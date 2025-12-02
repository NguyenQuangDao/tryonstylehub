"use client"
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const params = useSearchParams()
  const email = params.get('email') || ''
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [message, setMessage] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage('Đặt lại mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.')
      } else {
        setStatus('error')
        setMessage(data.error || 'Đã xảy ra lỗi')
      }
    } catch (err) {
      setStatus('error')
      setMessage('Không thể gửi yêu cầu, vui lòng thử lại')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Đặt lại mật khẩu</h1>
      {!email || !token ? (
        <p className="text-sm">Liên kết không hợp lệ. Vui lòng yêu cầu lại từ trang quên mật khẩu.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded px-3 py-2"
            disabled={status==='loading'}
          >
            {status==='loading' ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
      )}
      {message && (
        <p className="mt-4 text-sm">{message}</p>
      )}
    </div>
  )
}

