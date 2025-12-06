import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAdmin } from '@/lib/rbac';


// Placeholder to satisfy imports removed

// GET: List all seller applications
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) return admin.response!;

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit') || '20');

    const shops = await prisma.shop.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        owner: { select: { id: true, name: true, email: true, createdAt: true } },
      },
    });

    const applications = shops.map((s) => ({
      id: s.id,
      businessName: s.name,
      businessDescription: s.description || '',
      website: null,
      socialMedia: null,
      status: s.status === 'PENDING' ? 'PENDING' : s.status === 'ACTIVE' ? 'APPROVED' : 'REJECTED',
      rejectionReason: null,
      createdAt: s.createdAt.toISOString(),
      reviewedAt: null,
      user: {
        id: s.owner.id,
        name: s.owner.name,
        email: s.owner.email,
        createdAt: s.owner.createdAt.toISOString(),
      },
    }));

    return NextResponse.json({ applications });

  } catch (error) {
    console.error('Get seller applications error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}

// POST: Review seller application
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) return admin.response!;

    const body = await req.json();
    const schema = z.object({
      applicationId: z.string(),
      action: z.enum(['approve', 'reject']),
      rejectionReason: z.string().optional(),
    });
    const data = schema.parse(body);

    const shop = await prisma.shop.findUnique({ where: { id: data.applicationId }, select: { id: true, ownerId: true, status: true } });
    if (!shop) return NextResponse.json({ error: 'Không tìm thấy đơn' }, { status: 404 });

    if (data.action === 'approve') {
      await prisma.$transaction([
        prisma.shop.update({ where: { id: shop.id }, data: { status: 'ACTIVE' } }),
        prisma.user.update({ where: { id: shop.ownerId }, data: { role: 'SELLER' } }),
      ]);
      return NextResponse.json({ message: 'Đã duyệt đơn đăng ký' });
    }

    await prisma.shop.update({ where: { id: shop.id }, data: { status: 'SUSPENDED' } });
    return NextResponse.json({ message: 'Đã từ chối đơn đăng ký' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Review seller application error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}
