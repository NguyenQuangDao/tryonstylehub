import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyToken } from '../../../../lib/auth'

export async function GET(req: NextRequest) {
  try {
    const tokenCookie = req.cookies.get('token')?.value
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(tokenCookie)
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        tokenBalance: true,
        name: true,
        email: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const purchases = await prisma.tokenPurchase.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        amount: true,
        tokens: true,
        status: true,
        createdAt: true,
        stripePaymentId: true,
      }
    })

    const totalPurchased = purchases.reduce((sum, p) => sum + (p.status === 'completed' ? p.tokens : 0), 0)
    const totalUsed = totalPurchased - user.tokenBalance

    return NextResponse.json({
      success: true,
      data: {
        balance: user.tokenBalance,
        totalPurchased,
        totalUsed,
        recentPurchases: purchases,
      }
    })
  } catch (error) {
    console.error('Get token balance error:', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}