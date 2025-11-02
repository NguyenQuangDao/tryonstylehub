import { NextRequest, NextResponse } from 'next/server';

interface UserInfo {
  gender: 'male' | 'female' | 'non-binary';
  height: number;
  weight: number;
  skinTone: 'very-light' | 'light' | 'medium' | 'tan' | 'brown' | 'dark';
  eyeColor: 'brown' | 'black' | 'blue' | 'green' | 'gray' | 'amber';
  hairColor: 'black' | 'brown' | 'blonde' | 'red' | 'white' | 'gray' | 'other';
  hairStyle: 'long' | 'short' | 'curly' | 'straight' | 'bald' | 'wavy';
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra API key
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'OPENROUTER_API_KEY không được cấu hình'
        },
        { status: 500 }
      );
    }

    const userInfo: UserInfo = await request.json();

    // Tạo prompt system message (nâng cấp cho ảnh chân thực photorealistic)
    const systemMessage = `You are an expert prompt engineer for DALL-E (image generation). Your task is to produce ONE concise but richly detailed English prompt that creates a photorealistic, full-body image of a person based on the provided info.

Strict requirements:
- Output ONLY the final prompt text (no explanations, no lists).
- Photorealistic style with lifelike skin texture and realistic lighting.
- Full-body composition: head-to-toe clearly visible, entire figure in frame, subject centered.
- All limbs fully visible: face unobstructed, both arms and both hands visible, both legs and feet visible.
- Include: gender, height impression, body type, skin tone, eye color, hair color and style.
- Pose: natural standing pose, slight angle toward camera, relaxed hands at sides.
- Framing: full-length portrait distance, subject occupies ~70% of frame, adequate margins.
- Camera & lens: DSLR, 50mm prime lens, f/2.0, ISO 200, 1/200s.
- Lighting: soft studio key light with gentle rim light OR diffuse daylight.
- Background: neutral studio gradient or minimal clean backdrop.
- Quality tags: "photorealistic", "professional photography", "high quality", "high detail", "lifelike".
- Negative cues: no watermark, no text, no blur, no distortion, no cropping, no cut-off head/hands/feet, anatomically accurate proportions.
- Clothing instruction: Do NOT specify exact garments or brands; avoid detailed clothing descriptions (keep neutral/general only if needed).

Return only the single prompt.`;

    // Helpers để tăng độ chi tiết của mô tả cơ thể
    const describeHeightImpression = (h: number) => {
      if (h <= 155) return 'short stature';
      if (h >= 185) return 'tall stature';
      return 'average height';
    };

    const describeBodyType = (h: number, w: number) => {
      // BMI xấp xỉ, giúp mô tả body type tự nhiên
      const heightMeters = h / 100;
      const bmi = w / (heightMeters * heightMeters);
      if (bmi < 18.5) return 'slender build';
      if (bmi < 24.9) return 'average build';
      if (bmi < 29.9) return 'athletic/curvy build';
      return 'plus-size build';
    };

    const mapSkinTone = (tone: UserInfo['skinTone']) => {
      switch (tone) {
        case 'very-light': return 'very fair skin tone';
        case 'light': return 'fair skin tone';
        case 'medium': return 'medium skin tone';
        case 'tan': return 'tanned skin tone';
        case 'brown': return 'brown skin tone';
        case 'dark': return 'deep dark skin tone';
        default: return 'natural skin tone';
      }
    };

    const heightImpression = describeHeightImpression(userInfo.height);
    const bodyType = describeBodyType(userInfo.height, userInfo.weight);
    const skinToneDesc = mapSkinTone(userInfo.skinTone);

    // Tạo user message giàu thông tin hơn
    const userMessage = `Create a single photorealistic full-body prompt with:
- Gender: ${userInfo.gender}, age: adult
- Height: ${userInfo.height} cm (${heightImpression})
- Body type: ${bodyType}
- Skin tone: ${skinToneDesc}
- Eye color: ${userInfo.eyeColor}
- Hair: ${userInfo.hairStyle} ${userInfo.hairColor}

Additional constraints:
- Pose: natural standing, slight angle toward camera, relaxed hands at sides
- Composition: full-length portrait, full body centered, head-to-toe visible, limbs fully visible (hands and feet in frame), 4:5 ratio
- Camera & lens: DSLR, 50mm prime, f/2.0, ISO 200, 1/200s
- Lighting: soft studio key light with gentle rim light OR diffuse daylight
- Background: neutral studio gradient
- Quality: photorealistic, professional photography, high quality, high detail, lifelike
- Negative: no watermark, no text, no blur, no distortion, no cropping or cut-off head/hands/feet
- Clothing: avoid specifying garments or brands (keep neutral/general only)`;

    // Gọi OpenRouter API với retry logic
    let response;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://tryonstylehub.vercel.app',
            'X-Title': 'TryOnStyleHub',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [
              {
                role: 'system',
                content: systemMessage
              },
              {
                role: 'user',
                content: userMessage
              }
            ],
            max_tokens: 1000,
            temperature: 0.5
          })
        });

        // Nếu thành công, thoát khỏi loop
        if (response.ok) {
          break;
        }

        // Xử lý lỗi 429 (Rate limit)
        if (response.status === 429) {
          retryCount++;
          if (retryCount <= maxRetries) {
            // Đợi một chút trước khi retry (exponential backoff)
            const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
            console.log(`Rate limit hit, retrying in ${waitTime}ms (attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            // Đã hết số lần retry
            return NextResponse.json(
              {
                success: false,
                error: 'API đang quá tải, vui lòng thử lại sau ít phút',
                errorCode: 'RATE_LIMIT_EXCEEDED'
              },
              { status: 429 }
            );
          }
        }

        // Các lỗi khác
        throw new Error(`OpenRouter API error: ${response.status}`);

      } catch (fetchError) {
        if (retryCount < maxRetries) {
          retryCount++;
          const waitTime = 1000 * retryCount;
          console.log(`Network error, retrying in ${waitTime}ms (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw fetchError;
      }
    }

    const data = await response!.json();
    const generatedPrompt = data.choices?.[0]?.message?.content;

    if (!generatedPrompt) {
      throw new Error('Không nhận được prompt từ API');
    }

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt.trim()
    });

  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo prompt'
      },
      { status: 500 }
    );
  }
}