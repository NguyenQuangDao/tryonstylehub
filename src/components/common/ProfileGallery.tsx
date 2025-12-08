"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { getPlaceholderImageUrl } from "@/lib/placeholder-image";
import { cn } from "@/lib/utils";
import { Download, Grid3X3, Heart, Share2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import ZoomableImageModal from "./ZoomableImageModal";

type GalleryItem = {
  url: string;
  key: string;
  createdAt: string;
  size?: number;
  width?: number;
  height?: number;
  format?: string;
};

type Props = {
  items: GalleryItem[];
  loading?: boolean;
  onRefresh?: () => void;
};

const STYLE_TAGS = ["street", "classic", "sport", "formal", "casual", "vintage", "elegant", "retro"];
const GARMENT_TYPES = ["tops", "bottoms", "dress", "accessories", "outerwear"];

function detectTagFromText(text: string, tags: string[]): string | null {
  const lower = text.toLowerCase();
  for (const t of tags) {
    if (lower.includes(t)) return t;
  }
  return null;
}

export default function ProfileGallery({ items, loading = false, onRefresh }: Props) {
  const [activeTab, setActiveTab] = useState<"time" | "style" | "category">("time");
  const [search] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "likes_desc" | "likes_asc">("date_desc");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("galleryLikes") || "{}";
      setLikes(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting) {
        setPage((p) => p + 1);
      }
    }, { rootMargin: "200px" });
    if (sentinelRef.current) io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, []);

  const handleLike = (key: string) => {
    setLikes((prev) => {
      const next = { ...prev, [key]: (prev[key] || 0) + 1 };
      try { localStorage.setItem("galleryLikes", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleDelete = async (key: string) => {
    try {
      const res = await fetch("/api/user/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key }),
      });
      if (!res.ok) return;
      onRefresh?.();
    } catch {}
  };

  const handleShare = async (item: GalleryItem) => {
    const shareData: ShareData = { title: "Ảnh AI", text: "Xem ảnh AI của tôi", url: item.url };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(item.url);
      } catch {}
    }
  };

  const handleDownload = (item: GalleryItem) => {
    const a = document.createElement("a");
    a.href = item.url;
    a.download = item.key.split("/").pop() || "image";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  type EnhancedItem = GalleryItem & { style: string; garment: string; likeCount: number };
  const enhanced: EnhancedItem[] = useMemo(() => {
    return items.map((it) => {
      const style = detectTagFromText(it.key + it.url, STYLE_TAGS) || "khác";
      const garment = detectTagFromText(it.key + it.url, GARMENT_TYPES) || "khác";
      return { ...it, style, garment, likeCount: likes[it.key] || 0 };
    });
  }, [items, likes]);

  const filtered: EnhancedItem[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = enhanced.filter((it) => q === "" || it.url.toLowerCase().includes(q) || it.key.toLowerCase().includes(q));
    switch (activeTab) {
      case "style":
        list = list.sort((a, b) => a.style.localeCompare(b.style));
        break;
      case "category":
        list = list.sort((a, b) => a.garment.localeCompare(b.garment));
        break;
      case "time":
      default:
        break;
    }
    list = list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      if (sortBy === "date_desc") return db - da;
      if (sortBy === "date_asc") return da - db;
      if (sortBy === "likes_desc") return b.likeCount - a.likeCount;
      return a.likeCount - b.likeCount;
    });
    return list;
  }, [enhanced, search, sortBy, activeTab]);

  const paged = filtered.slice(0, page * PAGE_SIZE);

  const imageUrls = useMemo(() => paged.map(it => it.url), [paged]);

  return (
    <div>
      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as "time" | "style" | "category")}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date_desc" | "date_asc" | "likes_desc" | "likes_asc")}
              className="h-9 rounded-md border px-2 text-sm"
            >
              <option value="date_desc">Mới nhất</option>
              <option value="date_asc">Cũ nhất</option>
              <option value="likes_desc">Lượt thích nhiều</option>
              <option value="likes_asc">Lượt thích ít</option>
            </select>
            <Button variant={view === "grid" ? "default" : "ghost"} size="sm" onClick={() => setView("grid")}
              className={cn("h-9", view === "grid" ? "" : "opacity-70")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            {/* <Button variant={view === "list" ? "default" : "ghost"} size="sm" onClick={() => setView("list")}
              className={cn("h-9", view === "list" ? "" : "opacity-70")}
            >
              <List className="h-4 w-4" />
            </Button> */}
          </div>
        </div>
          <GalleryView
            items={paged}
            view={view}
            loading={loading}
            onLike={handleLike}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onShare={handleShare}
            onOpenImage={(url: string) => {
              const idx = imageUrls.findIndex(u => u === url);
              setModalIndex(idx >= 0 ? idx : 0);
              setIsModalOpen(true);
            }}
          />
      </Tabs>

      <div ref={sentinelRef} className="h-6" />
      <ZoomableImageModal
        images={imageUrls}
        isOpen={isModalOpen}
        initialIndex={modalIndex}
        onClose={() => setIsModalOpen(false)}
        onIndexChange={(i) => setModalIndex(i)}
      />
    </div>
  );
}

function GalleryView({ items, view, loading, onLike, onDelete, onDownload, onShare, onOpenImage, groupBy }:
  {
    items: (GalleryItem & { style?: string; garment?: string; likeCount?: number })[];
    view: "grid" | "list";
    loading?: boolean;
    onLike: (key: string) => void;
    onDelete: (key: string) => void | Promise<void>;
    onDownload: (item: GalleryItem) => void;
    onShare: (item: GalleryItem) => void | Promise<void>;
    onOpenImage: (url: string) => void;
    groupBy?: "style" | "garment";
  }
) {
  if (loading) {
    return (
      <div className={cn("grid gap-4", view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}> 
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-3">
            <Skeleton className="w-full h-48" />
            <div className="mt-2 flex gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const groups: Record<string, typeof items> = {};
  if (groupBy) {
    for (const it of items) {
      const key = (it[groupBy] as string) || "khác";
      groups[key] = groups[key] || [];
      groups[key].push(it);
    }
  }

  const renderItem = (it: GalleryItem & { likeCount?: number }) => (
    <Card key={it.key} className="relative p-3 border rounded-xl bg-white dark:bg-gray-800 overflow-hidden group">
      <div
        className={cn("relative rounded-lg overflow-hidden", view === "grid" ? "aspect-square" : "h-48")}
        onClick={() => onOpenImage(it.url)}
      > 
        <Image
          src={it.url}
          alt="Ảnh đã tạo"
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={getPlaceholderImageUrl()}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => onLike(it.key)} className="h-8 px-2">
              <Heart className="h-4 w-4" />
              <span className="ml-1 text-xs">{it.likeCount || 0}</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => onShare(it)} className="h-8 px-2"><Share2 className="h-4 w-4" /></Button>
            <Button variant="secondary" size="sm" onClick={() => onDownload(it)} className="h-8 px-2"><Download className="h-4 w-4" /></Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(it.key)} className="h-8 px-2"><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
        <span>{new Date(it.createdAt).toLocaleString()}</span>
        <span className="uppercase text-xs">{it.format || ""}</span>
      </div>
    </Card>
  );

  if (groupBy) {
    return (
      <div className="space-y-6">
        {Object.entries(groups).map(([title, arr]) => (
          <div key={title}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
            <div className={cn("grid gap-4", view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}> 
              {arr.map(renderItem)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}> 
      {items.map(renderItem)}
    </div>
  );
}
