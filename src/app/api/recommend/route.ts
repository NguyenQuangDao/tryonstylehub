import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCache, setCache } from "../../../lib/cache";
import { getRecommendedProductIds } from "../../../lib/openai-ai";
import { prisma } from "../../../lib/prisma";

type OutfitProduct = {
  id: number;
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

    const { style } = parseResult.data;
    const normalizedStyle = style.trim().toLowerCase();
    const cacheKey = `recommend:${normalizedStyle}`;

    const cached = getCache<RecommendationPayload>(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const products = await prisma.product.findMany({
      include: { shop: true },
    });

    if (!products.length) {
      return NextResponse.json(
        { error: "Danh mục sản phẩm trống" },
        { status: 500 }
      );
    }

    const productsWithParsedTags = products.map(product => ({
      ...product,
      styleTags: JSON.parse(product.styleTags || '[]')
    }));

    // Get AI recommendations
    const recommendedIds = await getRecommendedProductIds(style, productsWithParsedTags);
    let selectedProducts = products.filter(product =>
      recommendedIds.includes(product.id)
    );

    // Smart fallback with semantic matching
    if (!selectedProducts.length) {
      console.log('[Recommend API] Using intelligent fallback');

      // Extract keywords from style description
      const keywords = normalizedStyle
        .split(/\s+/)
        .filter(word => word.length > 3);

      // Score products based on tag and name matching
      const scoredProducts = products.map(product => {
        const tags = JSON.parse(product.styleTags || '[]');
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

        return { product, score };
      });

      // Sort by score and get top matches
      scoredProducts.sort((a, b) => b.score - a.score);

      // Ensure diversity in product types
      const typesSeen = new Set<string>();
      const diverseProducts: typeof products = [];

      for (const { product, score } of scoredProducts) {
        if (score > 0) {
          const type = product.type.toLowerCase();
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
        : products.slice(0, 4);
    }

    // Ensure we have a balanced outfit (if we have enough products)
    if (selectedProducts.length >= 3) {
      const typeCount = selectedProducts.reduce((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Log diversity for debugging
      console.log('[Recommend API] Product type distribution:', typeCount);
    }

    const outfitRecord = await prisma.outfit.create({
      data: {
        style,
        products: {
          connect: selectedProducts.map((product) => ({ id: product.id })),
        },
      },
      include: {
        products: {
          include: {
            shop: true,
          },
        },
      },
    });

    const outfit = outfitRecord.products.map(product => ({
      id: product.id,
      name: product.name,
      type: product.type,
      price: product.price,
      imageUrl: product.imageUrl,
      styleTags: JSON.parse(product.styleTags || '[]'),
      shop: {
        name: product.shop.name,
        url: product.shop.url,
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

