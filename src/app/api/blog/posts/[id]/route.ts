import { JWTPayload, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function tryParseId(idValue: unknown): string | null {
  if (typeof idValue === 'string') return idValue
  if (typeof idValue === 'number') return String(idValue)
  return null
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const post = await prisma.blogPost.findUnique({ where: { id }, include: { author: true } })
    if (!post) return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 })
    const related = await prisma.blogPost.findMany({
      where: {
        id: { not: id },
        status: 'PUBLISHED',
        OR: Array.isArray(post.tags) && (post.tags as string[]).length > 0 ? (post.tags as string[]).map((t: string) => ({ tags: { array_contains: t } })) : [],
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    })
    return NextResponse.json({ post, related })
  } catch {
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const post = await prisma.blogPost.findUnique({ where: { id } })
    if (!post) return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 })
    if (post.authorId !== userId) return NextResponse.json({ error: 'Bạn không có quyền chỉnh sửa' }, { status: 403 })

    const form = await request.formData()
    const title = String(form.get('title') || '').trim()
    const content = String(form.get('content') || '').trim()
    const category = String(form.get('category') || '').trim() || null
    const tagsStr = String(form.get('tags') || '').trim()
    const rawFiles = form.getAll('media')
    const files = rawFiles.filter((f) => typeof (f as File).arrayBuffer === 'function') as File[]

    const allowedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const allowedVideos = ['video/mp4', 'video/webm', 'video/quicktime']
    const maxImageSize = 10 * 1024 * 1024
    const maxVideoSize = 100 * 1024 * 1024

    const validFiles = files.filter((file) => {
      if (allowedImages.includes(file.type)) return file.size > 0 && file.size <= maxImageSize
      if (allowedVideos.includes(file.type)) return file.size > 0 && file.size <= maxVideoSize
      return false
    })

    const toRollback: string[] = []
    const uploaded: Array<{ url: string; key: string; size: number; type: string }> = []

    if (validFiles.length > 0) {
      const { uploadToS3 } = await import('@/lib/s3')
      for (const file of validFiles) {
        const arrayBuffer = await file.arrayBuffer()
        const input = Buffer.from(arrayBuffer)
        const folder = `users/${userId}/blog`
        const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}-${(file.name || 'media').replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const contentType = file.type || 'application/octet-stream'
        const url = await uploadToS3(input, key, contentType)
        toRollback.push(key)
        uploaded.push({ url, key, size: file.size, type: contentType })
      }
    }

    try {
      const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : []
      const updated = await prisma.blogPost.update({
        where: { id },
        data: {
          title: title || undefined,
          content: content || undefined,
          category: category || undefined,
          tags: tags.length ? tags : undefined,
          media: uploaded.length ? [...(Array.isArray(post.media) ? (post.media as Array<{ url: string; key: string; size: number; type: string }>) : []), ...uploaded] : undefined,
        },
      })
      return NextResponse.json({ success: true, post: updated })
    } catch {
      try {
        const { deleteFromS3 } = await import('@/lib/s3')
        await Promise.all(toRollback.map((k) => deleteFromS3(k)))
      } catch {}
      return NextResponse.json({ error: 'Có lỗi xảy ra khi cập nhật bài viết' }, { status: 500 })
    }
  } catch {
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const post = await prisma.blogPost.findUnique({ where: { id } })
    if (!post) return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 })
    if (post.authorId !== userId) return NextResponse.json({ error: 'Bạn không có quyền xóa' }, { status: 403 })

    const media = Array.isArray(post.media) ? (post.media as Array<{ key?: string }>) : []
    try {
      await prisma.blogPost.delete({ where: { id } })
      const { deleteFromS3 } = await import('@/lib/s3')
      await Promise.all(media.map((m) => m?.key ? deleteFromS3(m.key) : Promise.resolve()))
      return NextResponse.json({ success: true })
    } catch {
      return NextResponse.json({ error: 'Có lỗi xảy ra khi xóa bài viết' }, { status: 500 })
    }
  } catch {
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}
