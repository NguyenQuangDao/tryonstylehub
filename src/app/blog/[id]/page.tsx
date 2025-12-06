"use client"
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'

type MediaItem = { url: string; key?: string; type?: string }
type Post = { id: string; title: string; content: string; media: MediaItem[]; likesCount: number; savesCount: number; author: { name: string; avatarUrl?: string } }

export default function BlogDetailPage() {
  const params = useParams()
  const id = String(params?.id || '')
  const [post, setPost] = useState<Post | null>(null)
  const [related, setRelated] = useState<Post[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/blog/posts/${id}`)
    const data = await res.json()
    setPost(data.post || null)
    setRelated(data.related || [])
    const cRes = await fetch(`/api/blog/posts/${id}/comments`)
    const cData = await cRes.json()
    setComments(cData.comments || [])
    setLoading(false)
  }

  useEffect(() => { if (id) load() }, [id])

  const toggleLike = async () => {
    const res = await fetch(`/api/blog/posts/${id}/like`, { method: 'POST' })
    const data = await res.json()
    if (post) setPost({ ...post, likesCount: Math.max(0, post.likesCount + (data.liked ? 1 : -1)) })
  }

  const toggleSave = async () => {
    const res = await fetch(`/api/blog/posts/${id}/save`, { method: 'POST' })
    const data = await res.json()
    if (post) setPost({ ...post, savesCount: Math.max(0, post.savesCount + (data.saved ? 1 : -1)) })
  }

  const submitComment = async () => {
    if (!newComment.trim()) return
    const fd = new FormData()
    fd.set('content', newComment.trim())
    const res = await fetch(`/api/blog/posts/${id}/comments`, { method: 'POST', body: fd })
    const data = await res.json()
    if (data.success) {
      setNewComment('')
      load()
    }
  }

  if (!post) return <div className="max-w-4xl mx-auto">Không tìm thấy bài viết</div>

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8">
      <div>
        <div className="relative rounded-2xl overflow-hidden bg-white shadow">
          <div className="absolute inset-x-0 top-0 flex justify-end p-3">
            <button onClick={toggleSave} className="rounded-full bg-black text-white text-sm px-4 py-2">Lưu</button>
          </div>
          {Array.isArray(post.media) && post.media.map((m, idx) => (
            <div key={idx} className="border-b last:border-b-0">
              {(m.type || '').startsWith('video') ? (
                <video src={m.url} controls className="w-full h-auto" />
              ) : (
                <Image src={m.url} alt={post.title} width={1400} height={1000} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw" className="w-full h-auto object-cover" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl bg-white shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {post.author.avatarUrl && <Image src={post.author.avatarUrl} alt={post.author.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />}
              <div>
                <div className="text-sm font-medium">{post.author.name}</div>
                <div className="text-xs text-muted-foreground">❤ {post.likesCount} • 📌 {post.savesCount}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleLike} className="rounded-full border px-4 py-2">❤</button>
              <button onClick={() => navigator.share && navigator.share({ title: post.title, url: window.location.href })} className="rounded-full border px-4 py-2">↗</button>
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-semibold">{post.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>
        </div>
        <div className="mt-6">
          <h2 className="font-medium mb-3">Bình luận</h2>
          <div className="flex items-center gap-2 mb-4">
            <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Thêm bình luận" className="w-full rounded-full border px-4 py-2 outline-none focus:ring-2 focus:ring-black" />
            <button onClick={submitComment} className="rounded-full bg-black text-white px-5 py-2">Gửi</button>
          </div>
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="rounded-xl border p-3 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  {c.user?.avatarUrl && <Image src={c.user.avatarUrl} alt={c.user?.name || ''} width={24} height={24} className="w-6 h-6 rounded-full object-cover" />}
                  <div className="text-xs text-muted-foreground">{c.user?.name}</div>
                </div>
                <div className="text-sm">{c.content}</div>
                {Array.isArray(c.media) && c.media.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.media.map((m: any, idx: number) => (
                      <Image key={idx} src={m.url} alt="" width={96} height={96} className="w-24 h-24 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:sticky lg:top-20 h-fit">
        <h2 className="font-medium mb-3">Gợi ý cho bạn</h2>
        <div className="columns-1 sm:columns-2 lg:columns-1 gap-3 [column-fill:_balance]">
          {related.map((r) => {
            const cover = Array.isArray(r.media) ? r.media.find((m) => (m.type || '').startsWith('image')) || r.media[0] : undefined
            return (
              <a key={r.id} href={`/blog/${r.id}`} className="mb-3 block break-inside-avoid">
                <div className="group relative overflow-hidden rounded-2xl bg-white shadow hover:shadow-lg">
                  {cover?.url && <Image src={cover.url} alt="" width={600} height={800} className="w-full h-auto object-cover" />}
                  <div className="p-3">
                    <div className="text-sm font-medium truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground">❤ {r.likesCount} • 📌 {r.savesCount}</div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
        {loading && <div className="mt-4 text-muted-foreground">Đang tải...</div>}
      </div>
    </div>
  )
}
