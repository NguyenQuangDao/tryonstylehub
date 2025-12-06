import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create sample users (owners)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('seed-password', salt);
  const owner1 = await prisma.user.upsert({
    where: { email: 'owner1@example.com' },
    update: {},
    create: {
      email: 'owner1@example.com',
      name: 'Seed Owner 1',
      password: hashedPassword,
      role: 'SELLER',
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: 'owner2@example.com' },
    update: {},
    create: {
      email: 'owner2@example.com',
      name: 'Seed Owner 2',
      password: hashedPassword,
      role: 'SELLER',
    },
  });

  // Create sample shops
  const shop1 = await prisma.shop.upsert({
    where: { slug: 'fashion-store' },
    update: {},
    create: {
      name: 'Fashion Store',
      slug: 'fashion-store',
      description: 'The best fashion store',
      ownerId: owner1.id,
      status: 'ACTIVE',
    },
  });

  const shop2 = await prisma.shop.upsert({
    where: { slug: 'style-hub' },
    update: {},
    create: {
      name: 'Style Hub',
      slug: 'style-hub',
      description: 'Your daily style hub',
      ownerId: owner2.id,
      status: 'ACTIVE',
    },
  });

  // Create categories
  const category1 = await prisma.category.upsert({
    where: { slug: 'dresses' },
    update: {},
    create: {
      name: 'Dresses',
      slug: 'dresses',
    },
  });

  const category2 = await prisma.category.upsert({
    where: { slug: 'jackets' },
    update: {},
    create: {
      name: 'Jackets',
      slug: 'jackets',
    },
  });

  // Create sample products
  await prisma.product.upsert({
    where: { id: 'product-1' },
    update: {},
    create: {
      id: 'product-1',
      title: 'Summer Dress',
      description: 'A beautiful summer dress',
      images: ['/images/products/summer-dress.jpg'],
      basePrice: 49.99,
      shopId: shop1.id,
      categoryId: category1.id,
      status: 'PUBLISHED',
    },
  });

  await prisma.product.upsert({
    where: { id: 'product-2' },
    update: {},
    create: {
      id: 'product-2',
      title: 'Denim Jacket',
      description: 'A cool denim jacket',
      images: ['/images/products/denim-jacket.jpg'],
      basePrice: 79.99,
      shopId: shop2.id,
      categoryId: category2.id,
      status: 'PUBLISHED',
    },
  });

  const authors = [owner1, owner2,
    await prisma.user.upsert({
      where: { email: 'author1@example.com' },
      update: {},
      create: { email: 'author1@example.com', name: 'Tác giả 1', password: hashedPassword, role: 'USER' }
    }),
    await prisma.user.upsert({
      where: { email: 'author2@example.com' },
      update: {},
      create: { email: 'author2@example.com', name: 'Tác giả 2', password: hashedPassword, role: 'USER' }
    }),
    await prisma.user.upsert({
      where: { email: 'author3@example.com' },
      update: {},
      create: { email: 'author3@example.com', name: 'Tác giả 3', password: hashedPassword, role: 'USER' }
    })
  ]

  const topicCategories = [
    { category: 'Xu hướng thời trang theo mùa', tags: ['xu hướng', 'theo mùa', 'mùa hè', 'mùa đông'] },
    { category: 'Phối đồ theo phong cách', tags: ['phối đồ', 'streetwear', 'tối giản', 'công sở'] },
    { category: 'Đánh giá sản phẩm thời trang', tags: ['đánh giá', 'chất liệu', 'độ bền', 'giá trị'] },
    { category: 'Lời khuyên về phong cách cá nhân', tags: ['phong cách', 'tự tin', 'mẹo mặc đẹp'] },
    { category: 'Tin tức thời trang quốc tế', tags: ['tin tức', 'tuần lễ thời trang', 'thương hiệu'] },
  ]

  const imagePool = [
    'https://images.pexels.com/photos/2983326/pexels-photo-2983326.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/7679721/pexels-photo-7679721.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/2447042/pexels-photo-2447042.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/7940644/pexels-photo-7940644.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/6311582/pexels-photo-6311582.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/6311613/pexels-photo-6311613.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/14591672/pexels-photo-14591672.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/6311273/pexels-photo-6311273.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/699587/pexels-photo-699587.jpeg?auto=compress&cs=tinysrgb&w=1200'
  ]

  function buildContent(topic: string) {
    const base = [
      `${topic} đang được quan tâm bởi rất nhiều tín đồ thời trang.`,
      `Chúng tôi ghi nhận sự dịch chuyển đáng chú ý trong cách chọn chất liệu và phom dáng.`,
      `Điểm nổi bật nằm ở sự cân bằng giữa tính ứng dụng và thẩm mỹ hàng ngày.`,
      `Bạn có thể bắt đầu từ việc chọn gam màu phù hợp với tông da và bối cảnh.`,
      `Những thương hiệu lớn cũng đẩy mạnh các dòng sản phẩm đa dụng, bền vững.`,
      `Khi phối đồ, hãy chú ý tỉ lệ giữa áo, quần và phụ kiện để tạo điểm nhấn.`,
      `Việc đầu tư vào vài món chủ đạo sẽ giúp tiết kiệm mà vẫn giữ được phong cách.`,
      `Ngoài ra, xu hướng cá nhân hóa khiến trải nghiệm mua sắm thú vị hơn.`,
      `Các sàn thương mại điện tử cung cấp thông tin chi tiết giúp người dùng quyết định nhanh chóng.`,
      `Cuối cùng, hãy thử nghiệm và ghi nhận phản hồi từ bạn bè để tinh chỉnh lựa chọn.`,
    ]
    const dup = base.concat(base.slice(0, 12))
    return dup.join(' ')
  }

  const postsToCreate = 50
  for (let i = 0; i < postsToCreate; i++) {
    const t = topicCategories[i % topicCategories.length]
    const author = authors[i % authors.length]
    const title = `${t.category}: #${i + 1}`
    const media = [
      { url: imagePool[i % imagePool.length], type: 'image/jpeg' },
    ]
    await prisma.blogPost.create({
      data: {
        authorId: author.id,
        title,
        content: buildContent(t.category),
        media,
        category: t.category,
        tags: t.tags,
        status: 'PUBLISHED',
        createdAt: new Date(Date.now() - i * 86400000),
      }
    })
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
