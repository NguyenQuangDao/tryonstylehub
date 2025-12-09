import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadFileToS3 } from '@/lib/s3'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { NextRequest, NextResponse } from 'next/server'

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || ''
    const payload = token ? await verifyToken(token) : null
    const session = await getServerSession(authOptions)
    const userId = (payload as any)?.userId || (session?.user as any)?.id || null
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const shop = await prisma.shop.findUnique({ where: { ownerId: String(userId) } })
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }
    return NextResponse.json({ shop })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || ''
    const payload = token ? await verifyToken(token) : null
    const session = await getServerSession(authOptions)
    const userId = (payload as any)?.userId || (session?.user as any)?.id || null
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await request.formData()
    const name = String(form.get('name') || '').trim()
    const description = String(form.get('description') || '').trim()
    const address = String(form.get('address') || '').trim()
    const phone = String(form.get('phone') || '').trim()
    const email = String(form.get('email') || '').trim()
    const logo = form.get('logo') as File | null

    if (name && name.length < 2) {
      return NextResponse.json({ error: 'Tên shop không hợp lệ' }, { status: 400 })
    }
    if (address && address.length < 5) {
      return NextResponse.json({ error: 'Địa chỉ không hợp lệ' }, { status: 400 })
    }
    if (phone && !/^[0-9+\-()\s]{9,16}$/i.test(phone)) {
      return NextResponse.json({ error: 'Số điện thoại không hợp lệ' }, { status: 400 })
    }
    if (email && !isEmail(email)) {
      return NextResponse.json({ error: 'Email liên hệ không hợp lệ' }, { status: 400 })
    }

    const existing = await prisma.shop.findUnique({ where: { ownerId: String(userId) } })
    if (!existing) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    let logoUrl: string | undefined
    if (logo && typeof logo.size === 'number' && logo.size > 0) {
      try {
        logoUrl = await uploadFileToS3(logo, 'shops/logos')
      } catch {
        logoUrl = undefined
      }
    }

    const updated = await prisma.shop.update({
      where: { id: existing.id },
      data: {
        ...(name ? { name } : {}),
        ...(description ? { description } : {}),
        ...(address ? { address } : {}),
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
        ...(logoUrl ? { logoUrl } : {}),
      },
    })
    return NextResponse.json({ shop: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
