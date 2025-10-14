import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample shops
  const shop1 = await prisma.shop.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Fashion Store',
      url: 'https://fashionstore.example.com',
    },
  });

  const shop2 = await prisma.shop.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Style Hub',
      url: 'https://stylehub.example.com',
    },
  });

  // Create sample products
  await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Summer Dress',
      type: 'dress',
      imageUrl: '/images/products/summer-dress.jpg',
      price: 49.99,
      styleTags: JSON.stringify(['casual', 'summer', 'beach']),
      shopId: shop1.id,
    },
  });

  await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Denim Jacket',
      type: 'jacket',
      imageUrl: '/images/products/denim-jacket.jpg',
      price: 79.99,
      styleTags: JSON.stringify(['casual', 'streetwear', 'autumn']),
      shopId: shop2.id,
    },
  });

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

