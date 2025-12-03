import { createPaginationMeta, handleApiError, successResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/products
 * Fetch all published products with proper relations
 * 
 * OPTIMIZATION: Fixed schema mismatch, added proper filtering, pagination
 */
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
        const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10), 1), 100);
        const categorySlug = url.searchParams.get('category');
        const search = url.searchParams.get('search');

        // Build where clause
        const where: any = {
            status: 'PUBLISHED', // Only show published products
        };

        if (categorySlug) {
            where.category = {
                slug: categorySlug,
            };
        }

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
            ];
        }

        // Optimized query with proper includes to avoid N+1
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    shop: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            averageRating: true,
                        },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                    variants: {
                        select: {
                            id: true,
                            stock: true,
                            price: true,
                        },
                    },
                },
            }),
            prisma.product.count({ where }),
        ]);

        // Transform data to match expected format
        const formattedProducts = products.map((product) => ({
            id: product.id,
            title: product.title,
            description: product.description,
            basePrice: Number(product.basePrice),
            images: Array.isArray(product.images) ? product.images : [],
            status: product.status,
            totalStock: product.variants.reduce((sum, v) => sum + (v.stock || 0), 0),
            category: {
                id: product.category.id,
                name: product.category.name,
                slug: product.category.slug,
            },
            shop: {
                id: product.shop.id,
                name: product.shop.name,
                slug: product.shop.slug,
                rating: product.shop.averageRating,
            },
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        }));

        return NextResponse.json(
            successResponse(formattedProducts, {
                pagination: createPaginationMeta(page, limit, total),
            })
        );
    } catch (error) {
        const { response, statusCode } = handleApiError(error);
        return NextResponse.json(response, { status: statusCode });
    }
}
