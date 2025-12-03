import { JWTPayload, verifyToken } from '@/lib/auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getPresignedUrl } from '@/lib/s3';

// dùng prisma singleton


// GET: Get seller's products
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const payload: JWTPayload | null = token ? await verifyToken(token) : null;

    const tryParseId = (idValue: unknown): string | null => {
      if (typeof idValue === 'string') return idValue;
      if (typeof idValue === 'number') return String(idValue);
      return null;
    };

    let userId: string | null = tryParseId(payload?.userId) ?? tryParseId(session?.user?.id);

    if (!userId && payload?.email) {
      const u = await prisma.user.findUnique({ where: { email: payload.email } });
      userId = u?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 });
    }

    if (user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập' }, { status: 403 });
    }

    // paging params (optional for future use)
    const url = new URL(request.url);
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
    const limit = Math.max(parseInt(url.searchParams.get('limit') || '10', 10), 1);

    const shop = await prisma.shop.findUnique({ where: { ownerId: userId } });
    if (!shop) {
      return NextResponse.json({ products: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    }

    const total = await prisma.product.count({ where: { shopId: shop.id } });
    const rows = await prisma.product.findMany({
      where: { shopId: shop.id },
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const products = await Promise.all(rows.map(async (p) => {
      const imgs = Array.isArray(p.images) ? (p.images as any[]) : []
      const first = imgs[0]
      let firstUrl: string | undefined
      if (typeof first === 'string') {
        firstUrl = first
      } else if (first?.key) {
        try {
          firstUrl = await getPresignedUrl(first.key, 3600)
        } catch {
          firstUrl = first?.url
        }
      } else if (first?.url) {
        firstUrl = first.url
      }

      const mappedImages = imgs.map((it: any) => {
        if (typeof it === 'string') return { url: it }
        if (it?.key) {
          return { url: firstUrl && it === first ? firstUrl : (it.url || '') }
        }
        return { url: it?.url || '' }
      })

      return {
        id: p.id,
        name: p.title,
        description: p.description,
        price: Number(p.basePrice),
        category: p.category?.name ?? '',
        status: p.status,
        stock: p.variants.reduce((sum, v) => sum + (v.stock || 0), 0),
        images: mappedImages,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }
    }))

    const totalPages = Math.ceil(total / limit);
    return NextResponse.json({ products, pagination: { page, limit, total, totalPages } });

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

    if (!userId) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 });
    }
    if (user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập' }, { status: 403 });
    }
    const shop = await prisma.shop.findUnique({ where: { ownerId: userId } });
    if (!shop) {
      return NextResponse.json({ error: 'Bạn chưa có cửa hàng' }, { status: 400 });
    }

    const form = await request.formData();
    const name = String(form.get('name') || '').trim();
    const description = String(form.get('description') || '').trim();
    const priceStr = String(form.get('price') || '').trim();
    const categoryName = String(form.get('category') || '').trim();
    const isFeatured = String(form.get('isFeatured') || 'false') === 'true';
    const stockStr = String(form.get('stock') || '0');
    const rawFiles = form.getAll('images');
    const files = rawFiles.filter((f) => typeof (f as File).arrayBuffer === 'function') as File[];

    if (!name || !description || !priceStr || !categoryName) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const priceNum = parseFloat(priceStr);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return NextResponse.json({ error: 'Giá không hợp lệ' }, { status: 400 });
    }

    const stockNum = parseInt(stockStr || '0', 10) || 0;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024;
    const validFiles = files.filter((file) => allowedTypes.includes(file.type) && file.size > 0 && file.size <= maxSize);

    if (validFiles.length === 0) {
      return NextResponse.json({ error: 'Vui lòng chọn ít nhất một ảnh hợp lệ' }, { status: 400 });
    }

    const toRollback: string[] = [];
    const uploaded: { url: string; key: string; size: number; width: number; height: number; format: string }[] = [];

    const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { default: sharp } = await import('sharp');

    try {
      const shopId = shop.id;
      const categorySlug = slugify(categoryName);
      let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (!category) {
        category = await prisma.category.create({ data: { name: categoryName, slug: categorySlug } });
      }

      for (const file of validFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const input = Buffer.from(arrayBuffer);
        const meta = await sharp(input).metadata();
        const folder = `shops/${shopId}/products`;
        const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
        const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}-${(file.name || 'image').replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const contentType = file.type || 'image/jpeg';
        const url = await (await import('@/lib/s3')).uploadToS3(input, key, contentType);
        toRollback.push(key);
        uploaded.push({ url, key, size: file.size, width: meta.width || 0, height: meta.height || 0, format: contentType });
      }

      const product = await prisma.product.create({
        data: {
          title: name,
          description,
          images: uploaded,
          basePrice: priceNum,
          status: isFeatured ? 'PUBLISHED' : 'DRAFT',
          shopId,
          categoryId: category.id,
        },
      });

      return NextResponse.json({ success: true, product });
    } catch (err) {
      try {
        console.log(err);
        
        const { deleteFromS3 } = await import('@/lib/s3');
        await Promise.all(toRollback.map((k) => deleteFromS3(k)));
      } catch {}
      return NextResponse.json({ error: 'Có lỗi xảy ra khi tạo sản phẩm' }, { status: 500 });
    }

  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo sản phẩm' },
      { status: 500 }
    );
  }
}
