import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCache, setCache } from "../../../lib/cache";
import { getRecommendedProductIds } from "../../../lib/openai-ai";
import { prisma } from "../../../lib/prisma";
import { getPresignedUrl } from "../../../lib/s3";

type OutfitProduct = {
  id: string;
  name: string;
  type: string;
  price: number;
  imageUrl: string;
  styleTags: string[];
  shop: {
    name: string;
    url: string;
  };
};

type RecommendationPayload = {
  outfit: OutfitProduct[];
  shops: {
    name: string;
    url: string;
    productName: string;
  }[];
};

const recommendSchema = z.object({
  style: z.string().min(3, "Mô tả phong cách là bắt buộc"),
  wishlistIds: z.array(z.union([z.string(), z.number()])).optional().default([]),
  preferredShops: z.array(z.string()).optional().default([]),
  recentStyles: z.array(z.string()).optional().default([]),
});

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = recommendSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { style, wishlistIds, preferredShops, recentStyles } = parseResult.data;
    const normalizedStyle = style.trim().toLowerCase();
    const prefKey = JSON.stringify({ w: wishlistIds, s: preferredShops });
    const cacheKey = `recommend:${normalizedStyle}:${prefKey}`;

    const cached = getCache<RecommendationPayload>(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const products = await prisma.product.findMany({
      include: { shop: true, category: true },
    });

    if (!products.length) {
      return NextResponse.json(
        { error: "Danh mục sản phẩm trống" },
        { status: 500 }
      );
    }

    const enrichedProducts = await Promise.all(products.map(async (p) => {
      const name = (p as any).name ?? (p as any).title ?? '';
      const type = (p as any).type ?? p.category?.name ?? 'Khác';
      const price = typeof (p as any).price === 'number' ? (p as any).price : Number((p as any).basePrice ?? 0);

      let rawImage: any = (p as any).imageUrl;
      if (!rawImage && Array.isArray((p as any).images) && (p as any).images.length > 0) {
        const first = (p as any).images[0];
        rawImage = typeof first === 'string' ? first : (first?.url ?? '');
      }

      let imageUrl = typeof rawImage === 'string' ? rawImage : '';
      if (imageUrl.startsWith('http://')) {
        imageUrl = imageUrl.replace(/^http:\/\//, 'https://');
      }

      if (imageUrl && imageUrl.includes('.s3.') && imageUrl.includes('amazonaws.com')) {
        try {
          const u = new URL(imageUrl);
          const key = u.pathname.replace(/^\//, '');
          if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            imageUrl = await getPresignedUrl(key, 900);
          }
        } catch {}
      }

      const styleTags = [
        ...String(name).toLowerCase().split(/[^a-zA-Z0-9]+/).filter(Boolean),
        ...String(type).toLowerCase().split(/[^a-zA-Z0-9]+/).filter(Boolean),
      ];

      return {
        id: String(p.id),
        name,
        type,
        price,
        imageUrl,
        styleTags,
        shop: p.shop,
      };
    }));

    // Get AI recommendations (returns product IDs based on internal indexing)
    const recommendedIds = await getRecommendedProductIds(style, enrichedProducts);
    let selectedProducts = enrichedProducts.filter(p => recommendedIds.includes(p.id));

    // Re-rank by personalization if available
    if (selectedProducts.length) {
      const wl = new Set((wishlistIds || []).map(String));
      const shopsPref = new Set((preferredShops || []).map(s => s.toLowerCase()));
      selectedProducts = selectedProducts
        .map(product => {
          let boost = 0;
          if (wl.has(String(product.id))) boost += 5;
          const slug = (product as any)?.shop?.slug ? String((product as any).shop.slug).toLowerCase() : '';
          const shopName = (product as any)?.shop?.name ? String((product as any).shop.name).toLowerCase() : '';
          if (slug && shopsPref.has(slug)) boost += 3;
          if (shopName && shopsPref.has(shopName)) boost += 2;
          // Recent style keywords match
          const rs = (recentStyles || []).join(' ').toLowerCase();
          const productText = `${product.name} ${product.type} ${(product.styleTags || []).join(' ')}`.toLowerCase();
          const keywords = rs.split(/\s+/).filter(w => w.length > 3);
          keywords.forEach(k => { if (productText.includes(k)) boost += 1; });
          return { product, boost };
        })
        .sort((a, b) => b.boost - a.boost)
        .map(x => x.product);
    }

    // Smart fallback with semantic matching
    if (!selectedProducts.length) {
      console.log('[Recommend API] Using intelligent fallback');

      // Extract keywords from style description
      const keywords = normalizedStyle
        .split(/\s+/)
        .filter(word => word.length > 3);

      // Score products based on tag and name matching
      const wl = new Set((wishlistIds || []).map(String));
      const shopsPref = new Set((preferredShops || []).map(s => s.toLowerCase()));
      const rs = (recentStyles || []).join(' ').toLowerCase();
      const scoredProducts = enrichedProducts.map((product) => {
        const tags = product.styleTags || [];
        const productText = `${product.name} ${product.type} ${tags.join(' ')}`.toLowerCase();

        let score = 0;
        keywords.forEach(keyword => {
          if (productText.includes(keyword)) {
            score += 2;
          }
          // Partial match
          tags.forEach((tag: string) => {
            if (tag.toLowerCase().includes(keyword) || keyword.includes(tag.toLowerCase())) {
              score += 1;
            }
          });
        });

        // Personalization boosts
        if (wl.has(String(product.id))) score += 5;
        const slug = (product as any)?.shop?.slug ? String((product as any).shop.slug).toLowerCase() : '';
        const shopName = (product as any)?.shop?.name ? String((product as any).shop.name).toLowerCase() : '';
        if (slug && shopsPref.has(slug)) score += 3;
        if (shopName && shopsPref.has(shopName)) score += 2;
        const rsKeywords = rs.split(/\s+/).filter(w => w.length > 3);
        rsKeywords.forEach(k => { if (productText.includes(k)) score += 1; });

        return { product, score };
      });

      // Sort by score and get top matches
      scoredProducts.sort((a, b) => b.score - a.score);

      // Ensure diversity in product types
      const typesSeen = new Set<string>();
      const diverseProducts: typeof enrichedProducts = [];

      for (const { product, score } of scoredProducts) {
        if (score > 0) {
          const type = String(product.type).toLowerCase();
          // Prefer products of different types
          if (!typesSeen.has(type) || diverseProducts.length < 3) {
            diverseProducts.push(product);
            typesSeen.add(type);
          }
        }
        if (diverseProducts.length >= 5) break;
      }

      selectedProducts = diverseProducts.length
        ? diverseProducts
        : enrichedProducts.slice(0, 4);
    }

    // Ensure we have a balanced outfit (if we have enough products)
    if (selectedProducts.length >= 3) {
      const typeCount = selectedProducts.reduce((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('[Recommend API] Product type distribution:', typeCount);
    }

    const outfit: OutfitProduct[] = selectedProducts.map((product) => ({
      id: String(product.id),
      name: product.name,
      type: product.type,
      price: Number(product.price ?? 0),
      imageUrl: product.imageUrl,
      styleTags: product.styleTags || [],
      shop: {
        name: product.shop?.name ?? 'Shop',
        url: product.shop?.slug ? `/shops/${product.shop.slug}` : '#',
      },
    }));

    const shops = outfit.map((product: OutfitProduct) => ({
      name: product.shop.name,
      url: product.shop.url,
      productName: product.name,
    }));

    const responsePayload: RecommendationPayload = { outfit, shops };
    setCache(cacheKey, responsePayload, CACHE_TTL);

    return NextResponse.json({ ...responsePayload, cached: false });
  } catch (error) {
    console.error("Recommendation API error", error);

    if (error instanceof Error && error.name === "PrismaClientInitializationError") {
      return NextResponse.json(
        {
          error: "Cơ sở dữ liệu không khả dụng",
          hint: "Khởi động cơ sở dữ liệu trước khi yêu cầu trang phục.",
        },
        { status: 503 }
      );
    }

    const message = error instanceof Error ? error.message : "Lỗi không mong muốn";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
