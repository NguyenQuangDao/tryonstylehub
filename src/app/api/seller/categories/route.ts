import { JWTPayload, verifyToken } from '@/lib/auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
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
    if (!userId) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 });

    const shop = await prisma.shop.findUnique({ where: { ownerId: userId } });
    if (!shop) return NextResponse.json({ categories: [] });

    const rows = await prisma.product.findMany({
      where: { shopId: shop.id },
      select: { categoryId: true },
    });
    const ids = Array.from(new Set(rows.map(r => r.categoryId))).filter(Boolean) as string[];
    if (ids.length === 0) return NextResponse.json({ categories: [] });

    const categories = await prisma.category.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get seller categories error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
  }
}

