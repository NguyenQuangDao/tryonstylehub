'use client'

import { Card } from '@/components/ui/card'
import { ArrowRight, Globe, Store } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface Product {
  id: number
  name: string
  type: string
  price: number
  imageUrl: string
  styleTags: string[]
  shop: { name: string; url: string }
}

type ShopInfo = { name: string; url: string; productCount: number }

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function ShopsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'products'>('products')

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

  const shops: ShopInfo[] = useMemo(() => {
    const map = new Map<string, ShopInfo>()
    for (const p of products) {
      const key = p.shop.name
      const existing = map.get(key)
      if (existing) existing.productCount += 1
      else map.set(key, { name: p.shop.name, url: p.shop.url, productCount: 1 })
    }
    let list = Array.from(map.values())
    if (search) list = list.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    list.sort((a, b) => (sortBy === 'name' ? a.name.localeCompare(b.name) : b.productCount - a.productCount))
    return list
  }, [products, search, sortBy])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Danh sách shop thời trang</h1>
            <p className="text-xs sm:text-sm text-gray-600">Khám phá và theo dõi các shop yêu thích</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm shop..."
            className="h-9 px-3 text-sm border rounded-lg bg-white dark:bg-gray-800"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'products')}
            className="h-9 px-3 text-sm border rounded-lg"
          >
            <option value="products">Nhiều sản phẩm</option>
            <option value="name">Tên (A→Z)</option>
          </select>
        </div>
      </div>

      {shops.length === 0 ? (
        <div className="text-center py-16">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Không tìm thấy shop phù hợp</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {shops.map((shop) => (
            <Card key={shop.name} className="p-4 space-y-3 border hover:shadow-sm transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold truncate">{shop.name}</h3>
                  <p className="text-xs text-gray-500">{shop.productCount} sản phẩm</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={shop.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-9 text-sm flex items-center justify-center gap-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
                <a
                  href={`/shops/${slugify(shop.name)}`}
                  className="h-9 text-sm px-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Xem shop
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
