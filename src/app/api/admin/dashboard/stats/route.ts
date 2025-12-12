import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || (payload as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '7d';
    
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get dashboard statistics
    const [
      totalUsers,
      totalStores,
      totalProducts,
      totalBlogPosts
    ] = await Promise.all([
      // Count totals
      prisma.user.count(),
      prisma.shop.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.product.count({
        where: { status: 'PUBLISHED' }
      }),
      prisma.blogPost.count({
        where: { status: 'PUBLISHED' }
      })
    ]);

    return NextResponse.json({
      overview: {
        totalUsers,
        totalStores,
        totalProducts,
        totalBlogPosts
      },
      timeRange
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}