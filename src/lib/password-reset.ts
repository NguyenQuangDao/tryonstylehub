import crypto from 'crypto'

export function generateResetToken() {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 30 * 60 * 1000)
  return { token, expires }
}

export function generateResetCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(length)
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length]
  }
  const expires = new Date(Date.now() + 30 * 60 * 1000)
  return { code, expires }
}

export function buildResetEmailCode({ email, code }: { email: string; code: string }) {
  const subject = 'Mã xác thực đặt lại mật khẩu'
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6">
      <h2>Mã xác thực</h2>
      <p>Mã đặt lại mật khẩu cho tài khoản <b>${email}</b> là:</p>
      <p style="font-size:22px;font-weight:700;letter-spacing:2px">${code}</p>
      <p>Mã sẽ hết hạn sau 30 phút. Vui lòng nhập mã này trong ứng dụng để đặt lại mật khẩu.</p>
    </div>
  `
  return { subject, html }
}
