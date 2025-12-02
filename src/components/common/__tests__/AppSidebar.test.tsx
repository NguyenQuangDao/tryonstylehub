import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import AppSidebar from '../AppSidebar'
import '@testing-library/jest-dom'

vi.mock('@/lib/auth-context', () => {
  return {
    useAuth: () => ({ user: { email: 'test@ex.com', role: 'SHOPPER' }, logout: vi.fn(), loading: false }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})
vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/',
    useRouter: () => ({ push: vi.fn() }),
  }
})

describe('AppSidebar', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: any) => {
      if (url.includes('/api/seller/register-shop')) {
        return new Response(JSON.stringify({ success: true }), { status: 200 })
      }
      if (url.includes('/api/seller/products')) {
        return new Response(JSON.stringify({ products: [] }), { status: 200 })
      }
      return new Response('{}', { status: 200 })
    }))
  })

  it('opens Seller Panel sheet and shows tabs', async () => {
    render(<AppSidebar />)
    const trigger = screen.getAllByRole('button', { name: /Seller Panel/i })[0]
    fireEvent.click(trigger)
    expect(await screen.findByText(/Đăng ký shop/i)).toBeInTheDocument()
    expect(screen.getByText(/Đăng sản phẩm/i)).toBeInTheDocument()
    expect(screen.queryByText(/Quản lý shop/i)).toBeNull()
  })

  it('validates register form inputs', async () => {
    render(<AppSidebar />)
    const trigger = screen.getAllByRole('button', { name: /Seller Panel/i })[0]
    fireEvent.click(trigger)
    const submit = await screen.findByRole('button', { name: /Gửi đăng ký/i })
    fireEvent.click(submit)
    await waitFor(() => {
      expect(screen.getAllByText(/không hợp lệ|tối thiểu/i).length).toBeGreaterThan(0)
    })
  })
})
