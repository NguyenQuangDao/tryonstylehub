import { PrismaClient, Prisma } from '@prisma/client';

declare global {
    var prisma: PrismaClient | undefined;
}

// Connection pool configuration
const prismaClientOptions: Prisma.PrismaClientOptions = {
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat: 'pretty',
};

export const prisma = global.prisma || new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

// Graceful shutdown
if (typeof process !== 'undefined') {
    process.on('beforeExit', async () => {
        await prisma.$disconnect();
    });

    process.on('SIGINT', async () => {
        await prisma.$disconnect();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
}

/**
 * Helper to check if Prisma is connected
 */
export async function checkPrismaConnection(): Promise<boolean> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        console.error('Prisma connection check failed:', error);
        return false;
    }
}

/**
 * Helper to safely disconnect Prisma
 */
export async function disconnectPrisma(): Promise<void> {
    try {
        await prisma.$disconnect();
    } catch (error) {
        console.error('Error disconnecting Prisma:', error);
    }
}
