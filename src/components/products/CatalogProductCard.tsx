"use client"

import { PLACEHOLDER_IMAGE } from "@/lib/placeholder-image"
import { cn } from "@/lib/utils"
import { formatVND } from "@/utils/currency"
import Image from "next/image"
import Link from "next/link"

export interface CatalogProductCardProps {
  id: number | string
  title: string
  brand?: string
  category?: string
  price?: number
  imageUrl?: string
  className?: string
  onQuickView?: (id: number | string) => void
  onAdd?: (id: number | string) => void
}

export function CatalogProductCard(props: CatalogProductCardProps) {
  const { title, brand, category, price, imageUrl, className } = props
  // Function to determine category for virtual try-on
  const getCategoryForTryOn = (cat: string = '') => {
    const t = cat.toLowerCase()
    if (t.includes('dress') || t.includes('đầm')) return 'dress'
    if (t.includes('coat') || t.includes('jacket') || t.includes('outer')) return 'outerwear'
    if (t.includes('pant') || t.includes('quần') || t.includes('skirt') || t.includes('váy') || t.includes('bottom')) return 'bottoms'
    if (t.includes('accessor') || t.includes('phụ kiện')) return 'accessories'
    return 'tops'
  }

  return (
    <Link 
      href={`/?garmentImage=${encodeURIComponent(imageUrl || '')}&category=${getCategoryForTryOn(category || '')}`}
      className={cn("group block border border-border rounded-lg bg-card overflow-hidden hover:border-primary/50 transition-colors", className)}
    >
      <div className={cn("bg-muted", imageUrl ? "" : "flex items-center justify-center") + " aspect-square relative"}>
        <Image
          src={imageUrl || PLACEHOLDER_IMAGE}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
        />
      </div>

      <div className="p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {brand || category || ""}
        </div>
        <div className="text-sm font-medium leading-tight line-clamp-1 mt-1">{title}</div>
        <div className="text-sm font-medium leading-tight line-clamp-1 mt-1">{formatVND(price ?? 0)}</div>
      </div>
    </Link>
  )
}
