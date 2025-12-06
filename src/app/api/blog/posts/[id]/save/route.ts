import { JWTPayload, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function tryParseId(idValue: unknown): string | null {
  if (typeof idValue === 'string') return idValue
  if (typeof idValue === 'number') return String(idValue)
  return null
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    const payload: JWTPayload | null = token ? await verifyToken(token) : null
    let userId: string | null = tryParseId(payload?.userId)
    if (!userId && payload?.email) {
      const u = await prisma.user.findUnique({ where: { email: payload.email } })
      userId = u?.id ?? null
    }
    if (!userId) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 })

    const existing = await prisma.blogSave.findUnique({ where: { postId_userId: { postId: id, userId } } })
    if (existing) {
      await prisma.blogSave.delete({ where: { id: existing.id } })
      await prisma.blogPost.update({ where: { id }, data: { savesCount: { decrement: 1 } } })
      return NextResponse.json({ saved: false })
    } else {
      await prisma.blogSave.create({ data: { postId: id, userId } })
      await prisma.blogPost.update({ where: { id }, data: { savesCount: { increment: 1 } } })
      return NextResponse.json({ saved: true })
    }
  } catch {
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}
