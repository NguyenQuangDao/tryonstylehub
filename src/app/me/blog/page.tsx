"use client"
import { useEffect, useRef, useState } from 'react'

type MediaItem = { file: File; preview: string }

export default function MyBlogPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [media, setMedia] = useState<MediaItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const loadMine = async () => {
    const res = await fetch('/api/blog/posts?author=me&limit=50')
    const data = await res.json()
    setPosts(data.posts || [])
  }

  useEffect(() => { loadMine() }, [])

  const onDrop = (files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files)
    const next = arr.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))
    setMedia((m) => [...m, ...next])
  }

  const submit = async () => {
    if (!title.trim() || !content.trim()) return
    const fd = new FormData()
    fd.set('title', title.trim())
    fd.set('content', content.trim())
    if (category.trim()) fd.set('category', category.trim())
    if (tags.trim()) fd.set('tags', tags.trim())
    for (const m of media) fd.append('media', m.file)
    const res = await fetch('/api/blog/posts', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.success) {
      setTitle('')
      setContent('')
      setCategory('')
      setTags('')
      setMedia([])
      loadMine()
    }
  }

  const removePost = async (id: string) => {
    await fetch(`/api/blog/posts/${id}`, { method: 'DELETE' })
    loadMine()
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="rounded-xl border p-4 bg-white">
          <h2 className="font-semibold mb-4">Tạo bài viết mới</h2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề" className="w-full rounded-md border px-3 py-2 mb-3" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nội dung" className="w-full rounded-md border px-3 py-2 mb-3 h-32" />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Phân loại" className="rounded-md border px-3 py-2" />
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags, phân tách bởi dấu phẩy" className="rounded-md border px-3 py-2" />
          </div>
          <div
            className="rounded-md border border-dashed p-4 text-center cursor-pointer hover:bg-muted transition"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault() }}
            onDrop={(e) => { e.preventDefault(); onDrop(e.dataTransfer.files) }}
          >
            <div className="text-sm text-muted-foreground">Kéo thả ảnh/video vào đây hoặc bấm để chọn</div>
            <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => onDrop(e.target.files)} />
          </div>
          {media.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {media.map((m, idx) => (
                <div key={idx} className="relative">
                  {m.file.type.startsWith('video') ? (
                    <video src={m.preview} className="w-full h-28 object-cover rounded" />
                  ) : (
                    <img src={m.preview} className="w-full h-28 object-cover rounded" />
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <button onClick={submit} className="rounded-md bg-black text-white px-4 py-2 hover:opacity-90 transition">Đăng bài</button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-semibold mb-4">Bài viết của tôi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((p) => {
              const imageCover = Array.isArray(p.media) ? p.media.find((m: any) => (m.type || '').startsWith('image')) : undefined
              const fallback = !imageCover && Array.isArray(p.media) ? p.media[0] : undefined
              const isVideoFallback = fallback ? ((fallback.type || '').startsWith('video') || /\.(mp4|webm|mov|qt)$/i.test(fallback.url || '')) : false
              return (
                <div key={p.id} className="rounded-xl border overflow-hidden">
                  {imageCover?.url ? (
                    <img src={imageCover.url} className="w-full h-40 object-cover" />
                  ) : fallback?.url ? (
                    isVideoFallback ? (
                      <video src={fallback.url} className="w-full h-40 object-cover" muted playsInline preload="metadata" />
                    ) : (
                      <img src={fallback.url} className="w-full h-40 object-cover" />
                    )
                  ) : null}
                  <div className="p-3">
                    <div className="font-medium">{p.title}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <a href={`/blog/${p.id}`} className="text-xs underline">Xem</a>
                      <button onClick={() => removePost(p.id)} className="text-xs text-red-600">Xóa</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div>
        <div className="rounded-xl border p-4 bg-white">
          <div className="text-sm text-muted-foreground">Gợi ý: Duy trì phong cách minimalist, ưu tiên ảnh dọc, tiêu đề ngắn gọn, sử dụng tags để phân loại.</div>
        </div>
      </div>
    </div>
  )
}
