import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const saveSchema = z.object({
  avatarName: z.string().min(1).max(255),
  height: z.number().positive().max(300).optional(),
  weight: z.number().positive().max(500).optional(),
  gender: z.enum(['male', 'female', 'non-binary']).optional(),
  hairColor: z.string().min(1).max(50).optional(),
  hairStyle: z.string().min(1).max(50).optional(),
  skinTone: z.string().min(1).max(50).optional(),
  eyeColor: z.string().min(1).max(50).optional(),
  isPublic: z.boolean().optional(),
  userId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]).optional(),
  avatarImage: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = saveSchema.parse(raw);
    const avatarName = parsed.avatarName;
    const height = parsed.height;
    const weight = parsed.weight;
    const gender = parsed.gender;
    const hairColor = parsed.hairColor;
    const hairStyle = parsed.hairStyle;
    const skinTone = parsed.skinTone;
    const eyeColor = parsed.eyeColor;
    const isPublic = parsed.isPublic;
  const userId = parsed.userId !== undefined ? (typeof parsed.userId === 'string' ? parsed.userId : String(parsed.userId)) : undefined;
    const avatarImage = parsed.avatarImage;

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
        ...(userId ? { userId } : { sessionId })
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
        user: userId ? { connect: { id: userId } } : undefined,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error saving avatar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save avatar' },
      { status: 500 }
    );
  }
}
