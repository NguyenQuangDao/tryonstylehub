import { NextRequest, NextResponse } from 'next/server';

const READY_PLAYER_ME_API_KEY = process.env.READY_PLAYER_ME_API_KEY;


// Generate avatar with customization
export async function POST(request: NextRequest) {
  try {
    if (!READY_PLAYER_ME_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ready Player Me API credentials not configured' 
      }, { status: 500 });
    }

    const { userId, customization } = await request.json();

    if (!userId || !customization) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and customization data are required' 
      }, { status: 400 });
    }

    // Map customization to Ready Player Me format
    const avatarConfig = {
      gender: customization.gender,
      skinTone: customization.skinTone,
      hairColor: customization.hairColor,
      hairStyle: customization.hairStyle,
      eyeColor: customization.eyeColor,
      clothing: customization.clothingStyle,
      bodyType: 'fullbody',
      quality: 'medium'
    };

    // Generate avatar using Ready Player Me API
    const response = await fetch(`https://api.readyplayer.me/v1/avatars`, {
      method: 'POST',
      headers: {
        'x-api-key': READY_PLAYER_ME_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        config: avatarConfig
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Ready Player Me avatar generation error:', errorData);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to generate avatar' 
      }, { status: response.status });
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      data: {
        avatarUrl: result.data.url,
        avatarId: result.data.id,
        config: avatarConfig
      }
    });

  } catch (error) {
    console.error('Error generating avatar:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
