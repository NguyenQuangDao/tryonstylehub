import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { hashPassword, isValidPassword } from '../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, token, code, newPassword } = await request.json()

    if (!email || (!token && !code) || !newPassword) {
      return NextResponse.json({ error: 'Thiếu email, mã hoặc mật khẩu mới' }, { status: 400 })
    }

    const validation = isValidPassword(newPassword)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      return NextResponse.json({ error: 'Token không hợp lệ hoặc đã sử dụng' }, { status: 400 })
    }

    const now = new Date()
    const provided = token || code
    if (user.resetPasswordToken !== provided || user.resetPasswordExpires <= now) {
      return NextResponse.json({ error: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 400 })
    }

    const hashed = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi đặt lại mật khẩu' }, { status: 500 })
  }
}
