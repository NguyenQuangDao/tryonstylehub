import { verifyToken } from '@/lib/auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { uploadFileToS3 } from '@/lib/s3'
import { getServerSession } from 'next-auth'
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
      return NextResponse.json({ error: 'Bạn phải đăng ký làm seller trước' }, { status: 404 })
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

    const contentType = request.headers.get('content-type') || ''
    let name = ''
    let description = ''
    let address = ''
    let phone = ''
    let email = ''
    let logo: File | null = null

    if (contentType.includes('application/json')) {
      const body = await request.json()
      name = String(body.name || '').trim()
      description = String(body.description || '').trim()
      address = String(body.address || '').trim()
      phone = String(body.phone || '').trim()
      email = String(body.email || '').trim()
    } else {
      const form = await request.formData()
      name = String(form.get('name') || '').trim()
      description = String(form.get('description') || '').trim()
      address = String(form.get('address') || '').trim()
      phone = String(form.get('phone') || '').trim()
      email = String(form.get('email') || '').trim()
      logo = form.get('logo') as File | null
    }

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
      return NextResponse.json({ error: 'Bạn phải đăng ký làm seller trước' }, { status: 404 })
    }

    let logoUrl: string | undefined
    if (logo && typeof logo.size === 'number' && logo.size > 0) {
      try {
        logoUrl = await uploadFileToS3(logo, 'shops/logos')
      } catch (e) {
        console.error('Upload logo error:', e)
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
    console.error('Update shop error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
