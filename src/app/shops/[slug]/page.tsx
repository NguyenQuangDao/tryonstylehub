import { FollowButton } from '@/components/shops/FollowButton'
import { ShopProducts } from '@/components/shops/ShopProducts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export default async function ShopDetailPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug ?? ''
  if (!slug) return notFound()
  const shop = await prisma.shop.findUnique({
    where: { slug },
  })
  if (!shop) return notFound()

  const prods = await prisma.product.findMany({
    where: { shopId: shop.id },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })
  const items = prods.map((p) => ({
    id: p.id as any,
    title: (p as any).title ?? '',
    imageUrl: Array.isArray((p as any).images)
      ? (typeof (p as any).images[0] === 'string' ? (p as any).images[0] : (p as any).images[0]?.url)
      : undefined,
    price: Number((p as any).basePrice ?? 0),
    category: p.category?.name ?? null,
  }))

  const initial = shop.name?.charAt(0)?.toUpperCase() || '?'

  return (
    <div className="text-sm">
      <div className="relative w-full h-[220px]">
        {shop.bannerUrl ? (
          <Image src={shop.bannerUrl} alt={shop.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-background/70" />
      </div>

      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 -mt-8 border-2 border-background">
              {shop.logoUrl ? <AvatarImage src={shop.logoUrl} alt={shop.name} /> : null}
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="text-xl font-semibold tracking-tight">{shop.name}</div>
              <div className="flex items-center gap-3 text-muted-foreground text-xs">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.788 1.401 8.168L12 18.896l-7.335 3.871 1.401-8.168L.132 9.211l8.2-1.193z"/></svg>
                  <span>{(shop as any).averageRating?.toFixed ? (shop as any).averageRating.toFixed(1) : ((shop as any).averageRating ?? 0)}</span>
                </div>
                <div>•</div>
                <div>{(shop as any).totalSales ?? 0} sales</div>
              </div>
            </div>
          </div>
          <FollowButton slug={shop.slug} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <Tabs defaultValue="products">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-4">
            <ShopProducts products={items} />
          </TabsContent>
          <TabsContent value="about" className="mt-4">
            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground">Store Description</div>
              <div>{shop.description || 'No description'}</div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            <div className="text-muted-foreground">No reviews yet</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
