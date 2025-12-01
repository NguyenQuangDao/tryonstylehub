import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { TOKEN_CONFIG } from '../../../../config/tokens'
import { LogLevel, logPaymentEvent, PaymentEventType } from '../../../../lib/payment-logger'
import { PaymentProvider, verifyPayment } from '../../../../lib/payment/payment-manager'
import { prisma } from '../../../../lib/prisma'

/**
 * POST /api/tokens/payment-webhook
 * Handle payment webhooks from payment gateways for async notifications
 */
export async function POST(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const providerStr = (searchParams.get('provider') || '').toLowerCase()
        const provider = providerStr as PaymentProvider

        if (!provider || ![PaymentProvider.STRIPE, PaymentProvider.MOMO, PaymentProvider.VNPAY, PaymentProvider.PAYPAL].includes(provider)) {
            return NextResponse.json({ error: 'Missing provider' }, { status: 400 })
        }
        if (provider === PaymentProvider.STRIPE) {
            const sig = req.headers.get('stripe-signature') || ''
            const secret = process.env.STRIPE_WEBHOOK_SECRET || ''
            if (!sig || !secret) {
                return NextResponse.json({ error: 'Missing Stripe signature or webhook secret' }, { status: 400 })
            }
            const rawBody = await req.text()
            const secretKey = process.env.STRIPE_SECRET_KEY || ''
            if (!secretKey) {
                return NextResponse.json({ error: 'Missing Stripe secret key' }, { status: 400 })
            }
            const stripe = new Stripe(secretKey)
            let event: Stripe.Event
            try {
                event = stripe.webhooks.constructEvent(rawBody, sig, secret)
            } catch (err) {
                console.log(err);
                
                return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 })
            }
            const obj = event.data.object as Stripe.PaymentIntent
            const paymentIntentId = obj.id as string
            const packageId = obj.metadata?.packageId as string
            const userId = obj.metadata?.userId ? parseInt(obj.metadata.userId) : null
            if (!userId || !packageId) {
                return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
            }
            if (event.type !== 'payment_intent.succeeded') {
                return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
            }

            const existingPurchase = await prisma.tokenPurchase.findFirst({
                where: { stripePaymentId: paymentIntentId },
            })
            if (existingPurchase) {
                return NextResponse.json({ success: true, message: 'Already processed' })
            }

            const pkg = TOKEN_CONFIG.PACKAGES.find(p => p.id === packageId)
            if (!pkg) {
                return NextResponse.json({ error: 'Package not found' }, { status: 400 })
            }

            const result = await prisma.$transaction(async (tx) => {
                const purchase = await tx.tokenPurchase.create({
                    data: {
                        userId,
                        stripePaymentId: paymentIntentId,
                        amount: pkg.price,
                        tokens: pkg.tokens,
                        status: 'completed',
                    }
                })
                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: { tokenBalance: { increment: pkg.tokens } },
                    select: { tokenBalance: true, email: true },
                })
                return { purchase, newBalance: updatedUser.tokenBalance }
            })

            await logPaymentEvent({
                userId,
                eventType: PaymentEventType.PURCHASE_COMPLETED,
                level: LogLevel.INFO,
                details: {
                    provider,
                    packageId,
                    tokensAdded: pkg.tokens,
                    newBalance: result.newBalance,
                    transactionId: paymentIntentId,
                    amount: pkg.price,
                },
            })

            return NextResponse.json({ success: true, message: 'Payment processed successfully' })
        }

        let bodyUnknown: unknown

        const contentType = req.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
            bodyUnknown = await req.json()
        } else {
            const text = await req.text()
            bodyUnknown = Object.fromEntries(new URLSearchParams(text))
        }

        const body = typeof bodyUnknown === 'object' && bodyUnknown !== null
            ? (bodyUnknown as Record<string, string>)
            : {}

        const verification = await verifyPayment(provider, body)

        if (!verification.success) {
            console.error('Webhook verification failed:', verification.error)
            return NextResponse.json({
                error: 'Verification failed',
                code: 'VERIFICATION_FAILED'
            }, { status: 400 })
        }

        const transactionId = verification.transactionId || ''
        const match = transactionId.match(/TOKEN_(\d+)_/)
        const userId = match ? parseInt(match[1]) : null

        if (!userId) {
            return NextResponse.json({
                error: 'Invalid transaction ID format'
            }, { status: 400 })
        }

        // Check if already processed
        const existingPurchase = await prisma.tokenPurchase.findFirst({
            where: {
                stripePaymentId: transactionId,
            },
        })

        if (existingPurchase) {
            // Already processed, return success
            return NextResponse.json({
                success: true,
                message: 'Already processed'
            })
        }

        // Extract package info from webhook data
        // This depends on how we stored it during payment creation
        let packageId = ''
        let tokensToAdd = 0
        let amount = 0

        // Try to extract from different provider formats
        if (provider === PaymentProvider.PAYPAL && verification.packageId) {
            packageId = verification.packageId
        } else if (provider === PaymentProvider.MOMO) {
            const extraData = JSON.parse(body.extraData || '{}') as { packageId?: string }
            packageId = extraData.packageId || ''
        } else if (provider === PaymentProvider.VNPAY) {
            const orderInfo = body['vnp_OrderInfo'] || ''
            const m = orderInfo.match(/TOKEN_PACKAGE:([\w-]+)/)
            packageId = m ? m[1] : ''
        }

        // Get package details
        const pkg = TOKEN_CONFIG.PACKAGES.find(p => p.id === packageId)

        if (!pkg) {
            console.error('Package not found:', packageId)
            return NextResponse.json({
                error: 'Package not found'
            }, { status: 400 })
        }

        tokensToAdd = pkg.tokens
        amount = pkg.price

        // Create transaction and add tokens atomically
        const result = await prisma.$transaction(async (tx) => {
            // Record purchase
            const purchase = await tx.tokenPurchase.create({
                data: {
                    userId,
                    stripePaymentId: transactionId,
                    amount,
                    tokens: tokensToAdd,
                    status: 'completed',
                }
            })

            // Add tokens to user balance
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { tokenBalance: { increment: tokensToAdd } },
                select: { tokenBalance: true, email: true },
            })

            return { purchase, newBalance: updatedUser.tokenBalance }
        })

        // Log successful purchase
        await logPaymentEvent({
            userId,
            eventType: PaymentEventType.PURCHASE_COMPLETED,
            level: LogLevel.INFO,
            details: {
                provider,
                packageId,
                tokensAdded: tokensToAdd,
                newBalance: result.newBalance,
                transactionId,
                amount,
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Payment processed successfully'
        })

    } catch (error) {
        console.error('Payment webhook error:', error)
        return NextResponse.json({
            error: 'Internal error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
