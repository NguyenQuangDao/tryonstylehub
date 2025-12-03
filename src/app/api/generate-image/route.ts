import { CostTracker } from "../../../lib/cost-optimizer";
import { generateImageWithDALLE } from "../../../lib/openai-ai";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { verifyToken } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { uploadToS3, generateS3Key, getJSON, putJSON, getPresignedUrl } from "../../../lib/s3";

type GenerateImageRequest = {
  prompt: string;
  size?: "1024x1024" | "1024x1792" | "1792x1024";
  quality?: "standard" | "hd";
};
type GalleryEntry = {
  url: string;
  key: string;
  createdAt: string;
  size: number;
  width: number;
  height: number;
  format: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GenerateImageRequest;
    const { prompt, quality = "standard", size } = body;

    // Validation
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt là bắt buộc và phải là chuỗi văn bản."
        },
        { status: 400 }
      );
    }

    if (prompt.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt phải có ít nhất 10 ký tự để tạo ảnh chất lượng."
        },
        { status: 400 }
      );
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt không được vượt quá 1000 ký tự."
        },
        { status: 400 }
      );
    }

    // Generating image for prompt

    const token = request.cookies.get('token')?.value || null;
    let userId: string = 'anonymous';
    let userIdStr: string | null = null;
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.userId) {
        userId = String(payload.userId);
        userIdStr = String(payload.userId);
      }
    } else {
      const headerUser = request.headers.get('x-user-id');
      if (headerUser) {
        userId = headerUser;
      }
    }
    
    // Enhance prompt for better results
    const fullBodyCues = [
      'full body portrait',
      'subject centered',
      'head-to-toe visible',
      'all limbs fully visible (hands and feet in frame)',
      '4:5 ratio portrait framing'
    ].join(', ');
    const negativeCues = [
      'no watermark',
      'no text',
      'no blur',
      'no distortion',
      'no cropping or cut-off head/hands/feet'
    ].join(', ');
    const enhancedPrompt = `${prompt}, ${fullBodyCues}, DSLR 50mm prime, f/2.0, ISO 200, 1/200s, soft studio key light with rim light, neutral studio gradient background, photorealistic, professional photography, high quality, high detail, lifelike, ${negativeCues}`;

    // Generate image using optimized DALL-E
    const preferredSize: "1024x1024" | "1024x1792" | "1792x1024" = size || "1024x1792";
    const imageUrl = await generateImageWithDALLE(enhancedPrompt, String(userId), quality, preferredSize);

    const response = await fetch(imageUrl);
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Không thể tải ảnh đã tạo" },
        { status: 502 }
      );
    }
    const arrayBuffer = await response.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);
    const meta = await sharp(inputBuffer).metadata();
    let processor = sharp(inputBuffer).withMetadata();
    const minDim = 1080;
    const w = meta.width || minDim;
    const h = meta.height || minDim;
    if (w < minDim || h < minDim) {
      processor = processor.resize({ width: Math.max(w, minDim), height: Math.max(h, minDim), fit: 'inside' });
    }
    let outputBuffer: Buffer;
    let contentType = 'image/jpeg';
    let ext = 'jpg';
    if (meta.hasAlpha || meta.format === 'png' || meta.format === 'webp') {
      outputBuffer = await processor.png({ compressionLevel: 9 }).toBuffer();
      contentType = 'image/png';
      ext = 'png';
    } else {
      outputBuffer = await processor.jpeg({ quality: 92 }).toBuffer();
    }
    const finalMeta = await sharp(outputBuffer).metadata();
    const prefix = `users/${userId}/generated`;
    const s3Key = generateS3Key(prefix, `image.${ext}`);
    let savedUrl: string;
    try {
      savedUrl = await uploadToS3(outputBuffer, s3Key, contentType);
    } catch {
      return NextResponse.json(
        { success: false, error: "Không thể lưu ảnh vào kho lưu trữ" },
        { status: 500 }
      );
    }
    try {
      const head = await fetch(savedUrl, { method: 'HEAD' });
      if (!head.ok) {
        savedUrl = await getPresignedUrl(s3Key, 3600);
      }
    } catch {
      savedUrl = await getPresignedUrl(s3Key, 3600);
    }
    const metadata = {
      url: savedUrl,
      key: s3Key,
      createdAt: new Date().toISOString(),
      size: outputBuffer.length,
      width: finalMeta.width || minDim,
      height: finalMeta.height || minDim,
      format: contentType
    };
    const galleryKey = `users/${userId}/gallery.json`;
    let gallery = await getJSON<GalleryEntry[]>(galleryKey);
    if (!gallery) gallery = [];
    const updatedGallery = [metadata, ...gallery];
    await putJSON(galleryKey, updatedGallery);
    if (userIdStr) {
      try {
        await prisma.costTracking.create({
          data: {
            userId: userIdStr,
            service: 'aws-s3',
            operation: 'upload',
            cost: 0,
            details: JSON.stringify({ key: s3Key, size: outputBuffer.length })
          }
        });
      } catch {}
    }

    // Get cost information
    const costStats = CostTracker.getStats();

    return NextResponse.json({
      success: true,
      imageUrl: savedUrl,
      originalUrl: imageUrl,
      prompt: enhancedPrompt,
      metadata,
      cost: costStats.daily,
      cached: imageUrl.includes('cached')
    });

  } catch (error) {
    console.error("[Generate Image API] Error:", error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes("content_policy_violation")) {
        return NextResponse.json(
          {
            success: false,
            error: "Nội dung của bạn vi phạm chính sách của OpenAI. Vui lòng thử lại với nội dung khác."
          },
          { status: 400 }
        );
      }
      
      if (error.message.includes("rate_limit")) {
        return NextResponse.json(
          {
            success: false,
            error: "Đã vượt quá giới hạn tỷ lệ. Vui lòng thử lại sau ít phút."
          },
          { status: 429 }
        );
      }

      if (error.message.includes("insufficient_quota")) {
        return NextResponse.json(
          {
            success: false,
            error: "Không đủ quota API. Vui lòng kiểm tra tài khoản OpenAI."
          },
          { status: 402 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Không thể tạo ảnh. Vui lòng thử lại sau."
      },
      { status: 500 }
    );
  }
}
