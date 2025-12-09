import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock useAuth
vi.mock('@/lib/auth-context', () => {
  return {
    useAuth: () => ({
      user: null,
      loading: false,
      register: vi.fn(async () => {}),
    }),
  }
})

// Mock next/navigation router
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

import RegisterPage from '@/app/register/page'

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('hiển thị Tabs và mặc định chọn Người dùng thường', () => {
    render(<RegisterPage />)
    expect(screen.getByText('Người dùng thường')).toBeInTheDocument()
    expect(screen.getByText('Người bán')).toBeInTheDocument()
    expect(screen.queryByLabelText('Tên cửa hàng')).toBeNull()
  })

  it.skip('chuyển sang tab Người bán và hiển thị các trường seller', async () => {
    render(<RegisterPage />)
    fireEvent.click(screen.getByRole('tab', { name: 'Người bán' }))
    expect(await screen.findByLabelText('Tên cửa hàng')).toBeVisible()
    expect(screen.getByLabelText('Địa chỉ kinh doanh')).toBeVisible()
    expect(screen.getByLabelText('Số điện thoại liên hệ')).toBeVisible()
  })

  it.skip('submit Người dùng thường gọi API register', async () => {
    const { useAuth } = await import('@/lib/auth-context')
    const registerMock = (useAuth() as any).register as ReturnType<typeof vi.fn>
    render(<RegisterPage />)
    fireEvent.input(screen.getByLabelText('Tên đầy đủ'), { target: { value: 'User A' } })
    fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.input(screen.getByLabelText('Mật khẩu'), { target: { value: '123456' } })
    fireEvent.input(screen.getByLabelText('Xác nhận mật khẩu'), { target: { value: '123456' } })
    fireEvent.click(screen.getByRole('button', { name: 'Đăng Ký' }))
    await waitFor(() => expect(registerMock).toHaveBeenCalledWith('a@b.com', 'User A', '123456'))
  })

  it.skip('submit Người bán gọi API register và API seller/register-shop', async () => {
    const { useAuth } = await import('@/lib/auth-context')
    const registerMock = (useAuth() as any).register as ReturnType<typeof vi.fn>
    const fetchMock = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ user: { id: 'u1' } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ redirect: '/dashboard/seller' }), { status: 200 }))

    render(<RegisterPage />)
    fireEvent.click(screen.getByRole('tab', { name: 'Người bán' }))
    fireEvent.input(screen.getByLabelText('Tên đầy đủ'), { target: { value: 'Seller A' } })
    fireEvent.input(screen.getByLabelText('Email'), { target: { value: 's@b.com' } })
    fireEvent.input(screen.getByLabelText('Mật khẩu'), { target: { value: '123456' } })
    fireEvent.input(screen.getByLabelText('Xác nhận mật khẩu'), { target: { value: '123456' } })
    fireEvent.input(screen.getByLabelText('Tên cửa hàng'), { target: { value: 'Shop X' } })
    fireEvent.input(screen.getByLabelText('Địa chỉ kinh doanh'), { target: { value: '123 Street' } })
    fireEvent.input(screen.getByLabelText('Số điện thoại liên hệ'), { target: { value: '0123456789' } })
    fireEvent.click(screen.getByRole('button', { name: 'Đăng Ký Người Bán' }))

    await waitFor(() => expect(registerMock).toHaveBeenCalledWith('s@b.com', 'Seller A', '123456'))
    expect(fetchMock).toHaveBeenCalledWith('/api/seller/register-shop', expect.objectContaining({ method: 'POST' }))
  })
})
