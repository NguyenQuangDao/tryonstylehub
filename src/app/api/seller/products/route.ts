import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// dùng prisma singleton

const productSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().min(10).max(2000),
  price: z.number().positive(),
  category: z.string().min(1),
  styleTags: z.array(z.string()).min(1),
  images: z.array(z.string().url()).min(1),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  stock: z.number().int().nonnegative().default(0),
  isFeatured: z.boolean().default(false),
});

// GET: Get seller's products
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    const where = {
      shopId: session.user.shopId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(category && { category }),
      ...(status && { status }),
    };

    const [rawProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: true,
          _count: {
            select: {
              tryOnHistory: true,
              productViews: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const products = rawProducts.map((p) => ({
      ...p,
      styleTags: (() => {
        try { return p.styleTags ? JSON.parse(p.styleTags as unknown as string) : []; } catch { return []; }
      })(),
      sizes: (() => {
        try { return p.sizes ? JSON.parse(p.sizes as unknown as string) : []; } catch { return []; }
      })(),
      colors: (() => {
        try { return p.colors ? JSON.parse(p.colors as unknown as string) : []; } catch { return []; }
      })(),
    }));

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Get seller products error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}

// POST: Create new product
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        category: validatedData.category,
        styleTags: JSON.stringify(validatedData.styleTags),
        sizes: validatedData.sizes ? JSON.stringify(validatedData.sizes) : null,
        colors: validatedData.colors ? JSON.stringify(validatedData.colors) : null,
        stock: validatedData.stock,
        isFeatured: validatedData.isFeatured,
        status: 'ACTIVE',
        slug: validatedData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        shopId: session.user.shopId,
        images: {
          create: validatedData.images.map((url, index) => ({
            url,
            order: index,
            altText: `${validatedData.name} - Image ${index + 1}`,
          })),
        },
      },
      include: {
        images: true,
        _count: {
          select: {
            tryOnHistory: true,
            productViews: true,
            reviews: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Sản phẩm đã được tạo thành công',
      product,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo sản phẩm' },
      { status: 500 }
    );
  }
}