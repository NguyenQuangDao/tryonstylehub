import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/rbac';

// GET: Fetch all users
export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req as any);
    if (!admin.ok) return admin.response!;

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tokenBalance: true,
        createdAt: true,
        updatedAt: true,
        shop: {
          select: { id: true, name: true, status: true }
        }
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
