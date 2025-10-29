import { getCache, setCache } from "../../../lib/cache";
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

type ProductResponse = {
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
  createdAt: Date;
};

const CACHE_KEY = "products:all";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  try {
    const cached = getCache<ProductResponse[]>(CACHE_KEY);
    if (cached) {
      return NextResponse.json({ products: cached, cached: true });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        shop: true,
      },
    });

    const formatted: ProductResponse[] = products.map((product) => ({
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
      createdAt: product.createdAt,
    }));

    setCache(CACHE_KEY, formatted, CACHE_TTL);
    return NextResponse.json({ products: formatted, cached: false });
  } catch (error) {
    console.error("Failed to fetch products", error);

    if (error instanceof Error && error.name === "PrismaClientInitializationError") {
      return NextResponse.json(
        {
          error: "Cơ sở dữ liệu không khả dụng",
          hint: "Đảm bảo cơ sở dữ liệu được cấu hình và chạy đúng cách.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Không thể tải sản phẩm" },
      { status: 500 }
    );
  }
}

