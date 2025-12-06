import { JWTPayload, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function tryParseId(idValue: unknown): string | null {
  if (typeof idValue === 'string') return idValue
  if (typeof idValue === 'number') return String(idValue)
  return null
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    const payload: JWTPayload | null = token ? await verifyToken(token) : null
    let userId: string | null = tryParseId(payload?.userId)
    if (!userId && payload?.email) {
      const u = await prisma.user.findUnique({ where: { email: payload.email } })
      userId = u?.id ?? null
    }
    if (!userId) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 })

    const existing = await prisma.blogLike.findUnique({ where: { postId_userId: { postId: params.id, userId } } })
    if (existing) {
      await prisma.blogLike.delete({ where: { id: existing.id } })
      await prisma.blogPost.update({ where: { id: params.id }, data: { likesCount: { decrement: 1 } } })
      return NextResponse.json({ liked: false })
    } else {
      await prisma.blogLike.create({ data: { postId: params.id, userId } })
      await prisma.blogPost.update({ where: { id: params.id }, data: { likesCount: { increment: 1 } } })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}
