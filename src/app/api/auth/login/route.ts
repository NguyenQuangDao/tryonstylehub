import { createToken, isValidEmail, verifyPassword } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Create token và set cookie nếu cấu hình đầy đủ
    try {
      const token = await createToken({ userId: user.id, email: user.email, name: user.name });
      const response = NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
      });
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return response;
    } catch {
      // Nếu JWT chưa cấu hình: vẫn trả user, không set cookie
      return NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
        warning: 'JWT chưa cấu hình, vui lòng sử dụng phiên hiện tại hoặc cấu hình JWT_SECRET',
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đăng nhập' },
      { status: 500 }
    );
  }
}

