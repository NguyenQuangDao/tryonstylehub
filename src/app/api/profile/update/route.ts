import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const displayName: string | undefined = body?.displayName
    const avatarDefaults = {
      gender: body?.gender as string | undefined,
      height: typeof body?.height === 'number' ? body.height : undefined,
      weight: typeof body?.weight === 'number' ? body.weight : undefined,
      skinTone: body?.skinTone as string | undefined,
      eyeColor: body?.eyeColor as string | undefined,
      hairColor: body?.hairColor as string | undefined,
      hairStyle: body?.hairStyle as string | undefined,
    }

    await prisma.$transaction(async (tx) => {
      if (typeof displayName === 'string' && displayName.trim().length > 0) {
        await tx.user.update({ where: { id: payload.userId }, data: { name: displayName.trim() } })
      }

      const existing = await tx.virtualModel.findFirst({
        where: { userId: payload.userId, avatarName: 'Default Avatar Settings' },
      })

      const data = {
        userId: payload.userId,
        avatarName: 'Default Avatar Settings',
        isPublic: false,
        height: avatarDefaults.height ?? 170,
        weight: avatarDefaults.weight ?? 65,
        gender: avatarDefaults.gender ?? 'male',
        hairColor: avatarDefaults.hairColor ?? 'black',
        hairStyle: avatarDefaults.hairStyle ?? 'short',
        bodyShape: null,
        skinTone: avatarDefaults.skinTone ?? 'medium',
        eyeColor: avatarDefaults.eyeColor ?? 'brown',
      }

      if (existing) {
        await tx.virtualModel.update({ where: { id: existing.id }, data })
      } else {
        await tx.virtualModel.create({ data })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

