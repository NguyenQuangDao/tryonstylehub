'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Globe, ShoppingBag, Store } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

interface Product {
  id: number
  name: string
  type: string
  price: number
  imageUrl: string
  styleTags: string[]
  shop: { name: string; url: string }
  createdAt: string
}

function deslugify(slug: string) {
  return slug.replace(/-/g, ' ')
}

export default function ShopDetailPage({ params }: { params: { slug: string } }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')
  const [followed, setFollowed] = useState<boolean>(false)

  const shopName = useMemo(() => deslugify(params.slug), [params.slug])

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        if (res.ok) setProducts(data.products)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  // Follow shop by slug
  useEffect(() => {
    try {
      const stored = localStorage.getItem('followedShops')
      const arr = stored ? JSON.parse(stored) as string[] : []
      setFollowed(arr.includes(params.slug))
    } catch { }
  }, [params.slug])

  const toggleFollow = () => {
    try {
      const stored = localStorage.getItem('followedShops')
      const arr = stored ? (JSON.parse(stored) as string[]) : []
      const next = followed ? arr.filter((x) => x !== params.slug) : [...arr, params.slug]
      localStorage.setItem('followedShops', JSON.stringify(next))
      setFollowed(!followed)
    } catch { }
  }

  const shopProducts = products.filter((p) => p.shop.name.toLowerCase() === shopName.toLowerCase())
  const shopUrl = shopProducts[0]?.shop.url

  const sorted = [...shopProducts].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortBy === 'price_asc') return a.price - b.price
    return b.price - a.price
  })

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{shopName}</h1>
            <p className="text-sm text-gray-600">Shop thời trang – mô tả sẽ cập nhật</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {shopUrl && (
            <a
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              Đi đến shop
            </a>
          )}
          <Button variant={followed ? 'default' : 'outline'} onClick={toggleFollow}>
            {followed ? 'Đang theo dõi' : 'Theo dõi shop'}
          </Button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'price_asc' | 'price_desc')}
            className="px-3 py-2 border rounded-xl"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng</option>
            <option value="price_desc">Giá giảm</option>
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Shop chưa có sản phẩm</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  ${product.price.toFixed(2)}
                </Badge>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">{product.type}</span>
                  <div className="flex gap-1">
                    {product.styleTags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/products/${product.id}`}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-center"
                  >
                    Xem chi tiết
                  </a>
                  <a
                    href={product.shop.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl"
                  >
                    Mua ngay
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
