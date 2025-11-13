import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import { getJSON } from '../../../../lib/s3';

type GalleryEntry = {
  url: string;
  key: string;
  createdAt: string;
  size: number;
  width: number;
  height: number;
  format: string;
};

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
    }

    const key = `users/${payload.userId}/gallery.json`;
    const gallery = (await getJSON<GalleryEntry[]>(key)) || [];

    return NextResponse.json({ success: true, gallery });
  } catch {
    return NextResponse.json({ error: 'Không thể lấy danh sách ảnh' }, { status: 500 });
  }
}