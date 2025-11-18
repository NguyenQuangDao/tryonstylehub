import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// dùng prisma singleton

export async function GET(request: NextRequest) {
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
    const productIds = await prisma.product.findMany({
      where: { shopId: session.user.shopId },
      select: { id: true },
    }).then((rows) => rows.map((r) => r.id));

    const [totalProducts, activeProducts, totalTryOns, totalViews, recentProductsRaw] = await Promise.all([
      prisma.product.count({ where: { shopId: session.user.shopId } }),
      prisma.product.count({ where: { shopId: session.user.shopId, status: 'ACTIVE' } }),
      prisma.tryOnHistory.count({ where: { productId: { in: productIds } } }),
      prisma.productView.count({ where: { productId: { in: productIds } } }),
      prisma.product.findMany({
        where: { shopId: session.user.shopId },
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          _count: { select: { tryOnHistory: true, productViews: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const recentProducts = recentProductsRaw.map((p) => ({
      ...p,
      images: p.images,
      status: p.status,
      styleTags: (() => { try { return p.styleTags ? JSON.parse(p.styleTags as unknown as string) : []; } catch { return []; } })(),
      sizes: (() => { try { return p.sizes ? JSON.parse(p.sizes as unknown as string) : []; } catch { return []; } })(),
      colors: (() => { try { return p.colors ? JSON.parse(p.colors as unknown as string) : []; } catch { return []; } })(),
    }));

    return NextResponse.json({
      totalProducts,
      activeProducts,
      totalTryOns,
      totalViews,
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