"use client"
import SafeImage from '@/components/SafeImage';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type MediaItem = { url: string; key?: string; type?: string }
type Post = { id: string; title: string; media: MediaItem[]; likesCount: number; savesCount: number; author: { name: string; avatarUrl?: string } }


export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchPosts = async (keyword?: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (keyword) params.set('q', keyword)
    params.set('limit', '40')
    const res = await fetch(`/api/blog/posts?${params.toString()}`)
    const data = await res.json()
    setPosts(data.posts || [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  return (
    <div className="max-w-7xl mx-auto">
      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="max-w-7xl mx-auto flex items-center gap-3 p-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm ý tưởng" className="w-full rounded-full border px-4 py-2 outline-none focus:ring-2 focus:ring-black" />
          <button onClick={() => fetchPosts(q)} className="rounded-full bg-black text-white px-5 py-2 hover:opacity-90 transition">Tìm</button>
          <Link href="/me/blog" className="rounded-full w-[120px] text-center border px-2 py-2 hover:bg-muted transition">Tạo bài viết</Link>
        </div>
      </div>
      <div className="mt-6 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
        {posts.map((p) => {
          const imageCover = Array.isArray(p.media) ? p.media.find((m) => (m.type || '').startsWith('image')) : undefined
          const fallback = !imageCover && Array.isArray(p.media) ? p.media[0] : undefined
          const isVideoFallback = fallback ? ((fallback.type || '').startsWith('video') || /\.(mp4|webm|mov|qt)$/i.test(fallback.url || '')) : false
          return (
            <Link key={p.id} href={`/blog/${p.id}`} className="mb-4 block break-inside-avoid">
              <div className="group relative overflow-hidden rounded-2xl bg-white shadow hover:shadow-lg transition">
                {imageCover?.url ? (
                  <SafeImage src={imageCover.url} alt={p.title} width={1200} height={800} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw" className="w-full h-auto object-cover transition group-hover:scale-[1.02]" />
                ) : fallback?.url ? (
                  isVideoFallback ? (
                    <video src={fallback.url} className="w-full h-auto object-cover" muted playsInline preload="metadata" />
                  ) : (
                    <SafeImage src={fallback.url} alt={p.title} width={1200} height={800} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw" className="w-full h-auto object-cover transition group-hover:scale-[1.02]" />
                  )
                ) : null}
               
                <div className="p-3">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="mt-2 flex items-center justify-between text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {p.author.avatarUrl && <SafeImage src={p.author.avatarUrl} alt={p.author.name} width={20} height={20} className="w-5 h-5 rounded-full object-cover" />}
                      <span className="text-xs">{p.author.name}</span>
                    </div>
                    <div className="text-xs">❤ {p.likesCount} • 📌 {p.savesCount}</div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      {loading && <div className="mt-6 text-center text-muted-foreground">Đang tải...</div>}
    </div>
  )
}
