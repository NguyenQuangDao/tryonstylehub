"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart } from "lucide-react"

type ProductItem = {
  id: string
  title: string
  imageUrl?: string | null
  price: number
  category?: string | null
}

export function ShopProducts({ products }: { products: ProductItem[] }) {
  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return Array.from(set).sort()
  }, [products])

  const [selected, setSelected] = useState<string[]>([])

  const toggle = (c: string) => {
    setSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  const filtered = useMemo(() => {
    if (selected.length === 0) return products
    return products.filter((p) => (p.category ? selected.includes(p.category) : false))
  }, [products, selected])

  return (
    <div className="flex gap-4 text-sm">
      <div className="w-48 shrink-0">
        <div className="border rounded-md">
          <div className="p-3 font-semibold">Categories</div>
          <Separator />
          <div className="p-2 space-y-1">
            {categories.length === 0 ? (
              <div className="text-muted-foreground">No categories</div>
            ) : (
              categories.map((c) => (
                <button
                  key={c}
                  onClick={() => toggle(c)}
                  className={`w-full text-left px-2 py-1 rounded-sm ${selected.includes(c) ? "bg-accent" : "hover:bg-accent"}`}
                >
                  {c}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 flex-1">
        {filtered.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="aspect-square bg-muted relative">
              {p.imageUrl ? (
                <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
              ) : null}
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="truncate text-sm">{p.title}</div>
                <div className="font-bold">${p.price.toFixed(2)}</div>
              </div>
              <div className="flex items-center justify-end mt-2">
                <Button size="icon" variant="secondary" className="size-8">
                  <ShoppingCart />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

