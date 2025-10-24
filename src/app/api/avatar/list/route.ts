import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get session ID for anonymous users
    const cookieStore = cookies();
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

    // Parse Ready Player Me data for each model
    const modelsWithParsedData = virtualModels.map(model => {
      let readyPlayerMeData = null;
      if (model.readyPlayerMeData) {
        try {
          readyPlayerMeData = JSON.parse(model.readyPlayerMeData);
        } catch (error) {
          console.error('Error parsing Ready Player Me data:', error);
        }
      }
      
      return {
        ...model,
        readyPlayerMeData
      };
    });

    return NextResponse.json({
      success: true,
      data: modelsWithParsedData
    });

  } catch (error) {
    console.error('Error listing avatars:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list avatars' },
      { status: 500 }
    );
  }
}
