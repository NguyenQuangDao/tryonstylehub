import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'
import { verifyToken, JWTPayload } from './auth'

type RequireResult = {
  ok: boolean
  user?: { id: string; email: string; name: string; role: 'ADMIN' | 'USER' | 'SELLER' }
  response?: NextResponse
}

async function getUserFromPayload(payload: JWTPayload): Promise<{ id: string; email: string; name: string; role: 'ADMIN' | 'USER' | 'SELLER' } | null> {
  try {
    if (payload.userId) {
      const u = await prisma.user.findUnique({ where: { id: String(payload.userId) }, select: { id: true, email: true, name: true, role: true } })
      if (u) return { id: u.id, email: u.email, name: u.name, role: u.role as any }
    }
    if (payload.email) {
      const u = await prisma.user.findUnique({ where: { email: String(payload.email) }, select: { id: true, email: true, name: true, role: true } })
      if (u) return { id: u.id, email: u.email, name: u.name, role: u.role as any }
    }
    return null
  } catch {
    return null
  }
}

export async function requireAuth(req: NextRequest): Promise<RequireResult> {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const payload = await verifyToken(token)
  if (!payload) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const user = await getUserFromPayload(payload)
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { ok: true, user }
}

export async function requireAdmin(req: NextRequest): Promise<RequireResult> {
  const auth = await requireAuth(req)
  if (!auth.ok || !auth.user) return auth
  if (auth.user.role !== 'ADMIN') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true, user: auth.user }
}

export async function requireSeller(req: NextRequest): Promise<RequireResult> {
  const auth = await requireAuth(req)
  if (!auth.ok || !auth.user) return auth
  if (auth.user.role !== 'SELLER') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true, user: auth.user }
}

