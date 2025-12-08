import { JWTPayload, verifyToken, createToken } from '@/lib/auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { uploadFileToS3 } from '@/lib/s3'
import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    const payload: JWTPayload | null = token ? await verifyToken(token) : null
    const session = await getServerSession(authOptions)

    let userId: string | null = null
    const tryParseId = (idValue: unknown): string | null => {
      if (typeof idValue === 'string') {
        return idValue
      }
      if (typeof idValue === 'number') {
        return String(idValue)
      }
      return null
    }

    userId = tryParseId(payload?.userId) ?? tryParseId(session?.user?.id)

    if (!userId && payload?.email) {
      const u = await prisma.user.findUnique({ where: { email: payload.email } })
      userId = u?.id ?? null
    }

    if (!userId) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 })
    }

    const formData = await request.formData()
    const name = String(formData.get('name') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const logo = formData.get('logo') as File | null

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Tên shop không hợp lệ' }, { status: 400 })
    }

    let logoUrl: string | null = null
    if (logo && typeof logo.size === 'number' && logo.size > 0) {
      try {
        logoUrl = await uploadFileToS3(logo, 'shops/logos')
      } catch {
        logoUrl = null
      }
    }

    const existingShop = await prisma.shop.findUnique({ where: { ownerId: userId as string } })
    if (existingShop) {
      return NextResponse.json(
        { error: 'Bạn đã đăng ký shop. Mỗi tài khoản chỉ được phép có một shop', redirect: '/dashboard/seller' },
        { status: 409 }
      )
    }

    let baseSlug = slugify(name)
    if (!baseSlug) baseSlug = `shop-${Date.now()}`
    let slug = baseSlug
    const existing = await prisma.shop.findFirst({ where: { slug } })
    if (existing) slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`

    const shop = await prisma.shop.create({
      data: {
        name,
        slug,
        logoUrl,
        description: description || null,
        ownerId: userId as string,
        status: 'ACTIVE',
      },
    })

    await prisma.user.update({ where: { id: userId as string }, data: { role: 'SELLER' } })

    try {
      const token = await createToken({
        userId: userId as string,
        email: payload?.email ?? session?.user?.email ?? '',
        name: session?.user?.name ?? payload?.name ?? '',
        role: 'SELLER',
        shopId: shop.id,
      })
      const response = NextResponse.json({ success: true, redirect: '/dashboard/seller' })
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
      return response
    } catch {
      return NextResponse.json({ success: true, redirect: '/dashboard/seller' })
    }
  } catch (error) {
    console.error('Register shop error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra khi đăng ký shop' }, { status: 500 })
  }
}
