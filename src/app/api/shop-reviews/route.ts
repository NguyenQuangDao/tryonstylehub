import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { shopId, rating, comment, images = [] } = body;

    // Validate required fields
    if (!shopId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Order validation removed to allow anyone to rate


    // Check if user has already reviewed this shop
    const existingReview = await prisma.review.findFirst({
      where: ({
        userId: payload.userId,
        shopId: shopId
      } as any)
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this shop' }, { status: 400 });
    }

    // Create the review
    const review = await prisma.review.create({
      data: ({
        rating,
        comment,
        images,
        userId: payload.userId,
        shopId: shopId
      } as any),
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true
          }
        }
      }
    });

    // Update shop average rating
    const allReviews = await prisma.review.findMany({
      where: ({ shopId: shopId } as any)
    });

    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.shop.update({
      where: { id: shopId },
      data: { averageRating }
    });

    return NextResponse.json({ review }, { status: 201 });

  } catch (error) {
    console.error('Shop review creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: ({ shopId } as any),
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ reviews });

  } catch (error) {
    console.error('Shop reviews fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
