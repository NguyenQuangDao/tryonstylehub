import { prisma } from './prisma';

/**
 * Check database connection
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    // Database connection successful
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

    // Database status checked

    if (productCount === 0) {
      // Database is empty, seeding initial data...
      // This will be handled by prisma seed command
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

