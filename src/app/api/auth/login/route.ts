export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createToken, isValidEmail, verifyPassword } from '../../../../lib/auth';
import { checkDatabaseConnection } from '../../../../lib/db-check';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    let email: string | undefined;
    let password: string | undefined;
    const contentType = request.headers.get('content-type') || '';
    try {
      if (contentType.includes('application/json')) {
        const body = await request.json();
        email = body?.email;
        password = body?.password;
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const text = await request.text();
        const params = new URLSearchParams(text);
        email = params.get('email') || undefined;
        password = params.get('password') || undefined;
      } else if (contentType.includes('multipart/form-data')) {
        const form = await request.formData();
        email = (form.get('email') as string) || undefined;
        password = (form.get('password') as string) || undefined;
      } else {
        const body = await request.json().catch(() => ({}));
        email = body?.email;
        password = body?.password;
      }
    } catch {
      return NextResponse.json(
        { error: 'Dữ liệu gửi lên không hợp lệ' },
        { status: 400 }
      );
    }

    // Validation
    email = email?.trim().toLowerCase()
    password = password?.trim()
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
    const dbOk = await checkDatabaseConnection();
    if (!dbOk) {
      return NextResponse.json(
        { error: 'Cơ sở dữ liệu không khả dụng', hint: 'Vui lòng cấu hình DATABASE_URL và khởi động DB' },
        { status: 503 }
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
    if (!user.password) {
      return NextResponse.json(
        { error: 'Tài khoản này không hỗ trợ đăng nhập bằng mật khẩu' },
        { status: 401 }
      );
    }
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Create token và set cookie nếu cấu hình đầy đủ
    try {
      const shop = await prisma.shop.findUnique({ where: { ownerId: user.id } });
      const token = await createToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        shopId: shop?.id ?? null,
      });
      const response = NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, role: user.role, shopId: shop?.id ?? null },
      });
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return response;
    } catch (e) {
      // Nếu JWT chưa cấu hình: vẫn trả user, không set cookie
      return NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, role: user.role },
        warning: 'JWT chưa cấu hình, vui lòng sử dụng phiên hiện tại hoặc cấu hình JWT_SECRET',
      });
    }
  } catch (error) {
    const isDev = process.env.NODE_ENV === 'development';
    const err = error as any;
    const message = err?.message ?? 'Đã xảy ra lỗi khi đăng nhập';
    const stack = err?.stack ?? undefined;
    if (err?.name === 'PrismaClientInitializationError') {
      console.error('Login error:', message, '\n', stack);
      return NextResponse.json(
        { error: 'Cơ sở dữ liệu không khả dụng', hint: 'Vui lòng cấu hình DATABASE_URL và khởi động DB' },
        { status: 503 }
      );
    }
    console.error('Login error:', message, '\n', stack);
    if (isDev) {
      return NextResponse.json(
        { error: message, name: err?.name, stack },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi đăng nhập' }, { status: 500 });
  }
}
