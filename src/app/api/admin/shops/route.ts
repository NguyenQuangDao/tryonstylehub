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
    if (!payload || (payload as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: { [key: string]: any } = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status !== 'all') {
      where.status = status;
    }

    // Build order by clause
    const orderBy: { [key: string]: 'asc' | 'desc' } = {};
    switch (sortBy) {
      case 'name':
        orderBy.name = sortOrder as 'asc' | 'desc';
        break;
      case 'totalSales':
        orderBy.totalSales = sortOrder as 'asc' | 'desc';
        break;
      case 'averageRating':
        orderBy.averageRating = sortOrder as 'asc' | 'desc';
        break;
      case 'totalProducts':
        orderBy.totalProducts = sortOrder as 'asc' | 'desc';
        break;
      default:
        orderBy.createdAt = sortOrder as 'asc' | 'desc';
    }

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              products: true,
              orders: true
            }
          }
        }
      }),
      prisma.shop.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      shops: shops.map(shop => ({
        ...shop,
        totalProducts: shop._count.products,
        totalOrders: shop._count.orders
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Shops list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}