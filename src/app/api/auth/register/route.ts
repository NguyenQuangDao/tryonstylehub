import { createToken, hashPassword, isValidEmail, isValidPassword } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    // Validation
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Tất cả các trường đều bắt buộc' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được sử dụng' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // Create token and set cookie nếu cấu hình đầy đủ
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
      // Nếu JWT_SECRET chưa cấu hình: vẫn trả user, không set cookie
      return NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
        warning: 'JWT chưa cấu hình, vui lòng đăng nhập thủ công',
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đăng ký' },
      { status: 500 }
    );
  }
}

