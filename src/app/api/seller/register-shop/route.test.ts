import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(async () => ({ id: 'user-1', email: 'u@e.com' })),
        update: vi.fn(async () => ({})),
      },
      shop: {
        findUnique: vi.fn(async () => null),
        findFirst: vi.fn(async () => null),
        create: vi.fn(async (args: any) => ({ id: 'shop-1', ...args.data })),
      },
    },
  }
})

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => ({ value: 'token-123' }) }),
}))

vi.mock('@/lib/auth', () => ({
  verifyToken: vi.fn(async () => ({ userId: 'user-1', email: 'u@e.com' })),
  createToken: vi.fn(async () => 'new-token'),
}))

vi.mock('next-auth', () => ({ getServerSession: vi.fn(async () => null) }))

describe('POST /api/seller/register-shop', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('lưu address/phone/email vào Shop', async () => {
    const fd = new FormData()
    fd.append('name', 'Shop ABC')
    fd.append('description', 'Desc')
    fd.append('address', '123 Street')
    fd.append('phone', '0123456789')
    fd.append('email', 'shop@abc.com')
    const req = new Request('http://localhost/api/seller/register-shop', { method: 'POST', body: fd })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json: any = await res.json()
    expect(json.redirect).toBe('/dashboard/seller')
    expect((prisma.user.update as any).mock.calls[0][0]).toMatchObject({ where: { id: 'user-1' }, data: { role: 'SELLER' } })
  })

  it('validate số điện thoại không hợp lệ', async () => {
    const fd = new FormData()
    fd.append('name', 'Shop ABC')
    fd.append('address', '123 Street')
    fd.append('phone', 'abc!!')
    const req = new Request('http://localhost/api/seller/register-shop', { method: 'POST', body: fd })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json: any = await res.json()
    expect(json.error).toMatch(/Số điện thoại/)
  })
})
