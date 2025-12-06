import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req as any);
    if (!admin.ok) return admin.response!;

    // Get total users and sellers
    const [totalUsers, totalProducts, totalSellers, pendingApplications, activeProducts] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.user.count({ where: { role: 'SELLER' } }),
      prisma.shop.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
    ]);

    // Get total try-ons and views
    let totalTryOns = 0;
    try {
      const logs = await (prisma as any).costTracking.findMany({
        where: {
          service: 'payment',
          operation: 'TOKEN_DEDUCTED',
          details: { contains: 'Phối đồ ảo' },
        },
        select: { id: true },
      });
      totalTryOns = logs.length;
    } catch {}
    const totalViews = 0;

    return NextResponse.json({
      totalUsers,
      totalSellers,
      pendingApplications,
      totalProducts,
      activeProducts,
      totalTryOns,
      totalViews,
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
