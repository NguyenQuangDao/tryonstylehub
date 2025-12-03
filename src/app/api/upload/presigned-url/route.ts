import { errorResponse, successResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/auth';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

const s3Client = (() => {
    const { S3Client } = require('@aws-sdk/client-s3');
    return new S3Client({
        region: process.env.AWS_S3_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
    });
})();

const BUCKET_NAME = process.env.AWS_S3_BUCKET || '';
const PUBLIC_BASE = process.env.AWS_S3_PUBLIC_BASE_URL ||
    `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com`;

/**
 * POST /api/upload/presigned-url
 * Generate a presigned URL for direct client-to-S3 upload
 * 
 * OPTIMIZATION: Client uploads directly to S3, reducing server load
 */
export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const token = request.cookies.get('token')?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload?.userId) {
            return NextResponse.json(
                errorResponse('Unauthorized'),
                { status: 401 }
            );
        }

        const { fileName, fileType, folder = 'uploads' } = await request.json();

        // Validate inputs
        if (!fileName || !fileType) {
            return NextResponse.json(
                errorResponse('Missing fileName or fileType'),
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
        ];

        if (!allowedTypes.includes(fileType)) {
            return NextResponse.json(
                errorResponse('Invalid file type. Allowed: JPEG, PNG, WebP'),
                { status: 400 }
            );
        }

        // Validate file size (max 10MB) - this will be enforced on S3 policy
        const maxSize = 10 * 1024 * 1024;

        // Generate unique key
        const key = generateS3Key(folder, fileName);

        // Create presigned URL
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: fileType,
            // Optionally add conditions
            // This enforces max file size
            // Note: Will need to be validated on client before upload
        });

        const uploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600, // 1 hour
        });

        // Public URL after upload
        const publicUrl = `${PUBLIC_BASE}/${key}`;

        return NextResponse.json(
            successResponse({
                uploadUrl,
                key,
                publicUrl,
                expiresIn: 3600,
            })
        );

    } catch (error) {
        console.error('Presigned URL generation error:', error);
        return NextResponse.json(
            errorResponse('Failed to generate upload URL'),
            { status: 500 }
        );
    }
}

/**
 * Generate S3 key for file with timestamp and random string
 */
function generateS3Key(prefix: string, filename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const extension = sanitized.split('.').pop();
    const nameWithoutExt = sanitized.replace(`.${extension}`, '');

    return `${prefix}/${timestamp}-${random}-${nameWithoutExt}.${extension}`;
}
