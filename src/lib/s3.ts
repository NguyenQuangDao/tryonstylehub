// AWS S3 Integration - Install packages first: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
import { GetObjectCommand, PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs/promises';
import path from 'path';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME || '';
const PUBLIC_BASE = process.env.AWS_S3_PUBLIC_BASE_URL || (BUCKET_NAME && process.env.AWS_S3_REGION ? `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com` : '');

/**
 * Upload file to S3
 */
export async function uploadToS3(
  file: Buffer | Uint8Array | Blob,
  key: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  try {
    if (!BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      const publicDir = path.join(process.cwd(), 'public');
      const fullPath = path.join(publicDir, key);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, file as Buffer);
      return `/${key}`;
    }
    const includeAcl = process.env.AWS_S3_USE_ACL !== 'false';
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file as Buffer,
        ContentType: contentType,
        ...(includeAcl ? { ACL: 'public-read' as const } : {}),
      });
      await s3Client.send(command);
    } catch (err) {
      const code = (err as any)?.Code || (err as any)?.name;
      if (includeAcl && (code === 'AccessControlListNotSupported' || code === 'InvalidRequest')) {
        const commandNoAcl = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: file as Buffer,
          ContentType: contentType,
        });
        await s3Client.send(commandNoAcl);
      } else {
        throw err;
      }
    }

    const base = PUBLIC_BASE || `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com`;
    return `${base}/${key}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
}

/**
 * Generate presigned URL for temporary access
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('S3 presigned URL error:', error);
    throw new Error('Failed to generate presigned URL');
  }
}

/**
 * Upload base64 image to S3
 */
export async function uploadBase64ToS3(
  base64Data: string,
  fileName: string,
  folder: string = 'uploads'
): Promise<string> {
  try {
    // Remove data:image/xxx;base64, prefix if present
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');

    // Generate unique key
    const timestamp = Date.now();
    const key = `${folder}/${timestamp}-${fileName}`;

    // Detect content type
    let contentType = 'image/jpeg';
    if (base64Data.startsWith('data:image/png')) {
      contentType = 'image/png';
    } else if (base64Data.startsWith('data:image/webp')) {
      contentType = 'image/webp';
    }

    return await uploadToS3(buffer, key, contentType);
  } catch (error) {
    console.error('Base64 upload error:', error);
    throw new Error('Failed to upload base64 image to S3');
  }
}

export async function uploadFileToS3(
  file: File,
  folder: string
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const key = generateS3Key(folder, file.name || 'upload')
  const contentType = file.type || 'application/octet-stream'
  return uploadToS3(buffer, key, contentType)
}

/**
 * Generate S3 key for file
 */
export function generateS3Key(prefix: string, filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${prefix}/${timestamp}-${random}-${sanitized}`;
}

export async function getJSON<T>(key: string): Promise<T | null> {
  try {
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const res = await s3Client.send(command);
    const stream = res.Body as Readable;
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', (err: Error) => reject(err));
      stream.on('end', () => resolve());
    });
    const body = Buffer.concat(chunks).toString('utf-8');
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

export async function putJSON(key: string, data: unknown): Promise<string> {
  const body = Buffer.from(JSON.stringify(data));
  const url = await uploadToS3(body, key, 'application/json');
  return url;
}

export async function deleteFromS3(key: string): Promise<void> {
  if (!BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const fullPath = path.join(publicDir, key);
      await fs.rm(fullPath, { force: true });
    } catch {}
    return;
  }
  const command = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key });
  await s3Client.send(command);
}
