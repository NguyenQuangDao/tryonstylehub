import { NextRequest, NextResponse } from 'next/server';
import { TOKEN_CONFIG } from '../../../../config/tokens';
import { createToken, hashPassword, isValidEmail, isValidPassword } from '../../../../lib/auth';
import { checkDatabaseConnection } from '../../../../lib/db-check';
import { LogLevel, logPaymentEvent, PaymentEventType } from '../../../../lib/payment-logger';
import { prisma } from '../../../../lib/prisma';

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

    const dbOk = await checkDatabaseConnection();
    if (!dbOk) {
      return NextResponse.json(
        { error: 'Cơ sở dữ liệu không khả dụng', hint: 'Vui lòng cấu hình DATABASE_URL và khởi động DB' },
        { status: 503 }
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

    // Create user with free tokens
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        tokenBalance: TOKEN_CONFIG.FREE_TOKENS_ON_SIGNUP, // Grant free tokens on signup
      },
    });

    // Log free token grant
    await logPaymentEvent({
      userId: user.id,
      eventType: PaymentEventType.PURCHASE_COMPLETED,
      level: LogLevel.INFO,
      details: {
        source: 'signup_bonus',
        tokensAdded: TOKEN_CONFIG.FREE_TOKENS_ON_SIGNUP,
        provider: 'credentials',
        newBalance: TOKEN_CONFIG.FREE_TOKENS_ON_SIGNUP,
      },
    });

    // Create token and set cookie nếu cấu hình đầy đủ
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
    } catch {
      // Nếu JWT_SECRET chưa cấu hình: vẫn trả user, không set cookie
      return NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, role: user.role },
        warning: 'JWT chưa cấu hình, vui lòng đăng nhập thủ công',
      });
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'PrismaClientInitializationError') {
      return NextResponse.json(
        { error: 'Cơ sở dữ liệu không khả dụng', hint: 'Vui lòng cấu hình DATABASE_URL và khởi động DB' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đăng ký' },
      { status: 500 }
    );
  }
}
