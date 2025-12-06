'use client'

import { ProductCard } from '@/components/shop/ProductCard'
import { Accordion, AccordionContent, AccordionItemRoot, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useEffect, useMemo, useState } from 'react'

type Product = {
  id: number
  name: string
  type: string
  price: number
  imageUrl: string
  styleTags: string[]
  shop: { name: string; url: string }
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')

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

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.type)))
  }, [products])

  const minPrice = useMemo(() => {
    return products.length ? Math.min(...products.map((p) => p.price)) : 0
  }, [products])

  const maxPrice = useMemo(() => {
    return products.length ? Math.max(...products.map((p) => p.price)) : 1000
  }, [products])

  useEffect(() => {
    setPriceRange([minPrice, maxPrice])
  }, [minPrice, maxPrice])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const inCategory = selectedCategories.length === 0 || selectedCategories.includes(p.type)
      const inPrice = p.price >= priceRange[0] && p.price <= priceRange[1]
      return inCategory && inPrice
    })
  }, [products, selectedCategories, priceRange])

  const sorted = useMemo(() => {
    const list = [...filtered]
    if (sortBy === 'newest') list.sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price)
    if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price)
    return list
  }, [filtered, sortBy])

  const toggleCategory = (c: string, checked: boolean) => {
    setSelectedCategories((prev) => (checked ? [...prev, c] : prev.filter((x) => x !== c)))
  }

  return (
    <div className="w-full mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Tổng số sản phẩm: {sorted.length}</p>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="price_asc">Giá: Thấp đến cao</SelectItem>
            <SelectItem value="price_desc">Giá: Cao đến thấp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-6">
        <aside className="lg:w-64 lg:sticky lg:top-4 h-fit">
          <Accordion>
            <AccordionItemRoot>
              <AccordionTrigger>Danh mục</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {categories.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selectedCategories.includes(c)}
                        onCheckedChange={(val) => toggleCategory(c, Boolean(val))}
                        className="h-4 w-4"
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItemRoot>

            <AccordionItemRoot>
              <AccordionTrigger>Khoảng giá</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Slider
                    value={priceRange}
                    min={minPrice}
                    max={maxPrice}
                    step={1}
                    onValueChange={(val) => setPriceRange([val[0], val[1]])}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>${priceRange[0].toFixed(0)}</span>
                    <span>${priceRange[1].toFixed(0)}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItemRoot>
          </Accordion>
        </aside>

        <main>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-md border bg-card">
                  <div className="aspect-[3/4] bg-muted" />
                  <div className="p-3">
                    <div className="h-4 w-2/3 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không tìm thấy sản phẩm</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sorted.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.name}
                  category={p.type}
                  price={p.price}
                  imageUrl={p.imageUrl}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
