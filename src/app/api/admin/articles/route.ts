import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/rbac';
import { NextResponse } from 'next/server';

// GET: Fetch all articles
export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req as any);
    if (!admin.ok) return admin.response!;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } }, // Removed mode: 'insensitive' as it might not be supported by all DBs or Prisma versions without specific config, but usually safe for postgres. MySQL is case insensitive by default for some collations.
        { content: { contains: search } }
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [articles, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      }),
      prisma.blogPost.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Admin articles fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new article
export async function POST(req: Request) {
    try {
      const admin = await requireAdmin(req as any);
      if (!admin.ok) return admin.response!;
  
      const body = await req.json();
      const { title, content, excerpt, category, tags, featuredImage, status, slug } = body;
  
      // Basic validation
      if (!title || !content || !slug) {
        return NextResponse.json(
          { error: 'Title, content and slug are required' },
          { status: 400 }
        );
      }
      
      // Check for duplicate slug
      const existingSlug = await prisma.blogPost.findUnique({
          where: { slug }
      });

      if (existingSlug) {
          return NextResponse.json(
              { error: 'Slug already exists' },
              { status: 400 }
          );
      }

      const article = await prisma.blogPost.create({
        data: {
          title,
          content,
          excerpt,
          category,
          tags: tags || [],
          featuredImage,
          status: status || 'DRAFT',
          slug,
          media: [], // Initialize empty media array
          authorId: admin.user!.id // Assign to the admin user
        }
      });
  
      return NextResponse.json(article);
    } catch (error) {
      console.error('Admin article create error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
