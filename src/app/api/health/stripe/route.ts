import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  try {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      return NextResponse.json({ status: 'error', error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 })
    }
    const stripe = new Stripe(key)
    const pi = await stripe.paymentIntents.create({ amount: 100, currency: 'usd' })
    return NextResponse.json({ status: 'ok', paymentIntentId: pi.id })
  } catch (error) {
    return NextResponse.json({ status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
