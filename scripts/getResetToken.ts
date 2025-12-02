import { prisma } from '../src/lib/prisma'

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: tsx scripts/getResetToken.ts <email>')
    process.exit(1)
  }
  const user = await prisma.user.findUnique({ where: { email } })
  console.log({
    id: user?.id,
    email: user?.email,
    resetPasswordToken: user?.resetPasswordToken,
    resetPasswordExpires: user?.resetPasswordExpires,
  })
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

