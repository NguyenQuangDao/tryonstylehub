import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sample images for fashion blog posts
const blogSampleImages = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=600&fit=crop'
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
  
  const blogPosts = await prisma.blogPost.findMany()
  console.log(`Found ${blogPosts.length} blog posts`)

  for (let i = 0; i < blogPosts.length; i++) {
    const post = blogPosts[i]
    const imageUrl = blogSampleImages[i % blogSampleImages.length]
    
    // Create media array with the image
    const mediaArray = [{
      url: imageUrl,
      type: 'image/jpeg',
      alt: `Fashion image for ${post.title}`,
      caption: `Beautiful fashion image for blog post: ${post.title}`
    }]
    
    await prisma.blogPost.update({
      where: { id: post.id },
      data: ({
        featuredImage: imageUrl,
        media: mediaArray
      } as any)
    })
    
    console.log(`✅ Updated blog post: ${post.title}`)
  }
}

async function updateProducts() {
  console.log('Updating products with sample images...')
  
  const products = await prisma.product.findMany()
  console.log(`Found ${products.length} products`)

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const imageSet = productSampleImages[i % productSampleImages.length]
    
    // Create images array
    const imagesArray = imageSet.map((url, index) => ({
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
    
    console.log(`✅ Updated product: ${product.title} with ${imagesArray.length} images`)
  }
}

async function main() {
  try {
    console.log('🚀 Starting image update process...')
    await updateBlogPosts()
    await updateProducts()
    console.log('✅ All images updated successfully!')
  } catch (error) {
    console.error('❌ Error updating images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
