import { authOptions } from '@/lib/auth-config';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// dùng prisma singleton


// GET: Get seller's products
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Bạn không có quyền truy cập' },
        { status: 403 }
      );
    }

    return NextResponse.json({ products: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });

  } catch (error) {
    console.error('Get seller products error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}

// POST: Create new product
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Bạn không có quyền truy cập' },
        { status: 403 }
      );
    }

    if (!session.user.shopId) {
      return NextResponse.json(
        { error: 'Bạn chưa có cửa hàng' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Chức năng tạo sản phẩm chưa khả dụng trong phiên bản này' }, { status: 501 });

  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo sản phẩm' },
      { status: 500 }
    );
  }
}