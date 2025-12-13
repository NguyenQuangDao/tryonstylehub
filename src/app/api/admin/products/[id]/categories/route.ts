import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || (payload as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const productId = params.id;
    const { categoryIds } = await request.json();

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: 'categoryIds must be an array' },
        { status: 400 }
      );
    }

    // Validate that all categoryIds exist
    const existingCategories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds
        }
      }
    });

    if (existingCategories.length !== categoryIds.length) {
      return NextResponse.json(
        { error: 'Some categories do not exist' },
        { status: 400 }
      );
    }

    // Use raw SQL for better control
    await prisma.$executeRawUnsafe(`DELETE FROM ProductCategory WHERE productId = ?`, productId);
    
    if (categoryIds.length > 0) {
      const values = categoryIds.map(id => `('${productId}', '${id}')`).join(',');
      await prisma.$executeRawUnsafe(`INSERT INTO ProductCategory (productId, categoryId) VALUES ${values}`);
    }

    // Get updated product with categories using raw SQL
    const product = await prisma.$queryRawUnsafe(`
      SELECT p.*, c.id as category_id, c.name as category_name, c.slug as category_slug
      FROM Product p
      LEFT JOIN ProductCategory pc ON p.id = pc.productId
      LEFT JOIN Category c ON pc.categoryId = c.id
      WHERE p.id = ?
    `, productId) as any[];
    
    // Transform the result
    const categories = product.filter((row: any) => row.category_id).map((row: any) => ({
      category: {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug
      }
    }));
    
    const result = {
      ...product[0],
      productCategories: categories
    };

    return NextResponse.json({
      product: result
    });

  } catch (error) {
    console.error('Update product categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}