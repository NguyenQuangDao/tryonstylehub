const clientId = process.env.PAYPAL_CLIENT_ID || ''
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || ''
const mode = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase()
const base = process.env.PAYPAL_API_BASE || (mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com')

export async function getAccessToken(): Promise<string | null> {
  if (!clientId || !clientSecret) return null
  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) return null
  const data = await res.json() as any
  return data.access_token as string
}

export interface CreateOrderParams {
  amount: number
  currency: string
  userId: string
  packageId: string
  userEmail: string
  returnUrl?: string
  cancelUrl?: string
}

export async function createPaypalOrder(params: CreateOrderParams): Promise<{ success: boolean; orderId?: string; approvalUrl?: string; error?: string }>{
  try {
    const token = await getAccessToken()
    if (!token) return { success: false, error: 'PayPal is not configured' }

    const supported = new Set(['USD','EUR','AUD','CAD','GBP','JPY'])
    const requested = params.currency.toUpperCase()
    const currency = supported.has(requested) ? requested : 'USD'
    const zeroDecimalCurrencies = new Set(['JPY', 'KRW', 'VND'])
    const value = zeroDecimalCurrencies.has(currency)
      ? String(Math.round(params.amount))
      : String(Number(params.amount).toFixed(2))

    const res = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `${params.userId}-${Date.now()}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: { currency_code: currency, value },
            description: `Token purchase - Package: ${params.packageId}`,
            custom_id: `${params.userId}:${params.packageId}`,
          },
        ],
        application_context: {
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
        },
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      return { success: false, error: err }
    }
    const order = await res.json() as any
    const id = order?.id as string | undefined
    const links = order?.links as Array<{ rel: string; href: string }> | undefined
    const approve = links?.find(l => l.rel === 'approve')?.href

    return { success: true, orderId: id, approvalUrl: approve }
  } catch (error) {
    console.error('PayPal create order error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Create order failed' }
  }
}

export async function capturePaypalOrder(orderId: string): Promise<{ success: boolean; captureId?: string; status?: string; error?: string }>{
  try {
    const token = await getAccessToken()
    if (!token) return { success: false, error: 'PayPal is not configured' }
    const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) {
      const err = await res.text()
      return { success: false, error: err }
    }
    const capture = await res.json() as any
    const status = capture?.status as string | undefined
    const captures = capture?.purchase_units?.[0]?.payments?.captures
    const captureId = captures?.[0]?.id as string | undefined
    return { success: status === 'COMPLETED', captureId, status }
  } catch (error) {
    console.error('PayPal capture error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Capture failed' }
  }
}

export async function refundPaypalCapture(captureId: string, amount?: number, currency: string = 'USD'): Promise<{ success: boolean; status?: string; error?: string }>{
  try {
    const token = await getAccessToken()
    if (!token) return { success: false, error: 'PayPal is not configured' }
    const body: any = {}
    if (amount) {
      const value = new Set(['JPY', 'KRW', 'VND']).has(currency.toUpperCase())
        ? String(Math.round(amount))
        : String(Number(amount).toFixed(2))
      body.amount = { currency_code: currency.toUpperCase(), value }
    }
    const res = await fetch(`${base}/v2/payments/captures/${captureId}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.text()
      return { success: false, error: err }
    }
    const json = await res.json() as any
    const status = json?.status as string | undefined
    return { success: !!status, status }
  } catch (error) {
    console.error('PayPal refund error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Refund failed' }
  }
}
