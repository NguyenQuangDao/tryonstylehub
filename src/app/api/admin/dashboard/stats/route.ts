import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get total users and sellers
    const [totalUsers, totalSellers, pendingApplications, totalProducts, activeProducts] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'SELLER' } }),
      prisma.sellerApplication.count({ where: { status: 'PENDING' } }),
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
    ]);

    // Get total try-ons and views
    const [totalTryOns, totalViews] = await Promise.all([
      prisma.tryOnHistory.count(),
      prisma.productView.count(),
    ]);

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