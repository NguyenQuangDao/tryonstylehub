import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { JWTPayload, verifyToken } from '@/lib/auth';

// dùng prisma singleton

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const token = request.cookies.get('token')?.value;
    const payload: JWTPayload | null = token ? await verifyToken(token) : null;

    const tryParseId = (idValue: unknown): string | null => {
      if (typeof idValue === 'string') return idValue;
      if (typeof idValue === 'number') return String(idValue);
      return null;
    };

    let userId: string | null = tryParseId(session?.user?.id) ?? tryParseId(payload?.userId);
    if (!userId && payload?.email) {
      const u = await prisma.user.findUnique({ where: { email: payload.email } });
      userId = u?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 });
    }

    if (user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Bạn không có quyền truy cập' },
        { status: 403 }
      );
    }

    const shop = await prisma.shop.findUnique({ where: { ownerId: userId } });
    if (!shop) {
      return NextResponse.json(
        { error: 'Bạn chưa có cửa hàng' },
        { status: 400 }
      );
    }

    // Get dashboard stats

    const [totalProducts, recentProductsRaw] = await Promise.all([
      prisma.product.count({ where: { shopId: shop.id } }),
      prisma.product.findMany({
        where: { shopId: shop.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const recentProducts = recentProductsRaw.map((p) => ({
      ...p,
    }));

    return NextResponse.json({
      totalProducts,
      activeProducts: totalProducts,
      totalTryOns: 0,
      totalViews: 0,
      recentProducts,
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}
