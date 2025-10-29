import { CostTracker } from "../../../lib/cost-optimizer";
import { generateImageWithDALLE } from "../../../lib/openai-ai";
import { NextRequest, NextResponse } from "next/server";

type GenerateImageRequest = {
  prompt: string;
  size?: "1024x1024" | "1024x1792" | "1792x1024";
  quality?: "standard" | "hd";
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GenerateImageRequest;
    const { prompt, quality = "standard" } = body;

    // Validation
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt là bắt buộc và phải là chuỗi văn bản."
        },
        { status: 400 }
      );
    }

    if (prompt.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt phải có ít nhất 10 ký tự để tạo ảnh chất lượng."
        },
        { status: 400 }
      );
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt không được vượt quá 1000 ký tự."
        },
        { status: 400 }
      );
    }

    // Generating image for prompt

    // Extract user ID for cost tracking
    const userId = request.headers.get('x-user-id') || 'anonymous';
    
    // Enhance prompt for better results
    const enhancedPrompt = `${prompt}. High quality, detailed, photorealistic, professional photography.`;

    // Generate image using optimized DALL-E
    const imageUrl = await generateImageWithDALLE(enhancedPrompt, userId, quality);

    // Image generated successfully

    // Get cost information
    const costStats = CostTracker.getStats();

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      prompt: enhancedPrompt,
      cost: costStats.daily,
      cached: imageUrl.includes('cached')
    });

  } catch (error) {
    console.error("[Generate Image API] Error:", error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes("content_policy_violation")) {
        return NextResponse.json(
          {
            success: false,
            error: "Nội dung của bạn vi phạm chính sách của OpenAI. Vui lòng thử lại với nội dung khác."
          },
          { status: 400 }
        );
      }
      
      if (error.message.includes("rate_limit")) {
        return NextResponse.json(
          {
            success: false,
            error: "Đã vượt quá giới hạn tỷ lệ. Vui lòng thử lại sau ít phút."
          },
          { status: 429 }
        );
      }

      if (error.message.includes("insufficient_quota")) {
        return NextResponse.json(
          {
            success: false,
            error: "Không đủ quota API. Vui lòng kiểm tra tài khoản OpenAI."
          },
          { status: 402 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Không thể tạo ảnh. Vui lòng thử lại sau."
      },
      { status: 500 }
    );
  }
}

