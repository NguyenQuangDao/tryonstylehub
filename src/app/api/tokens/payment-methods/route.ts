import { NextResponse } from 'next/server'
import { TOKEN_CONFIG } from '../../../../config/tokens'

/**
 * GET /api/tokens/payment-methods
 * Returns available payment methods
 */
export async function GET() {
    try {
        const isPaypalReady = !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET
        const availableMethods = TOKEN_CONFIG.PAYMENT_METHODS
            .filter(m => m.id === 'paypal')
            .map(m => ({ ...m, enabled: isPaypalReady }))
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
