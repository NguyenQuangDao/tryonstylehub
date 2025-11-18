import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get session ID for anonymous users
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sessionId')?.value;

    // Find all virtual models for user or session
    const virtualModels = await prisma.virtualModel.findMany({
      where: {
        ...(userId ? { userId: parseInt(userId) } : { sessionId })
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: virtualModels
    });

  } catch (error) {
    console.error('Error listing avatars:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list avatars' },
      { status: 500 }
    );
  }
}
