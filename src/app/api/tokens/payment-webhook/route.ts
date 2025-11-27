import { NextRequest, NextResponse } from 'next/server'
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
        const provider = searchParams.get('provider') as PaymentProvider

        if (!provider) {
            return NextResponse.json({ error: 'Missing provider' }, { status: 400 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let body: any

        // Different providers send different content types
        const contentType = req.headers.get('content-type') || ''

        if (contentType.includes('application/json')) {
            body = await req.json()
        } else {
            // For form-urlencoded (VNPay, etc.)
            const text = await req.text()
            body = Object.fromEntries(new URLSearchParams(text))
        }

        // Verify payment
        const verification = await verifyPayment(provider, body)

        if (!verification.success) {
            console.error('Webhook verification failed:', verification.error)
            return NextResponse.json({
                error: 'Verification failed',
                code: 'VERIFICATION_FAILED'
            }, { status: 400 })
        }

        // Extract userId from transaction ID
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
        if (provider === PaymentProvider.MOMO) {
            const extraData = JSON.parse(body.extraData || '{}')
            packageId = extraData.packageId
        } else if (provider === PaymentProvider.VNPAY) {
            const parts = transactionId.split('_')
            if (parts.length >= 4) {
                packageId = parts.slice(2, parts.length - 1).join('_')
            }
        } else if (provider === PaymentProvider.STRIPE) {
            packageId = body.metadata?.packageId
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
