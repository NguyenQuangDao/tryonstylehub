import { NextRequest, NextResponse } from 'next/server'
import { TOKEN_CONFIG } from '../../../../config/tokens'
import { verifyToken } from '../../../../lib/auth'
import { LogLevel, logPaymentEvent, PaymentEventType } from '../../../../lib/payment-logger'
import { prisma } from '../../../../lib/prisma'

/**
 * POST /api/tokens/purchase
 * Purchase token package
 * 
 * Body: { packageId: string, paymentMethodId: string }
 */
export async function POST(req: NextRequest) {
  let userId: number | undefined

  try {
    // 1. Authenticate user
    const tokenCookie = req.cookies.get('token')?.value
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(tokenCookie)
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    userId = payload.userId

    // 2. Parse request body
    const body = await req.json()
    const { packageId, paymentMethodId } = body

    if (!packageId || !paymentMethodId) {
      return NextResponse.json({
        error: 'Missing required fields: packageId, paymentMethodId'
      }, { status: 400 })
    }

    // 3. Get package details
    const pkg = TOKEN_CONFIG.PACKAGES.find(p => p.id === packageId)
    if (!pkg) {
      await logPaymentEvent({
        userId,
        eventType: PaymentEventType.PURCHASE_FAILED,
        level: LogLevel.WARNING,
        details: { reason: 'invalid_package', packageId },
      })
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // 4. Log purchase initiation
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    await logPaymentEvent({
      userId,
      eventType: PaymentEventType.PURCHASE_INITIATED,
      level: LogLevel.INFO,
      details: {
        packageId,
        packageName: pkg.name,
        tokens: pkg.tokens,
        price: pkg.price,
        paymentMethodId,
      },
      ipAddress,
      userAgent,
    })

    // 5. Process payment with real payment gateway
    const paymentResult = await processPayment({
      userId,
      packageId,
      amount: pkg.price,
      currency: pkg.currency,
      paymentMethodId,
      userEmail: payload.email || 'unknown@example.com',
      req,
    })

    if (!paymentResult.success) {
      await logPaymentEvent({
        userId,
        eventType: PaymentEventType.PAYMENT_DECLINED,
        level: LogLevel.WARNING,
        details: {
          packageId,
          reason: paymentResult.error,
          paymentMethodId,
        },
        ipAddress,
        userAgent,
      })

      return NextResponse.json({
        error: 'Payment failed: ' + paymentResult.error
      }, { status: 402 })
    }

    // For redirect-based payments (MoMo, VNPay, ZaloPay, PayPal)
    if (paymentResult.paymentUrl) {
      // Return payment URL for frontend to redirect user
      return NextResponse.json({
        success: true,
        requiresRedirect: true,
        paymentUrl: paymentResult.paymentUrl,
        transactionId: paymentResult.transactionId,
      })
    }

    // For Stripe (client-side confirmation)
    if (paymentResult.clientSecret) {
      return NextResponse.json({
        success: true,
        requiresClientConfirmation: true,
        clientSecret: paymentResult.clientSecret,
        transactionId: paymentResult.transactionId,
      })
    }

    // 6. Create transaction record and add tokens
    const result = await prisma.$transaction(async (tx) => {
      // Record purchase
      const purchase = await tx.tokenPurchase.create({
        data: {
          userId: userId!,
          stripePaymentId: paymentResult.transactionId || `fallback_${Date.now()}`,
          amount: pkg.price,
          tokens: pkg.tokens,
          status: 'completed',
        }
      })

      // Add tokens to user balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { tokenBalance: { increment: pkg.tokens } },
        select: { tokenBalance: true, email: true, name: true },
      })

      return { purchase, newBalance: updatedUser.tokenBalance, user: updatedUser }
    })

    // 7. Log successful purchase
    await logPaymentEvent({
      userId,
      eventType: PaymentEventType.PURCHASE_COMPLETED,
      level: LogLevel.INFO,
      details: {
        packageId,
        packageName: pkg.name,
        tokensAdded: pkg.tokens,
        newBalance: result.newBalance,
        transactionId: paymentResult.transactionId,
        amount: pkg.price,
      },
      ipAddress,
      userAgent,
    })

    // 8. Return success response
    return NextResponse.json({
      success: true,
      data: {
        transactionId: paymentResult.transactionId,
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
    console.error('Token purchase error:', error)

    if (userId) {
      await logPaymentEvent({
        userId,
        eventType: PaymentEventType.PURCHASE_FAILED,
        level: LogLevel.ERROR,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
      })
    }

    return NextResponse.json({
      error: 'Failed to purchase tokens'
    }, { status: 500 })
  }
}

/**
 * Process payment using real payment gateway
 */
async function processPayment(params: {
  userId: number
  packageId: string
  amount: number
  currency: string
  paymentMethodId: string
  userEmail: string
  req: NextRequest
}): Promise<{
  success: boolean
  transactionId?: string
  paymentUrl?: string
  clientSecret?: string
  error?: string
}> {
  const { createPayment, PaymentProvider } = await import('../../../../lib/payment/payment-manager')

  // Map payment method ID to provider
  let provider: typeof PaymentProvider[keyof typeof PaymentProvider]
  switch (params.paymentMethodId) {
    case 'stripe':
      provider = PaymentProvider.STRIPE
      break
    case 'paypal':
      provider = PaymentProvider.PAYPAL
      break
    case 'momo':
      provider = PaymentProvider.MOMO
      break
    case 'vnpay':
      provider = PaymentProvider.VNPAY
      break
    case 'zalopay':
      provider = PaymentProvider.ZALOPAY
      break
    default:
      // Fallback for old mock IDs
      if (params.paymentMethodId.startsWith('pm_mock_')) {
        provider = PaymentProvider.STRIPE
      } else {
        return {
          success: false,
          error: 'Invalid payment method',
        }
      }
  }

  // Get base URL for callbacks
  const protocol = params.req.headers.get('x-forwarded-proto') || 'http'
  const host = params.req.headers.get('host') || 'localhost:3000'
  const baseUrl = `${protocol}://${host}`

  const returnUrl = `${baseUrl}/api/tokens/payment-callback?provider=${provider}`
  const cancelUrl = `${baseUrl}/tokens?payment=cancelled`
  const notifyUrl = `${baseUrl}/api/tokens/payment-webhook?provider=${provider}`
  const ipAddress = params.req.headers.get('x-forwarded-for') || params.req.headers.get('x-real-ip') || '127.0.0.1'

  try {
    const result = await createPayment({
      provider,
      amount: params.amount,
      currency: params.currency,
      userId: params.userId,
      packageId: params.packageId,
      userEmail: params.userEmail,
      returnUrl,
      cancelUrl,
      notifyUrl,
      ipAddress,
    })

    return result
  } catch (error) {
    console.error('Payment processing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed',
    }
  }
}

/**
 * GET /api/tokens/purchase
 * Get purchase history for current user
 */
export async function GET(req: NextRequest) {
  try {
    const tokenCookie = req.cookies.get('token')?.value
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(tokenCookie)
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const purchases = await prisma.tokenPurchase.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ success: true, data: purchases })
  } catch (error) {
    console.error('Fetch purchase history error:', error)
    return NextResponse.json({
      error: 'Failed to fetch purchase history'
    }, { status: 500 })
  }
}