/**
 * Payment Gateway Manager
 * Unified interface for all payment methods
 */

import { createPaypalOrder } from './paypal'

export enum PaymentProvider {
    PAYPAL = 'paypal',
}

export interface PaymentParams {
    provider: PaymentProvider
    amount: number
    currency: string
    userId: string
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
    paymentUrl?: string
    clientSecret?: string
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
            case PaymentProvider.PAYPAL: {
                const result = await createPaypalOrder({
                    amount: params.amount,
                    currency: params.currency,
                    userId: params.userId,
                    packageId: params.packageId,
                    userEmail: params.userEmail,
                    returnUrl: params.returnUrl,
                    cancelUrl: params.cancelUrl,
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
type MoMoCallbackPayload = {
    orderId: string
    requestId: string
    amount: string
    orderInfo: string
    orderType: string
    transId: string
    resultCode: number
    message: string
    payType: string
    responseTime: string
    extraData: string
    signature: string
}

type VNPayCallbackPayload = {
    vnp_TxnRef: string
    vnp_ResponseCode?: string
    vnp_OrderInfo?: string
    vnp_SecureHash?: string
    [key: string]: string | undefined
}

export async function verifyPayment(
    provider: PaymentProvider,
    data: Record<string, unknown>
): Promise<{ success: boolean; transactionId?: string; error?: string; packageId?: string }> {
    try {
        switch (provider) {
            case PaymentProvider.PAYPAL:
                return { success: false, error: 'Use capture endpoint for PayPal' }

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
    const c = currency.toUpperCase()
    return [PaymentProvider.PAYPAL]
}
