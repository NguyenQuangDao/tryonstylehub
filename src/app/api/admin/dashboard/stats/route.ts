import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get total users and sellers
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalSellers = 0;
    const pendingApplications = 0;
    const activeProducts = totalProducts;

    // Get total try-ons and views
    const totalTryOns = await prisma.tryOnHistory.count();
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