"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder-image"
import { Edit, Eye, Package, Trash2 } from "lucide-react"
import NextImage from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart as RBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

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

type SellerStats = {
  currency: string
  totalRevenue: number
  totalOrders: number
  inStock: number
  rating: number
  monthlyRevenue: Array<{ month: string; revenue: number }>
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
                    <TableCell>{formatCurrency(p.price ?? 0, "USD")}</TableCell>
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

function OrdersTab() {
  const rows = useMemo(
    () => [
      { id: "ORD-1001", customer: "Nguyen Van A", total: 125.5, status: "Đang xử lý", date: "2025-11-22" },
      { id: "ORD-1002", customer: "Tran Thi B", total: 89.99, status: "Đã giao", date: "2025-11-20" },
    ],
    []
  )
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Đơn hàng</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Tổng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.id}</TableCell>
                  <TableCell>{r.customer}</TableCell>
                  <TableCell>{formatCurrency(r.total, "USD")}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{r.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function AnalyticsTab() {
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/seller/dashboard/stats")
        const data = await res.json()
        if (res.ok) {
          const s: SellerStats = {
            currency: "USD",
            totalRevenue: data.totalRevenue ?? 0,
            totalOrders: data.totalOrders ?? 0,
            inStock: data.inStock ?? 0,
            rating: data.rating ?? 4.5,
            monthlyRevenue: data.monthlyRevenue ?? [],
          }
          setStats(s)
        }
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Phân tích</h2>
      {loading ? (
        <div className="py-8 text-center">Đang tải...</div>
      ) : stats ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Doanh thu</div>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue, stats.currency)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Đơn hàng</div>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Tồn kho</div>
                <div className="text-2xl font-bold">{stats.inStock}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Đánh giá</div>
                <div className="text-2xl font-bold">{stats.rating.toFixed(1)}</div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Doanh thu theo tháng</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RBarChart data={stats.monthlyRevenue}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </RBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="py-8 text-center">Không có dữ liệu</div>
      )}
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Cài đặt cửa hàng</h2>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Tên shop</label>
              <input className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Tên shop" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Slug</label>
              <input className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="slug" />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Mô tả</label>
            <textarea className="mt-1 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Mô tả shop" />
          </div>
          <div className="flex justify-end">
            <Button disabled>Lưu cài đặt</Button>
          </div>
          <div className="text-xs text-muted-foreground">API cập nhật đang được triển khai.</div>
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
          <TabsTrigger value="products">Sản phẩm</TabsTrigger>
          <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
