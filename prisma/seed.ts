import { faker } from '@faker-js/faker'
import { Prisma, PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function imageUrl(seed: number, w = 960, h = 1280, keywords = 'fashion,style,outfit') {
  return `https://loremflickr.com/${w}/${h}/${keywords}?lock=${seed}`
}

async function seedCategories() {
  const names = ['Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories']
  const created: { id: string; name: string; slug: string }[] = []
  for (const name of names) {
    const slug = slugify(name)
    const c = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug, imageUrl: imageUrl(faker.number.int(), 800, 600, 'fashion,category') },
    })
    created.push(c)
  }
  return created
}

async function seedAuthors(count = 12) {
  const authors: { id: string }[] = []
  for (let i = 0; i < count; i++) {
    const name = faker.person.fullName()
    const email = faker.internet.email().toLowerCase()
    const passwordHash = await bcrypt.hash('Password123!', 10)
    const avatarUrl = imageUrl(i + 1000, 400, 400, 'fashion,portrait')
    const user = await prisma.user.create({
      data: { email, password: passwordHash, name, avatarUrl, role: 'USER' },
    })
    authors.push(user)
  }
  return authors
}

async function seedBlogPosts(authors: { id: string }[]) {
  const categories = ['Casual', 'Formal', 'Vintage', 'Streetwear']
  for (let i = 0; i < 50; i++) {
    const author = authors[faker.number.int({ min: 0, max: authors.length - 1 })]
    const title = faker.lorem.sentence({ min: 4, max: 9 })
    const content = faker.lorem.paragraphs({ min: 3, max: 6 }, '\n\n')
    const media = [
      { url: imageUrl(i + 5000), type: 'image/jpeg', size: faker.number.int({ min: 50000, max: 3000000 }) },
    ]
    const category = categories[faker.number.int({ min: 0, max: categories.length - 1 })]
    await prisma.blogPost.create({
      data: {
        authorId: author.id,
        title,
        slug: slugify(`${title}-${i}-${faker.string.alphanumeric({ length: 6 })}`),
        content,
        media,
        category,
        tags: [faker.word.noun(), faker.word.adjective(), faker.word.noun()],
        status: 'PUBLISHED',
      },
    })
  }
}

const MATERIALS = ['Cotton', 'Silk', 'Denim', 'Linen', 'Wool', 'Polyester']

async function seedSellersAndProducts(categories: { id: string }[]) {
  const sellerCount = faker.number.int({ min: 30, max: 35 })
  for (let i = 0; i < sellerCount; i++) {
    const name = faker.company.name()
    const email = faker.internet.email().toLowerCase()
    const passwordHash = await bcrypt.hash('Password123!', 10)
    const avatarUrl = imageUrl(i + 8000, 300, 300, 'fashion,person')
    const user = await prisma.user.create({
      data: { email, password: passwordHash, name, avatarUrl, role: 'SELLER' },
    })
    const shopName = name
    const slug = slugify(`${shopName}-${i}-${faker.string.alphanumeric({ length: 4 })}`)
    const description = faker.lorem.sentences({ min: 2, max: 4 })
    const productCount = faker.number.int({ min: 20, max: 30 })
    await prisma.shop.create({
      data: {
        name: shopName,
        slug,
        logoUrl: imageUrl(i + 9000, 600, 600, 'fashion,logo'),
        description,
        status: 'ACTIVE',
        ownerId: user.id,
        products: {
          create: Array.from({ length: productCount }).map((_, idx) => {
            const mat = MATERIALS[faker.number.int({ min: 0, max: MATERIALS.length - 1 })]
            const pTitle = faker.commerce.productName()
            const pDesc = `${faker.commerce.productDescription()} Material: ${mat}.`
            const price = faker.number.float({ min: 10, max: 200, fractionDigits: 2 })
            const cat = categories[faker.number.int({ min: 0, max: categories.length - 1 })]
            const images = [imageUrl(i * 100 + idx, 1000, 1000, 'fashion,product,outfit')]
            return {
              title: pTitle,
              description: pDesc,
              images,
              sku: slugify(`${pTitle}-${i}-${idx}-${faker.string.alphanumeric({ length: 8 })}`),
              basePrice: new Prisma.Decimal(price),
              status: 'PUBLISHED',
              category: { connect: { id: cat.id } },
            }
          }),
        },
      },
    })
  }
}

async function main() {
  const cats = await seedCategories()
  const authors = await seedAuthors(12)
  await seedBlogPosts(authors)
  await seedSellersAndProducts(cats)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
