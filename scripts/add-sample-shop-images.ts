import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sample shop banner and logo images
const shopImages = [
  {
    bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=200&fit=crop'
  },
  {
    bannerUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=400&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&h=200&fit=crop'
  },
  {
    bannerUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&h=400&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=200&h=200&fit=crop'
  },
  {
    bannerUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&h=400&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
  },
  {
    bannerUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=400&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=200&h=200&fit=crop'
  }
]

async function updateShops() {
  console.log('Updating shops with sample images...')
  
  const shops = await prisma.shop.findMany()
  console.log(`Found ${shops.length} shops`)

  for (let i = 0; i < shops.length; i++) {
    const shop = shops[i]
    const imageIndex = i % shopImages.length
    const images = shopImages[imageIndex]
    
    await prisma.shop.update({
      where: { id: shop.id },
      data: {
        bannerUrl: images.bannerUrl,
        logoUrl: images.logoUrl
      }
    })
    
    console.log(`✅ Updated shop: ${shop.name}`)
  }
}

async function main() {
  try {
    console.log('🚀 Starting shop images update...')
    await updateShops()
    console.log('✅ All shops updated successfully!')
  } catch (error) {
    console.error('❌ Error updating shops:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()