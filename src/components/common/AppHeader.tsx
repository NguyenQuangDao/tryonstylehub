"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Breadcrumbs from "./Breadcrumbs";

export default function AppHeader() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }
  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background/80 backdrop-blur-md shadow-sm supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center gap-3">
          {pathname !== "/" && (
            <Button
              variant="outline"
              className="h-8 px-3"
              onClick={() => router.back()}
            >
              Quay lại
            </Button>
          )}
          <Breadcrumbs />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {user?.role !== "SELLER" && user?.role !== "ADMIN" && (
            <Button variant="outline" className="h-8 px-3" asChild>
              <Link href="/dashboard/seller">Đăng ký người bán</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
