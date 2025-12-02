import { NextResponse } from 'next/server'
import { TOKEN_CONFIG } from '../../../../config/tokens'

/**
 * GET /api/tokens/payment-methods
 * Returns available payment methods
 */
export async function GET() {
    try {
        const isStripeReady = !!process.env.STRIPE_SECRET_KEY
        const availableMethods = TOKEN_CONFIG.PAYMENT_METHODS
            .filter(m => m.id === 'stripe')
            .map(m => ({ ...m, enabled: isStripeReady }))
            .filter(method => method.enabled)

        return NextResponse.json({
            success: true,
            data: availableMethods
        })
    } catch {
        return NextResponse.json({
            error: 'Failed to fetch payment methods'
        }, { status: 500 })
    }
}
