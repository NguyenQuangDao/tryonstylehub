"use client"

import { ArrowRight, Shirt, Sparkles, Zap } from "lucide-react"
import Link from "next/link"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"

const features = [
  {
    icon: Shirt,
    title: "Thử đồ ảo",
    description: "Trải nghiệm thử đồ chân thực với công nghệ AI",
    href: "/generate-image"
  },
  // {
  //   icon: Users,
  //   title: "Body Parts Composer",
  //   description: "Create custom avatars with our advanced body composition tools",
  //   href: "/body-parts"
  // },
  {
    icon: Sparkles,
    title: "Gợi ý phong cách",
    description: "Nhận gợi ý thời trang cá nhân hóa theo sở thích",
    href: "/recommend"
  },
  {
    icon: Zap,
    title: "Danh mục sản phẩm",
    description: "Khám phá bộ sưu tập thời trang và phụ kiện phong phú",
    href: "/products"
  }
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-12 md:py-24 lg:py-32">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Nền tảng
                <span className="text-primary"> AIStyleHub</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground sm:text-xl">
                Thay đổi trải nghiệm thời trang với công nghệ AI hiện đại.
                Tạo, tùy chỉnh và khám phá phong cách hoàn hảo của bạn.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/generate-image">
                  Bắt đầu
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard">
                  Xem bảng điều khiển
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center space-y-8">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Tính năng mạnh mẽ
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground sm:text-lg">
                Khám phá các công cụ giúp AIStyleHub trở thành nền tảng công nghệ thời trang hàng đầu
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="mb-4">
                      {feature.description}
                    </CardDescription>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={feature.href}>
                        Tìm hiểu thêm
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="border-2">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col items-center space-y-6 text-center">
                <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                  Sẵn sàng thay đổi phong cách của bạn?
                </h3>
                <p className="text-muted-foreground sm:text-lg">
                  Tham gia cùng hàng nghìn người dùng đang trải nghiệm tương lai thời trang với AIStyleHub
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/register">
                      Bắt đầu dùng thử miễn phí
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/login">
                      Đăng nhập
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
