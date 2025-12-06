import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sample images for fashion blog posts
const blogSampleImages = [
  {
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    type: 'image/jpeg',
    alt: 'Fashion store interior'
  },
  {
    url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop',
    type: 'image/jpeg',
    alt: 'Fashion outfits'
  },
  {
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop',
    type: 'image/jpeg',
    alt: 'Fashion shopping'
  },
  {
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=600&fit=crop',
    type: 'image/jpeg',
    alt: 'Fashion accessories'
  },
  {
    url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=600&fit=crop',
    type: 'image/jpeg',
    alt: 'Fashion model'
  }
]

// Sample product images
const productSampleImages = [
  [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=800&fit=crop'
  ],
  [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=800&fit=crop'
  ],
  [
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=600&h=800&fit=crop'
  ],
  [
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop'
  ],
  [
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=800&fit=crop'
  ]
]

async function updateBlogPosts() {
  console.log('Updating blog posts with sample images...')
  
  const blogPosts = await prisma.blogPost.findMany({
    select: { id: true, title: true }
  })

  const postsWithoutImages = blogPosts.filter((p: any) => !p.featuredImage || p.featuredImage === '')
  console.log(`Found ${postsWithoutImages.length} blog posts without images`)

  for (let i = 0; i < postsWithoutImages.length; i++) {
    const post = postsWithoutImages[i]
    const imageIndex = i % blogSampleImages.length
    const sampleImage = blogSampleImages[imageIndex]
    
    await prisma.blogPost.update({
      where: { id: post.id },
      data: ({
        featuredImage: sampleImage.url,
        media: [{
          url: sampleImage.url,
          type: sampleImage.type,
          alt: sampleImage.alt,
          caption: `Sample image for ${post.title}`
        }]
      } as any)
    })
    
    console.log(`Updated blog post: ${post.title} with image`)
  }
}

async function updateProducts() {
  console.log('Updating products with sample images...')
  
  const products = await prisma.product.findMany()

  const productsWithoutImages = products.filter(p => !p.images || (Array.isArray(p.images) && (p.images as any[]).length === 0))
  console.log(`Found ${productsWithoutImages.length} products without images`)

  for (let i = 0; i < productsWithoutImages.length; i++) {
    const product = productsWithoutImages[i]
    const imageIndex = i % productSampleImages.length
    const sampleImages = productSampleImages[imageIndex]
    
    const imagesArray = sampleImages.map((url, index) => ({
      url: url,
      alt: `${product.title} - Image ${index + 1}`,
      type: 'image/jpeg'
    }))
    
    await prisma.product.update({
      where: { id: product.id },
      data: {
        images: imagesArray
      }
    })
    
    console.log(`Updated product: ${product.title} with ${sampleImages.length} images`)
  }
}

async function main() {
  try {
    await updateBlogPosts()
    await updateProducts()
    console.log('✅ All images updated successfully!')
  } catch (error) {
    console.error('Error updating images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
