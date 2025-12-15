import { JWTPayload, verifyToken } from '@/lib/auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  description: z.string().min(10).max(2000).optional(),
  price: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  styleTags: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  stock: z.number().int().nonnegative().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).optional(),
  isActive: z.boolean().optional(),
  externalUrl: z.string().url().optional().or(z.literal('')),
});

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  console.log('GET /api/seller/products/[id] called - forcing reload');
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const payload: JWTPayload | null = token ? await verifyToken(token) : null;
    const params = await context.params;
    const tryParseId = (idValue: unknown): string | null => {
      if (typeof idValue === 'string') return idValue;
      if (typeof idValue === 'number') return String(idValue);
      return null;
    };
    let userId: string | null = tryParseId(session?.user?.id) ?? tryParseId(payload?.userId);
    if (!userId && payload?.email) {
      const u = await prisma.user.findUnique({ where: { email: payload.email } });
      userId = u?.id ?? null;
    }
    if (!userId) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 });
    const shop = await prisma.shop.findUnique({ where: { ownerId: userId } });
    if (!shop) return NextResponse.json({ error: 'Bạn chưa có cửa hàng' }, { status: 400 });

    const id = params.id;
    const product = await prisma.product.findFirst({ where: { id, shopId: shop.id }, include: { productCategories: { include: { category: true } } } });

    if (!product) return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });

    return NextResponse.json({
      ...product,
      category: product.productCategories?.[0]?.category?.name
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const payload: JWTPayload | null = token ? await verifyToken(token) : null;
    const tryParseId = (idValue: unknown): string | null => {
      if (typeof idValue === 'string') return idValue;
      if (typeof idValue === 'number') return String(idValue);
      return null;
    };
    let userId: string | null = tryParseId(session?.user?.id) ?? tryParseId(payload?.userId);
    if (!userId && payload?.email) {
      const u = await prisma.user.findUnique({ where: { email: payload.email } });
      userId = u?.id ?? null;
    }
    if (!userId) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 });
    const shop = await prisma.shop.findUnique({ where: { ownerId: userId } });
    if (!shop) return NextResponse.json({ error: 'Bạn chưa có cửa hàng' }, { status: 400 });

    const id = params.id;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const product = await prisma.product.findFirst({ where: { id, shopId: shop.id } });
    if (!product) return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });

    const updates: any = {};
    if (data.name !== undefined) updates.title = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.price !== undefined) updates.basePrice = data.price;
    if (data.isActive !== undefined) updates.status = data.isActive ? 'PUBLISHED' : 'ARCHIVED';
    if (data.externalUrl !== undefined) updates.externalUrl = data.externalUrl || null;

    if (data.category !== undefined) {
      const slugify = (s: string) => s
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const categorySlug = slugify(data.category);
      let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (!category) {
        category = await prisma.category.create({ data: { name: data.category, slug: categorySlug } });
      }
      updates.productCategories = {
        deleteMany: {},
        create: { categoryId: category.id }
      };
    }

    await prisma.product.update({ where: { id }, data: updates });

    // Images handling is disabled in this version

    return NextResponse.json({ message: 'Cập nhật sản phẩm thành công' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ', details: error.errors }, { status: 400 });
    }
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra khi cập nhật sản phẩm' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const payload: JWTPayload | null = token ? await verifyToken(token) : null;
    const params = await context.params;
    const tryParseId = (idValue: unknown): string | null => {
      if (typeof idValue === 'string') return idValue;
      if (typeof idValue === 'number') return String(idValue);
      return null;
    };
    let userId: string | null = tryParseId(session?.user?.id) ?? tryParseId(payload?.userId);
    if (!userId && payload?.email) {
      const u = await prisma.user.findUnique({ where: { email: payload.email } });
      userId = u?.id ?? null;
    }
    if (!userId) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 });
    const shop = await prisma.shop.findUnique({ where: { ownerId: userId } });
    if (!shop) return NextResponse.json({ error: 'Bạn chưa có cửa hàng' }, { status: 400 });

    const id = params.id;
    const product = await prisma.product.findFirst({ where: { id, shopId: shop.id } });
    if (!product) return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra khi xóa sản phẩm' }, { status: 500 });
  }
}
