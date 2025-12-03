"use client"

import { useEffect, useMemo, useState } from "react"
import { Accordion, AccordionContent, AccordionItemRoot, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { CatalogProductCard } from "@/components/products/CatalogProductCard"
import { Grid3x3, List, Filter } from "lucide-react"

type Product = {
  id: number
  name: string
  type: string
  price: number
  imageUrl: string
  styleTags: string[]
  shop: { name: string; url: string }
  brand?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [visibleCount, setVisibleCount] = useState(24)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/products")
        const data = await res.json()
        if (res.ok) {
          const list = Array.isArray(data?.data)
            ? data.data.map((p: any) => {
                const img = Array.isArray(p?.images) ? p.images[0] : undefined
                const imageUrl = typeof img === "string" ? img : img?.url || img?.src || img?.path
                return {
                  id: p.id,
                  name: p.title,
                  type: p?.category?.name || "",
                  price: Number(p.basePrice) || 0,
                  imageUrl,
                  styleTags: Array.isArray(p.styleTags) ? p.styleTags : [],
                  shop: { name: p?.shop?.name || "", url: "" },
                  brand: p.brand,
                } as Product
              })
            : []
          setProducts(list)
        } else {
          setProducts([])
        }
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const categories = useMemo(() => {
    return Array.from(new Set((products || []).map((p) => p.type)))
  }, [products])

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>()
    products.forEach((p) => {
      map.set(p.type, (map.get(p.type) || 0) + 1)
    })
    return map
  }, [products])

  const minPrice = useMemo(() => (products.length ? Math.min(...products.map((p) => p.price)) : 0), [products])
  const maxPrice = useMemo(() => (products.length ? Math.max(...products.map((p) => p.price)) : 1000), [products])

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
    if (sortBy === "newest") list.sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    if (sortBy === "price_asc") list.sort((a, b) => a.price - b.price)
    if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price)
    return list
  }, [filtered, sortBy])

  const visible = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount])

  const toggleCategory = (c: string, checked: boolean) => {
    setSelectedCategories((prev) => (checked ? [...prev, c] : prev.filter((x) => x !== c)))
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-muted-foreground">Trang chủ / Sản phẩm</div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="price_asc">Giá: Thấp đến cao</SelectItem>
              <SelectItem value="price_desc">Giá: Cao đến thấp</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
            aria-label="Xem dạng lưới"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
            aria-label="Xem dạng danh sách"
          >
            <List className="h-4 w-4" />
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 lg:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Bộ lọc</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <Accordion>
                  <AccordionItemRoot>
                    <AccordionTrigger className="text-sm font-semibold">Danh mục</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {categories.map((c) => (
                          <label key={c} className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedCategories.includes(c)}
                              onCheckedChange={(val) => toggleCategory(c, Boolean(val))}
                              className="h-4 w-4"
                            />
                            <span className="text-sm text-muted-foreground">{c}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{categoryCounts.get(c) || 0}</span>
                          </label>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItemRoot>
                  <AccordionItemRoot>
                    <AccordionTrigger className="text-sm font-semibold">Giá</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Slider
                          value={priceRange}
                          min={minPrice}
                          max={maxPrice}
                          step={1}
                          onValueChange={(val) => setPriceRange([val[0], val[1]])}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            className="h-8 rounded-md border bg-background px-2 text-xs"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value || 0), priceRange[1]])}
                          />
                          <input
                            type="number"
                            className="h-8 rounded-md border bg-background px-2 text-xs"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value || 0)])}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItemRoot>
                </Accordion>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-6">
        <aside className="hidden lg:block w-64 sticky top-20 h-fit">
          <Accordion>
            <AccordionItemRoot>
              <AccordionTrigger className="text-sm font-semibold">Danh mục</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {categories.map((c) => (
                    <label key={c} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedCategories.includes(c)}
                        onCheckedChange={(val) => toggleCategory(c, Boolean(val))}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-muted-foreground">{c}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{categoryCounts.get(c) || 0}</span>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItemRoot>

            <AccordionItemRoot>
              <AccordionTrigger className="text-sm font-semibold">Giá</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Slider
                    value={priceRange}
                    min={minPrice}
                    max={maxPrice}
                    step={1}
                    onValueChange={(val) => setPriceRange([val[0], val[1]])}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value || 0), priceRange[1]])}
                    />
                    <input
                      type="number"
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value || 0)])}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItemRoot>
          </Accordion>
        </aside>

        <main>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card overflow-hidden">
                  <div className="aspect-square bg-muted" />
                  <div className="p-3">
                    <div className="h-3 w-2/3 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không tìm thấy sản phẩm</p>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-4"}>
              {visible.map((p) => (
                <CatalogProductCard
                  key={p.id}
                  id={p.id}
                  title={p.name}
                  brand={p.brand}
                  category={p.type}
                  price={p.price}
                  imageUrl={p.imageUrl}
                />
              ))}
            </div>
          )}

          {sorted.length > visible.length && (
            <div className="flex justify-center mt-6">
              <Button variant="outline" className="h-9" onClick={() => setVisibleCount((c) => c + 24)}>
                Tải thêm
              </Button>
            </div>
          )}
        </main>
      </div>

      <Separator className="mt-6" />
    </div>
  )
}
