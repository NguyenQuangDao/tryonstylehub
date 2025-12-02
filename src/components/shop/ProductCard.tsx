"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ProductCardProps {
  id: number | string
  title: string
  category: string
  price: number
  imageUrl?: string
  className?: string
  onAddToCart?: (id: number | string) => void
}

export function ProductCard({ id, title, category, price, imageUrl, className, onAddToCart }: ProductCardProps) {
  return (
    <Card className={cn("overflow-hidden border bg-card", className)}>
      <div className={cn("bg-muted", imageUrl ? "" : "flex items-center justify-center") + " aspect-[3/4] relative"}>
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill sizes="(max-width: 1024px) 25vw, 20vw" className="object-cover" />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>

      <CardContent className="p-3">
        <div className="text-xs text-muted-foreground mb-1">{category}</div>
        <div className="text-sm font-medium leading-tight line-clamp-2">{title}</div>
        <div className="mt-1 text-sm font-bold">${price.toFixed(2)}</div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full mt-2"
          onClick={() => onAddToCart?.(id)}
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  )
}

