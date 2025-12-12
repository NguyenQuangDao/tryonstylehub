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
    const category = searchParams.get('category') || 'all';
    const shop = searchParams.get('shop') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } }
      ];
    }

    if (status !== 'all') {
      where.status = status;
    }

    if (category !== 'all') {
      where.productCategories = {
        some: {
          category: {
            slug: category
          }
        }
      };
    }

    if (shop !== 'all') {
      where.shop = { slug: shop };
    }

    // Build order by clause
    const orderBy: any = {};
    switch (sortBy) {
      case 'title':
        orderBy.title = sortOrder;
        break;
      case 'price':
        orderBy.basePrice = sortOrder;
        break;
      case 'stock':
        orderBy.stockQuantity = sortOrder;
        break;
      case 'rating':
        orderBy.rating = sortOrder;
        break;
      default:
        orderBy.createdAt = sortOrder;
    }

    // Get products and total count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    // Get categories for each product
    const productIds = products.map(p => p.id);
    const productCategories = await prisma.$queryRawUnsafe(`
      SELECT pc.productId, c.id, c.name, c.slug
      FROM ProductCategory pc
      JOIN Category c ON pc.categoryId = c.id
      WHERE pc.productId IN (${productIds.map(() => '?').join(',')})
    `, ...productIds) as any[];

    // Combine products with their categories
    const productsWithCategories = products.map(product => {
      const categories = productCategories
        .filter((pc: any) => pc.productId === product.id)
        .map((pc: any) => ({
          category: {
            id: pc.id,
            name: pc.name,
            slug: pc.slug
          }
        }));

      // Transform images
      let images: any[] = [];
      if (Array.isArray(product.images)) {
        images = (product.images as any[]).map((img: any, index: number) => {
          if (typeof img === 'string') {
            return {
              url: img,
              alt: product.title,
              isPrimary: index === 0
            };
          } else if (typeof img === 'object' && img !== null) {
             return {
               url: img.url || '',
               alt: img.alt || product.title,
               isPrimary: img.isPrimary || index === 0
             };
          }
          return null;
        }).filter(Boolean);
      }

      return {
        ...product,
        productCategories: categories,
        images
      };
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products: productsWithCategories,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      totalPages
    });

  } catch (error) {
    console.error('Products list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}