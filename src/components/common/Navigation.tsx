"use client"

import { LogOut, Menu, User } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui';
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "./ThemeToggle";

const navigationItems = [
  // { href: "/body-parts", label: "Body Parts Composer" },
  { href: "/generate-image", label: "Tạo ảnh" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/recommend", label: "Gợi ý" },
  { href: "/dashboard", label: "Bảng điều khiển" },
]

export default function Navigation() {
  const [open, setOpen] = React.useState(false)
  const { user, logout, loading } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center px-4">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-xl">
              AIStyleHub
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="flex items-center gap-6 text-sm">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Mở menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetHeader>
              <SheetTitle>
                <Link
                  href="/"
                  className="flex items-center"
                  onClick={() => setOpen(false)}
                >
                  <span className="font-bold">AIStyleHub</span>
                </Link>
              </SheetTitle>
            </SheetHeader>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Mobile Authentication Section */}
                <div className="border-t pt-4 mt-4">
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
                      <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
                    </div>
                  ) : user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium">
                        <User className="h-4 w-4" />
                        {user.name || user.email}
                        {typeof user.tokenBalance === 'number' && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {user.tokenBalance} token
                          </span>
                        )}
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="block px-2 py-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
                      >
                        Bảng điều khiển
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="block px-2 py-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
                      >
                        Hồ sơ
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout()
                          setOpen(false)
                        }}
                        className="flex w-full items-center gap-2 px-2 py-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
                      >
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/login" onClick={() => setOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full">
                          Đăng nhập
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setOpen(false)}>
                        <Button variant="default" size="sm" className="w-full">
                          Đăng ký
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Mobile Logo */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="flex items-center md:hidden">
              <span className="font-bold">AIStyleHub</span>
            </Link>
          </div>
          
          {/* Right side actions */}
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
                <div className="h-8 w-20 animate-pulse rounded bg-muted"></div>
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.name || user.email}</span>
                    {typeof user.tokenBalance === 'number' && (
                      <span className="ml-2 hidden sm:inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {user.tokenBalance} token
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Bảng điều khiển</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tokens">Nạp token</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Hồ sơ</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" prefetch={false}>
                  <Button variant="outline" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register" prefetch={false}>
                  <Button variant="default" size="sm">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
