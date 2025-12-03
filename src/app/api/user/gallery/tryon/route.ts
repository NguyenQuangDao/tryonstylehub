import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../../lib/auth';
import { getJSON, getPresignedUrl } from '../../../../../lib/s3';

type GalleryEntry = {
  url: string;
  key: string;
  createdAt: string;
  size?: number;
  width?: number;
  height?: number;
  format?: string;
  type?: string;
  tryonPhoto?: boolean;
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

    const userId = String(payload.userId);
    const galleryKey = `users/${userId}/gallery.json`;
    const gallery = (await getJSON<GalleryEntry[]>(galleryKey)) || [];

    const tryonOnly = gallery.filter((item) => {
      if (!item || !item.key) return false;
      const hasType = item.type === 'tryon' || item.tryonPhoto === true;
      const inFolder = item.key.startsWith(`users/${userId}/tryon/`) || item.key.includes(`/tryon/`);
      return hasType || inFolder;
    });

    const mapped = await Promise.all(tryonOnly.map(async (item) => {
      try {
        const url = await getPresignedUrl(item.key, 3600);
        return { ...item, url };
      } catch {
        return item;
      }
    }));

    return NextResponse.json({ success: true, gallery: mapped });
  } catch {
    return NextResponse.json({ error: 'Không thể lấy danh sách ảnh try-on' }, { status: 500 });
  }
}

