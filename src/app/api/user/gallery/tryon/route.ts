import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../../lib/auth';
import { getJSON, getPresignedUrl, putJSON } from '../../../../../lib/s3';

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

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, type = 'tryon' } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Thiếu URL ảnh' }, { status: 400 });
    }

    const userId = String(payload.userId);
    const galleryKey = `users/${userId}/gallery.json`;
    
    // Get existing gallery
    const existingGallery = (await getJSON<GalleryEntry[]>(galleryKey)) || [];
    
    // Create new entry
    const newEntry: GalleryEntry = {
      url: imageUrl,
      key: `users/${userId}/tryon/${Date.now()}.jpg`,
      createdAt: new Date().toISOString(),
      type,
      tryonPhoto: true
    };
    
    // Add to gallery
    const updatedGallery = [newEntry, ...existingGallery];
    
    // Save back to S3
    await putJSON(galleryKey, updatedGallery);
    
    return NextResponse.json({ success: true, message: 'Đã lưu ảnh vào bộ sưu tập' });
    
  } catch (error) {
    console.error('Error saving try-on image:', error);
    return NextResponse.json({ error: 'Không thể lưu ảnh' }, { status: 500 });
  }
}

