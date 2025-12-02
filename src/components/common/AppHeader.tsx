"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function AppHeader() {
  const { user } = useAuth()
  return (
    <header className={cn("sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60")}>      
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center">
          <nav className="text-xs text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-foreground">Home</Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li>
                <span className="text-muted-foreground">Dashboard</span>
              </li>
            </ol>
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {user?.role === 'SELLER' ? (
            <Button variant="default" className="h-8 px-3" asChild>
              <Link href="/dashboard/seller">Seller Panel</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
