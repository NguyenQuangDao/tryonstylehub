import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Bắt đầu seed dữ liệu mẫu...');
    
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@aistylehub.com' },
      update: {},
      create: {
        email: 'admin@aistylehub.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Quản trị viên',
        role: 'ADMIN',
        tokenBalance: 1000
      }
    });
    
    console.log('👤 Admin user created:', adminUser.email);
    
    // Create categories
    const categories = [
      { name: 'Áo', slug: 'ao' },
      { name: 'Quần', slug: 'quan' },
      { name: 'Váy đầm', slug: 'vay-dam' },
      { name: 'Áo khoác', slug: 'ao-khoac' },
      { name: 'Đồ thể thao', slug: 'do-the-thao' },
      { name: 'Đồ ngủ', slug: 'do-ngu' },
      { name: 'Đồ bầu', slug: 'do-bau' },
      { name: 'Đồ trẻ em', slug: 'do-tre-em' }
    ];
    
    const createdCategories = [];
    for (const category of categories) {
      const created = await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: {
          name: category.name,
          slug: category.slug,
          imageUrl: `https://via.placeholder.com/400x300/10B981/FFFFFF?text=${encodeURIComponent(category.name)}`
        }
      });
      createdCategories.push(created);
    }
    
    console.log('📂 Categories created:', createdCategories.length);
    
    // Create stores with basic data
    const storeNames = [
      "Thời Trang Cao Cấp Việt Nam",
      "Thời Trang Trẻ Em Happy Kids", 
      "Thời Trang Thể Thao Active Life",
      "Thời Trang Công Sở Elegance",
      "Thời Trang Dã Ngoại Adventure",
      "Thời Trang Nam Nữ UniStyle",
      "Thời Trang Vintage Classic",
      "Thời Trang Handmade Artisan",
      "Thời Trang Luxury Premium",
      "Thời Trang Streetwear Urban",
      "Thời Trang Big Size Comfort",
      "Thời Trang Organic Green",
      "Thời Trang Wedding Bridal",
      "Thời Trang Denim Expert",
      "Thời Trang Linen Natural",
      "Thời Trang Silk Elegance",
      "Thời Trang Cotton Comfort",
      "Thời Trang Leather Premium",
      "Thời Trang Swimwear Beach",
      "Thời Trang Maternity Care",
      "Thời Trang Kids Fun",
      "Thời Trang Teen Trendy",
      "Thời Trang Adult Mature",
      "Thời Trang Elder Gentle",
      "Thời Trang Sport Pro",
      "Thời Trang Yoga Zen",
      "Thời Trang Gym Power",
      "Thời Trang Dance Move",
      "Thời Trang Outdoor Explore",
      "Thời Trang Travel Companion"
    ];
    
    const createdStores = [];
    
    for (let i = 0; i < storeNames.length; i++) {
      const storeName = storeNames[i];
      const slug = storeName.toLowerCase()
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Create seller user for each store
      const sellerUser = await prisma.user.upsert({
        where: { email: `seller${i + 1}@aistylehub.com` },
        update: {},
        create: {
          email: `seller${i + 1}@aistylehub.com`,
          password: await bcrypt.hash('seller123', 10),
          name: `Chủ shop ${storeName}`,
          role: 'SELLER',
          tokenBalance: Math.floor(Math.random() * 500) + 100
        }
      });
      
      // Create store
      const store = await prisma.shop.create({
        data: {
          name: storeName,
          slug: slug,
          description: `Cửa hàng ${storeName} chuyên cung cấp các sản phẩm thời trang chất lượng cao với đa dạng mẫu mã và giá cả hợp lý. Chúng tôi cam kết mang đến cho khách hàng những sản phẩm tốt nhất với dịch vụ chuyên nghiệp.`,
          email: `info@${slug}.vn`,
          website: `https://${slug}.vn`,
          logoUrl: `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(storeName.substring(0, 10))}`,
          bannerUrl: `https://via.placeholder.com/1200x400/10B981/FFFFFF?text=${encodeURIComponent(storeName)}`,
          openingHours: {
            monday: "08:00-21:00",
            tuesday: "08:00-21:00", 
            wednesday: "08:00-21:00",
            thursday: "08:00-21:00",
            friday: "08:00-21:00",
            saturday: "09:00-22:00",
            sunday: "09:00-20:00"
          },
          policies: {
            returnPolicy: "Đổi trả trong vòng 7 ngày nếu sản phẩm còn nguyên tem mác",
            shippingPolicy: "Miễn phí vận chuyển cho đơn hàng trên 500.000đ",
            warrantyPolicy: "Bảo hành 1 năm cho tất cả sản phẩm",
            privacyPolicy: "Cam kết bảo mật thông tin khách hàng tuyệt đối"
          },
          socialMedia: {
            facebook: `https://facebook.com/${slug}`,
            instagram: `https://instagram.com/${slug}`
          },
          status: 'ACTIVE',
          averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          totalSales: Math.floor(Math.random() * 1000),
          featured: Math.random() > 0.8,
          ownerId: sellerUser.id
        } as any
      });
      
      createdStores.push(store);
      console.log(`✅ Store ${i + 1}/${storeNames.length}: ${store.name}`);
      
      // Create products for this store
      const productCount = Math.floor(Math.random() * 6) + 25; // 25-30 products
      const category = createdCategories[Math.floor(Math.random() * createdCategories.length)];
      
      for (let j = 0; j < productCount; j++) {
        const productTypes = ["Áo thun", "Quần jeans", "Váy đầm", "Áo sơ mi", "Quần âu", "Áo khoác"];
        const materials = ["Cotton 100%", "Linen", "Silk", "Polyester", "Denim"];
        const colors = ["Trắng", "Đen", "Xám", "Xanh Navy", "Đỏ", "Hồng", "Vàng"];
        
        const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
        const material = materials[Math.floor(Math.random() * materials.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        await prisma.product.create({
          data: {
            title: `${productType} ${material} màu ${color} - Mẫu ${j + 1}`,
            description: `${productType} cao cấp được làm từ chất liệu ${material} mềm mại, thoáng mát. Màu ${color} dễ dàng phối đồ. Sản phẩm được may tỉ mỉ với đường chỉ chắc chắn, đảm bảo độ bền cao theo thời gian.`,
            shortDescription: `${productType} chất liệu ${material} màu ${color}`,
            basePrice: Math.floor(Math.random() * 500000) + 150000,
            salePrice: Math.random() > 0.7 ? Math.floor((Math.random() * 500000 + 150000) * 0.85) : null,
            sku: `SKU-${store.id.substring(0, 8).toUpperCase()}-${String(j + 1).padStart(4, '0')}`,
            stockQuantity: Math.floor(Math.random() * 100) + 10,
            weight: Math.floor(Math.random() * 500) + 100,
            dimensions: {
              length: Math.floor(Math.random() * 50) + 20,
              width: Math.floor(Math.random() * 40) + 15,
              height: Math.floor(Math.random() * 20) + 5
            },
            material: material,
            brand: "FashionViet",
            tags: [productType.toLowerCase(), material.toLowerCase(), color.toLowerCase(), "thời trang"],
            specifications: {
              "Xuất xứ": "Việt Nam",
              "Thương hiệu": "FashionViet",
              "Chất liệu": material,
              "Màu sắc": color
            },
            features: [
              "Thiết kế thời trang",
              "Chất liệu cao cấp", 
              "May tỉ mỉ",
              "Dễ dàng giặt ủi"
            ],
            shippingInfo: {
              weight: Math.floor(Math.random() * 500) + 100,
              dimensions: "30x25x5cm",
              shippingMethod: ["Giao hàng nhanh", "Giao hàng tiêu chuẩn"]
            },
            warranty: "Bảo hành 3 tháng cho các lỗi may mặc",
            returnPolicy: "Đổi trả trong 7 ngày nếu sản phẩm còn nguyên tem mác",
            isFeatured: Math.random() > 0.8,
            isNew: Math.random() > 0.6,
            shopId: store.id,
            productCategories: {
              create: {
                categoryId: category.id
              }
            },
            images: [
              {
                url: `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(productType)}+${encodeURIComponent(color)}+1`,
                alt: `${productType} màu ${color} - Ảnh 1`,
                isPrimary: true
              },
              {
                url: `https://via.placeholder.com/800x600/10B981/FFFFFF?text=${encodeURIComponent(productType)}+${encodeURIComponent(color)}+2`,
                alt: `${productType} màu ${color} - Ảnh 2`,
                isPrimary: false
              },
              {
                url: `https://via.placeholder.com/800x600/F59E0B/FFFFFF?text=${encodeURIComponent(productType)}+${encodeURIComponent(color)}+3`,
                alt: `${productType} màu ${color} - Ảnh 3`,
                isPrimary: false
              }
            ]
          } as any
        });
      }
      
      console.log(`   📦 Created ${productCount} products`);
    }
    
    // Create blog posts
    console.log('📝 Creating blog posts...');
    
    const blogTopics = [
      { title: "Xu hướng thời trang mùa hè 2024", category: "Xu hướng" },
      { title: "Cách phối đồ công sở thanh lịch", category: "Phong cách" },
      { title: "Chăm sóc quần áo đúng cách", category: "Chăm sóc" },
      { title: "Thời trang bền vững và trách nhiệm", category: "Bền vững" },
      { title: "Phụ kiện thời trang nam nữ không thể thiếu", category: "Phụ kiện" },
      { title: "Mẹo chọn size quần áo phù hợp", category: "Mẹo vặt" },
      { title: "Thời trang cho người mới bắt đầu", category: "Hướng dẫn" },
      { title: "Cách bảo quản quần áo mùa mưa", category: "Chăm sóc" },
      { title: "Phong cách thời trang Hàn Quốc", category: "Phong cách" },
      { title: "Thời trang cho người gầy", category: "Tư vấn" },
      { title: "Thời trang cho người mập", category: "Tư vấn" },
      { title: "Cách phối màu quần áo", category: "Mẹo vặt" },
      { title: "Thời trang cho tuổi teen", category: "Độ tuổi" },
      { title: "Thời trang cho người trung niên", category: "Độ tuổi" },
      { title: "Thời trang cho người cao tuổi", category: "Độ tuổi" },
      { title: "Thời trang đi biển", category: "Dịp đặc biệt" },
      { title: "Thời trang đi dự tiệc", category: "Dịp đặc biệt" },
      { title: "Thời trang đi làm", category: "Công sở" },
      { title: "Thời trang đi học", category: "Học sinh" },
      { title: "Thời trang đi chơi", category: "Giải trí" },
      { title: "Thời trang thu đông", category: "Mùa" },
      { title: "Thời trang xuân hè", category: "Mùa" },
      { title: "Thời trang cho ngày lễ", category: "Lễ Tết" },
      { title: "Thời trang cho ngày Tết", category: "Lễ Tết" },
      { title: "Thời trang cho ngày Valentine", category: "Lễ Tết" }
    ];
    
    for (let i = 0; i < blogTopics.length; i++) {
      const topic = blogTopics[i];
      const title = `${topic.title} - Bài ${i + 1}`;
      
      await prisma.blogPost.create({
        data: {
          title: title,
          slug: title.toLowerCase()
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim(),
          excerpt: "Khám phá những bí quyết thời trang mới nhất và cách phối đồ độc đáo cho mọi dịp.",
          content: `Bài viết về ${topic.title} này sẽ chia sẻ với bạn đọc những thông tin hữu ích và thú vị.

## Giới thiệu

Trong thế giới thời trang luôn thay đổi không ngừng, việc cập nhật xu hướng và phong cách mới là điều rất quan trọng. Bài viết này sẽ giúp bạn hiểu rõ hơn về ${topic.title.toLowerCase()}.

## Nội dung chính

### 1. Xu hướng hiện tại

Hiện nay, ${topic.title.toLowerCase()} đang trở thành tâm điểm chú ý của giới mộ điệu thời trang. Nhiều nhà thiết kế đã sáng tạo ra những mẫu mã độc đáo, phù hợp với nhu cầu đa dạng của người tiêu dùng.

### 2. Cách áp dụng vào cuộc sống

Việc áp dụng ${topic.title.toLowerCase()} vào phong cách cá nhân cần có sự tinh tế và hiểu biết nhất định. Bạn nên lựa chọn những item phù hợp với vóc dáng và màu da, kết hợp hài hòa giữa các yếu tố thời trang.

## Kết luận

${topic.title} là một phần quan trọng trong văn hóa thời trang hiện đại. Hy vọng bài viết này đã mang đến cho bạn những thông tin bổ ích.`,
          featuredImage: `https://via.placeholder.com/1200x600/10B981/FFFFFF?text=${encodeURIComponent(topic.title)}`,
          media: [
            {
              url: `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(topic.title)}+1`,
              alt: `Hình ảnh minh họa 1`,
              caption: `Mô tả cho hình ảnh 1`
            },
            {
              url: `https://via.placeholder.com/800x600/10B981/FFFFFF?text=${encodeURIComponent(topic.title)}+2`,
              alt: `Hình ảnh minh họa 2`, 
              caption: `Mô tả cho hình ảnh 2`
            },
            {
              url: `https://via.placeholder.com/800x600/F59E0B/FFFFFF?text=${encodeURIComponent(topic.title)}+3`,
              alt: `Hình ảnh minh họa 3`,
              caption: `Mô tả cho hình ảnh 3`
            }
          ],
          category: topic.category,
          tags: topic.title.toLowerCase().split(' '),
          isFeatured: Math.random() > 0.7,
          readingTime: Math.floor(Math.random() * 10) + 5,
          seoTitle: `${topic.title} | Thời trang chất lượng`,
          seoDescription: "Khám phá những bí quyết thời trang mới nhất và cách phối đồ độc đáo cho mọi dịp.",
          seoKeywords: topic.title.toLowerCase(),
          status: 'PUBLISHED',
          publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        } as any
      });
    }
    
    console.log('✅ Blog posts created:', blogTopics.length);
    
    // Create some regular users
    console.log('👥 Creating regular users...');
    for (let i = 0; i < 10; i++) {
      await prisma.user.upsert({
        where: { email: `user${i + 1}@aistylehub.com` },
        update: {},
        create: {
          email: `user${i + 1}@aistylehub.com`,
          password: await bcrypt.hash('user123', 10),
          name: `Người dùng ${i + 1}`,
          role: 'USER',
          tokenBalance: Math.floor(Math.random() * 200) + 50
        }
      });
    }
    
    console.log('🎉 Seed dữ liệu hoàn thành!');
    console.log(`📊 Tổng kết:`);
    console.log(`   - ${storeNames.length} cửa hàng`);
    console.log(`   - ${categories.length} danh mục`);
    console.log(`   - ${blogTopics.length} bài viết blog`);
    console.log(`   - 1 admin user`);
    console.log(`   - ${storeNames.length} seller users`);
    console.log(`   - 10 regular users`);
    console.log(`   - ${storeNames.length * 27.5} sản phẩm (trung bình)`);
    
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
