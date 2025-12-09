import { JWTPayload, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function tryParseId(idValue: unknown): string | null {
  if (typeof idValue === 'string') return idValue
  if (typeof idValue === 'number') return String(idValue)
  return null
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const keyword = (url.searchParams.get('q') || '').trim()
    const category = (url.searchParams.get('category') || '').trim()
    const sort = (url.searchParams.get('sort') || 'newest').trim()
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1)
    const limit = Math.max(parseInt(url.searchParams.get('limit') || '20', 10), 1)
    const authorParam = (url.searchParams.get('author') || '').trim()

    const where: any = {}
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { content: { contains: keyword } },
      ]
    }
    if (category) where.category = category
    where.status = 'PUBLISHED'

    if (authorParam) {
      if (authorParam === 'me') {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        const payload: JWTPayload | null = token ? await verifyToken(token) : null
        let userId: string | null = tryParseId(payload?.userId)
        if (!userId && payload?.email) {
          const u = await prisma.user.findUnique({ where: { email: payload.email } })
          userId = u?.id ?? null
        }
        if (userId) where.authorId = userId
      } else {
        where.authorId = authorParam
      }
    }

    const total = await prisma.blogPost.count({ where })
    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: sort === 'popular' ? { likesCount: 'desc' } : { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { author: true },
    })

    return NextResponse.json({ posts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (error) {
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const title = String(form.get('title') || '').trim()
    const content = String(form.get('content') || '').trim()
    const category = String(form.get('category') || '').trim() || null
    const tagsStr = String(form.get('tags') || '').trim()
    const rawFiles = form.getAll('media')
    const files = rawFiles.filter((f) => typeof (f as File).arrayBuffer === 'function') as File[]

    if (!title || !content) return NextResponse.json({ error: 'Thiếu tiêu đề hoặc nội dung' }, { status: 400 })

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
    const uploaded: any[] = []

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
      const post = await prisma.blogPost.create({
        data: {
          authorId: userId,
          title,
          slug: slugify(`${title}-${Date.now().toString(36)}`),
          content,
          media: uploaded,
          category: category || undefined,
          tags,
          status: 'PUBLISHED',
        },
      })
      return NextResponse.json({ success: true, post })
    } catch (err) {
      try {
        const { deleteFromS3 } = await import('@/lib/s3')
        await Promise.all(toRollback.map((k) => deleteFromS3(k)))
      } catch {}
      return NextResponse.json({ error: 'Có lỗi xảy ra khi tạo bài viết' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}
