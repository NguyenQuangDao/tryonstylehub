import Fashn from 'fashn';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sharp from 'sharp';
import { prisma } from '../../../lib/prisma';
import { getPresignedUrl, uploadToS3, generateS3Key, getJSON, putJSON } from '../../../lib/s3';
import { verifyToken } from '../../../lib/auth';
import { requireTokens, createInsufficientTokensResponse, chargeTokens } from '../../../lib/token-middleware'
import { TOKEN_CONFIG } from '../../../config/tokens'

const FASHN_ENDPOINT_URL = process.env.FASHN_ENDPOINT_URL || "https://api.fashn.ai";
const FASHN_API_KEY = process.env.FASHN_API_KEY;

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mime = file.type || 'image/jpeg';
  return `data:${mime};base64,${base64}`;
}

function extractS3Key(input: string): string | null {
  try {
    if (!input) return null;
    if (!input.startsWith('http')) return input;
    const u = new URL(input);
    const host = u.hostname;
    if (host.includes('.s3.') || host.endsWith('.s3.amazonaws.com')) {
      const key = u.pathname.replace(/^\/+/, '');
      return key || null;
    }
    return null;
  } catch {
    return null;
  }
}

async function urlToBase64(url: string): Promise<string> {
  if (!url) {
    throw new Error('Failed to fetch image from URL');
  }
  if (url.startsWith('data:')) {
    return url;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  let res: Response | null = null;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch {
    res = null;
  } finally {
    clearTimeout(timer);
  }
  if (!res || !res.ok) {
    const s3Key = extractS3Key(url);
    if (s3Key) {
      const presigned = await getPresignedUrl(s3Key, 180);
      const res2 = await fetch(presigned);
      if (!res2.ok) {
        throw new Error('Failed to fetch image from URL');
      }
      const contentType2 = res2.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer2 = await res2.arrayBuffer();
      const base64_2 = Buffer.from(arrayBuffer2).toString('base64');
      return `data:${contentType2};base64,${base64_2}`;
    }
    throw new Error('Failed to fetch image from URL');
  }
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:${contentType};base64,${base64}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get files and other data from FormData
    const personImage = formData.get('personImage') as File;
    const garmentImage = formData.get('garmentImage') as File;
    const garmentImageUrl = formData.get('garmentImageUrl') as string | null;
    const virtualModelId = formData.get('virtualModelId') as string;
    const category = formData.get('category') as string;
    const quality = (formData.get('quality') as string) || 'standard'
    
    // Validate API key (server-side only)
    const finalApiKey = FASHN_API_KEY;
    if (!finalApiKey) {
      return NextResponse.json({ 
        error: "Missing FASHN_API_KEY on server. Please set environment variable.",
      }, { status: 500 });
    }
    
    // Validate inputs
    if (!personImage && !virtualModelId) {
      return NextResponse.json({ error: "Missing person image or virtual model" }, { status: 400 });
    }
    if (!garmentImage && !garmentImageUrl) {
      return NextResponse.json({ error: "Missing garment image" }, { status: 400 });
    }
    
    // Require tokens based on quality tier
    const requiredTokens = quality === 'high'
      ? TOKEN_CONFIG.COSTS.TRY_ON_HIGH.amount
      : TOKEN_CONFIG.COSTS.TRY_ON_STANDARD.amount

    const tokenCheck = await requireTokens(request as any, {
      operation: quality === 'high' ? 'Phối đồ ảo (cao)' : 'Phối đồ ảo (thường)',
      tokensRequired: requiredTokens,
    })

    if (!tokenCheck.success) {
      if (tokenCheck.insufficientTokens) {
        return createInsufficientTokensResponse(
          requiredTokens,
          tokenCheck.currentBalance || 0,
          quality === 'high' ? 'phối đồ ảo chất lượng cao' : 'phối đồ ảo chất lượng thường'
        )
      }
      return NextResponse.json({ error: tokenCheck.error || 'Unauthorized' }, { status: 401 })
    }

    const userId = String(tokenCheck.userId)

    // Convert files to base64
    let modelImageBase64 = '';
    if (personImage) {
      modelImageBase64 = await fileToBase64(personImage);
    } else if (virtualModelId) {
      const virtualModel = await prisma.virtualModel.findUnique({ where: { id: virtualModelId } });
      if (!virtualModel || !virtualModel.avatarImage) {
        return NextResponse.json({ error: 'Virtual model image not found' }, { status: 404 });
      }
      modelImageBase64 = await urlToBase64(virtualModel.avatarImage);
    }
    
    let garmentImageBase64 = '';
    if (garmentImage) {
      garmentImageBase64 = await fileToBase64(garmentImage);
    } else if (garmentImageUrl) {
      garmentImageBase64 = await urlToBase64(garmentImageUrl);
    }
    
    // Set default parameters
    const garmentPhotoType = 'flat-lay';
    const mode = 'balanced';
    const segmentationFree = false;
    const seed = Math.floor(Math.random() * 1000000);
    const numSamples = 1;

    // Validate and set category
    const validCategories = ['tops', 'bottoms', 'one-pieces', 'auto'] as const;
    type CategoryType = typeof validCategories[number];
    const finalCategory = category && validCategories.includes(category as CategoryType) ? category : 'auto';

    const inputs = {
      model_image: modelImageBase64,
      garment_image: garmentImageBase64,
      garment_photo_type: garmentPhotoType as 'flat-lay',
      category: finalCategory as CategoryType,
      mode: mode as 'balanced',
      segmentation_free: segmentationFree,
      seed: seed,
      num_samples: numSamples,
    };

    const apiPayload = {
      model_name: 'tryon-v1.6' as const,
      inputs: inputs
    }

    const baseURL = FASHN_ENDPOINT_URL;
    const client = new Fashn({ apiKey: finalApiKey, baseURL });

    // Sending request to FASHN API
    const runResponse = await client.predictions.run(apiPayload);
    const predId = runResponse.id;
    // Prediction ID received
    if (!predId) {
      return NextResponse.json({ error: "Failed to get prediction ID from FASHN API" }, { status: 500 });
    }

    // Poll status
    const maxPollingTime = 180 * 1000; // 3 minutes in milliseconds
    const pollingInterval = 2 * 1000; // 2 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxPollingTime) {
      // Polling status
      const statusData = await client.predictions.status(predId);

      // Prediction status checked

      if (statusData.status === "completed") {
        // Prediction completed
        // Return array of image URLs for compatibility with client
        const images = statusData.output || [];

        try {
          const token = (await cookies()).get('token')?.value || null;
          if (token) {
            const payload = await verifyToken(token);
            if (payload && payload.userId) {
              const userId = String(payload.userId);
              const prefix = `users/${userId}/tryon`;
              const newEntries: Array<{ url: string; key: string; createdAt: string; size: number; width: number; height: number; format: string; type: string; tryonPhoto?: boolean; }> = [];

              for (const imageUrl of images) {
                try {
                  const res = await fetch(imageUrl);
                  if (!res.ok) continue;
                  const arrayBuffer = await res.arrayBuffer();
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
                  const s3Key = generateS3Key(prefix, `tryon.${ext}`);
                  let savedUrl = await uploadToS3(outputBuffer, s3Key, contentType);
                  try {
                    const head = await fetch(savedUrl, { method: 'HEAD' });
                    if (!head.ok) {
                      savedUrl = await getPresignedUrl(s3Key, 3600);
                    }
                  } catch {
                    savedUrl = await getPresignedUrl(s3Key, 3600);
                  }
                  newEntries.push({
                    url: savedUrl,
                    key: s3Key,
                    createdAt: new Date().toISOString(),
                    size: outputBuffer.length,
                    width: finalMeta.width || minDim,
                    height: finalMeta.height || minDim,
                    format: contentType,
                    type: 'tryon',
                    tryonPhoto: true,
                  });
                } catch {}
              }

              if (newEntries.length > 0) {
                const galleryKey = `users/${userId}/gallery.json`;
                const gallery = (await getJSON<typeof newEntries>(galleryKey)) || [] as any[];
                const updated = [...newEntries, ...gallery];
                await putJSON(galleryKey, updated);
              }
            }
          }
        } catch {}

        // Charge tokens after success
        await chargeTokens(
          userId,
          quality === 'high' ? 'Phối đồ ảo (cao)' : 'Phối đồ ảo (thường)',
          requiredTokens,
          { count: (statusData.output || []).length }
        )

        return NextResponse.json({ images });
      } else if (statusData.status === "failed") {
        console.error(`Prediction failed with id ${predId}: ${JSON.stringify(statusData.error)}`);
        return NextResponse.json({ error: `Prediction failed: ${statusData.error?.message || 'Unknown reason'}` }, { status: 500 });
      }

      await delay(pollingInterval);
    }

    return NextResponse.json({ error: "Maximum polling time exceeded." }, { status: 504 }); // Gateway Timeout

  } catch (error: Error | unknown) {
    if (error instanceof Fashn.APIError) {
      console.error("FASHN API /run error:", error);
      
      // Check for authentication errors
      if (error.status === 401 || error.status === 403) {
        return NextResponse.json({ 
          error: "Invalid API key. Please check your FASHN API key and try again.",
          requiresApiKey: true 
        }, { status: 401 });
      }

      if (error.status === 429) {
        return NextResponse.json({ 
          error: "Rate limit exceeded. Please try again later.",
        }, { status: 429 });
      }
      
      return NextResponse.json({ error: `API run failed: ${error.cause}` }, { status: error.status });
    } else {
      console.error("Error in /api/tryon:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }
}
