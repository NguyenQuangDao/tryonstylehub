"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const labels: Record<string, string> = {
  dashboard: "Bảng điều khiển",
  profile: "Hồ sơ",
  products: "Sản phẩm",
  shops: "Cửa hàng",
  blog: "Blog",
  me: "Của tôi",
  tokens: "Token",
  admin: "Quản trị",
  users: "Người dùng",
  "generate-image": "Tạo ảnh",
  recommend: "Gợi ý",
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  const parts = (pathname || "/").split("/").filter(Boolean)
  const items = [
    { href: "/", label: "Trang chủ" },
    ...parts.map((seg, idx) => {
      const href = "/" + parts.slice(0, idx + 1).join("/")
      const base = seg.replace(/\[|\]/g, "")
      const label = labels[base] || base
      return { href, label }
    }),
  ]
  return (
    <nav className="text-xs text-muted-foreground">
      <ol className="flex items-center gap-2">
        {items.map((it, i) => (
          <li key={it.href} className="flex items-center gap-2">
            {i < items.length - 1 ? (
              <Link href={it.href} className="hover:text-foreground">{it.label}</Link>
            ) : (
              <span className="text-muted-foreground">{it.label}</span>
            )}
            {i < items.length - 1 && <span className="text-muted-foreground">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
