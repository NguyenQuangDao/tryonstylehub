import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FollowButton } from '@/components/shops/FollowButton'
import { ShopProducts } from '@/components/shops/ShopProducts'

export default async function ShopDetailPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug ?? ''
  if (!slug) return notFound()
  const shopName = slug.replace(/-/g, ' ')
  const shop = await prisma.shop.findFirst({
    where: { name: shopName },
  })
  if (!shop) return notFound()

  const prods = await prisma.product.findMany({
    where: { shopId: shop.id },
    include: { category: true },
  })
  const items = prods.map((p) => ({
    id: p.id as any,
    title: (p as any).name ?? (p as any).title ?? '',
    imageUrl: (p as any).imageUrl ?? (Array.isArray((p as any).images) ? (p as any).images[0] : undefined),
    price: typeof (p as any).price === 'number' ? (p as any).price : Number((p as any).basePrice ?? 0),
    category: (p as any).type ?? p.category?.name ?? null,
  }))

  const initial = shop.name?.charAt(0)?.toUpperCase() || '?'

  return (
    <div className="text-sm">
      <div className="relative w-full h-[200px]">
        {shop.bannerUrl ? (
          <Image src={shop.bannerUrl} alt={shop.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
      </div>

      <div className="sticky top-0 bg-background/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-20 -mt-10 border-2 border-background">
              {shop.logoUrl ? <AvatarImage src={shop.logoUrl} alt={shop.name} /> : null}
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold">{shop.name}</div>
            </div>
          </div>
          <FollowButton slug={shop.slug} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-4">
            <ShopProducts products={items} />
          </TabsContent>
          <TabsContent value="about" className="mt-4">
            <div className="space-y-2">
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
