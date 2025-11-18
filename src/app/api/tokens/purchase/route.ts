import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyToken } from '../../../../lib/auth'

const packages = [
  { id: 'starter', name: 'Starter', tokens: 20, price: 4.99 },
  { id: 'basic', name: 'Basic', tokens: 50, price: 9.99 },
  { id: 'pro', name: 'Pro', tokens: 120, price: 19.99 },
  { id: 'enterprise', name: 'Enterprise', tokens: 350, price: 49.99 },
]

export async function POST(req: NextRequest) {
  try {
    const tokenCookie = req.cookies.get('token')?.value
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(tokenCookie)
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const pkg = packages.find(p => p.id === body?.packageId)
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    const stripePaymentId = `manual-${Date.now()}`

    await prisma.$transaction(async (tx) => {
      await tx.tokenPurchase.create({
        data: {
          userId: payload.userId,
          stripePaymentId,
          amount: pkg.price,
          tokens: pkg.tokens,
          status: 'completed',
        }
      })

      await tx.user.update({
        where: { id: payload.userId },
        data: { tokenBalance: { increment: pkg.tokens } },
      })
    })

    return NextResponse.json({ success: true, data: { paymentId: stripePaymentId, tokensAdded: pkg.tokens } })
  } catch (error) {
    console.error('Token purchase error:', error)
    return NextResponse.json({ error: 'Failed to purchase tokens' }, { status: 500 })
  }
}