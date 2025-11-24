/**
 * ZaloPay Payment Integration
 * Handles ZaloPay e-wallet payments for Vietnam market
 */

import crypto from 'crypto'

export interface ZaloPayPaymentParams {
    amount: number // Amount in VND
    userId: number
    packageId: string
    description: string
    callbackUrl: string
}

export interface ZaloPayPaymentResult {
    success: boolean
    orderUrl?: string
    transactionId?: string
    error?: string
}

/**
 * Create ZaloPay payment order
 */
export async function createZaloPayPayment(
    params: ZaloPayPaymentParams
): Promise<ZaloPayPaymentResult> {
    try {
        const {
            ZALOPAY_APP_ID,
            ZALOPAY_KEY1,
            ZALOPAY_KEY2,
            ZALOPAY_ENDPOINT,
        } = process.env

        if (!ZALOPAY_APP_ID || !ZALOPAY_KEY1 || !ZALOPAY_KEY2) {
            return {
                success: false,
                error: 'ZaloPay credentials not configured',
            }
        }

        const transId = `${Date.now()}`
        const appTransId = `${new Date().toISOString().slice(0, 6).replace(/-/g, '')}_${transId}`

        const embedData = JSON.stringify({
            redirecturl: params.callbackUrl,
            userId: params.userId,
            packageId: params.packageId,
        })

        const items = JSON.stringify([
            {
                itemid: params.packageId,
                itemname: 'Token Package',
                itemprice: params.amount,
                itemquantity: 1,
            },
        ])

        const orderData = {
            app_id: parseInt(ZALOPAY_APP_ID),
            app_trans_id: appTransId,
            app_user: `user_${params.userId}`,
            app_time: Date.now(),
            amount: Math.round(params.amount),
            item: items,
            embed_data: embedData,
            description: params.description,
            bank_code: 'zalopayapp',
        }

        // Create MAC signature
        const data =
            orderData.app_id +
            '|' +
            orderData.app_trans_id +
            '|' +
            orderData.app_user +
            '|' +
            orderData.amount +
            '|' +
            orderData.app_time +
            '|' +
            orderData.embed_data +
            '|' +
            orderData.item

        const mac = crypto
            .createHmac('sha256', ZALOPAY_KEY1)
            .update(data)
            .digest('hex')

        const requestBody = {
            ...orderData,
            mac,
        }

        const endpoint = ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2/create'

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody as unknown as Record<string, string>),
        })

        const result = await response.json()

        if (result.return_code === 1) {
            return {
                success: true,
                orderUrl: result.order_url,
                transactionId: appTransId,
            }
        }

        return {
            success: false,
            error: result.return_message || 'ZaloPay payment creation failed',
        }
    } catch (error) {
        console.error('ZaloPay payment error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'ZaloPay payment failed',
        }
    }
}

/**
 * Verify ZaloPay callback signature
 */
export function verifyZaloPayCallback(data: {
    data: string
    mac: string
}): boolean {
    try {
        const { ZALOPAY_KEY2 } = process.env

        if (!ZALOPAY_KEY2) {
            return false
        }

        const calculatedMac = crypto
            .createHmac('sha256', ZALOPAY_KEY2)
            .update(data.data)
            .digest('hex')

        return calculatedMac === data.mac
    } catch (error) {
        console.error('ZaloPay callback verification error:', error)
        return false
    }
}

/**
 * Query ZaloPay order status
 */
export async function queryZaloPayOrder(
    appTransId: string
): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
        const { ZALOPAY_APP_ID, ZALOPAY_KEY1 } = process.env

        if (!ZALOPAY_APP_ID || !ZALOPAY_KEY1) {
            return {
                success: false,
                error: 'ZaloPay credentials not configured',
            }
        }

        const data = ZALOPAY_APP_ID + '|' + appTransId + '|' + ZALOPAY_KEY1
        const mac = crypto.createHmac('sha256', ZALOPAY_KEY1).update(data).digest('hex')

        const requestBody = {
            app_id: ZALOPAY_APP_ID,
            app_trans_id: appTransId,
            mac,
        }

        const response = await fetch('https://sb-openapi.zalopay.vn/v2/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody),
        })

        const result = await response.json()

        if (result.return_code === 1) {
            return {
                success: true,
                status: 'completed',
            }
        }

        return {
            success: false,
            error: result.return_message || 'Order not found or failed',
        }
    } catch (error) {
        console.error('ZaloPay query error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Query failed',
        }
    }
}
