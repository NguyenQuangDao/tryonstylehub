import { authOptions } from '@/lib/auth-config';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const prisma = new PrismaClient();

const sellerApplicationSchema = z.object({
  businessName: z.string().min(3).max(255),
  businessDescription: z.string().min(50).max(2000),
  website: z.string().url().optional().or(z.literal('')),
  socialMedia: z.array(z.string().url()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để nộp đơn' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = sellerApplicationSchema.parse(body);

    // Check if user already has a seller application
    const existingApplication = await prisma.sellerApplication.findUnique({
      where: { userId: parseInt(session.user.id) }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Bạn đã nộp đơn trở thành người bán rồi' },
        { status: 400 }
      );
    }

    // Check if user is already a seller
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true }
    });

    if (user?.role === 'SELLER') {
      return NextResponse.json(
        { error: 'Bạn đã là người bán rồi' },
        { status: 400 }
      );
    }

    // Create seller application
    const application = await prisma.sellerApplication.create({
      data: {
        userId: parseInt(session.user.id),
        businessName: validatedData.businessName,
        businessDescription: validatedData.businessDescription,
        website: validatedData.website || null,
        socialMedia: validatedData.socialMedia ? JSON.stringify(validatedData.socialMedia) : null,
      }
    });

    return NextResponse.json({
      message: 'Đơn đăng ký của bạn đã được gửi thành công. Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ.',
      application
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Seller application error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi nộp đơn' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập' },
        { status: 401 }
      );
    }

    const application = await prisma.sellerApplication.findUnique({
      where: { userId: parseInt(session.user.id) }
    });

    if (!application) {
      return NextResponse.json({ hasApplication: false });
    }

    return NextResponse.json({
      hasApplication: true,
      application: {
        ...application,
        socialMedia: application.socialMedia ? JSON.parse(application.socialMedia) : null,
      }
    });

  } catch (error) {
    console.error('Get seller application error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}