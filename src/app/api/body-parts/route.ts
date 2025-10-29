import { BodyPart, BodyPartsComposer } from '@/lib/body-parts-composer';
import { NextResponse } from 'next/server';

const composer = BodyPartsComposer.getInstance();

// GET /api/body-parts - Lấy danh sách tất cả các bộ phận cơ thể
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let bodyParts;
    if (category) {
      bodyParts = composer.getBodyPartsByCategory(category);
    } else {
      bodyParts = composer.getAllBodyParts();
    }

  return NextResponse.json({
    success: true,
    data: bodyParts,
    categories: ['hair', 'head', 'torso', 'leftArm', 'rightArm', 'legs', 'feet', 'accessories']
  });
  } catch (error) {
    console.error('[Body Parts API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách bộ phận cơ thể' },
      { status: 500 }
    );
  }
}

// POST /api/body-parts - Thêm bộ phận cơ thể mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, imagePath, position, blendMode, opacity } = body;

    // Validation
    if (!name || !category || !imagePath) {
      return NextResponse.json(
        { success: false, error: 'Tên, danh mục và đường dẫn ảnh là bắt buộc' },
        { status: 400 }
      );
    }

    const validCategories = ['hair', 'head', 'torso', 'leftArm', 'rightArm', 'legs', 'feet', 'accessories'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Danh mục không hợp lệ' },
        { status: 400 }
      );
    }

    const newPart: BodyPart = {
      id: `${category}-${Date.now()}`,
      name,
      category: category as BodyPart['category'],
      imagePath,
      position: position || { x: 0, y: 0, width: 100, height: 100 },
      blendMode: blendMode || 'normal',
      opacity: opacity || 1.0
    };

    composer.addBodyPart(newPart);

    return NextResponse.json({
      success: true,
      data: newPart,
      message: 'Thêm bộ phận cơ thể thành công'
    });
  } catch (error) {
    console.error('[Body Parts API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi thêm bộ phận cơ thể' },
      { status: 500 }
    );
  }
}
