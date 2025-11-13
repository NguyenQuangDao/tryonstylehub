// AWS S3 Integration - Install packages first: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || '';

/**
 * Upload file to S3
 */
export async function uploadToS3(
  file: Buffer | Uint8Array | Blob,
  key: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file as Buffer,
      ContentType: contentType,
      ACL: 'public-read', // Make file publicly accessible
    });

    await s3Client.send(command);

    // Return public URL
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
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
  await uploadToS3(body, key, 'application/json');
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
}

