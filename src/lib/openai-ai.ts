/* eslint-disable */
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
  quality: 'standard' | 'hd' = 'standard',
  size: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1792'
): Promise<string> {
  const cacheKey = `dalle:${quality}:${size}:${prompt}`;
  const cached = getCache<string>(cacheKey);

  if (cached) {
    // Using cached DALL-E image
    return cached;
  }

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality,
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }

    // Track cost
    let cost = quality === 'hd' ? DALLE3_HD_1024_COST : DALLE3_STANDARD_1024_COST;
    if (quality === 'hd' && size === '1024x1792') {
      cost = DALLE3_HD_1792_COST;
    }
    CostTracker.track(cost, 'openai', 'dalle-3');

    // Cache for 1 hour
    setCache(cacheKey, imageUrl, 60 * 60 * 1000);

    return imageUrl;
  } catch (error) {
    console.error('[OpenAI] DALL-E error:', error);
    const e: any = error;
    const code = e?.error?.code || e?.code || '';
    if (String(code).includes('content_policy_violation')) {
      throw new Error('content_policy_violation');
    }
    throw error;
  }
}

/**
 * Extract style context from user input using AI
 */
async function extractStyleContext(style: string): Promise<{
  occasion?: string;
  season?: string;
  colors?: string[];
  vibe?: string;
  formality?: string;
}> {
  const cacheKey = `context:${style}`;
  const cached = getCache<any>(cacheKey);
  if (cached) return cached;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a fashion context analyzer. Extract key context from style descriptions. Return valid JSON only.',
        },
        {
          role: 'user',
          content: `Analyze this style request and extract context: "${style}"\n\nReturn JSON with: occasion (work/casual/formal/party/beach/sport), season (summer/winter/spring/fall/all), colors (array), vibe (edgy/classic/minimal/bohemian/trendy), formality (casual/smart-casual/business/formal)`,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const context = JSON.parse(content);

    // Cache for 1 hour
    setCache(cacheKey, context, 60 * 60 * 1000);

    return context;
  } catch (error) {
    console.error('[OpenAI] Context extraction error:', error);
    return {};
  }
}

/**
 * Get recommended product IDs using GPT-4 with advanced semantic analysis
 */
export async function getRecommendedProductIds(
  style: string,
  products: Array<{ id: string; name: string; type: string; styleTags: string[] }>
): Promise<string[]> {
  const cacheKey = `recommend:v2:${style}`;
  const cached = getCache<string[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // Step 1: Extract context from style description
    const context = await extractStyleContext(style);

    // Step 2: Group products by type for balanced selection
    const productsByType = products.reduce((acc, p) => {
      const type = p.type.toLowerCase();
      if (!acc[type]) acc[type] = [];
      acc[type].push(p);
      return acc;
    }, {} as Record<string, typeof products>);

    // Step 3: Create enriched product list with context
    // Step 3: Create an indexed product list so the model returns stable IDXs
    const indexedProducts = products.map((p, idx) => ({ idx: idx + 1, ...p }));
    const enhancedProductList = indexedProducts.map(p => {
      const tags = p.styleTags.join(', ');
      return `IDX: ${p.idx} | Name: ${p.name} | Type: ${p.type} | Style: ${tags}`;
    }).join('\n');

    // Step 4: Build intelligent prompt with context
    const contextInfo = Object.keys(context).length > 0
      ? `\nContext Analysis: ${JSON.stringify(context)}`
      : '';

    const prompt = `You are an expert fashion stylist AI. Analyze this style request and recommend products for a complete outfit.

USER REQUEST: "${style}"${contextInfo}

AVAILABLE PRODUCTS:
${enhancedProductList}

PRODUCT TYPES AVAILABLE: ${Object.keys(productsByType).join(', ')}

INSTRUCTIONS:
1. Create a BALANCED outfit (mix tops, bottoms, and accessories if available)
2. Consider the occasion, season, and color harmony from the context
3. Ensure products complement each other stylistically
4. Prioritize quality matches over quantity (3-5 items ideal)
5. If context suggests formality, choose appropriate items

Return ONLY a JSON object with this structure:
{
  "idx": [1, 2, 3],
  "reasoning": "Brief explanation of why these items work together"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an elite fashion stylist AI with expertise in outfit coordination, color theory, and style matching. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content || '{"idx": []}';

    // Parse the response
    let idxs: number[] = [];
    let reasoning = '';

    try {
      const parsed = JSON.parse(content.trim());
      idxs = parsed.idx || parsed.productIds || parsed.ids || [];
      reasoning = parsed.reasoning || '';

      // Log AI reasoning for debugging
      if (reasoning) {
        console.log('[AI Stylist]', reasoning);
      }
    } catch {
      // Fallback: try to extract array from response
      const arrayMatch = content.match(/\[[\d,\s]+\]/);
      if (arrayMatch) {
        idxs = JSON.parse(arrayMatch[0]);
      } else {
        const matches = content.match(/\d+/g);
        idxs = matches ? matches.map(Number) : [];
      }
    }

    // Filter valid IDs and ensure diversity
    const idxSet = new Set(idxs.filter((n) => Number.isFinite(n) && n > 0));
    const validIds = indexedProducts
      .filter((p) => idxSet.has(p.idx))
      .map((p) => p.id);

    // Track cost
    const usage = response.usage;
    if (usage) {
      const cost = (usage.prompt_tokens * GPT4_INPUT_COST) + (usage.completion_tokens * GPT4_OUTPUT_COST);
      CostTracker.track(cost, 'openai', 'gpt-4-smart-recommendations');
    }

    // Cache for 30 minutes
    setCache(cacheKey, validIds, 30 * 60 * 1000);

    return validIds.length > 0 ? validIds : [];
  } catch (error) {
    console.error('[OpenAI] Smart Recommendation error:', error);
    return [];
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
