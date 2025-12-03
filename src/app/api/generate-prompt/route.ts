import { NextRequest, NextResponse } from 'next/server';
import { composePromptFromAll, improveOnly } from '@/lib/promptComposer';

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

    const body = await request.json();
    const incomingPrompt: string | undefined = typeof body === 'object' && typeof body.prompt === 'string' ? body.prompt : undefined;
    const userInfo: UserInfo | undefined = typeof body === 'object' && typeof body.gender === 'string' ? (body as UserInfo) : undefined;
    const preferRemote: boolean = typeof body === 'object' && body?.preferRemote ? true : false;
    const model: string = typeof body === 'object' && typeof body?.model === 'string' ? body.model : 'google/gemini-2.0-flash-exp:free';

    const systemMessageForUserInfo = `You are an expert prompt engineer for DALL-E (image generation). Your task is to produce ONE concise but richly detailed English prompt that creates a photorealistic, full-body image of a person based on the provided info.

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

    const systemMessageForImprove = `You are a senior prompt engineer specialized in DALL-E 3. Improve the user's prompt for fashion image generation.

Rules:
- Output ONLY the improved prompt in English.
- Preserve the original intent and key subject.
- Enhance with professional, photorealistic, high-quality photography cues.
- Add clear composition (subject-centered), lighting, background, and camera details.
- Avoid brand names and copyrighted characters; avoid text/watermarks.
- Avoid overly prescriptive clothing details unless requested.
- Prefer full-body framing when the subject is a person; otherwise choose suitable framing.
`;

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

    const heightImpression = userInfo ? describeHeightImpression(userInfo.height) : undefined;
    const bodyType = userInfo ? describeBodyType(userInfo.height, userInfo.weight) : undefined;
    const skinToneDesc = userInfo ? mapSkinTone(userInfo.skinTone) : undefined;

    const userMessage = (() => {
      if (incomingPrompt && userInfo) {
        return `Combine the provided avatar description with the structured user data into ONE clear, detailed English prompt for DALL-E 3.

Inputs:
- Description: "${incomingPrompt}"
- Gender: ${userInfo.gender}, age: adult
- Height: ${userInfo.height} cm (${heightImpression})
- Body type: ${bodyType}
- Skin tone: ${skinToneDesc}
- Eye color: ${userInfo.eyeColor}
- Hair: ${userInfo.hairStyle} ${userInfo.hairColor}

Requirements:
- Preserve the user's intent and key details.
- Remove duplicate or unnecessary information.
- Prioritize subject attributes first, then pose, composition, camera, lighting, background, quality tags, and negative cues.
- Prefer concise phrasing; avoid brand names or copyrighted terms.
- Output ONLY the final prompt, one line.`;
      }
      if (incomingPrompt) {
        return `Original user prompt to improve:\n\n${incomingPrompt}\n\nRewrite it into a single, concise but richly detailed prompt optimized for DALL-E 3, following the rules.`;
      }
      return `Create a single photorealistic full-body prompt with:
Gender: ${userInfo!.gender}, age: adult
Height: ${userInfo!.height} cm (${heightImpression})
Body type: ${bodyType}
Skin tone: ${skinToneDesc}
Eye color: ${userInfo!.eyeColor}
Hair: ${userInfo!.hairStyle} ${userInfo!.hairColor}

Additional constraints:
- Pose: natural standing, slight angle toward camera, relaxed hands at sides
- Composition: full-length portrait, full body centered, head-to-toe visible, limbs fully visible (hands and feet in frame), 4:5 ratio
- Camera & lens: DSLR, 50mm prime, f/2.0, ISO 200, 1/200s
- Lighting: soft studio key light with gentle rim light OR diffuse daylight
- Background: neutral studio gradient
- Quality: photorealistic, professional photography, high quality, high detail, lifelike
- Negative: no watermark, no text, no blur, no distortion, no cropping or cut-off head/hands/feet
- Clothing: avoid specifying garments or brands (keep neutral/general only)`;
    })();

    const localImprovePrompt = (original: string) => improveOnly(original);

    const localGenerateFromUserInfo = (info: UserInfo) => composePromptFromAll(info);

    const localComposeFromAll = (info: UserInfo, original: string) => composePromptFromAll(info, original);

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
            model,
            messages: [
              {
                role: 'system',
                content: incomingPrompt ? systemMessageForImprove : systemMessageForUserInfo
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
            const waitTime = Math.pow(2, retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          if (preferRemote) {
            return NextResponse.json(
              {
                success: false,
                error: 'API đang quá tải, vui lòng thử lại sau ít phút',
                errorCode: 'RATE_LIMIT_EXCEEDED'
              },
              { status: 429 }
            );
          }
          const promptOut = incomingPrompt && userInfo
            ? localComposeFromAll(userInfo!, incomingPrompt)
            : incomingPrompt
              ? localImprovePrompt(incomingPrompt)
              : localGenerateFromUserInfo(userInfo!);
          return NextResponse.json({ success: true, prompt: promptOut, source: 'local' });
        }

        // Các lỗi khác
        throw new Error(`OpenRouter API error: ${response.status}`);

      } catch (fetchError) {
        console.error('Error fetching from OpenRouter:', fetchError);
        if (retryCount < maxRetries) {
          retryCount++;
          const waitTime = 1000 * retryCount;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        if (preferRemote) {
          return NextResponse.json(
            {
              success: false,
              error: 'Không gọi được OpenRouter, vui lòng thử lại',
              errorCode: 'NETWORK_ERROR'
            },
            { status: 502 }
          );
        }
        const promptOut = incomingPrompt && userInfo
          ? localComposeFromAll(userInfo!, incomingPrompt)
          : incomingPrompt
            ? localImprovePrompt(incomingPrompt)
            : localGenerateFromUserInfo(userInfo!);
        return NextResponse.json({ success: true, prompt: promptOut, source: 'local' });
      }
    }

    const data = await response!.json();
    const generatedPrompt = data.choices?.[0]?.message?.content;

    if (!generatedPrompt) {
      throw new Error('Không nhận được prompt từ API');
    }

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt.trim(),
      source: 'openrouter'
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
