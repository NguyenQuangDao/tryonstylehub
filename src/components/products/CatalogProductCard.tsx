"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ShoppingCart } from "lucide-react"

export interface CatalogProductCardProps {
  id: number | string
  title: string
  brand?: string
  category?: string
  price: number
  imageUrl?: string
  className?: string
  onQuickView?: (id: number | string) => void
  onAdd?: (id: number | string) => void
}

export function CatalogProductCard({
  id,
  title,
  brand,
  category,
  price,
  imageUrl,
  className,
  onQuickView,
  onAdd,
}: CatalogProductCardProps) {
  return (
    <div
      className={cn(
        "group relative border border-border rounded-lg bg-card overflow-hidden hover:border-primary/50 transition-colors",
        className
      )}
    >
      <div className={cn("bg-muted", imageUrl ? "" : "flex items-center justify-center") + " aspect-square relative"}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full" />
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            className="h-8 text-xs bg-background/90 backdrop-blur"
            variant="secondary"
            onClick={() => onQuickView?.(id)}
          >
            Quick View
          </Button>
        </div>
      </div>

      <div className="p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {brand || category || ""}
        </div>
        <div className="text-sm font-medium leading-tight line-clamp-1 mt-1">{title}</div>

        <div className="flex items-end justify-between mt-2">
          <div className="text-base font-bold">${price.toFixed(2)}</div>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full"
            onClick={() => onAdd?.(id)}
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

