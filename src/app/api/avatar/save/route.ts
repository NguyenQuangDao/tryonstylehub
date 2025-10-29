import { PrismaClient, Prisma } from '@prisma/client';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      avatarName, 
      height,
      weight,
      gender,
      hairColor,
      hairStyle,
      skinTone,
      eyeColor,
      isPublic,
      userId,
      avatarImage 
    } = body;

    // Generate session ID for anonymous users
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('sessionId')?.value;
    
    if (!sessionId) {
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      cookieStore.set('sessionId', sessionId, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    // Check if avatar already exists
    const existingAvatar = await prisma.virtualModel.findFirst({
      where: {
        avatarName,
        ...(userId ? { userId: parseInt(userId) } : { sessionId })
      }
    });

    let virtualModel;
    if (existingAvatar) {
      // Update existing avatar - prepare data object
      const updateData: Prisma.VirtualModelUpdateInput = {
        height,
        weight,
        gender,
        hairColor,
        hairStyle,
        skinTone,
        eyeColor,
        isPublic: isPublic || false,
        updatedAt: new Date(),
        ...(avatarImage && { avatarImage })
      };

      virtualModel = await prisma.virtualModel.update({
        where: { id: existingAvatar.id },
        data: updateData
      });
    } else {
      // Create new avatar - prepare data object
      const createData: Prisma.VirtualModelCreateInput = {
        userId: userId ? parseInt(userId) : undefined,
        sessionId: userId ? undefined : sessionId,
        avatarName,
        height: height || 170,
        weight: weight || 65,
        gender: gender || 'male',
        hairColor: hairColor || 'black',
        hairStyle: hairStyle || 'short',
        skinTone: skinTone || 'medium',
        eyeColor: eyeColor || 'brown',
        isPublic: isPublic || false,
        ...(avatarImage && { avatarImage })
      };

      virtualModel = await prisma.virtualModel.create({
        data: createData
      });
    }

    return NextResponse.json({
      success: true,
      data: virtualModel,
      sessionId: userId ? null : sessionId
    });

  } catch (error) {
    console.error('Error saving avatar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save avatar' },
      { status: 500 }
    );
  }
}
