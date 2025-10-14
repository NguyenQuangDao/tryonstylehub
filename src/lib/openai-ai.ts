import OpenAI from 'openai/index.mjs';
import { getCache, setCache } from './cache';
import { CostTracker } from './cost-optimizer';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cost estimates per 1K tokens for GPT-4
const GPT4_INPUT_COST = 0.03 / 1000;
const GPT4_OUTPUT_COST = 0.06 / 1000;

// DALL-E 3 pricing
const DALLE3_STANDARD_1024_COST = 0.04;
const DALLE3_HD_1024_COST = 0.08;
const DALLE3_HD_1792_COST = 0.12;

/**
 * Generate image using DALL-E 3
 */
export async function generateImageWithDALLE(
  prompt: string,
  userId: string = 'anonymous',
  quality: 'standard' | 'hd' = 'standard'
): Promise<string> {
  const cacheKey = `dalle:${quality}:${prompt}`;
  const cached = getCache<string>(cacheKey);
  
  if (cached) {
    console.log('[OpenAI] Using cached DALL-E image');
    return cached;
  }

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality,
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }

    // Track cost
    const cost = quality === 'hd' ? DALLE3_HD_1024_COST : DALLE3_STANDARD_1024_COST;
    CostTracker.track(cost, 'openai', 'dalle-3');

    // Cache for 1 hour
    setCache(cacheKey, imageUrl, 60 * 60 * 1000);

    return imageUrl;
  } catch (error) {
    console.error('[OpenAI] DALL-E error:', error);
    throw error;
  }
}

/**
 * Get recommended product IDs using GPT-4
 */
export async function getRecommendedProductIds(
  style: string,
  products: Array<{ id: number; name: string; type: string; styleTags: string[] }>
): Promise<number[]> {
  const cacheKey = `recommend:${style}`;
  const cached = getCache<number[]>(cacheKey);
  
  if (cached) {
    console.log('[OpenAI] Using cached recommendations');
    return cached;
  }

  try {
    const productList = products.map(p => 
      `ID: ${p.id}, Name: ${p.name}, Type: ${p.type}, Tags: ${p.styleTags.join(', ')}`
    ).join('\n');

    const prompt = `Based on the style description "${style}", recommend 3-5 product IDs from this list that would make a great outfit. Return ONLY a JSON array of product IDs, nothing else.

Products:
${productList}

Return format: [id1, id2, id3, ...]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a fashion stylist AI. Return only valid JSON arrays of product IDs.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content || '[]';
    
    // Parse the response
    let productIds: number[] = [];
    try {
      productIds = JSON.parse(content.trim());
    } catch {
      // Fallback: extract numbers from response
      const matches = content.match(/\d+/g);
      productIds = matches ? matches.map(Number) : [];
    }

    // Track cost
    const usage = response.usage;
    if (usage) {
      const cost = (usage.prompt_tokens * GPT4_INPUT_COST) + (usage.completion_tokens * GPT4_OUTPUT_COST);
      CostTracker.track(cost, 'openai', 'gpt-4-recommendations');
    }

    // Cache for 30 minutes
    setCache(cacheKey, productIds, 30 * 60 * 1000);

    return productIds;
  } catch (error) {
    console.error('[OpenAI] Recommendation error:', error);
    // Return fallback: random products
    return products.slice(0, 4).map(p => p.id);
  }
}

/**
 * Generate outfit description using GPT-4
 */
export async function generateOutfitDescription(
  products: Array<{ name: string; type: string }>
): Promise<string> {
  try {
    const productList = products.map(p => `${p.name} (${p.type})`).join(', ');

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a fashion stylist. Create engaging, concise outfit descriptions.',
        },
        {
          role: 'user',
          content: `Create a short, catchy description for an outfit containing: ${productList}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 100,
    });

    const description = response.choices[0]?.message?.content || 'Stylish outfit combination';

    // Track cost
    const usage = response.usage;
    if (usage) {
      const cost = (usage.prompt_tokens * GPT4_INPUT_COST) + (usage.completion_tokens * GPT4_OUTPUT_COST);
      CostTracker.track(cost, 'openai', 'gpt-4-description');
    }

    return description;
  } catch (error) {
    console.error('[OpenAI] Description error:', error);
    return 'A perfect combination for your style';
  }
}

