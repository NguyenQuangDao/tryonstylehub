"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function FollowButton({ slug }: { slug: string }) {
  const [followed, setFollowed] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("followedShops")
      const arr = stored ? (JSON.parse(stored) as string[]) : []
      setFollowed(arr.includes(slug))
    } catch {}
  }, [slug])

  const toggle = () => {
    try {
      const stored = localStorage.getItem("followedShops")
      const arr = stored ? (JSON.parse(stored) as string[]) : []
      const next = followed ? arr.filter((x) => x !== slug) : [...arr, slug]
      localStorage.setItem("followedShops", JSON.stringify(next))
      setFollowed(!followed)
    } catch {}
  }

  return (
    <Button onClick={toggle} variant={followed ? "default" : "outline"} className="h-8">
      {followed ? "Following" : "Follow"}
    </Button>
  )
}

