"use server"

import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { uploadFileToS3 } from "@/lib/s3"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function registerShop(formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  const payload = token ? await verifyToken(token) : null
  const userId = payload?.userId as string | undefined

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const name = String(formData.get("name") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const logo = formData.get("logo") as File | null

  const schema = z.object({
    name: z.string().min(2),
    description: z.string().min(10).optional(),
    logo: z.any()
  })

  const parsed = schema.safeParse({ name, description: description || undefined, logo })
  if (!parsed.success) {
    throw new Error("Validation failed")
  }

  let logoUrl: string | null = null
  if (logo && typeof logo.size === "number" && logo.size > 0) {
    logoUrl = await uploadFileToS3(logo, "shops/logos")
  }

  let baseSlug = slugify(name)
  if (!baseSlug) {
    baseSlug = `shop-${Date.now()}`
  }

  let slug = baseSlug
  const existing = await prisma.shop.findFirst({ where: { slug } })
  if (existing) {
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
  }

  await prisma.$transaction([
    prisma.shop.create({
      data: {
        name,
        slug,
        logoUrl: logoUrl || null,
        description: description || null,
        ownerId: userId
      }
    }),
    prisma.user.update({
      where: { id: userId },
      data: { role: "SELLER" }
    })
  ])

  revalidatePath("/dashboard/seller")
  redirect("/dashboard/seller")
}
