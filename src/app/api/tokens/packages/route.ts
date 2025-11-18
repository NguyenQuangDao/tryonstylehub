import { NextResponse } from 'next/server'

const packages = [
  { id: 'starter', name: 'Starter', tokens: 20, price: 4.99, featured: true },
  { id: 'basic', name: 'Basic', tokens: 50, price: 9.99 },
  { id: 'pro', name: 'Pro', tokens: 120, price: 19.99 },
  { id: 'enterprise', name: 'Enterprise', tokens: 350, price: 49.99 },
]

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: packages })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}