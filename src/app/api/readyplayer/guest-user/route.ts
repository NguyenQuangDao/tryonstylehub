import { NextRequest, NextResponse } from 'next/server';

const READY_PLAYER_ME_API_KEY = process.env.READY_PLAYER_ME_API_KEY;
const READY_PLAYER_ME_APP_ID = process.env.READY_PLAYER_ME_APP_ID;

// Create guest user according to Ready Player Me documentation
export async function POST(request: NextRequest) {
  try {
    if (!READY_PLAYER_ME_API_KEY || !READY_PLAYER_ME_APP_ID) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ready Player Me API credentials not configured' 
      }, { status: 500 });
    }

    const response = await fetch('https://api.readyplayer.me/v1/users', {
      method: 'POST',
      headers: {
        'x-api-key': READY_PLAYER_ME_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          applicationId: READY_PLAYER_ME_APP_ID
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Ready Player Me API error:', errorData);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create guest user' 
      }, { status: response.status });
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      data: {
        userId: result.data.id,
        createdAt: result.data.createdAt,
        updatedAt: result.data.updatedAt
      }
    });

  } catch (error) {
    console.error('Error creating guest user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
