import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/rbac';
import { NextResponse } from 'next/server';

// PATCH: Update an article
export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req as any);
    if (!admin.ok) return admin.response!;

    const body = await req.json();
    const { title, content, excerpt, category, tags, featuredImage, status, slug } = body;
    const params = await props.params;
    const { id } = params;

    // Check if article exists
    const existingArticle = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existingArticle.slug) {
        const duplicateSlug = await prisma.blogPost.findUnique({
            where: { slug }
        });
        if (duplicateSlug) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 400 }
            );
        }
    }

    const updatedArticle = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        content,
        excerpt,
        category,
        tags,
        featuredImage,
        status,
        slug
      }
    });

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Admin article update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an article
export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req as any);
    if (!admin.ok) return admin.response!;

    const params = await props.params;
    const { id } = params;

    await prisma.blogPost.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Admin article delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
