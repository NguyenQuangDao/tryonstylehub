import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '../../../../lib/auth'
import { refundPaypalCapture } from '../../../../lib/payment/paypal'

export async function POST(req: NextRequest) {
  try {
    const tokenCookie = req.cookies.get('token')?.value
    if (!tokenCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyToken(tokenCookie)
    if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const captureId: string | undefined = body?.captureId
    const amount: number | undefined = body?.amount
    const currency: string = (body?.currency || 'USD')
    if (!captureId) return NextResponse.json({ error: 'Missing captureId' }, { status: 400 })

    const res = await refundPaypalCapture(captureId, amount, currency)
    if (!res.success) {
      return NextResponse.json({ error: res.error || 'Refund failed' }, { status: 400 })
    }
    return NextResponse.json({ success: true, status: res.status })
  } catch (error) {
    console.error('Refund error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

