/**
 * Stripe Payment Integration
 * Handles credit/debit card payments via Stripe
 */

import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-11-20.acacia',
})

export interface StripePaymentParams {
    amount: number // Amount in USD
    currency: string
    userId: number
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
        const zeroDecimalCurrencies = new Set([
            'BIF','CLP','DJF','GNF','JPY','KMF','KRW','MGA','PYG','RWF','UGX','VND','XAF','XOF','XPF'
        ])
        const currency = params.currency.toUpperCase()
        const amountInSmallestUnit = zeroDecimalCurrencies.has(currency)
            ? Math.round(params.amount)
            : Math.round(params.amount * 100)

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInSmallestUnit,
            currency: params.currency.toLowerCase(),
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
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

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

/**
 * Refund a Stripe payment
 */
export async function refundStripePayment(
    paymentIntentId: string,
    amount?: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const refund = await stripe.refunds.create({
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
