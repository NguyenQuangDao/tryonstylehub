import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

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

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${randomUUID()}.${fileExtension}`;
    const uploadPath = join(process.cwd(), 'public', 'uploads', 'avatars', fileName);

    // Create directory if it doesn't exist
    const { mkdir } = await import('fs/promises');
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Write file
    await writeFile(uploadPath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/avatars/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        filename: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type
      }
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}