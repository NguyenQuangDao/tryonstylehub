"use client";

export const dynamic = "force-dynamic";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SellerProductsPage() {
  const { loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading) router.replace("/dashboard/seller");
  }, [loading, router]);
  return null;
}
