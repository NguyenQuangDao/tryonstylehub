
import { fakerVI as faker } from '@faker-js/faker';
import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function imageUrl(seed: number, w = 800, h = 800, keywords = 'fashion,style') {
  // Use Pollinations AI for consistent, high-quality, prompt-based images
  // We encode the prompt to ensure it's a valid URL
  const prompt = `fashion product photography of ${keywords}, isolated on white background, studio lighting, 4k, high quality, no human, no model, minimalist, front view, highly detailed, realistic texture`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${seed}&nologo=true`;
}

const MATERIALS = ['Cotton', 'Lụa', 'Jean', 'Linen', 'Len', 'Polyester', 'Kaki', 'Nhung', 'Voan', 'Thun lạnh'];

// Map product types to single, specific English keywords for better accuracy
const PRODUCT_TYPES: Record<string, string> = {
  'Áo thun': 't-shirt, cotton',
  'Áo sơ mi': 'dress shirt, formal',
  'Quần jean': 'blue jeans, denim',
  'Quần tây': 'trousers, formal pants',
  'Chân váy': 'skirt, elegant',
  'Đầm': 'one-piece dress, elegant',
  'Áo khoác': 'coat, winter jacket',
  'Áo blazer': 'blazer, suit jacket',
  'Quần short': 'shorts, casual',
  'Áo len': 'knitted sweater, wool',
  'Set đồ': 'clothing outfit set, flatlay',
  'Jumpsuit': 'jumpsuit, overalls'
};

const ADJECTIVES = ['Thời trang', 'Cao cấp', 'Hàn Quốc', 'Vintage', 'Mùa hè', 'Dáng rộng', 'Ôm body', 'Thanh lịch', 'Cá tính', 'Basic', 'Retro', 'Streetwear'];
const DETAILS = ['Họa tiết hoa', 'Kẻ sọc', 'Trơn màu', 'Phối ren', 'Cổ tim', 'Tay dài', 'Tay ngắn', 'Lưng cao', 'Xẻ tà', 'Cut-out'];

const SHOP_PREFIXES = ['Thời trang', 'Shop', 'Boutique', 'Tiệm may', 'Xưởng', 'Nhà thiết kế', 'Store'];
const SHOP_NAMES_VI = ['Mai Phương', 'Lan Anh', 'Tuấn Kiệt', 'Minh Châu', 'Hạnh Phúc', 'Thanh Hằng', 'Ngọc Lan', 'Việt Style', 'Phương Linh', 'Hoàng Gia', 'Thảo Nhi', 'An Nhiên', 'Mộc Miên', 'Hải Yến', 'Bảo Ngọc', 'Gia Hân', 'Khánh Vy', 'Hồng Nhung', 'Thu Thảo', 'Kim Chi', 'Mỹ Tâm', 'Đông Nhi', 'Hương Tràm', 'Bích Phương', 'Sơn Tùng'];

const SHOP_DESCRIPTIONS = [
  'Chuyên cung cấp các loại quần áo thời trang nam nữ chất lượng cao, mẫu mã đa dạng, cập nhật xu hướng mới nhất.',
  'Nơi mang đến vẻ đẹp thanh lịch và sang trọng cho bạn. Chúng tôi cam kết chất lượng sản phẩm tốt nhất.',
  'Phong cách trẻ trung, năng động. Giá cả hợp lý, phù hợp với mọi lứa tuổi. Uy tín làm nên thương hiệu.',
  'Cửa hàng thời trang thiết kế độc quyền. Chất liệu cao cấp, đường may tinh tế. Hãy đến và trải nghiệm.',
  'Thế giới thời trang của riêng bạn. Chúng tôi luôn lắng nghe và thấu hiểu phong cách của bạn.',
  'Chuyên đồ công sở, dự tiệc, dạo phố. Mẫu mới về mỗi ngày. Ship hàng toàn quốc.',
  'Đơn giản nhưng không đơn điệu. Phong cách minimalism tinh tế cho người hiện đại.',
  'Thời trang Vintage hoài cổ, nhẹ nhàng và nữ tính. Dành cho những cô nàng mộng mơ.'
];

async function main() {
  console.log('Cleaning up old seeded data...');
  
  // Clean up old shops created by this script
  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: 'store_owner_'
      }
    }
  });
  
  console.log('Start seeding 25 shops with 30 products each...');

  // Ensure some categories exist
  const categoryNames = ['Áo', 'Quần', 'Đồ mặc ngoài', 'Giày dép', 'Phụ kiện', 'Váy', 'Đầm'];
  const categories: { id: string; name: string }[] = [];
  
  for (const name of categoryNames) {
    const slug = slugify(name);
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { 
        name, 
        slug, 
        // Use shorter URL for category to avoid overflow (Prisma default String is 191)
        imageUrl: `https://loremflickr.com/800/600/clothing?lock=${faker.number.int()}`
      },
    });
    categories.push({ id: cat.id, name: cat.name });
  }

  const shopCount = 25;
  const productsPerShop = 30;
  const productTypeKeys = Object.keys(PRODUCT_TYPES);

  for (let i = 0; i < shopCount; i++) {
    // Create Seller (Owner)
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${lastName} ${firstName}`;
    const uniqueEmail = `store_owner_${i}_${Date.now()}@example.com`; 
    
    const passwordHash = await bcrypt.hash('Password123!', 10);
    // Use loremflickr for avatar to avoid length issues
    const avatarUrl = `https://loremflickr.com/400/400/portrait?lock=${i + 10000}`;

    const user = await prisma.user.create({
      data: {
        email: uniqueEmail,
        password: passwordHash,
        name,
        avatarUrl,
        role: 'SELLER',
      },
    });

    // Create Shop
    const prefix = SHOP_PREFIXES[faker.number.int({ min: 0, max: SHOP_PREFIXES.length - 1 })];
    const shopBaseName = SHOP_NAMES_VI[i % SHOP_NAMES_VI.length]; 
    const shopName = `${prefix} ${shopBaseName}`;
    
    const uniqueSuffix = faker.string.alphanumeric({ length: 4 });
    const slug = slugify(`${shopName}-${uniqueSuffix}`);
    
    const description = SHOP_DESCRIPTIONS[faker.number.int({ min: 0, max: SHOP_DESCRIPTIONS.length - 1 })];
    
    const shop = await prisma.shop.create({
      data: {
        name: shopName,
        slug,
        // Shop.logoUrl and bannerUrl are String (191 chars)
        logoUrl: `https://loremflickr.com/600/600/logo?lock=${i + 20000}`,
        bannerUrl: `https://loremflickr.com/1200/400/store?lock=${i + 30000}`,
        description,
        status: 'ACTIVE',
        ownerId: user.id,
        address: faker.location.streetAddress({ useFullAddress: true }),
        phone: faker.phone.number(),
        email: uniqueEmail,
      },
    });

    console.log(`Created shop: ${shop.name} (${i + 1}/${shopCount})`);

    // Create Products
    for (let j = 0; j < productsPerShop; j++) {
      const mat = MATERIALS[faker.number.int({ min: 0, max: MATERIALS.length - 1 })];
      const type = productTypeKeys[faker.number.int({ min: 0, max: productTypeKeys.length - 1 })];
      const keyword = PRODUCT_TYPES[type]; // Single specific keyword
      const adj = ADJECTIVES[faker.number.int({ min: 0, max: ADJECTIVES.length - 1 })];
      const detail = DETAILS[faker.number.int({ min: 0, max: DETAILS.length - 1 })];
      
      const pTitle = `${type} ${adj} ${detail}`;
      const pDesc = `Sản phẩm ${pTitle} được thiết kế tỉ mỉ, chất liệu ${mat} thoáng mát, bền đẹp. Phong cách ${adj} hiện đại, dễ dàng phối đồ. Điểm nhấn ${detail} tạo nên sự khác biệt. Phù hợp đi làm, đi chơi.`;
      
      const price = faker.number.float({ min: 150000, max: 2500000, fractionDigits: 0 }); 
      
      // Map product type to category properly
      let catName = 'Áo';
      if (type.includes('Quần')) catName = 'Quần';
      else if (type.includes('váy')) catName = 'Váy';
      else if (type.includes('Đầm')) catName = 'Đầm';
      else if (type.includes('khoác') || type.includes('blazer')) catName = 'Đồ mặc ngoài';
      else if (type.includes('Jumpsuit') || type.includes('Set')) catName = 'Đồ mặc ngoài'; // or separate
      
      // Fallback find or default
      const category = categories.find(c => c.name.includes(catName)) || categories[0];

      // Use single keyword for clearer images
      const pImages = [
        imageUrl(i * 1000 + j, 800, 800, `${keyword}, whole product`), 
        imageUrl(i * 1000 + j + 50000, 800, 800, `${keyword}, close up fabric detail`),
      ];

      const sku = slugify(`${shop.slug}-${type}-${j}-${faker.string.alphanumeric(4)}`).toUpperCase();

      await prisma.product.create({
        data: {
          title: pTitle,
          description: pDesc,
          images: pImages,
          sku,
          basePrice: new Prisma.Decimal(price),
          status: 'PUBLISHED',
          shopId: shop.id,
          stockQuantity: faker.number.int({ min: 5, max: 100 }),
          productCategories: {
            create: {
              categoryId: category.id,
            },
          },
        },
      });
    }
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
