import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// dùng prisma singleton

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Bạn không có quyền truy cập' },
        { status: 403 }
      );
    }

    if (!session.user.shopId) {
      return NextResponse.json(
        { error: 'Bạn chưa có cửa hàng' },
        { status: 400 }
      );
    }

    // Get dashboard stats

    const [totalProducts, totalTryOns, recentProductsRaw] = await Promise.all([
      prisma.product.count({ where: { shopId: session.user.shopId } }),
      prisma.tryOnHistory.count(),
      prisma.product.findMany({
        where: { shopId: session.user.shopId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const recentProducts = recentProductsRaw.map((p) => ({
      ...p,
      styleTags: (() => { try { return p.styleTags ? JSON.parse(p.styleTags as unknown as string) : []; } catch { return []; } })(),
    }));

    return NextResponse.json({
      totalProducts,
      activeProducts: totalProducts,
      totalTryOns,
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