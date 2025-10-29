import { BodyPartsComposer } from '@/lib/body-parts-composer';
import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import sharp from 'sharp';

const composer = BodyPartsComposer.getInstance();

// POST /api/body-parts/compose - Ghép ảnh các bộ phận cơ thể
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { compositionId, parts, canvasSize, baseImage } = body;

    // Validation
    if (!parts || !Array.isArray(parts) || parts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Danh sách bộ phận là bắt buộc' },
        { status: 400 }
      );
    }

    const canvas = canvasSize || { width: 600, height: 1000 };
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'public', 'generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const outputPath = path.join(outputDir, `composition-${timestamp}.png`);

    try {
      // Create base canvas
      let canvasImage = sharp({
        create: {
          width: canvas.width,
          height: canvas.height,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        }
      }).png();

      // If base image is provided, use it as background
      if (baseImage && baseImage.startsWith('/')) {
        const baseImagePath = path.join(process.cwd(), 'public', baseImage);
        if (fs.existsSync(baseImagePath)) {
          canvasImage = sharp(baseImagePath)
            .resize(canvas.width, canvas.height)
            .png();
        }
      }

      // Composite all parts
      const compositeOperations = [];
      
      for (const part of parts) {
        const imagePath = path.join(process.cwd(), 'public', part.imagePath);
        
        if (fs.existsSync(imagePath)) {
          const { x, y, width, height } = part.position;
          
          compositeOperations.push({
            input: await sharp(imagePath)
              .resize(width, height)
              .png()
              .toBuffer(),
            left: x,
            top: y,
            blend: part.blendMode || 'over'
          });
        }
      }

      // Apply all composites
      if (compositeOperations.length > 0) {
        await canvasImage
          .composite(compositeOperations)
          .png()
          .toFile(outputPath);
      } else {
        // If no parts to composite, just save the base canvas
        await canvasImage.toFile(outputPath);
      }

      // Generate public URL
      const publicUrl = `/generated/composition-${timestamp}.png`;

      return NextResponse.json({
        success: true,
        data: {
          imageUrl: publicUrl,
          compositionId: compositionId || `comp-${timestamp}`,
          timestamp,
          canvasSize: canvas,
          partsCount: parts.length
        },
        message: 'Ghép ảnh thành công'
      });

    } catch (imageError) {
      console.error('[Image Composition] Error:', imageError);
      return NextResponse.json(
        { success: false, error: 'Lỗi khi xử lý ảnh' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[Body Parts Compose API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi ghép ảnh' },
      { status: 500 }
    );
  }
}

// GET /api/body-parts/compose - Lấy thông tin composition
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const compositionId = searchParams.get('id');

    if (!compositionId) {
      return NextResponse.json(
        { success: false, error: 'ID composition là bắt buộc' },
        { status: 400 }
      );
    }

    const composition = composer.getComposition(compositionId);
    if (!composition) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy composition' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: composition
    });
  } catch (error) {
    console.error('[Body Parts Compose API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy thông tin composition' },
      { status: 500 }
    );
  }
}
