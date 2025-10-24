import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const avatarName = searchParams.get('avatarName');
    const userId = searchParams.get('userId');

    // Get session ID for anonymous users
    const cookieStore = cookies();
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

    // Parse Ready Player Me data
    let readyPlayerMeData = null;
    if (virtualModel.readyPlayerMeData) {
      try {
        readyPlayerMeData = JSON.parse(virtualModel.readyPlayerMeData);
      } catch (error) {
        console.error('Error parsing Ready Player Me data:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...virtualModel,
        readyPlayerMeData
      }
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
    const cookieStore = cookies();
    const sessionId = cookieStore.get('sessionId')?.value;

    if (!avatarName) {
      return NextResponse.json(
        { success: false, error: 'Avatar name is required' },
        { status: 400 }
      );
    }

    // Delete virtual model
    const deletedModel = await prisma.virtualModel.deleteMany({
      where: {
        avatarName,
        ...(userId ? { userId: parseInt(userId) } : { sessionId })
      }
    });

    return NextResponse.json({
      success: true,
      deletedCount: deletedModel.count
    });

  } catch (error) {
    console.error('Error deleting avatar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete avatar' },
      { status: 500 }
    );
  }
}
