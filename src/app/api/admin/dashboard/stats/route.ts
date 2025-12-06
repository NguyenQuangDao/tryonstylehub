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
      totalBlogPosts,
      recentUsers,
      recentStores,
      recentProducts,
      topStores
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
      }),
      
      // Recent items
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          avatarUrl: true
        }
      }),
      
      prisma.shop.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          status: true,
          averageRating: true,
          createdAt: true,
          owner: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      
      prisma.product.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          basePrice: true,
          
          createdAt: true,
          shop: {
            select: {
              name: true,
              slug: true
            }
          },
          category: {
            select: {
              name: true,
              slug: true
            }
          }
        }
      }),
      
      // Top stores by rating (not sales)
      prisma.shop.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { averageRating: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          averageRating: true,
          createdAt: true
        }
      })
    ]);

    

    return NextResponse.json({
      overview: {
        totalUsers,
        totalStores,
        totalProducts,
        totalBlogPosts
      },
      recent: {
        users: recentUsers,
        stores: recentStores,
        products: recentProducts
      },
      topStores,
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