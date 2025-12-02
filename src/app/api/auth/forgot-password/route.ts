import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { isValidEmail } from '../../../../lib/auth'
import { generateResetCode, buildResetEmailCode } from '../../../../lib/password-reset'
import { sendMail } from '../../../../lib/mail'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email là bắt buộc' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Tránh lộ thông tin tồn tại email
    if (!user) {
      return NextResponse.json({ success: true })
    }

    const { code, expires } = generateResetCode(8)

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: code, resetPasswordExpires: expires },
    })

    const { subject, html } = buildResetEmailCode({ email, code })

    try {
      await sendMail({ to: email, subject, html })
    } catch (err) {
      // Không tiết lộ lỗi email ra ngoài, nhưng log server
      console.error('Send reset email error:', err)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi yêu cầu đặt lại mật khẩu' }, { status: 500 })
  }
}
