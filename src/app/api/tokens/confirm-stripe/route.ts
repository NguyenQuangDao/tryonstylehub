import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '../../../../lib/auth'
import { LogLevel, logPaymentEvent, PaymentEventType } from '../../../../lib/payment-logger'
import { prisma } from '../../../../lib/prisma'
import { verifyStripePayment } from '../../../../lib/payment/stripe'

export async function POST(req: NextRequest) {
  try {
    const tokenCookie = req.cookies.get('token')?.value
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(tokenCookie)
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { paymentIntentId, packageId } = body as { paymentIntentId?: string; packageId?: string }
    if (!paymentIntentId || !packageId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const verification = await verifyStripePayment(paymentIntentId)
    if (!verification.success) {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const already = await prisma.tokenPurchase.findFirst({
      where: { stripePaymentId: paymentIntentId, userId: payload.userId }
    })
    if (already) {
      return NextResponse.json({ success: true, data: { transactionId: paymentIntentId, newBalance: (await prisma.user.findUnique({ where: { id: payload.userId }, select: { tokenBalance: true } }))?.tokenBalance } })
    }

    const pkg = (await import('../../../../config/tokens')).TOKEN_CONFIG.PACKAGES.find(p => p.id === packageId)
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.tokenPurchase.create({
        data: {
          userId: payload.userId,
          stripePaymentId: paymentIntentId,
          amount: pkg.price,
          tokens: pkg.tokens,
          status: 'completed',
        }
      })

      const updatedUser = await tx.user.update({
        where: { id: payload.userId },
        data: { tokenBalance: { increment: pkg.tokens } },
        select: { tokenBalance: true, email: true },
      })

      return { purchase, newBalance: updatedUser.tokenBalance }
    })

    await logPaymentEvent({
      userId: payload.userId,
      eventType: PaymentEventType.PURCHASE_COMPLETED,
      level: LogLevel.INFO,
      details: {
        provider: 'stripe',
        packageId,
        tokensAdded: pkg.tokens,
        newBalance: result.newBalance,
        transactionId: paymentIntentId,
        amount: pkg.price,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        transactionId: paymentIntentId,
        tokensAdded: pkg.tokens,
        newBalance: result.newBalance,
        purchase: {
          id: result.purchase.id,
          createdAt: result.purchase.createdAt,
          amount: result.purchase.amount,
        }
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
