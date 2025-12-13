"use client"

import RegisterShopForm from "@/components/forms/register-shop-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder-image"
import { Edit, Eye, Package, Trash2 } from "lucide-react"
import NextImage from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  status: string
  stock: number
  images: Array<{ url: string }>
  createdAt?: string
  updatedAt?: string
}


function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value)
}

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/seller/products?page=1&limit=10")
      const data = await response.json()
      if (response.ok) {
        setProducts((data.products || []) as Product[])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return
    const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" })
    if (res.ok) {
      setProducts(p => p.filter(x => x.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sản phẩm</h2>
        <Button asChild>
          <Link href="/seller/products/new">Thêm sản phẩm</Link>
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">Đang tải...</TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">Chưa có sản phẩm</TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                        <NextImage
                          src={(p.images && p.images[0]?.url) || PLACEHOLDER_IMAGE}
                          alt={p.name || 'Product image'}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            e.currentTarget.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category || "—"}</TableCell>
                    <TableCell>{p.stock ?? 0}</TableCell>
                    <TableCell>{formatCurrency(p.price ?? 0, "VND")}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/seller/products/${p.id}/edit`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/seller/products/${p.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}



function SettingsTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/seller/shop')
        const data = await res.json()
        if (res.ok && data.shop) {
          setName(data.shop.name || '')
          setSlug(data.shop.slug || '')
          setDescription(data.shop.description || '')
          setAddress(data.shop.address || '')
          setPhone(data.shop.phone || '')
          setEmail(data.shop.email || '')
        } else {
          setError(data.error || 'Không thể tải thông tin shop')
        }
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const onSave = async () => {
    setError(null)
    setSaved(false)
    setSaving(true)
    const fd = new FormData()
    if (name) fd.append('name', name)
    if (description) fd.append('description', description)
    if (address) fd.append('address', address)
    if (phone) fd.append('phone', phone)
    if (email) fd.append('email', email)
    if (logoFile) fd.append('logo', logoFile)
    if (bannerFile) fd.append('banner', bannerFile)
    try {
      const res = await fetch('/api/seller/shop', { method: 'PATCH', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Lưu cài đặt thất bại')
      } else {
        setSaved(true)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Cài đặt cửa hàng</h2>
      <Card>
        <CardContent className="p-4 space-y-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Đang tải...</div>
          ) : error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Tên shop</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Tên shop" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Slug</label>
                  <input value={slug} disabled className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="slug" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Email liên hệ</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="email@domain.com" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Số điện thoại</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="0123 456 789" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Địa chỉ</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Địa chỉ cửa hàng" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Mô tả</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Mô tả shop" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Logo</label>
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.currentTarget.files?.[0] || null)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Banner</label>
                <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.currentTarget.files?.[0] || null)} className="mt-1" />
              </div>
              <div className="flex items-center justify-end gap-3">
                {saved && <div className="text-xs text-green-600">Đã lưu</div>}
                <Button onClick={onSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu cài đặt'}</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function Page() {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
        <Package className="h-4 w-4" />
        <span className="text-sm">Bảng người bán</span>
      </div>
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="register">Đăng ký người bán</TabsTrigger>
          <TabsTrigger value="products">Sản phẩm</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>
        <TabsContent value="register">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Đăng ký seller</h2>
            <Card>
              <CardContent className="p-4">
                <RegisterShopForm />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
