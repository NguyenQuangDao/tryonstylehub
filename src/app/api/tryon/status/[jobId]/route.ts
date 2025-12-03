import { errorResponse } from '@/lib/api-response';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/tryon/status/[jobId]
 * Check the status of a virtual try-on job
 * 
 * NOTE: Temporarily disabled - TryOnJob model not in main schema
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    return NextResponse.json(
        errorResponse('Try-on job status checking is currently unavailable'),
        { status: 501 }
    );
}
