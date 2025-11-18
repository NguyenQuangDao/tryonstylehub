import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const avatarName = searchParams.get('avatarName');
    const userId = searchParams.get('userId');

    // Get session ID for anonymous users
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sessionId')?.value;

    if (!avatarName) {
      return NextResponse.json(
        { success: false, error: 'Avatar name is required' },
        { status: 400 }
      );
    }

    // Find virtual model
    const virtualModel = await prisma.virtualModel.findFirst({
      where: {
        avatarName,
        ...(userId ? { userId: parseInt(userId) } : { sessionId })
      }
    });

    if (!virtualModel) {
      return NextResponse.json(
        { success: false, error: 'Avatar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: virtualModel
    });

  } catch (error) {
    console.error('Error loading avatar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load avatar' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const avatarName = searchParams.get('avatarName');
    const userId = searchParams.get('userId');

    // Get session ID for anonymous users
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sessionId')?.value;

    if (!avatarName) {
      return NextResponse.json(
        { success: false, error: 'Avatar name is required' },
        { status: 400 }
      );
    }

    // Find and delete virtual model
    const virtualModel = await prisma.virtualModel.findFirst({
      where: {
        avatarName,
        ...(userId ? { userId: parseInt(userId) } : { sessionId })
      }
    });

    if (!virtualModel) {
      return NextResponse.json(
        { success: false, error: 'Avatar not found' },
        { status: 404 }
      );
    }

    await prisma.virtualModel.delete({
      where: { id: virtualModel.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Avatar deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting avatar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete avatar' },
      { status: 500 }
    );
  }
}
