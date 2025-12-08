"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder-image"
import { formatVND } from "@/utils/currency"
import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"

type ProductItem = {
  id: string
  title: string
  imageUrl?: string | null
  price: number
  category?: string | null
}

export function ShopProducts({ products }: { products: ProductItem[] }) {
  const getCategoryForTryOn = (cat: string = "") => {
    const t = cat.toLowerCase()
    if (t.includes("dress") || t.includes("đầm")) return "dress"
    if (t.includes("coat") || t.includes("jacket") || t.includes("outer")) return "outerwear"
    if (
      t.includes("pant") ||
      t.includes("quần") ||
      t.includes("skirt") ||
      t.includes("váy") ||
      t.includes("bottom")
    )
      return "bottoms"
    if (t.includes("accessor") || t.includes("phụ kiện")) return "accessories"
    return "tops"
  }
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
          <div className="p-3 font-semibold">Danh mục</div>
          <Separator />
          <div className="p-2 space-y-1">
            {categories.length === 0 ? (
              <div className="text-muted-foreground">Không có danh mục</div>
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
          <Link
            key={p.id}
            href={`/?garmentImage=${encodeURIComponent(p.imageUrl || "")}&category=${getCategoryForTryOn(
              p.category || ""
            )}`}
            className="block"
          >
          <Card className="overflow-hidden">
            <div className="aspect-square bg-muted relative">
              <Image
                src={p.imageUrl || PLACEHOLDER_IMAGE}
                alt={p.title || "Sản phẩm"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                unoptimized
                onError={(e) => {
                  try {
                    (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE
                  } catch {}
                }}
              />
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="truncate text-sm">{p.title}</div>
              </div>
              <div className="flex items-center justify-start mt-2">
                <div className="font-bold">{formatVND(p.price)}</div>
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
