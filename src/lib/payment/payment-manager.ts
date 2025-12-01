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
            case PaymentProvider.STRIPE: {
                const pid = typeof data.paymentIntentId === 'string' ? data.paymentIntentId : ''
                const result = await verifyStripePayment(pid)
                return {
                    success: result.success,
                    transactionId: pid,
                    error: result.error,
                }
            }

            case PaymentProvider.MOMO: {
                const momoData = data as MoMoCallbackPayload
                const isValid = verifyMoMoSignature(momoData)
                if (!isValid) {
                    return { success: false, error: 'Invalid signature' }
                }
                let pkgId: string | undefined
                try {
                    const extra = typeof momoData.extraData === 'string' ? JSON.parse(momoData.extraData) : {}
                    pkgId = typeof extra.packageId === 'string' ? extra.packageId : undefined
                } catch {}
                return {
                    success: momoData.resultCode === 0,
                    transactionId: momoData.orderId,
                    error: momoData.resultCode !== 0 ? momoData.message : undefined,
                    packageId: pkgId,
                }
            }

            case PaymentProvider.VNPAY: {
                const vnData = data as VNPayCallbackPayload
                const vnParams: Record<string, string> = {}
                for (const key in vnData) {
                    const val = vnData[key]
                    if (typeof val === 'string') vnParams[key] = val
                }
                const isValid = verifyVNPaySignature({ ...vnParams })
                if (!isValid) {
                    return { success: false, error: 'Invalid signature' }
                }
                const success = isVNPayPaymentSuccess(vnParams)
                let pkgId: string | undefined
                try {
                    const m = (vnParams['vnp_OrderInfo'] || '').match(/TOKEN_PACKAGE:([\w-]+)/)
                    pkgId = m ? m[1] : undefined
                } catch {}
                return {
                    success,
                    transactionId: vnParams['vnp_TxnRef'],
                    error: !success ? 'Payment failed' : undefined,
                    packageId: pkgId,
                }
            }


            case PaymentProvider.PAYPAL: {
                const orderId = typeof (data as Record<string, unknown>).orderId === 'string' ? (data as Record<string, unknown>).orderId as string : ''
                const result = await capturePayPalPayment(orderId)
                let pkgId: string | undefined
                try {
                    if (result.customId) {
                        const c = JSON.parse(result.customId)
                        pkgId = typeof c.packageId === 'string' ? c.packageId : undefined
                    }
                } catch {}
                return {
                    success: result.success,
                    transactionId: result.referenceId || orderId,
                    error: result.error,
                    packageId: pkgId,
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
    const c = currency.toUpperCase()
    if (c === 'VND') {
        return [PaymentProvider.VNPAY, PaymentProvider.MOMO]
    }
    return [PaymentProvider.STRIPE, PaymentProvider.PAYPAL]
}
