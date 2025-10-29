"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, User, LogOut } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { ThemeToggle } from "./ThemeToggle"
import { useAuth } from "@/lib/auth-context"

const navigationItems = [
  { href: "/body-parts", label: "Body Parts Composer" },
  { href: "/generate-image", label: "Generate Image" },
  { href: "/products", label: "Products" },
  { href: "/recommend", label: "Recommend" },
  { href: "/dashboard", label: "Dashboard" },
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
              <span className="sr-only">Toggle Menu</span>
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
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="block px-2 py-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="block px-2 py-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout()
                          setOpen(false)
                        }}
                        className="flex w-full items-center gap-2 px-2 py-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/login" onClick={() => setOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setOpen(false)}>
                        <Button variant="default" size="sm" className="w-full">
                          Register
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
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" prefetch={false}>
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register" prefetch={false}>
                  <Button variant="default" size="sm">
                    Register
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
