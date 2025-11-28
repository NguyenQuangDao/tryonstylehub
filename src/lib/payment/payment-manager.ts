/**
 * Payment Gateway Manager
 * Unified interface for all payment methods
 */

import { createMoMoPayment, verifyMoMoSignature } from './momo'
import { capturePayPalPayment, createPayPalPayment } from './paypal'
import { createStripePayment, verifyStripePayment } from './stripe'
import { createVNPayPayment, isVNPayPaymentSuccess, verifyVNPaySignature } from './vnpay'

export enum PaymentProvider {
    STRIPE = 'stripe',
    MOMO = 'momo',
    VNPAY = 'vnpay',
    PAYPAL = 'paypal',
}

export interface PaymentParams {
    provider: PaymentProvider
    amount: number
    currency: string
    userId: number
    packageId: string
    userEmail: string
    userName?: string
    returnUrl: string
    cancelUrl?: string
    notifyUrl?: string
    ipAddress?: string
    preferredPaymentMethods?: string[]
}

export interface PaymentResult {
    success: boolean
    transactionId?: string
    paymentUrl?: string // For redirect-based payments (MoMo, VNPay, ZaloPay, PayPal)
    clientSecret?: string // For Stripe
    error?: string
}

/**
 * Convert USD to VND (approximate rate)
 */
function convertUSDtoVND(usd: number): number {
    const exchangeRate = 24000 // Approximate USD to VND rate
    return Math.round(usd * exchangeRate)
}

/**
 * Create payment based on provider
 */
export async function createPayment(params: PaymentParams): Promise<PaymentResult> {
    try {
        switch (params.provider) {
            case PaymentProvider.STRIPE: {
                const result = await createStripePayment({
                    amount: params.amount,
                    currency: params.currency,
                    userId: params.userId,
                    packageId: params.packageId,
                    userEmail: params.userEmail,
                    userName: params.userName,
                })
                return {
                    success: result.success,
                    transactionId: result.transactionId,
                    clientSecret: result.clientSecret,
                    error: result.error,
                }
            }

            case PaymentProvider.MOMO: {
                const amountVND = params.currency === 'USD'
                    ? convertUSDtoVND(params.amount)
                    : params.amount

                const result = await createMoMoPayment({
                    amount: amountVND,
                    userId: params.userId,
                    packageId: params.packageId,
                    orderInfo: `Nạp token - Gói ${params.packageId}`,
                    returnUrl: params.returnUrl,
                    notifyUrl: params.notifyUrl || params.returnUrl,
                })
                return {
                    success: result.success,
                    transactionId: result.transactionId,
                    paymentUrl: result.payUrl,
                    error: result.error,
                }
            }

            case PaymentProvider.VNPAY: {
                const amountVND = params.currency === 'USD'
                    ? convertUSDtoVND(params.amount)
                    : params.amount

                const result = await createVNPayPayment({
                    amount: amountVND,
                    userId: params.userId,
                    packageId: params.packageId,
                    orderInfo: `Nạp token - TOKEN_PACKAGE:${params.packageId}`,
                    returnUrl: params.returnUrl,
                    ipAddress: params.ipAddress || '127.0.0.1',
                })
                return {
                    success: result.success,
                    transactionId: result.transactionId,
                    paymentUrl: result.paymentUrl,
                    error: result.error,
                }
            }


            case PaymentProvider.PAYPAL: {
                const result = await createPayPalPayment({
                    amount: params.amount,
                    currency: params.currency,
                    userId: params.userId,
                    packageId: params.packageId,
                    returnUrl: params.returnUrl,
                    cancelUrl: params.cancelUrl || params.returnUrl,
                })
                return {
                    success: result.success,
                    transactionId: result.orderId,
                    paymentUrl: result.approvalUrl,
                    error: result.error,
                }
            }

            default:
                return {
                    success: false,
                    error: 'Unsupported payment provider',
                }
        }
    } catch (error) {
        console.error('Payment creation error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Payment failed',
        }
    }
}

/**
 * Verify payment callback/webhook
 */
export async function verifyPayment(
    provider: PaymentProvider,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
        switch (provider) {
            case PaymentProvider.STRIPE: {
                const result = await verifyStripePayment(data.paymentIntentId)
                return {
                    success: result.success,
                    transactionId: data.paymentIntentId,
                    error: result.error,
                }
            }

            case PaymentProvider.MOMO: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const isValid = verifyMoMoSignature(data as any)
                if (!isValid) {
                    return { success: false, error: 'Invalid signature' }
                }
                return {
                    success: data.resultCode === 0,
                    transactionId: data.orderId,
                    error: data.resultCode !== 0 ? data.message : undefined,
                }
            }

            case PaymentProvider.VNPAY: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const isValid = verifyVNPaySignature(data as any)
                if (!isValid) {
                    return { success: false, error: 'Invalid signature' }
                }
                return {
                    success: isVNPayPaymentSuccess(data),
                    transactionId: data.vnp_TxnRef,
                    error: !isVNPayPaymentSuccess(data) ? 'Payment failed' : undefined,
                }
            }


            case PaymentProvider.PAYPAL: {
                const result = await capturePayPalPayment(data.orderId)
                return {
                    success: result.success,
                    transactionId: data.orderId,
                    error: result.error,
                }
            }

            default:
                return { success: false, error: 'Unsupported payment provider' }
        }
    } catch (error) {
        console.error('Payment verification error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Verification failed',
        }
    }
}

/**
 * Get available payment methods based on currency
 */
export function getAvailablePaymentMethods(currency: string): PaymentProvider[] {
    if (currency === 'VND') {
        return [
            PaymentProvider.MOMO,
            PaymentProvider.VNPAY,
            PaymentProvider.STRIPE,
        ]
    }

    return [PaymentProvider.STRIPE, PaymentProvider.PAYPAL]
}
