import { authOptions } from '@/lib/auth-config';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';



export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để nộp đơn' },
        { status: 401 }
      );
    }

    await request.json();

    // Check if user already has a seller application
    return NextResponse.json({ error: 'Chức năng đăng ký người bán chưa khả dụng trong phiên bản này' }, { status: 501 });

  } catch (error) {
    console.error('Seller application error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi nộp đơn' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập' },
        { status: 401 }
      );
    }

    return NextResponse.json({ hasApplication: false });

  } catch (error) {
    console.error('Get seller application error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}