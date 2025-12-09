import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { TOKEN_CONFIG } from "../../../config/tokens";
import { CostTracker } from "../../../lib/cost-optimizer";
import { generateImageWithDALLE } from "../../../lib/openai-ai";
import { prisma } from "../../../lib/prisma";
import { composePromptFromAll, improveOnly } from "../../../lib/promptComposer";
import { generateS3Key, getJSON, getPresignedUrl, putJSON, uploadToS3 } from "../../../lib/s3";
import { chargeTokens, createInsufficientTokensResponse, requireTokens } from "../../../lib/token-middleware";

type UserInfo = {
  gender: 'male' | 'female' | 'non-binary';
  height: number;
  weight: number;
  skinTone: 'very-light' | 'light' | 'medium' | 'tan' | 'brown' | 'dark';
  eyeColor: 'brown' | 'black' | 'blue' | 'green' | 'gray' | 'amber';
  hairColor: 'black' | 'brown' | 'blonde' | 'red' | 'white' | 'gray' | 'other';
  hairStyle: 'long' | 'short' | 'curly' | 'straight' | 'bald' | 'wavy';
};

type CreateAvatarRequest = {
  userInfo?: UserInfo;
  prompt?: string;
  options?: {
    quality?: 'standard' | 'hd';
    range?: 'upper-body' | 'full-body';
    pose?: 'standing' | 'walking' | 'hands-on-hips' | 'arms-crossed' | 'leaning';
  };
  image?: {
    size?: "1024x1024" | "1024x1792" | "1792x1024";
  };
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
    const body = await request.json() as CreateAvatarRequest;

    const { userInfo, prompt } = body;
    const quality = body.options?.quality ?? 'standard';
    const range = body.options?.range ?? 'full-body';
    const pose = body.options?.pose ?? 'standing';
    const size = body.image?.size;

    if ((!userInfo && !prompt) || (prompt && typeof prompt !== 'string')) {
      return NextResponse.json(
        { success: false, error: 'Cần cung cấp thông tin người dùng hoặc mô tả (prompt) hợp lệ.' },
        { status: 400 }
      );
    }

    const tokenCheck = await requireTokens(request, {
      operation: 'Tạo ảnh AI',
      tokensRequired: TOKEN_CONFIG.COSTS.GENERATE_IMAGE.amount,
    });

    if (!tokenCheck.success) {
      if (tokenCheck.insufficientTokens) {
        return createInsufficientTokensResponse(
          TOKEN_CONFIG.COSTS.GENERATE_IMAGE.amount,
          tokenCheck.currentBalance || 0,
          'tạo ảnh AI'
        );
      }
      return NextResponse.json({ success: false, error: tokenCheck.error || 'Unauthorized' }, { status: 401 });
    }

    const userId: string = tokenCheck.userId!;
    const userIdStr: string = tokenCheck.userId!;

    let basePrompt = userInfo
      ? composePromptFromAll(userInfo, prompt)
      : improveOnly(String(prompt));
    const removeTerms = [
      'edge-emphasized',
      'contour-focused',
      'shape-based representation',
      'structural morphology',
      'rotation-invariant depiction',
      'camera-agnostic orientation'
    ]
    for (const term of removeTerms) {
      basePrompt = basePrompt.replace(new RegExp(`\\b${term}\\b`, 'gi'), '')
    }
    basePrompt = basePrompt.replace(/\s{2,}/g, ' ').trim()

    const fullBodyCues = [
      'full body portrait',
      'subject centered',
      'head-to-toe visible',
      'single subject only',
      'one adult person',
      'fully clothed',
      'non-sexual, safe for work',
      'solo portrait',
      'single frame',
      'single shot',
      'front-facing orientation',
      'one-angle view',
      'plain neutral background',
      'uncluttered background'
    ].join(', ');
    const upperBodyCues = [
      'upper body portrait',
      'subject centered',
      'from head to mid-torso visible',
      'single subject only',
      'one adult person',
      'fully clothed',
      'non-sexual, safe for work',
      'solo portrait',
      'single frame',
      'single shot',
      'front-facing orientation',
      'one-angle view',
      'plain neutral background',
      'uncluttered background'
    ].join(', ');
    const negativeCues = [
      'no watermark',
      'no text',
      'no blur',
      'no distortion',
      'no cropping or cut-off head/hands/feet',
      'no collage',
      'no multiple panels',
      'no split-screen',
      'no multi-view',
      'no multiple angles',
      'no orthographic views',
      'no front/side/back layout',
      'no top-bottom layout',
      'no multiple people',
      'no two people',
      'no couple',
      'no group',
      'no crowd',
      'no additional figures',
      'no extra person',
      'no diagram',
      'no labels or annotations',
      'no measurement lines',
      'no grid overlay',
      'no text blocks',
      'no infographic layout',
      'no reference sheet',
      'no brand logos',
      'no copyrighted characters',
      'no trademarked characters',
      'no celebrity likeness',
      'no nudity',
      'no underwear',
      'no swimwear',
      'no lingerie',
      'no erotic content',
      'no sexual content',
      'no minors',
      'no violence',
      'no weapons',
      'no blood',
      'no gore'
    ].join(', ');
    const structureCues = [
      'photorealistic portrait',
      'realistic human proportions',
      'natural neutral background',
      'high detail',
      'balanced exposure',
      'denoised',
      'artifact-free'
    ].join(', ');
    const poseCues = (() => {
      switch (pose) {
        case 'walking':
          return 'natural walking pose, one foot forward, relaxed arms swing';
        case 'hands-on-hips':
          return 'standing pose, hands on hips, confident posture';
        case 'arms-crossed':
          return 'standing pose, arms crossed, balanced posture';
        case 'leaning':
          return 'standing pose, slight lean, relaxed posture';
        default:
          return 'natural standing pose, relaxed hands at sides';
      }
    })();
    const rangeCues = range === 'upper-body' ? upperBodyCues : fullBodyCues;

    const sanitizePrompt = (raw: string) => {
      const groupTerms = [
        'two\\s+people', 'three\\s+people', '\\d+\\s*people', 'multiple\\s+subjects', 'additional\\s+figures', 'extra\\s+person',
        'group', 'couple', 'multiple', 'crowd', 'several', 'friends', 'family', 'team',
        'nhóm', 'cặp', 'đôi', 'hai\\s+người', '2\\s*người', 'ba\\s+người', '3\\s*người', 'nhiều\\s+người',
        'đám\\s+đông', 'tập\\s+thể', 'gia\\s+đình', 'bạn\\s+bè', 'bộ\\s+ba', 'bộ\\s+đôi', 'song\\s+sinh', '\\d+\\s*người'
      ];
      const sensitiveTerms = [
        'nude','naked','underwear','bikini','lingerie','sexy','erotic','fetish','violence','weapon','blood','gore','child','kid','minor','teen'
      ];
      const blacklist = new RegExp(`(?:${[...groupTerms, ...sensitiveTerms].join('|')})`, 'gi');
      return raw
        .replace(blacklist, '')
        .replace(/\b(\d+)\s*(people|persons|người)\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    };
    const enhancedPrompt = `${sanitizePrompt(basePrompt)}, ${rangeCues}, ${poseCues}, ${structureCues}, ${negativeCues}`;

    const preferredSize: "1024x1024" | "1024x1792" | "1792x1024" = size || (range === 'upper-body' ? "1024x1024" : "1024x1792");

    let imageUrl: string;
    try {
      imageUrl = await generateImageWithDALLE(enhancedPrompt, String(userId), quality, preferredSize);
    } catch (err) {
      const isPolicy = err instanceof Error && err.message.includes('content_policy_violation');
      if (!isPolicy) throw err;
      const SAFE_BASE = 'adult person portrait, fully clothed, non-sexual, safe for work, single subject only, one person, solo portrait, plain neutral background';
      const safePrompt = `${SAFE_BASE}, ${rangeCues}, ${poseCues}, ${structureCues}, ${negativeCues}`;
      imageUrl = await generateImageWithDALLE(safePrompt, String(userId), quality, preferredSize);
    }

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

    const costStats = CostTracker.getStats();
    await chargeTokens(
      userId,
      'Tạo ảnh AI',
      TOKEN_CONFIG.COSTS.GENERATE_IMAGE.amount,
      { s3Key }
    );

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
    if (error instanceof Error) {
      if (error.message.includes('content_policy_violation')) {
        return NextResponse.json(
          { success: false, error: 'Nội dung vi phạm chính sách. Vui lòng thử với mô tả khác.' },
          { status: 400 }
        );
      }
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { success: false, error: 'Đã vượt quá giới hạn tần suất. Thử lại sau.' },
          { status: 429 }
        );
      }
      if (error.message.includes('insufficient_quota')) {
        return NextResponse.json(
          { success: false, error: 'Không đủ quota API. Vui lòng kiểm tra cấu hình.' },
          { status: 402 }
        );
      }
    }
    return NextResponse.json(
      { success: false, error: 'Không thể tạo ảnh. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
