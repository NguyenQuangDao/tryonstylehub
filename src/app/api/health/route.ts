import { checkDatabaseConnection } from '@/lib/db-check';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dbConnected = await checkDatabaseConnection();

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbConnected ? 'connected' : 'disconnected',
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
        fashn: process.env.FASHN_API_KEY ? 'configured' : 'not configured',
        s3: process.env.AWS_ACCESS_KEY_ID ? 'configured' : 'not configured',
      },
      environment: process.env.NODE_ENV,
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

