const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.costTracking.create({
      data: {
        service: 'payment',
        operation: 'TEST_EVENT',
        cost: 0,
        details: 'manual test',
      },
    })
    const rows = await prisma.costTracking.findMany({
      where: { operation: 'TEST_EVENT' },
      take: 1,
      orderBy: { createdAt: 'desc' },
    })
    console.log('Rows:', JSON.stringify(rows))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('Test failed:', e)
  process.exit(1)
})

