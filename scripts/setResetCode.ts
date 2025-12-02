import { prisma } from '../src/lib/prisma'

async function main() {
  const email = process.argv[2]
  const code = process.argv[3]
  if (!email || !code) {
    console.error('Usage: tsx scripts/setResetCode.ts <email> <code>')
    process.exit(1)
  }
  const expires = new Date(Date.now() + 30 * 60 * 1000)
  await prisma.user.update({ where: { email }, data: { resetPasswordToken: code.toUpperCase(), resetPasswordExpires: expires } })
  const user = await prisma.user.findUnique({ where: { email } })
  console.log({ email: user?.email, resetPasswordToken: user?.resetPasswordToken, resetPasswordExpires: user?.resetPasswordExpires })
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

