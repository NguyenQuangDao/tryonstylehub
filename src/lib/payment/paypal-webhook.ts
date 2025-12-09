const clientId = process.env.PAYPAL_CLIENT_ID || ''
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || ''
const mode = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase()
const base = process.env.PAYPAL_API_BASE || (mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com')

async function getAccessToken(): Promise<string | null> {
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

export async function verifyPaypalWebhookSignature(headers: Headers, rawBody: string): Promise<{ verified: boolean; event?: any; error?: string }>{
  try {
    const token = await getAccessToken()
    if (!token) return { verified: false, error: 'PayPal not configured' }

    const transmissionId = headers.get('paypal-transmission-id') || headers.get('PayPal-Transmission-Id') || ''
    const transmissionTime = headers.get('paypal-transmission-time') || headers.get('PayPal-Transmission-Time') || ''
    const certUrl = headers.get('paypal-cert-url') || headers.get('PayPal-Cert-Url') || ''
    const authAlgo = headers.get('paypal-auth-algo') || headers.get('PayPal-Auth-Algo') || ''
    const transmissionSig = headers.get('paypal-transmission-sig') || headers.get('PayPal-Transmission-Sig') || ''
    const webhookId = process.env.PAYPAL_WEBHOOK_ID || ''

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig || !webhookId) {
      return { verified: false, error: 'Missing webhook headers or webhook id' }
    }

    const event = JSON.parse(rawBody)

    const res = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: webhookId,
        webhook_event: event,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      return { verified: false, error: err }
    }
    const json = await res.json() as any
    const ok = (json?.verification_status as string) === 'SUCCESS'
    return { verified: ok, event }
  } catch (e) {
    return { verified: false, error: e instanceof Error ? e.message : 'Verify failed' }
  }
}

async function getOrderDetails(orderId: string): Promise<any | null> {
  const token = await getAccessToken()
  if (!token) return null
  const res = await fetch(`${base}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) return null
  return res.json()
}

export async function extractPurchaseMetadataFromEvent(event: any): Promise<{ userId?: string; packageId?: string; orderId?: string; captureId?: string }>{
  try {
    const type = event?.event_type as string | undefined
    const resource = event?.resource as any
    if (!type || !resource) return {}

    if (type === 'PAYMENT.CAPTURE.COMPLETED') {
      const captureId = resource?.id as string | undefined
      const orderId = resource?.supplementary_data?.related_ids?.order_id as string | undefined
      let customId: string | undefined = resource?.custom_id
      if (!customId && orderId) {
        const order = await getOrderDetails(orderId)
        customId = order?.purchase_units?.[0]?.custom_id
      }
      const [userId, packageId] = (customId || '').split(':')
      return { userId, packageId, orderId, captureId }
    }

    if (type === 'CHECKOUT.ORDER.APPROVED' || type === 'CHECKOUT.ORDER.COMPLETED') {
      const orderId = resource?.id as string | undefined
      const customId = resource?.purchase_units?.[0]?.custom_id as string | undefined
      const [userId, packageId] = (customId || '').split(':')
      return { userId, packageId, orderId }
    }

    return {}
  } catch {
    return {}
  }
}
