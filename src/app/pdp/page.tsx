"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionItem,
  AccordionItemRoot,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { ShoppingCart, Heart, Star, Check } from "lucide-react"

export default function Page() {
  const images = [
    "https://images.pexels.com/photos/6311528/pexels-photo-6311528.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/6311602/pexels-photo-6311602.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3762069/pexels-photo-3762069.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/4066292/pexels-photo-4066292.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/6311574/pexels-photo-6311574.jpeg?auto=compress&cs=tinysrgb&w=800",
  ]

  const colors = [
    { name: "Black", value: "#111827" },
    { name: "White", value: "#F9FAFB" },
    { name: "Navy", value: "#1F2A44" },
    { name: "Olive", value: "#556B2F" },
  ]

  const sizes = [
    { label: "XS", disabled: false },
    { label: "S", disabled: false },
    { label: "M", disabled: false },
    { label: "L", disabled: false },
    { label: "XL", disabled: true },
  ]

  const [activeImage, setActiveImage] = useState(images[0])
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0].name)
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[2].label)
  const [quantity, setQuantity] = useState<number>(1)

  const rating = 4.4
  const ratingCount = 128

  const addToCart = () => {
    const selection = {
      image: activeImage,
      color: selectedColor,
      size: selectedSize,
      quantity,
    }
    // eslint-disable-next-line no-console
    console.log("Add to Cart:", selection)
  }

  const decrease = () => setQuantity((q) => Math.max(1, q - 1))
  const increase = () => setQuantity((q) => q + 1)

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="text-xs text-muted-foreground mb-4">Home / Apparel / Minimalist Tee</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        <div className="space-y-3">
          <div className="relative aspect-square md:aspect-[4/5] rounded-lg border border-border bg-muted overflow-hidden">
            <Image src={activeImage} alt="Product image" fill className="object-cover" sizes="(min-width: 768px) 40vw, 100vw" priority />
          </div>
          <div className="flex gap-3">
            {images.map((src) => (
              <button
                key={src}
                onClick={() => setActiveImage(src)}
                className={`relative size-20 overflow-hidden rounded-md border border-border ${
                  activeImage === src ? "ring-2 ring-primary" : ""
                }`}
              >
                <Image src={src} alt="Thumbnail" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Minimalist Tee</h1>
            <div className="text-xl font-semibold mt-2">$38.00</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{rating} • {ratingCount} reviews</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-medium">Select Color</div>
            <div className="flex flex-wrap gap-3">
              {colors.map((c) => {
                const selected = selectedColor === c.name
                return (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    aria-pressed={selected}
                    className={`relative size-8 rounded-full border ${selected ? "ring-2 ring-primary" : ""}`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  >
                    {selected ? (
                      <Check className="absolute inset-0 m-auto h-4 w-4 text-primary-foreground" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Select Size</div>
            <div className="grid grid-cols-5 gap-2">
              {sizes.map((s) => {
                const selected = selectedSize === s.label
                return (
                  <Button
                    key={s.label}
                    variant={selected ? "default" : "outline"}
                    className={`h-9 px-4 text-sm ${s.disabled ? "opacity-50 line-through pointer-events-none" : ""}`}
                    onClick={() => setSelectedSize(s.label)}
                    aria-disabled={s.disabled}
                  >
                    {s.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center h-10 rounded-md border border-input">
              <Button variant="outline" size="icon" className="h-10 w-10" onClick={decrease}>
                −
              </Button>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="h-10 w-16 text-center border-0 focus-visible:ring-0"
              />
              <Button variant="outline" size="icon" className="h-10 w-10" onClick={increase}>
                +
              </Button>
            </div>

            <Button onClick={addToCart} className="h-10 flex-1 font-semibold">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>

            <Button variant="outline" size="icon" className="h-10 w-10">
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          <Accordion className="pt-2">
            <AccordionItem>
              <AccordionItemRoot>
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A refined, everyday tee with clean lines and a tailored silhouette. Crafted from premium cotton for comfort and durability.
                  </p>
                </AccordionContent>
              </AccordionItemRoot>
            </AccordionItem>

            <AccordionItem>
              <AccordionItemRoot>
                <AccordionTrigger>Features</AccordionTrigger>
                <AccordionContent>
                  <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
                    <li>100% long‑staple cotton</li>
                    <li>Pre‑shrunk fabric</li>
                    <li>Minimalist, high‑density finish</li>
                    <li>Machine washable</li>
                  </ul>
                </AccordionContent>
              </AccordionItemRoot>
            </AccordionItem>

            <AccordionItem>
              <AccordionItemRoot>
                <AccordionTrigger>Shipping & Returns</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Free domestic shipping over $50. Returns accepted within 30 days in original condition.
                  </p>
                </AccordionContent>
              </AccordionItemRoot>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}

