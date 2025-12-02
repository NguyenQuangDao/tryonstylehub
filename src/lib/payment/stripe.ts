/**
 * Stripe Payment Integration
 * Handles credit/debit card payments via Stripe
 */

import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY
let stripe: Stripe | null = null
function getStripe(): Stripe | null {
    if (!stripeKey) return null
    if (!stripe) {
        stripe = new Stripe(stripeKey)
    }
    return stripe
}

export interface StripePaymentParams {
    amount: number // Amount in USD
    currency: string
    userId: string
    packageId: string
    userEmail: string
    userName?: string
}

export interface StripePaymentResult {
    success: boolean
    transactionId?: string
    paymentIntentId?: string
    error?: string
    clientSecret?: string // For frontend confirmation
}

/**
 * Create a payment intent for Stripe
 */
export async function createStripePayment(
    params: StripePaymentParams
): Promise<StripePaymentResult> {
    try {
        const client = getStripe()
        if (!client) {
            return { success: false, error: 'Stripe is not configured' }
        }
        const zeroDecimalCurrencies = new Set([
            'BIF','CLP','DJF','GNF','JPY','KMF','KRW','MGA','PYG','RWF','UGX','VND','XAF','XOF','XPF'
        ])
        const currency = params.currency.toUpperCase()
        const amountInSmallestUnit = zeroDecimalCurrencies.has(currency)
            ? Math.round(params.amount)
            : Math.round(params.amount * 100)

        // Create payment intent
        const paymentIntent = await client.paymentIntents.create({
            amount: amountInSmallestUnit,
            currency: params.currency.toLowerCase(),
            payment_method_types: ['card'],
            metadata: {
                userId: params.userId.toString(),
                packageId: params.packageId,
                userEmail: params.userEmail,
                userName: params.userName || 'N/A',
            },
            description: `Token purchase - Package: ${params.packageId}`,
            receipt_email: params.userEmail,
        })

        return {
            success: true,
            transactionId: paymentIntent.id,
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret || undefined,
        }
    } catch (error) {
        console.error('Stripe payment error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Stripe payment failed',
        }
    }
}

/**
 * Verify a Stripe payment
 */
export async function verifyStripePayment(
    paymentIntentId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const client = getStripe()
        if (!client) {
            return { success: false, error: 'Stripe is not configured' }
        }
        const paymentIntent = await client.paymentIntents.retrieve(paymentIntentId)

        if (paymentIntent.status === 'succeeded') {
            return { success: true }
        }

        return {
            success: false,
            error: `Payment status: ${paymentIntent.status}`,
        }
    } catch (error) {
        console.error('Stripe verification error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Verification failed',
        }
    }
}

export async function confirmStripePayment(
    paymentIntentId: string
): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
        const client = getStripe()
        if (!client) {
            return { success: false, error: 'Stripe is not configured' }
        }
        const current = await client.paymentIntents.retrieve(paymentIntentId)
        if (current.status === 'succeeded') {
            return { success: true, status: current.status }
        }

        const intent = await client.paymentIntents.confirm(paymentIntentId)
        return { success: intent.status === 'succeeded', status: intent.status }
    } catch (error) {
        const code = (error as any)?.code
        if (code === 'payment_intent_unexpected_state') {
            try {
                const client = getStripe()
                if (!client) {
                    return { success: false, error: 'Stripe is not configured' }
                }
                const check = await client.paymentIntents.retrieve(paymentIntentId)
                return { success: check.status === 'succeeded', status: check.status, error: code }
            } catch (e) {
                console.log(e);
                
                // fallthrough
            }
        }
        console.error('Stripe confirm error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Confirm failed',
        }
    }
}

/**
 * Refund a Stripe payment
 */
export async function refundStripePayment(
    paymentIntentId: string,
    amount?: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const client = getStripe()
        if (!client) {
            return { success: false, error: 'Stripe is not configured' }
        }
        const refund = await client.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount ? Math.round(amount * 100) : undefined,
        })

        return { success: refund.status === 'succeeded' }
    } catch (error) {
        console.error('Stripe refund error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Refund failed',
        }
    }
}
