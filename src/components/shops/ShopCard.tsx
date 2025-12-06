"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Package, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

type ShopWithCounts = {
  id: string
  slug: string
  name: string
  description?: string | null
  logoUrl?: string | null
  bannerUrl?: string | null
  averageRating?: number | null
  _count: { products: number }
}

export function ShopCard({ shop }: { shop: ShopWithCounts }) {
  const rating = typeof shop.averageRating === 'number' ? shop.averageRating : 0
  const products = shop._count?.products ?? 0
  const initial = shop.name?.charAt(0)?.toUpperCase() || '?'
  
  // State for handling image loading errors
  const [bannerError, setBannerError] = useState(false)
  const [logoError, setLogoError] = useState(false)
  
  // Fallback banner URL
  const fallbackBannerUrl = `https://via.placeholder.com/400x120/e5e7eb/6b7280?text=${encodeURIComponent(shop.name)}`

  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="relative h-20 bg-muted overflow-hidden rounded-t-lg">
        {(shop.bannerUrl && !bannerError) ? (
          <Image 
            src={shop.bannerUrl} 
            alt={shop.name} 
            fill 
            className="object-cover"
            onError={() => setBannerError(true)}
          />
        ) : (
          <Image 
            src={fallbackBannerUrl} 
            alt={shop.name} 
            fill 
            className="object-cover"
          />
        )}
      </div>

      <div className="-mt-6 ml-4">
        <Avatar className="size-12 rounded-full border-2 border-background">
          {(shop.logoUrl && !logoError) ? (
            <AvatarImage 
              src={shop.logoUrl} 
              alt={shop.name} 
              onError={() => setLogoError(true)}
            />
          ) : null}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </div>

      <div className="p-4 pt-2">
        <div className="text-base font-bold">{shop.name}</div>
        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {shop.description || 'Không có mô tả'}
        </div>

        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3" />
            {rating.toFixed(1)} sao
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package className="size-3" />
            {products} sản phẩm
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <Button asChild variant="secondary" className="w-full h-8">
          <Link href={`/shops/${shop.slug}`}>Xem cửa hàng</Link>
        </Button>
      </div>
    </div>
  )
}
