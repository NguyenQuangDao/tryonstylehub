import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { TOKEN_CONFIG } from '../../../../config/tokens'
import { LogLevel, logPaymentEvent, PaymentEventType } from '../../../../lib/payment-logger'
import { PaymentProvider, verifyPayment } from '../../../../lib/payment/payment-manager'
import { prisma } from '../../../../lib/prisma'
import { getTokenPurchaseClient } from '../../../../lib/tokenPurchaseClient'

/**
 * POST /api/tokens/payment-webhook
 * Handle payment webhooks from payment gateways for async notifications
 */
export async function POST(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const providerStr = (searchParams.get('provider') || '').toLowerCase()
        const provider = providerStr as PaymentProvider

        if (!provider || ![PaymentProvider.STRIPE].includes(provider)) {
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
            const userId = obj.metadata?.userId ? String(obj.metadata.userId) : null
            if (!userId || !packageId) {
                return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
            }
            if (event.type !== 'payment_intent.succeeded') {
                return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
            }

            const existingPurchase = await getTokenPurchaseClient(prisma).findFirst({
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
                const purchase = await getTokenPurchaseClient(tx).create({
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
        return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })

    } catch (error) {
        console.error('Payment webhook error:', error)
        return NextResponse.json({
            error: 'Internal error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
