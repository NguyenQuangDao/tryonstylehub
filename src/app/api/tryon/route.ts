import Fashn from 'fashn';
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getPresignedUrl } from '../../../lib/s3';

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Get files and other data from FormData
    const personImage = formData.get('personImage') as File;
    const garmentImage = formData.get('garmentImage') as File;
    const virtualModelId = formData.get('virtualModelId') as string;
    const category = formData.get('category') as string;
    
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
    if (!garmentImage) {
      return NextResponse.json({ error: "Missing garment image" }, { status: 400 });
    }
    
    // Convert files to base64
    let modelImageBase64 = '';
    if (personImage) {
      modelImageBase64 = await fileToBase64(personImage);
    } else if (virtualModelId) {
      const virtualModel = await (prisma as any).virtualModel.findUnique({ where: { id: virtualModelId } });
      if (!virtualModel || !virtualModel.avatarImage) {
        return NextResponse.json({ error: 'Virtual model image not found' }, { status: 404 });
      }
      modelImageBase64 = await urlToBase64(virtualModel.avatarImage);
    }
    
    const garmentImageBase64 = await fileToBase64(garmentImage);
    
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
