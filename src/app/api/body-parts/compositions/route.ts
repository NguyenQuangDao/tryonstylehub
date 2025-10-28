import { BodyPartsComposer } from '@/lib/body-parts-composer';
import { NextResponse } from 'next/server';

const composer = BodyPartsComposer.getInstance();

// GET /api/body-parts/compositions - Lấy danh sách compositions
export async function GET() {
  try {
    const compositions = composer.getAllCompositions();
    
    return NextResponse.json({
      success: true,
      data: compositions
    });
  } catch (error) {
    console.error('[Compositions API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách compositions' },
      { status: 500 }
    );
  }
}

// POST /api/body-parts/compositions - Tạo composition mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, parts, baseImage } = body;

    // Validation
    if (!name || !parts || !Array.isArray(parts)) {
      return NextResponse.json(
        { success: false, error: 'Tên và danh sách bộ phận là bắt buộc' },
        { status: 400 }
      );
    }

    const composition = composer.createComposition(
      name,
      parts,
      baseImage
    );

    // Validate composition
    const validation = composer.validateComposition(composition);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Composition không hợp lệ',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: composition,
      message: 'Tạo composition thành công'
    });
  } catch (error) {
    console.error('[Compositions API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo composition' },
      { status: 500 }
    );
  }
}

// PUT /api/body-parts/compositions - Cập nhật composition
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID composition là bắt buộc' },
        { status: 400 }
      );
    }

    const success = composer.updateComposition(id, updates);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy composition' },
        { status: 404 }
      );
    }

    const updatedComposition = composer.getComposition(id);
    
    return NextResponse.json({
      success: true,
      data: updatedComposition,
      message: 'Cập nhật composition thành công'
    });
  } catch (error) {
    console.error('[Compositions API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật composition' },
      { status: 500 }
    );
  }
}

// DELETE /api/body-parts/compositions - Xóa composition
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID composition là bắt buộc' },
        { status: 400 }
      );
    }

    const success = composer.deleteComposition(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy composition' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa composition thành công'
    });
  } catch (error) {
    console.error('[Compositions API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa composition' },
      { status: 500 }
    );
  }
}
