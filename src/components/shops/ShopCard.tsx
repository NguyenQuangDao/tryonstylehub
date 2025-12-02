import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Package, Star } from 'lucide-react'

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

  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="relative h-20 bg-muted overflow-hidden rounded-t-lg">
        {shop.bannerUrl ? (
          <Image src={shop.bannerUrl} alt={shop.name} fill className="object-cover" />
        ) : null}
      </div>

      <div className="-mt-6 ml-4">
        <Avatar className="size-12 rounded-full border-2 border-background">
          {shop.logoUrl ? (
            <AvatarImage src={shop.logoUrl} alt={shop.name} />
          ) : null}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </div>

      <div className="p-4 pt-2">
        <div className="text-base font-bold">{shop.name}</div>
        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {shop.description || 'No description'}
        </div>

        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3" />
            {rating.toFixed(1)} Star
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package className="size-3" />
            {products} Products
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <Button asChild variant="secondary" className="w-full h-8">
          <Link href={`/shops/${shop.slug}`}>Visit Store</Link>
        </Button>
      </div>
    </div>
  )
}

