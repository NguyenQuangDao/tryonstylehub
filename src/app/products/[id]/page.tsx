'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ExternalLink, ImageIcon } from 'lucide-react'
import { use, useEffect, useMemo, useRef, useState } from 'react'

interface Product {
  id: number
  name: string
  type: string
  price: number
  imageUrl: string
  styleTags: string[]
  shop: { name: string; url: string }
  createdAt: string
}

export default function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const productId = Number(params.id);
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Try-on overlay state
  const [modelSrc, setModelSrc] = useState<string | null>(null)
  const [overlayScale, setOverlayScale] = useState(1)
  const [overlayOpacity, setOverlayOpacity] = useState(0.85)
  const [overlayX, setOverlayX] = useState(0)
  const [overlayY, setOverlayY] = useState(0)
  const dragRef = useRef<{ dragging: boolean; startX: number; startY: number }>({ dragging: false, startX: 0, startY: 0 })

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

  const product = useMemo(() => products.find((p) => p.id === productId), [products, productId])

  const onUploadModel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setModelSrc(String(reader.result))
    reader.readAsDataURL(file)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current.dragging = true
    dragRef.current.startX = e.clientX - overlayX
    dragRef.current.startY = e.clientY - overlayY
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return
    setOverlayX(e.clientX - dragRef.current.startX)
    setOverlayY(e.clientY - dragRef.current.startY)
  }
  const onPointerUp = () => {
    dragRef.current.dragging = false
  }

  if (loading || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image + try-on */}
        <Card className="flex-1 p-4">
          <div
            className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-xl"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {modelSrc ? (
              // User model image
              // eslint-disable-next-line @next/next/no-img-element
              <img src={modelSrc} alt="người mẫu" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <ImageIcon className="h-10 w-10" />
                <span className="ml-2">Tải ảnh người mẫu để thử đồ</span>
              </div>
            )}

            {/* Product overlay */}
            {product.imageUrl && (
              <div
                className="absolute left-0 top-0"
                style={{ transform: `translate(${overlayX}px, ${overlayY}px) scale(${overlayScale})`, opacity: overlayOpacity }}
                onPointerDown={onPointerDown}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.imageUrl} alt={product.name} className="w-56 h-auto cursor-move select-none" draggable={false} />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Tỷ lệ</label>
              <input type="range" min={0.5} max={2} step={0.01} value={overlayScale} onChange={(e) => setOverlayScale(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium">Độ mờ</label>
              <input type="range" min={0.2} max={1} step={0.01} value={overlayOpacity} onChange={(e) => setOverlayOpacity(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium">Ảnh người mẫu</label>
              <input type="file" accept="image/*" onChange={onUploadModel} className="w-full" />
            </div>
          </div>
        </Card>

        {/* Details */}
        <div className="w-full md:w-80 space-y-4">
          <Card className="p-4 space-y-3">
            <h1 className="text-xl font-bold">{product.name}</h1>
            <div className="flex items-center justify-between">
              <span className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">{product.type}</span>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">${product.price.toFixed(2)}</Badge>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm">Hình ảnh sản phẩm dùng cho thử đồ cơ bản</span>
            </div>
            <div className="flex gap-2">
              <a
                href={product.shop.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl"
              >
                <ExternalLink className="h-4 w-4" />
                Đi đến shop
              </a>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="font-semibold mb-2">Tags phong cách</h2>
            <div className="flex flex-wrap gap-2">
              {product.styleTags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
