/**
 * PayPal Payment Integration
 * Handles PayPal payments for international users
 */

export interface PayPalPaymentParams {
    amount: number
    currency: string
    userId: number
    packageId: string
    returnUrl: string
    cancelUrl: string
}

export interface PayPalPaymentResult {
    success: boolean
    approvalUrl?: string
    orderId?: string
    error?: string
}

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken(): Promise<string | null> {
    try {
        const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_BASE } = process.env

        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            return null
        }

        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
        const baseUrl = PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'

        const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        })

        const data = await response.json()
        return data.access_token || null
    } catch (error) {
        console.error('PayPal token error:', error)
        return null
    }
}

/**
 * Create PayPal order
 */
export async function createPayPalPayment(
    params: PayPalPaymentParams
): Promise<PayPalPaymentResult> {
    try {
        const accessToken = await getPayPalAccessToken()

        if (!accessToken) {
            return {
                success: false,
                error: 'PayPal authentication failed',
            }
        }

        const baseUrl = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'

        const orderData = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    reference_id: `TOKEN_${params.userId}_${Date.now()}`,
                    description: `Token Package - ${params.packageId}`,
                    custom_id: JSON.stringify({
                        userId: params.userId,
                        packageId: params.packageId,
                    }),
                    amount: {
                        currency_code: params.currency,
                        value: params.amount.toFixed(2),
                    },
                },
            ],
            application_context: {
                return_url: params.returnUrl,
                cancel_url: params.cancelUrl,
                brand_name: 'AIStyleHub',
                landing_page: 'BILLING',
                user_action: 'PAY_NOW',
            },
        }

        const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        })

        const result = await response.json()

        if (result.id) {
            interface PayPalLink {
                href: string
                rel: string
                method: string
            }

            const approvalUrl = result.links?.find(
                (link: PayPalLink) => link.rel === 'approve'
            )?.href

            return {
                success: true,
                orderId: result.id,
                approvalUrl,
            }
        }

        return {
            success: false,
            error: result.message || 'PayPal order creation failed',
        }
    } catch (error) {
        console.error('PayPal payment error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'PayPal payment failed',
        }
    }
}

/**
 * Capture PayPal payment
 */
export async function capturePayPalPayment(
    orderId: string
): Promise<{ success: boolean; referenceId?: string; customId?: string; error?: string }> {
    try {
        const accessToken = await getPayPalAccessToken()

        if (!accessToken) {
            return {
                success: false,
                error: 'PayPal authentication failed',
            }
        }

        const baseUrl = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'

        const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        })

        const result = await response.json()

        if (result.status === 'COMPLETED') {
            let referenceId: string | undefined
            let customId: string | undefined
            try {
                const pu = Array.isArray(result.purchase_units) ? result.purchase_units[0] : undefined
                if (pu) {
                    referenceId = typeof pu.reference_id === 'string' ? pu.reference_id : undefined
                    customId = typeof pu.custom_id === 'string' ? pu.custom_id : undefined
                }
            } catch {}
            return { success: true, referenceId, customId }
        }

        return {
            success: false,
            error: result.message || 'Payment capture failed',
        }
    } catch (error) {
        console.error('PayPal capture error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Capture failed',
        }
    }
}
