import { NextRequest, NextResponse } from 'next/server'
import { LogLevel, logPaymentEvent, PaymentEventType } from '../../../../lib/payment-logger'
import { PaymentProvider, verifyPayment } from '../../../../lib/payment/payment-manager'
import { prisma } from '../../../../lib/prisma'

/**
 * GET /api/tokens/payment-callback
 * Handle payment callbacks from payment gateways
 */
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const provider = searchParams.get('provider') as PaymentProvider

        if (!provider) {
            return NextResponse.redirect(new URL('/tokens?payment=error', req.url))
        }

        // Get all query parameters
        const params: Record<string, string> = {}
        searchParams.forEach((value, key) => {
            params[key] = value
        })

        // Verify payment
        const verification = await verifyPayment(provider, params)

        if (!verification.success) {
            console.error('Payment verification failed:', verification.error)
            return NextResponse.redirect(new URL('/tokens?payment=failed', req.url))
        }

        // Extract userId from transaction ID (format: TOKEN_userId_timestamp)
        const transactionId = verification.transactionId || ''
        const match = transactionId.match(/TOKEN_(\d+)_/)
        const userId = match ? parseInt(match[1]) : null

        if (!userId) {
            return NextResponse.redirect(new URL('/tokens?payment=error', req.url))
        }

        // Get package ID from extra data or metadata
        // This will depend on the provider's callback format
        // For now, we'll try to extract it from the transaction
        const purchase = await prisma.tokenPurchase.findFirst({
            where: {
                stripePaymentId: transactionId,
                userId
            },
        })

        if (purchase) {
            // Already processed
            return NextResponse.redirect(new URL('/tokens?payment=success', req.url))
        }

        // For successful payment without existing record,
        // we need to get package info from somewhere
        // Ideally stored in a temporary table during payment initiation

        await logPaymentEvent({
            userId,
            eventType: PaymentEventType.PAYMENT_VERIFIED,
            level: LogLevel.INFO,
            details: {
                provider,
                transactionId: verification.transactionId,
            },
        })

        return NextResponse.redirect(new URL('/tokens?payment=processing', req.url))

    } catch (error) {
        console.error('Payment callback error:', error)
        return NextResponse.redirect(new URL('/tokens?payment=error', req.url))
    }
}

/**
 * POST /api/tokens/payment-callback
 * Handle POST callbacks (for some providers)
 */
export async function POST(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const provider = searchParams.get('provider') as PaymentProvider

        if (!provider) {
            return NextResponse.json({ error: 'Missing provider' }, { status: 400 })
        }

        const body = await req.json()

        // Verify payment
        const verification = await verifyPayment(provider, body)

        if (!verification.success) {
            console.error('Payment verification failed:', verification.error)
            return NextResponse.json({
                error: 'Verification failed',
                code: 'VERIFICATION_FAILED'
            }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified'
        })

    } catch (error) {
        console.error('Payment callback POST error:', error)
        return NextResponse.json({
            error: 'Internal error'
        }, { status: 500 })
    }
}
