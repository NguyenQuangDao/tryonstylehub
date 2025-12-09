import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '../../../../lib/auth'
import { LogLevel, logPaymentEvent, PaymentEventType } from '../../../../lib/payment-logger'
import { capturePaypalOrder, getPaypalOrderDetails } from '../../../../lib/payment/paypal'
import { prisma } from '../../../../lib/prisma'
import { getTokenPurchaseClient } from '../../../../lib/tokenPurchaseClient'

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
    let packageId: string | undefined = body?.packageId
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const existing = await getTokenPurchaseClient(prisma).findFirst({
      where: { paypalOrderId: orderId, userId: payload.userId },
    })
    if (existing) {
      const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { tokenBalance: true } })
      return NextResponse.json({ success: true, data: { transactionId: orderId, newBalance: user?.tokenBalance } })
    }

    if (!packageId) {
      const details = await getPaypalOrderDetails(orderId)
      if (!details.success) {
        return NextResponse.json({ error: details.error || 'Failed to fetch order details' }, { status: 400 })
      }
      const custom = details.customId || ''
      const parts = custom.split(':')
      const customUserId = parts[0]
      const customPackageId = parts[1]
      if (!customUserId || !customPackageId) {
        return NextResponse.json({ error: 'Order metadata missing' }, { status: 400 })
      }
      if (customUserId !== payload.userId) {
        await logPaymentEvent({
          userId: payload.userId,
          eventType: PaymentEventType.PURCHASE_FAILED,
          level: LogLevel.SECURITY,
          details: { reason: 'user_mismatch', orderId, customUserId },
        })
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      packageId = customPackageId
      const currencyOk = (details.amountCurrency || '').toUpperCase() === 'USD'
      const amountOk = details.amountValue ? Number(details.amountValue) === Number((await import('../../../../config/tokens')).TOKEN_CONFIG.PACKAGES.find(p => p.id === customPackageId)?.price) : false
      if (!currencyOk || !amountOk) {
        await logPaymentEvent({
          userId: payload.userId,
          eventType: PaymentEventType.PURCHASE_FAILED,
          level: LogLevel.WARNING,
          details: {
            reason: 'amount_currency_mismatch',
            orderId,
            expectedCurrency: 'USD',
            gotCurrency: details.amountCurrency,
            expectedAmount: (await import('../../../../config/tokens')).TOKEN_CONFIG.PACKAGES.find(p => p.id === customPackageId)?.price,
            gotAmount: details.amountValue,
          },
        })
        return NextResponse.json({ error: 'Payment details mismatch' }, { status: 400 })
      }
      await logPaymentEvent({
        userId: payload.userId,
        eventType: PaymentEventType.PAYMENT_VERIFIED,
        level: LogLevel.INFO,
        details: {
          provider: 'paypal',
          orderId,
          payerId: details.payerId,
          amount: details.amountValue,
          currency: details.amountCurrency,
          packageId,
        },
      })
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
