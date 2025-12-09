import { NextRequest, NextResponse } from 'next/server'
import { PaymentProvider } from '../../../../lib/payment/payment-manager'

/**
 * GET /api/tokens/payment-callback
 * Handle payment callbacks from payment gateways
 */
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const provider = searchParams.get('provider') as PaymentProvider

        if (!provider || provider !== PaymentProvider.PAYPAL) {
            return NextResponse.redirect(new URL('/tokens?payment=error', req.url))
        }

        // Get all query parameters
        const params: Record<string, string> = {}
        searchParams.forEach((value, key) => {
            params[key] = value
        })

        return NextResponse.redirect(new URL('/tokens?payment=error', req.url))

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

        if (!provider || provider !== PaymentProvider.PAYPAL) {
            return NextResponse.json({ error: 'Missing provider' }, { status: 400 })
        }

        const raw = await req.text()
        const { verifyPaypalWebhookSignature, extractPurchaseMetadataFromEvent } = await import('../../../../lib/payment/paypal-webhook')

        const verification = await verifyPaypalWebhookSignature(req.headers as unknown as Headers, raw)
        if (!verification.verified || !verification.event) {
            return NextResponse.json({ error: verification.error || 'Webhook not verified' }, { status: 400 })
        }

        const meta = await extractPurchaseMetadataFromEvent(verification.event)
        const eventType = verification.event?.event_type as string | undefined

        if (eventType === 'PAYMENT.CAPTURE.COMPLETED' && meta.userId && meta.packageId) {
            const { prisma } = await import('../../../../lib/prisma')
            const { getTokenPurchaseClient } = await import('../../../../lib/tokenPurchaseClient')
            const { TOKEN_CONFIG } = await import('../../../../config/tokens')
            const { logPaymentEvent, PaymentEventType, LogLevel } = await import('../../../../lib/payment-logger')

            const pkg = TOKEN_CONFIG.PACKAGES.find(p => p.id === meta.packageId)
            if (!pkg) {
                return NextResponse.json({ error: 'Package not found' }, { status: 404 })
            }

            const existing = await getTokenPurchaseClient(prisma).findFirst({
                where: { paypalOrderId: meta.orderId || meta.captureId || '', userId: meta.userId }
            })
            if (existing) {
                const user = await prisma.user.findUnique({ where: { id: meta.userId }, select: { tokenBalance: true } })
                return NextResponse.json({ success: true, data: { transactionId: meta.orderId || meta.captureId, newBalance: user?.tokenBalance } })
            }

            const result = await prisma.$transaction(async (tx) => {
                const purchase = await getTokenPurchaseClient(tx).create({
                    data: {
                        userId: meta.userId!,
                        paypalOrderId: meta.orderId || meta.captureId || `webhook_${Date.now()}`,
                        amount: pkg.price,
                        tokens: pkg.tokens,
                        status: 'completed',
                    }
                })

                const updatedUser = await tx.user.update({
                    where: { id: meta.userId! },
                    data: { tokenBalance: { increment: pkg.tokens } },
                    select: { tokenBalance: true },
                })

                return { purchase, newBalance: updatedUser.tokenBalance }
            })

            await logPaymentEvent({
                userId: meta.userId!,
                eventType: PaymentEventType.PURCHASE_COMPLETED,
                level: LogLevel.INFO,
                details: {
                    provider: 'paypal',
                    packageId: meta.packageId,
                    tokensAdded: TOKEN_CONFIG.PACKAGES.find(p => p.id === meta.packageId)!.tokens,
                    newBalance: result.newBalance,
                    transactionId: meta.orderId || meta.captureId,
                    amount: TOKEN_CONFIG.PACKAGES.find(p => p.id === meta.packageId)!.price,
                },
            })

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Payment callback POST error:', error)
        return NextResponse.json({
            error: 'Internal error'
        }, { status: 500 })
    }
}
