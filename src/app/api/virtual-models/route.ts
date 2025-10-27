import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to get user ID and session ID from request
async function getUserInfoFromRequest(request: NextRequest): Promise<{ userId: number | null; sessionId: string | null }> {
  const token = request.cookies.get('token')?.value;
  let userId: number | null = null;
  
  if (token) {
    const payload = await verifyToken(token);
    userId = payload?.userId || null;
  }
  
  // Get session ID from cookies for anonymous users
  const sessionId = cookies().get('sessionId')?.value || null;
  
  return { userId, sessionId };
}

// GET /api/virtual-models - Get all virtual models for current user
export async function GET(request: NextRequest) {
  try {
    const { userId, sessionId } = await getUserInfoFromRequest(request);
    
    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const virtualModels = await prisma.virtualModel.findMany({
      where: {
        ...(userId ? { userId } : { sessionId })
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ virtualModels });
  } catch (error) {
    console.error('Error fetching virtual models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch virtual models' },
      { status: 500 }
    );
  }
}

// POST /api/virtual-models - Create a new virtual model
export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId } = await getUserInfoFromRequest(request);
    
    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['avatarName', 'height', 'weight', 'gender', 'hairColor', 'hairStyle'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create the virtual model
    const virtualModel = await prisma.virtualModel.create({
      data: {
        userId: userId || null,
        sessionId: userId ? null : sessionId,
        avatarName: body.avatarName,
        isPublic: body.isPublic || false,
        
        // Required fields
        height: parseFloat(body.height),
        weight: parseFloat(body.weight),
        gender: body.gender,
        hairColor: body.hairColor,
        hairStyle: body.hairStyle,
        
        // Optional fields
        bodyShape: body.bodyShape || null,
        skinTone: body.skinTone || null,
        muscleLevel: body.muscleLevel ? parseInt(body.muscleLevel) : null,
        fatLevel: body.fatLevel ? parseInt(body.fatLevel) : null,
        shoulderWidth: body.shoulderWidth ? parseFloat(body.shoulderWidth) : null,
        waistSize: body.waistSize ? parseFloat(body.waistSize) : null,
        hipSize: body.hipSize ? parseFloat(body.hipSize) : null,
        legLength: body.legLength ? parseFloat(body.legLength) : null,
        eyeColor: body.eyeColor || null,
        faceShape: body.faceShape || null,
        beardStyle: body.beardStyle || null,
        tattoos: body.tattoos || null,
        piercings: body.piercings || null,
        clothingStyle: body.clothingStyle || null,
        accessories: body.accessories ? JSON.stringify(body.accessories) : null,
        footwearType: body.footwearType || null,
        colorPalette: body.colorPalette ? JSON.stringify(body.colorPalette) : null,
        ageAppearance: body.ageAppearance ? parseInt(body.ageAppearance) : null,
        bodyProportionPreset: body.bodyProportionPreset || null,
      },
    });

    return NextResponse.json({ 
      virtualModel,
      message: 'Virtual model created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating virtual model:', error);
    return NextResponse.json(
      { error: 'Failed to create virtual model' },
      { status: 500 }
    );
  }
}

// DELETE /api/virtual-models?id=123 - Delete a virtual model
export async function DELETE(request: NextRequest) {
  try {
    const { userId, sessionId } = await getUserInfoFromRequest(request);
    
    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing virtual model ID' },
        { status: 400 }
      );
    }

    // Check if virtual model belongs to user
    const virtualModel = await prisma.virtualModel.findFirst({
      where: {
        id: parseInt(id),
        ...(userId ? { userId } : { sessionId })
      },
    });

    if (!virtualModel) {
      return NextResponse.json(
        { error: 'Virtual model not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the virtual model
    await prisma.virtualModel.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ 
      message: 'Virtual model deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting virtual model:', error);
    return NextResponse.json(
      { error: 'Failed to delete virtual model' },
      { status: 500 }
    );
  }
}

// PUT /api/virtual-models?id=123 - Update a virtual model
export async function PUT(request: NextRequest) {
  try {
    const { userId, sessionId } = await getUserInfoFromRequest(request);
    
    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing virtual model ID' },
        { status: 400 }
      );
    }

    // Check if virtual model belongs to user
    const existingModel = await prisma.virtualModel.findFirst({
      where: {
        id: parseInt(id),
        ...(userId ? { userId } : { sessionId })
      },
    });

    if (!existingModel) {
      return NextResponse.json(
        { error: 'Virtual model not found or access denied' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Update the virtual model
    const virtualModel = await prisma.virtualModel.update({
      where: { id: parseInt(id) },
      data: {
        avatarName: body.avatarName || existingModel.avatarName,
        isPublic: body.isPublic !== undefined ? body.isPublic : existingModel.isPublic,
        
        // Update fields if provided
        height: body.height ? parseFloat(body.height) : existingModel.height,
        weight: body.weight ? parseFloat(body.weight) : existingModel.weight,
        gender: body.gender || existingModel.gender,
        hairColor: body.hairColor || existingModel.hairColor,
        hairStyle: body.hairStyle || existingModel.hairStyle,
        
        // Optional fields
        bodyShape: body.bodyShape !== undefined ? body.bodyShape : existingModel.bodyShape,
        skinTone: body.skinTone !== undefined ? body.skinTone : existingModel.skinTone,
        muscleLevel: body.muscleLevel !== undefined ? (body.muscleLevel ? parseInt(body.muscleLevel) : null) : existingModel.muscleLevel,
        fatLevel: body.fatLevel !== undefined ? (body.fatLevel ? parseInt(body.fatLevel) : null) : existingModel.fatLevel,
        shoulderWidth: body.shoulderWidth !== undefined ? (body.shoulderWidth ? parseFloat(body.shoulderWidth) : null) : existingModel.shoulderWidth,
        waistSize: body.waistSize !== undefined ? (body.waistSize ? parseFloat(body.waistSize) : null) : existingModel.waistSize,
        hipSize: body.hipSize !== undefined ? (body.hipSize ? parseFloat(body.hipSize) : null) : existingModel.hipSize,
        legLength: body.legLength !== undefined ? (body.legLength ? parseFloat(body.legLength) : null) : existingModel.legLength,
        eyeColor: body.eyeColor !== undefined ? body.eyeColor : existingModel.eyeColor,
        faceShape: body.faceShape !== undefined ? body.faceShape : existingModel.faceShape,
        beardStyle: body.beardStyle !== undefined ? body.beardStyle : existingModel.beardStyle,
        tattoos: body.tattoos !== undefined ? body.tattoos : existingModel.tattoos,
        piercings: body.piercings !== undefined ? body.piercings : existingModel.piercings,
        clothingStyle: body.clothingStyle !== undefined ? body.clothingStyle : existingModel.clothingStyle,
        accessories: body.accessories !== undefined ? (body.accessories ? JSON.stringify(body.accessories) : null) : existingModel.accessories,
        footwearType: body.footwearType !== undefined ? body.footwearType : existingModel.footwearType,
        colorPalette: body.colorPalette !== undefined ? (body.colorPalette ? JSON.stringify(body.colorPalette) : null) : existingModel.colorPalette,
        ageAppearance: body.ageAppearance !== undefined ? (body.ageAppearance ? parseInt(body.ageAppearance) : null) : existingModel.ageAppearance,
        bodyProportionPreset: body.bodyProportionPreset !== undefined ? body.bodyProportionPreset : existingModel.bodyProportionPreset,
      },
    });

    return NextResponse.json({ 
      virtualModel,
      message: 'Virtual model updated successfully' 
    });
  } catch (error) {
    console.error('Error updating virtual model:', error);
    return NextResponse.json(
      { error: 'Failed to update virtual model' },
      { status: 500 }
    );
  }
}

