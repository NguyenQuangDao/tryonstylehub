"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Coins, Home, LineChart, LogOut, Newspaper, ShoppingCart, Store, UploadCloud, User, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const items = [
  { href: "/dashboard", label: "Bảng điều khiển", icon: Home },
  { href: "/profile", label: "Thông tin cá nhân", icon: User },
  { href: "/products", label: "Sản phẩm", icon: Box },
  { href: "/shops", label: "Cửa hàng", icon: ShoppingCart },
  { href: "/blog", label: "Blog", icon: Newspaper },
  { href: "/tokens", label: "Token", icon: Coins },
  { href: "/admin/users", label: "Các tính năng", icon: Users },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [openSellerPanel, setOpenSellerPanel] = useState(false)

  const isSellerAdmin = useMemo(() => {
    type Role = "SHOPPER" | "SELLER" | "ADMIN" | "SHOP_ADMIN"
    type UserWithRole = { role?: Role } | null
    const role = (user as UserWithRole)?.role
    return role === "SELLER" || role === "SHOP_ADMIN" || role === "ADMIN"
  }, [user])

  if (pathname === '/login' || pathname === '/register') {
    return null
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-background/80 backdrop-blur-md shadow-xl">
      <div className="flex h-full flex-col">
        <div className="px-3 py-3">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span>AIStyleHub</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href)
            return (
              <Link key={href} href={href} className="block">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-9 text-sm font-medium text-muted-foreground hover:text-foreground gap-2",
                    active && "text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              </Link>
            )
          })}
          <Sheet open={openSellerPanel} onOpenChange={setOpenSellerPanel}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start h-9 text-sm font-medium text-muted-foreground hover:text-foreground gap-2"
              >
                <Store className="h-4 w-4" />
                <span>Bảng người bán</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-lg w-full bg-background/95 backdrop-blur-xl shadow-2xl">
              <SheetHeader>
                <SheetTitle>Quản lý cửa hàng</SheetTitle>
              </SheetHeader>
              <div className="mt-3">
                <Tabs defaultValue="register">
                  <TabsList className="w-full">
                    <TabsTrigger value="register" className="flex-1">
                      Đăng ký shop
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1">
                      Đăng sản phẩm
                    </TabsTrigger>
                    {isSellerAdmin && (
                      <TabsTrigger value="manage" className="flex-1">
                        Quản lý shop
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="register" className="mt-4">
                    <RegisterShopForm onSuccess={() => setOpenSellerPanel(false)} />
                  </TabsContent>

                  <TabsContent value="upload" className="mt-4">
                    <UploadProductForm />
                  </TabsContent>

                  {isSellerAdmin && (
                    <TabsContent value="manage" className="mt-4">
                      <ShopAdminArea />
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
        <div className="mt-auto px-3 py-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar ?? ""} alt={user?.name ?? "Người dùng"} />
              <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="text-sm text-muted-foreground">
              {user?.name || user?.email || "Khách"}
            </div>
          </div>
          <div className="mt-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-9 text-sm font-medium text-muted-foreground hover:text-foreground gap-2"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}

const registerSchema = z.object({
  name: z.string().min(2, { message: "Tên shop tối thiểu 2 ký tự" }),
  address: z.string().min(5, { message: "Địa chỉ không hợp lệ" }),
  phone: z
    .string()
    .regex(/^[0-9+\-()\s]{9,16}$/i, { message: "Số điện thoại không hợp lệ" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  description: z.string().min(10, { message: "Mô tả tối thiểu 10 ký tự" }),
  logo: z.any().optional(),
})

function RegisterShopForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth()
  type RegisterFormValues = Omit<z.infer<typeof registerSchema>, "logo"> & {
    logo?: FileList
  }
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: user?.email || "",
      description: "",
      logo: undefined,
    },
    mode: "onChange",
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setError(null)
    setSubmitting(true)
    const formData = new FormData()
    formData.append("name", values.name)
    formData.append("description", `${values.description}\nĐịa chỉ: ${values.address}\nĐiện thoại: ${values.phone}\nEmail: ${values.email}`)
    const logoFile = values.logo?.[0]
    if (logoFile) {
      if (!logoFile.type.startsWith("image/")) {
        setError("Logo phải là ảnh")
        setSubmitting(false)
        return
      }
      if (logoFile.size > 5 * 1024 * 1024) {
        setError("Logo vượt quá 5MB")
        setSubmitting(false)
        return
      }
      formData.append("logo", logoFile)
    }
    try {
      const res = await fetch("/api/seller/register-shop", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Đăng ký shop thất bại")
        setSubmitting(false)
        return
      }
      onSuccess()
    } catch {
      setError("Có lỗi mạng khi gửi đăng ký")
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên shop</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên shop" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ</FormLabel>
              <FormControl>
                <Input placeholder="Địa chỉ cửa hàng" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input placeholder="0123 456 789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@domain.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả shop</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Giới thiệu ngắn gọn về cửa hàng" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <div className="text-sm text-destructive">{error}</div>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Đang gửi..." : "Gửi đăng ký"}
        </Button>
      </form>
    </Form>
  )
}

const productSchema = z.object({
  name: z.string().min(3, { message: "Tên sản phẩm tối thiểu 3 ký tự" }),
  price: z.coerce.number().positive({ message: "Giá phải > 0" }),
  description: z.string().min(10, { message: "Mô tả tối thiểu 10 ký tự" }),
  category: z.string().min(1, { message: "Chọn danh mục" }),
  images: z.any(),
})

function UploadProductForm() {
  type ProductFormValues = Omit<z.infer<typeof productSchema>, "images"> & {
    images?: FileList
  }
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", price: 0, description: "", category: "", images: undefined },
    mode: "onChange",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    setError(null)
    setSubmitting(true)
    const filesList = (values as ProductFormValues).images
    const filesArray: File[] = filesList ? Array.from(filesList) : []
    for (let i = 0; i < filesArray.length; i++) {
      const f = filesArray[i]
      if (!f.type.startsWith("image/")) {
        setError("Ảnh sản phẩm phải là định dạng hình ảnh")
        setSubmitting(false)
        return
      }
      if (f.size > 8 * 1024 * 1024) {
        setError("Mỗi ảnh tối đa 8MB")
        setSubmitting(false)
        return
      }
    }
    try {
      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          price: values.price,
          description: values.description,
          category: values.category,
          images: filesArray.map((f) => f.name),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Tạo sản phẩm thất bại")
        setSubmitting(false)
        return
      }
      setSubmitting(false)
    } catch {
      setError("Có lỗi mạng khi tạo sản phẩm")
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên sản phẩm</FormLabel>
              <FormControl>
                <Input placeholder="Áo thun..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="100000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <option value="">Chọn danh mục</option>
                    <option value="tops">Áo</option>
                    <option value="bottoms">Quần</option>
                    <option value="dress">Đầm</option>
                    <option value="accessories">Phụ kiện</option>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Mô tả chi tiết" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ảnh sản phẩm</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" multiple onChange={(e) => field.onChange(e.target.files)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <div className="text-sm text-destructive">{error}</div>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Đang tạo..." : "Đăng sản phẩm"}
        </Button>
      </form>
    </Form>
  )
}

function ShopAdminArea() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<{ id?: number; name?: string }[]>([])

  useState(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/seller/products")
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error || "Không thể tải sản phẩm")
        } else {
          const data = await res.json()
          setProducts(data.products || [])
        }
      } catch {
        setError("Lỗi mạng khi tải dữ liệu")
      } finally {
        setLoading(false)
      }
    })()
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg shadow-soft p-3 bg-card">
          <div className="flex items-center gap-2 font-medium"><UploadCloud className="h-4 w-4" /> Quản lý sản phẩm</div>
          {loading ? (
            <div className="mt-2 text-muted-foreground">Đang tải...</div>
          ) : error ? (
            <div className="mt-2 text-destructive">{error}</div>
          ) : (
            <div className="mt-2 text-muted-foreground">{products.length} sản phẩm</div>
          )}
        </div>
        <div className="rounded-lg shadow-soft p-3 bg-card">
          <div className="flex items-center gap-2 font-medium"><Users className="h-4 w-4" /> Đơn hàng</div>
          <div className="mt-2 text-muted-foreground">Chưa khả dụng</div>
        </div>
        <div className="rounded-lg shadow-soft p-3 bg-card">
          <div className="flex items-center gap-2 font-medium"><LineChart className="h-4 w-4" /> Doanh thu</div>
          <div className="mt-2 text-muted-foreground">Chưa khả dụng</div>
        </div>
      </div>
    </div>
  )
}
