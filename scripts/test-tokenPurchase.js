const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const row = await prisma.tokenPurchase.findFirst({
      where: { paypalOrderId: 'non-existent-id' },
    })
    console.log('Query ok, result:', row)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('Test failed:', e)
  process.exit(1)
})
