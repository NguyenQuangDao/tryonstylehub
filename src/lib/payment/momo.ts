/**
 * MoMo Payment Integration
 * Handles MoMo e-wallet payments for Vietnam market
 */

import crypto from 'crypto'

export interface MoMoPaymentParams {
    amount: number // Amount in VND
    userId: number
    packageId: string
    orderInfo: string
    returnUrl: string
    notifyUrl: string
}

export interface MoMoPaymentResult {
    success: boolean
    payUrl?: string
    transactionId?: string
    error?: string
}

/**
 * Create MoMo payment request
 */
export async function createMoMoPayment(
    params: MoMoPaymentParams
): Promise<MoMoPaymentResult> {
    try {
        const {
            MOMO_PARTNER_CODE,
            MOMO_ACCESS_KEY,
            MOMO_SECRET_KEY,
            MOMO_ENDPOINT,
        } = process.env

        if (!MOMO_PARTNER_CODE || !MOMO_ACCESS_KEY || !MOMO_SECRET_KEY) {
            return {
                success: false,
                error: 'MoMo credentials not configured',
            }
        }

        const orderId = `TOKEN_${params.userId}_${Date.now()}`
        const requestId = orderId
        const amount = Math.round(params.amount).toString()
        const orderInfo = params.orderInfo
        const redirectUrl = params.returnUrl
        const ipnUrl = params.notifyUrl
        const requestType = 'captureWallet'
        const extraData = JSON.stringify({
            userId: params.userId,
            packageId: params.packageId,
        })

        // Create signature
        const rawSignature =
            'accessKey=' +
            MOMO_ACCESS_KEY +
            '&amount=' +
            amount +
            '&extraData=' +
            extraData +
            '&ipnUrl=' +
            ipnUrl +
            '&orderId=' +
            orderId +
            '&orderInfo=' +
            orderInfo +
            '&partnerCode=' +
            MOMO_PARTNER_CODE +
            '&redirectUrl=' +
            redirectUrl +
            '&requestId=' +
            requestId +
            '&requestType=' +
            requestType

        const signature = crypto
            .createHmac('sha256', MOMO_SECRET_KEY)
            .update(rawSignature)
            .digest('hex')

        const requestBody = {
            partnerCode: MOMO_PARTNER_CODE,
            accessKey: MOMO_ACCESS_KEY,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: 'vi',
        }

        const endpoint = MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create'

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })

        const result = await response.json()

        if (result.resultCode === 0) {
            return {
                success: true,
                payUrl: result.payUrl,
                transactionId: orderId,
            }
        }

        return {
            success: false,
            error: result.message || 'MoMo payment creation failed',
        }
    } catch (error) {
        console.error('MoMo payment error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'MoMo payment failed',
        }
    }
}

/**
 * Verify MoMo callback signature
 */
export function verifyMoMoSignature(data: {
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
}): boolean {
    try {
        const { MOMO_SECRET_KEY, MOMO_ACCESS_KEY } = process.env

        if (!MOMO_SECRET_KEY || !MOMO_ACCESS_KEY) {
            return false
        }

        const rawSignature =
            'accessKey=' +
            MOMO_ACCESS_KEY +
            '&amount=' +
            data.amount +
            '&extraData=' +
            data.extraData +
            '&message=' +
            data.message +
            '&orderId=' +
            data.orderId +
            '&orderInfo=' +
            data.orderInfo +
            '&orderType=' +
            data.orderType +
            '&partnerCode=' +
            process.env.MOMO_PARTNER_CODE +
            '&payType=' +
            data.payType +
            '&requestId=' +
            data.requestId +
            '&responseTime=' +
            data.responseTime +
            '&resultCode=' +
            data.resultCode +
            '&transId=' +
            data.transId

        const signature = crypto
            .createHmac('sha256', MOMO_SECRET_KEY)
            .update(rawSignature)
            .digest('hex')

        return signature === data.signature
    } catch (error) {
        console.error('MoMo signature verification error:', error)
        return false
    }
}
