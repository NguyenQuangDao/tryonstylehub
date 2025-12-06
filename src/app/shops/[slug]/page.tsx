import { FollowButton } from '@/components/shops/FollowButton'
import { ShopProducts } from '@/components/shops/ShopProducts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { prisma } from '@/lib/prisma'
import { getPresignedUrl } from '@/lib/s3'
import type { Prisma } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ShopDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
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
  const productCount = prods.length
  const categoryCount = new Set(
    prods.map((p) => (p.category?.name ? p.category.name : null)).filter(Boolean)
  ).size
  const items = await Promise.all(
    prods.map(async (p) => {
      let imageUrl: string | undefined
      const images = p.images as Prisma.JsonValue
      const arr = Array.isArray(images) ? images : []
      const first = (arr[0] ?? undefined) as unknown
      if (typeof first === 'string') {
        imageUrl = first
      } else if (first && typeof first === 'object') {
        const obj = first as { key?: string; url?: string }
        if (obj.key) {
          try {
            imageUrl = await getPresignedUrl(obj.key, 3600)
          } catch {
            imageUrl = obj.url
          }
        } else if (obj.url) {
          imageUrl = obj.url
        }
      }
      return {
        id: p.id,
        title: p.title,
        imageUrl,
        price: Number(p.basePrice ?? 0),
        category: p.category?.name ?? null,
      }
    })
  )

  const initial = shop.name?.charAt(0)?.toUpperCase() || '?'
  const statusVariant = shop.status === 'ACTIVE' ? 'default' : shop.status === 'SUSPENDED' ? 'destructive' : 'secondary'
  const joinedText = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(shop.createdAt)

  return (
    <div className="text-sm">
      <div className="relative w-full h-[260px]">
        {shop.bannerUrl ? (
          <Image src={shop.bannerUrl} alt={shop.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-background/80" />
      </div>

      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-20 -mt-10 border-2 border-background shadow-sm">
              {shop.logoUrl ? <AvatarImage src={shop.logoUrl} alt={shop.name} /> : null}
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="text-xl font-semibold tracking-tight">{shop.name}</div>
                <Badge variant={statusVariant}>{shop.status}</Badge>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground text-xs">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.788 1.401 8.168L12 18.896l-7.335 3.871 1.401-8.168L.132 9.211l8.2-1.193z"/></svg>
                  <span>{shop.averageRating.toFixed(1)}</span>
                </div>
                <div>•</div>
                <div>{shop.totalSales} lượt bán</div>
                <div>•</div>
                <div>{productCount} sản phẩm</div>
                <div>•</div>
                <div>Tham gia: {joinedText}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:block">
              <Link href="#products" style={{display: 'flex', alignItems: 'center'}}>Xem sản phẩm</Link>
            </Button>
            <FollowButton slug={shop.slug} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-base">Sản phẩm</CardTitle>
              <CardDescription>{productCount} mặt hàng</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-base">Danh mục</CardTitle>
              <CardDescription>{categoryCount} loại</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-base">Đánh giá</CardTitle>
              <CardDescription>{shop.averageRating}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-base">Doanh số</CardTitle>
              <CardDescription>{shop.totalSales}</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Separator />

        <Tabs defaultValue="products">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="products">Sản phẩm</TabsTrigger>
            <TabsTrigger value="about">Giới thiệu</TabsTrigger>
            <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-4" id="products">
            <ShopProducts products={items} />
          </TabsContent>
          <TabsContent value="about" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Giới thiệu cửa hàng</CardTitle>
                <CardDescription>Thông tin mô tả về cửa hàng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="text-muted-foreground">Mô tả</div>
                <div>{shop.description || 'Chưa có mô tả'}</div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Đánh giá</CardTitle>
                <CardDescription>Phản hồi từ khách hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">Chưa có đánh giá nào</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
