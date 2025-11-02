import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, generateS3Key } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('avatar') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate S3 key for avatar images
    const s3Key = generateS3Key('avatars', file.name);

    try {
      // Upload to S3
      const s3Url = await uploadToS3(buffer, s3Key, file.type);

      return NextResponse.json({
        success: true,
        data: {
          url: s3Url,
          s3Key: s3Key,
          originalName: file.name,
          size: file.size,
          type: file.type
        }
      });

    } catch (s3Error) {
      console.error('S3 upload failed:', s3Error);
      return NextResponse.json(
        { success: false, error: 'Failed to upload to cloud storage' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}