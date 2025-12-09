export const runtime = 'nodejs';
import { verifyToken } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Không tìm thấy token xác thực' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Người dùng không tồn tại' },
        { status: 404 }
      );
    }

    const exp = (payload as any).exp ?? null;
    return NextResponse.json({ user, exp });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi lấy thông tin người dùng' },
      { status: 500 }
    );
  }
}
