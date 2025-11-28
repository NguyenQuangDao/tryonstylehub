'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingBag, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: number
  name: string
  type: string
  price: number
  imageUrl: string
  styleTags: string[]
  shop: { name: string; url: string }
}

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<number[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('wishlist')
    if (stored) {
      try { setWishlistIds(JSON.parse(stored)) } catch {}
    }
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

  const wished = products.filter((p) => wishlistIds.includes(p.id))

  const removeFromWishlist = (id: number) => {
    const next = wishlistIds.filter((x) => x !== id)
    setWishlistIds(next)
    localStorage.setItem('wishlist', JSON.stringify(next))
  }

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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Wishlist của bạn</h1>
            <p className="text-sm text-gray-600">Sản phẩm đã lưu để xem lại</p>
          </div>
        </div>
      </div>

      {wished.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Chưa có sản phẩm nào trong wishlist</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wished.map((product) => (
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
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Mua ngay
                  </a>
                </div>
                <div className="pt-2">
                  <Button variant="outline" onClick={() => removeFromWishlist(product.id)}>Bỏ khỏi wishlist</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

