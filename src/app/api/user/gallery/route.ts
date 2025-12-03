import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import { getJSON, getPresignedUrl } from '../../../../lib/s3';

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
    const mapped = await Promise.all(gallery.map(async (item) => {
      try {
        const url = await getPresignedUrl(item.key, 3600);
        return { ...item, url };
      } catch {
        return item;
      }
    }));

    return NextResponse.json({ success: true, gallery: mapped });
  } catch {
    return NextResponse.json({ error: 'Không thể lấy danh sách ảnh' }, { status: 500 });
  }
}
