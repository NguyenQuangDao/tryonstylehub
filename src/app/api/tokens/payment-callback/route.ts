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

        if (!provider || provider !== PaymentProvider.STRIPE) {
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

        if (!provider || provider !== PaymentProvider.STRIPE) {
            return NextResponse.json({ error: 'Missing provider' }, { status: 400 })
        }

        const body = await req.json()
        console.log('POST callback body:', body)

        return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })

    } catch (error) {
        console.error('Payment callback POST error:', error)
        return NextResponse.json({
            error: 'Internal error'
        }, { status: 500 })
    }
}
