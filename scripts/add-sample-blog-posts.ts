import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Fashion blog content samples
const blogPosts = [
  {
    title: 'Xu Hướng Thời Trang Mùa Hè 2024',
    slug: 'xu-huong-thoi-trang-mua-he-2024',
    excerpt: 'Khám phá những xu hướng thời trang hot nhất cho mùa hè năm nay',
    content: `Mùa hè 2024 đã đến với những xu hướng thời trang đầy màu sắc và sống động. 

Những gam màu nổi bật như cam san hô, xanh biển và vàng nắng đang lên ngôi. 

Chất liệu thoáng mát như linen, cotton và silk được ưu tiên hàng đầu. 

Phong cách boho chic và minimalist tiếp tục thống trị các sàn diễn thời trang.`,
    featuredImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop',
        type: 'image/jpeg',
        alt: 'Fashion store interior',
        caption: 'Không gian thời trang hiện đại'
      },
      {
        url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=800&fit=crop',
        type: 'image/jpeg',
        alt: 'Fashion outfits display',
        caption: 'Bộ sưu tập mùa hè 2024'
      }
    ],
    category: 'Thời Trang',
    tags: ['thời trang', 'mùa hè', 'xu hướng', '2024'],
    status: 'PUBLISHED',
    readingTime: 5
  },
  {
    title: 'Cách Phối Đồ Với Quần Jeans Chuẩn Style',
    slug: 'cach-phoi-do-voi-quan-jeans',
    excerpt: 'Hướng dẫn cách phối đồ với quần jeans cho mọi dáng người',
    content: `Quần jeans là món đồ không thể thiếu trong tủ đồ của mọi người. 

Với cách phối đồ khéo léo, bạn có thể biến chiếc quần jeans đơn giản thành outfit cực kỳ stylish. 

Cho người gầy: Nên chọn quần jeans ống suông, tránh quần bó sát. 

Cho người mập: Quần jeans đen hoặc tối màu sẽ giúp che khuyết điểm tốt hơn.`,
    featuredImage: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200&h=800&fit=crop',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200&h=800&fit=crop',
        type: 'image/jpeg',
        alt: 'Jeans fashion',
        caption: 'Phong cách jeans hiện đại'
      },
      {
        url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=1200&h=800&fit=crop',
        type: 'image/jpeg',
        alt: 'Denim outfit ideas',
        caption: 'Ý tưởng phối đồ với jeans'
      }
    ],
    category: 'Style Guide',
    tags: ['jeans', 'phối đồ', 'style', 'thời trang'],
    status: 'PUBLISHED',
    readingTime: 7
  },
  {
    title: 'Phụ Kiện Thời Trang Không Thể Thiếu Cho Nam Giới',
    slug: 'phu-kien-thoi-trang-cho-nam-gioi',
    excerpt: 'Những phụ kiện thời trang cơ bản mà mỗi quý ông nên có',
    content: `Phụ kiện thời trang nam giới không chỉ làm tăng giá trị outfit mà còn thể hiện cá tính và gu thẩm mỹ. 

1. Đồng hồ: Món phụ kiện quan trọng nhất, thể hiện đẳng cấp. 

2. Thắt lưng da: Nên có ít nhất 2 chiếc - một đen, một nâu. 

3. Ví da: Chọn ví da thật, màu trung tính dễ phối đồ. 

4. Kính mát: Bảo vệ mắt và tạo điểm nhấn cho khuôn mặt.`,
    featuredImage: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=1200&h=800&fit=crop',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=1200&h=800&fit=crop',
        type: 'image/jpeg',
        alt: 'Men fashion accessories',
        caption: 'Phụ kiện nam giới cơ bản'
      },
      {
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop',
        type: 'image/jpeg',
        alt: 'Men style accessories',
        caption: 'Các loại phụ kiện nam'
      }
    ],
    category: 'Phụ Kiện',
    tags: ['phụ kiện', 'nam giới', 'thời trang', 'style'],
    status: 'PUBLISHED',
    readingTime: 6
  },
  {
    title: 'Chọn Trang Phục Phù Hợp Với Màu Da',
    slug: 'chon-trang-phuc-theo-mau-da',
    excerpt: 'Hướng dẫn chọn màu sắc trang phục phù hợp với tông màu da',
    content: `Chọn đúng màu sắc trang phục giúp bạn trông rạng rỡ và nổi bật hơn. 

Da ngăm: Nên chọn màu đậm như đỏ đô, xanh navy, đen. Tránh màu pastel. 

Da trắng: Hợp với hầu hết mọi màu, đặc biệt là màu pastel và màu tươi sáng. 

Da vàng: Nên chọn màu ấm như cam, đỏ gạch, nâu. 

Da tối màu: Nên chọn màu sáng như trắng, be, xám sáng để tạo độ tương phản.`,
    featuredImage: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&h=800&fit=crop',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&h=800&fit=crop',
        type: 'image/jpeg',
        alt: 'Fashion colors for skin tone',
        caption: 'Màu sắc phù hợp với tông da'
      },
      {
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&h=800&fit=crop',
        type: 'image/jpeg',
        alt: 'Color matching fashion',
        caption: 'Cách phối màu theo làn da'
      }
    ],
    category: 'Style Guide',
    tags: ['màu da', 'trang phục', 'màu sắc', 'phong cách'],
    status: 'PUBLISHED',
    readingTime: 8
  },
  {
    title: 'Thời Trang Công Sở Cho Nữ Giới',
    slug: 'thoi-trang-cong-so-nu',
    excerpt: 'Những gợi ý trang phục công sở thanh lịch và chuyên nghiệp cho nữ giới',
    content: `Trang phục công sở nữ giới cần đảm bảo sự thanh lịch, chuyên nghiệp nhưng vẫn giữ được nét nữ tính. 

1. Áo sơ mi trắng: Item cơ bản không thể thiếu, dễ phối đồ. 

2. Quần âu hoặc chân váy bút chì: Tạo sự chuyên nghiệp và gọn gàng. 

3. Blazer: Giúp outfit trông chỉn chu và có thẩm mỹ hơn. 

4. Giày cao gót vừa phải: Nên chọn độ cao 5-7cm để thoải mái khi di chuyển.`,
    featuredImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=800&fit=crop',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=800&fit=crop',
        type: 'image/jpeg',
        alt: 'Office fashion for women',
        caption: 'Thời trang công sở nữ'
      },
      {
        url: 'https://images.unsplash.com/photo-1506629905607-d405b7a30db2?w=1200&h=800&fit=crop',
        type: 'image/jpeg',
        alt: 'Professional women outfit',
        caption: 'Trang phục công sở chuyên nghiệp'
      }
    ],
    category: 'Công Sở',
    tags: ['công sở', 'nữ giới', 'trang phục', 'chuyên nghiệp'],
    status: 'PUBLISHED',
    readingTime: 6
  }
]

async function createBlogPosts() {
  console.log('Creating sample blog posts with real images...')
  
  // Get first admin user
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!adminUser) {
    console.log('No admin user found, creating blog posts with first available user...')
  }

  const user = adminUser || await prisma.user.findFirst()

  if (!user) {
    console.log('No users found in database')
    return
  }

  for (const postData of blogPosts) {
    const existingPost = await prisma.blogPost.findFirst({
      where: { slug: postData.slug }
    })

    if (!existingPost) {
      await prisma.blogPost.create({
        data: ({
          ...postData,
          authorId: user.id,
          publishedAt: new Date(),
          likesCount: Math.floor(Math.random() * 100),
          savesCount: Math.floor(Math.random() * 50),
          viewCount: Math.floor(Math.random() * 200)
        } as any)
      })
      console.log(`✅ Created blog post: ${postData.title}`)
    } else {
      // Update existing post with images
      await prisma.blogPost.update({
        where: { id: existingPost.id },
        data: ({
          featuredImage: postData.featuredImage,
          media: postData.media
        } as any)
      })
      console.log(`✅ Updated blog post: ${postData.title}`)
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting blog posts creation...')
    await createBlogPosts()
    console.log('✅ All blog posts created/updated successfully!')
  } catch (error) {
    console.error('❌ Error creating blog posts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
