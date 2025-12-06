import { JWTPayload, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function tryParseId(idValue: unknown): string | null {
  if (typeof idValue === 'string') return idValue
  if (typeof idValue === 'number') return String(idValue)
  return null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const comments = await prisma.blogComment.findMany({
      where: { postId: params.id },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    })
    return NextResponse.json({ comments })
  } catch (error) {
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
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

    const form = await request.formData()
    const content = String(form.get('content') || '').trim()
    const rawFiles = form.getAll('media')
    const files = rawFiles.filter((f) => typeof (f as File).arrayBuffer === 'function') as File[]
    if (!content) return NextResponse.json({ error: 'Thiếu nội dung bình luận' }, { status: 400 })

    const allowedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxImageSize = 10 * 1024 * 1024
    const validFiles = files.filter((file) => allowedImages.includes(file.type) && file.size > 0 && file.size <= maxImageSize)

    const toRollback: string[] = []
    const uploaded: any[] = []

    if (validFiles.length > 0) {
      const { uploadToS3 } = await import('@/lib/s3')
      for (const file of validFiles) {
        const arrayBuffer = await file.arrayBuffer()
        const input = Buffer.from(arrayBuffer)
        const folder = `users/${userId}/blog/comments`
        const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}-${(file.name || 'image').replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const contentType = file.type || 'image/jpeg'
        const url = await uploadToS3(input, key, contentType)
        toRollback.push(key)
        uploaded.push({ url, key, size: file.size, type: contentType })
      }
    }

    try {
      const comment = await prisma.blogComment.create({
        data: { postId: params.id, userId, content, media: uploaded },
      })
      await prisma.blogPost.update({ where: { id: params.id }, data: { commentsCount: { increment: 1 } } })
      return NextResponse.json({ success: true, comment })
    } catch (err) {
      try {
        const { deleteFromS3 } = await import('@/lib/s3')
        await Promise.all(toRollback.map((k) => deleteFromS3(k)))
      } catch {}
      return NextResponse.json({ error: 'Có lỗi xảy ra khi tạo bình luận' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}
