import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '../../../../lib/auth'
import { LogLevel, logPaymentEvent, PaymentEventType } from '../../../../lib/payment-logger'
import { prisma } from '../../../../lib/prisma'
import { getTokenPurchaseClient } from '../../../../lib/tokenPurchaseClient'
import { capturePaypalOrder } from '../../../../lib/payment/paypal'

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
    const orderId: string | undefined = body?.orderId
    const packageId: string | undefined = body?.packageId
    if (!orderId || !packageId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const existing = await getTokenPurchaseClient(prisma).findFirst({
      where: { paypalOrderId: orderId, userId: payload.userId },
    })
    if (existing) {
      const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { tokenBalance: true } })
      return NextResponse.json({ success: true, data: { transactionId: orderId, newBalance: user?.tokenBalance } })
    }

    const pkg = (await import('../../../../config/tokens')).TOKEN_CONFIG.PACKAGES.find(p => p.id === packageId)
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    const capture = await capturePaypalOrder(orderId)
    if (!capture.success || capture.status !== 'COMPLETED') {
      return NextResponse.json({ error: capture.error || 'Payment not completed' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await getTokenPurchaseClient(tx).create({
        data: {
          userId: payload.userId,
          paypalOrderId: orderId,
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
        provider: 'paypal',
        packageId,
        tokensAdded: pkg.tokens,
        newBalance: result.newBalance,
        transactionId: orderId,
        amount: pkg.price,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        transactionId: orderId,
        captureId: capture.captureId,
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
    console.error('Confirm PayPal error:', error)
    const message = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: message || 'Internal error' }, { status: 500 })
  }
}
