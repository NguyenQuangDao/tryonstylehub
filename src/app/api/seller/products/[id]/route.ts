import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { deleteCache } from '@/lib/cache';
import { getServerSession } from 'next-auth';
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
});

export async function GET(_request: NextRequest, context: unknown) {
  try {
    const session = await getServerSession(authOptions);
    const { params } = context as { params: { id: string } };
    if (!session?.user) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 });
    if (session.user.role !== 'SELLER') return NextResponse.json({ error: 'Bạn không có quyền truy cập' }, { status: 403 });

    const id = parseInt(params.id);
    const product = await prisma.product.findFirst({
      where: { id, shopId: session.user.shopId ?? undefined },
    });

    if (!product) return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });

    const resp = {
      ...product,
      styleTags: (() => { try { return product.styleTags ? JSON.parse(product.styleTags as unknown as string) : []; } catch { return []; } })(),
      isActive: true,
    };

    return NextResponse.json(resp);
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: unknown) {
  try {
    const { params } = context as { params: { id: string } };
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 });
    if (session.user.role !== 'SELLER') return NextResponse.json({ error: 'Bạn không có quyền truy cập' }, { status: 403 });
    if (!session.user.shopId) return NextResponse.json({ error: 'Bạn chưa có cửa hàng' }, { status: 400 });

    const id = parseInt(params.id);
    const body = await request.json();
    const data = updateSchema.parse(body);

    const product = await prisma.product.findFirst({ where: { id, shopId: session.user.shopId } });
    if (!product) return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });

    const updates: Partial<{
      name: string;
      description: string;
      price: number;
      category: string;
      styleTags: string;
      sizes: string;
      colors: string;
      stock: number;
      isFeatured: boolean;
      status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
    }> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.price !== undefined) updates.price = data.price;
    if (data.category !== undefined) updates.category = data.category;
    if (data.styleTags !== undefined) updates.styleTags = JSON.stringify(data.styleTags);
    if (data.sizes !== undefined) updates.sizes = JSON.stringify(data.sizes);
    if (data.colors !== undefined) updates.colors = JSON.stringify(data.colors);
    if (data.stock !== undefined) updates.stock = data.stock;
    if (data.isFeatured !== undefined) updates.isFeatured = data.isFeatured;
    if (data.status !== undefined) updates.status = data.status;
    if (data.isActive !== undefined) updates.status = data.isActive ? 'ACTIVE' : 'INACTIVE';

    await prisma.product.update({ where: { id }, data: updates });
    deleteCache('products:all');

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

export async function DELETE(_request: NextRequest, context: unknown) {
  try {
    const session = await getServerSession(authOptions);
    const { params } = context as { params: { id: string } };
    if (!session?.user) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 });
    if (session.user.role !== 'SELLER') return NextResponse.json({ error: 'Bạn không có quyền truy cập' }, { status: 403 });
    if (!session.user.shopId) return NextResponse.json({ error: 'Bạn chưa có cửa hàng' }, { status: 400 });

    const id = parseInt(params.id);
    const product = await prisma.product.findFirst({ where: { id, shopId: session.user.shopId } });
    if (!product) return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });

    await prisma.product.delete({ where: { id } });
    deleteCache('products:all');

    return NextResponse.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra khi xóa sản phẩm' }, { status: 500 });
  }
}