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
