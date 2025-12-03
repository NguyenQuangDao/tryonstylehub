import { uploadFileToS3 } from '@/lib/s3';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const rawFiles = formData.getAll('file');
    const files = rawFiles.filter((f) => typeof (f as File).arrayBuffer === 'function') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024;
    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) return false;
      if (!file.size || file.size <= 0) return false;
      if (file.size > maxSize) return false;
      return true;
    });

    if (validFiles.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty files' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    
    for (const file of validFiles) {
      const url = await uploadFileToS3(file, 'products');
      uploadedUrls.push(url);
    }

    return NextResponse.json({ urls: uploadedUrls, success: true });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
export const runtime = 'nodejs'
