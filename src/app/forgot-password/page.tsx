"use client"
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [message, setMessage] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage('Nếu email tồn tại, chúng tôi đã gửi mã xác thực 8 ký tự vào email.')
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
      <h1 className="text-2xl font-semibold mb-4">Quên mật khẩu</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded px-3 py-2"
          disabled={status==='loading'}
        >
          {status==='loading' ? 'Đang gửi...' : 'Gửi mã xác thực'}
        </button>
      </form>
      {message && (
        <p className="mt-4 text-sm">{message}</p>
      )}
      {status==='success' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setStatus('loading')
            try {
              const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword }),
              })
              const data = await res.json()
              if (res.ok) {
                setStatus('success')
                setMessage('Đặt lại mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.')
              } else {
                setStatus('error')
                setMessage(data.error || 'Đã xảy ra lỗi')
              }
            } catch {
              setStatus('error')
              setMessage('Không thể gửi yêu cầu, vui lòng thử lại')
            }
          }}
          className="space-y-4 mt-6"
        >
          <div>
            <label className="block mb-1">Mã xác thực</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full border rounded px-3 py-2"
              required
              maxLength={8}
            />
          </div>
          <div>
            <label className="block mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white rounded px-3 py-2"
            disabled={status==='loading'}
          >
            {status==='loading' ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
      )}
    </div>
  )
}
