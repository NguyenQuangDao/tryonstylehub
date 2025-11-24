/**
 * VNPay Payment Integration
 * Handles VNPay payment gateway for Vietnam market
 */

import crypto from 'crypto'
import querystring from 'querystring'

export interface VNPayPaymentParams {
    amount: number // Amount in VND
    userId: number
    packageId: string
    orderInfo: string
    returnUrl: string
    ipAddress: string
}

export interface VNPayPaymentResult {
    success: boolean
    paymentUrl?: string
    transactionId?: string
    error?: string
}

/**
 * Create VNPay payment URL
 */
export async function createVNPayPayment(
    params: VNPayPaymentParams
): Promise<VNPayPaymentResult> {
    try {
        const {
            VNPAY_TMN_CODE,
            VNPAY_HASH_SECRET,
            VNPAY_URL,
        } = process.env

        if (!VNPAY_TMN_CODE || !VNPAY_HASH_SECRET || !VNPAY_URL) {
            return {
                success: false,
                error: 'VNPay credentials not configured',
            }
        }

        const orderId = `TOKEN_${params.userId}_${Date.now()}`
        const amount = Math.round(params.amount * 100) // VNPay uses smallest unit (VND * 100)

        const createDate = new Date()
            .toISOString()
            .replace(/[-:]/g, '')
            .replace(/\.\d{3}Z/, '')
            .slice(0, 14)

        const vnpParams: Record<string, string> = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: VNPAY_TMN_CODE,
            vnp_Amount: amount.toString(),
            vnp_CreateDate: createDate,
            vnp_CurrCode: 'VND',
            vnp_IpAddr: params.ipAddress,
            vnp_Locale: 'vn',
            vnp_OrderInfo: params.orderInfo,
            vnp_OrderType: 'other',
            vnp_ReturnUrl: params.returnUrl,
            vnp_TxnRef: orderId,
        }

        // Sort params alphabetically
        const sortedParams = Object.keys(vnpParams)
            .sort()
            .reduce((acc, key) => {
                acc[key] = vnpParams[key]
                return acc
            }, {} as Record<string, string>)

        // Create signature
        const signData = querystring.stringify(sortedParams)
        const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET)
        const signature = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

        // Add signature to params
        sortedParams.vnp_SecureHash = signature

        const paymentUrl = VNPAY_URL + '?' + querystring.stringify(sortedParams)

        return {
            success: true,
            paymentUrl,
            transactionId: orderId,
        }
    } catch (error) {
        console.error('VNPay payment error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'VNPay payment failed',
        }
    }
}

/**
 * Verify VNPay callback signature
 */
export function verifyVNPaySignature(
    vnpParams: Record<string, string>
): boolean {
    try {
        const { VNPAY_HASH_SECRET } = process.env

        if (!VNPAY_HASH_SECRET) {
            return false
        }

        const secureHash = vnpParams.vnp_SecureHash
        delete vnpParams.vnp_SecureHash
        delete vnpParams.vnp_SecureHashType

        // Sort params
        const sortedParams = Object.keys(vnpParams)
            .sort()
            .reduce((acc, key) => {
                acc[key] = vnpParams[key]
                return acc
            }, {} as Record<string, string>)

        const signData = querystring.stringify(sortedParams)
        const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET)
        const signature = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

        return signature === secureHash
    } catch (error) {
        console.error('VNPay signature verification error:', error)
        return false
    }
}

/**
 * Check if VNPay payment was successful
 */
export function isVNPayPaymentSuccess(vnpParams: Record<string, string>): boolean {
    return vnpParams.vnp_ResponseCode === '00'
}
