import { prisma } from './prisma';

/**
 * Check database connection
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Initialize database with test data if empty
 */
export async function initializeDatabase() {
  try {
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();

    console.log(`Database status: ${userCount} users, ${productCount} products`);

    if (productCount === 0) {
      console.log('Database is empty, seeding initial data...');
      // This will be handled by prisma seed command
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

