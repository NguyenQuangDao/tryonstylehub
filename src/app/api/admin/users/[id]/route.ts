import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAdmin } from '@/lib/rbac';

const updateUserSchema = z.object({
  role: z.enum(['USER', 'SELLER', 'ADMIN']).optional(),
});

export async function PATCH(request: NextRequest, context: unknown) {
  try {
    const { params } = context as { params: { id: string } };
    const admin = await requireAdmin(request);
    if (!admin.ok || !admin.user) return admin.response!;

    const userId = params.id;

    if (String(userId) === String(admin.user.id)) {
      return NextResponse.json({ error: 'Cannot update your own account' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateUserSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.role !== undefined ? { role: data.role } : {}),
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
