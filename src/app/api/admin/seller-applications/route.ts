import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';


const reviewApplicationSchema = z.object({
  applicationId: z.number(),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
});

// GET: List all seller applications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bạn không có quyền truy cập' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const applications = await prisma.sellerApplication.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ applications });

  } catch (error) {
    console.error('Get seller applications error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}

// POST: Review seller application
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bạn không có quyền truy cập' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { applicationId, action, rejectionReason } = reviewApplicationSchema.parse(body);

    const application = await prisma.sellerApplication.findUnique({
      where: { id: applicationId },
      include: { user: true }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn đăng ký' },
        { status: 404 }
      );
    }

    if (application.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Đơn đăng ký này đã được xử lý rồi' },
        { status: 400 }
      );
    }

    const adminId = parseInt(session.user.id);

    if (action === 'approve') {
      // Create shop for the user
      const shop = await prisma.shop.create({
        data: {
          name: application.businessName,
          url: application.website || `https://aistylehub.com/shop/${application.user.name.toLowerCase().replace(/\s+/g, '-')}`,
          ownerId: application.userId,
        }
      });

      // Update user role to SELLER
      await prisma.user.update({
        where: { id: application.userId },
        data: {
          role: 'SELLER',
          shopId: shop.id,
        }
      });

      // Update application status
      await prisma.sellerApplication.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        }
      });

      return NextResponse.json({
        message: 'Đã duyệt đơn đăng ký thành công',
        application: { ...application, status: 'APPROVED' }
      });

    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: 'Vui lòng cung cấp lý do từ chối' },
          { status: 400 }
        );
      }

      await prisma.sellerApplication.update({
        where: { id: applicationId },
        data: {
          status: 'REJECTED',
          reviewedBy: adminId,
          reviewedAt: new Date(),
          rejectionReason,
        }
      });

      return NextResponse.json({
        message: 'Đã từ chối đơn đăng ký',
        application: { ...application, status: 'REJECTED', rejectionReason }
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Review seller application error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}