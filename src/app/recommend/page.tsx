'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, Info, Loader2, Sparkles, Star, Wand2, Zap } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  imageUrl: string;
  styleTags: string[];
  shop: {
    name: string;
    url: string;
  };
}

// Popular style suggestions
const POPULAR_STYLES = [
  { label: 'Summer Beach', value: 'casual summer beach style with pastel colors', icon: '' },
  { label: 'Office Professional', value: 'professional business casual for office work', icon: '' },
  { label: 'Urban Street', value: 'modern urban streetwear with edgy vibe', icon: '' },
  { label: 'Romantic Date', value: 'romantic elegant date night outfit', icon: '' },
  { label: 'Athletic Casual', value: 'comfortable athletic casual sporty style', icon: '' },
  { label: 'Party Glam', value: 'glamorous party outfit with bold colors', icon: '' },
];

export default function RecommendPage() {
  const [style, setStyle] = useState('');
  const [outfit, setOutfit] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [useFollowedShopsPref, setUseFollowedShopsPref] = useState(true);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('styleSearchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent, quickStyle?: string) => {
    if (e) e.preventDefault();

    const searchValue = quickStyle || style;

    if (searchValue.length < 3) {
      setError('Vui lòng nhập ít nhất 3 ký tự');
      return;
    }

    setLoading(true);
    setError('');
    setOutfit([]);

    try {
      const followedShops = JSON.parse(localStorage.getItem('followedShops') || '[]');
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: searchValue,
          wishlistIds: [],
          preferredShops: useFollowedShopsPref ? followedShops : [],
          recentStyles: searchHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể tạo gợi ý');
      }

      const data = await response.json();
      setOutfit(data.outfit);

      // Save to history
      const newHistory = [searchValue, ...searchHistory.filter(h => h !== searchValue)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('styleSearchHistory', JSON.stringify(newHistory));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (styleValue: string) => {
    setStyle(styleValue);
    handleSubmit(undefined, styleValue);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="rounded-xl border bg-card p-8">
          <div className="text-center space-y-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border">
              <Wand2 className="h-5 w-5" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold vietnamese-heading">Gợi Ý AI</h1>
            <p className="text-sm text-muted-foreground">Gợi ý trang phục phù hợp với phong cách của bạn</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className={`flex items-center justify-between ${showGuide ? 'mb-4' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 inline-flex items-center justify-center rounded-md border">
                <Info className="h-4 w-4" />
              </div>
              <h2 className="text-base font-semibold">Hướng Dẫn Sử Dụng</h2>
            </div>
            <button onClick={() => setShowGuide(!showGuide)} className="px-3 py-2 rounded-md border text-sm">
              {showGuide ? 'Ẩn' : 'Xem'}
            </button>
          </div>
          {showGuide && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold mb-1">Mô Tả Phong Cách</h3>
                <p className="text-sm text-muted-foreground">Casual, formal, vintage, modern, minimalist…</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold mb-1">Hoàn Cảnh Sử Dụng</h3>
                <p className="text-sm text-muted-foreground">Đi làm, đi chơi, dự tiệc, du lịch…</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold mb-1">Màu Sắc Yêu Thích</h3>
                <p className="text-sm text-muted-foreground">Pastel, đen trắng, rực rỡ, trung tính…</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold mb-1">Ví Dụ Prompt</h3>
                <p className="text-sm text-muted-foreground">&quot;casual summer beach style with pastel colors&quot;</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 inline-flex items-center justify-center rounded-md border">
              <Zap className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold">Phong Cách Phổ Biến</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {POPULAR_STYLES.map((styleItem) => (
              <button
                key={styleItem.value}
                onClick={() => handleQuickSearch(styleItem.value)}
                className="flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-muted"
              >
                <span className="text-lg">{styleItem.icon}</span>
                <span className="font-medium">{styleItem.label.replace(/^.\s/, '')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Tìm Kiếm Gần Đây</h2>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {showHistory ? 'Ẩn' : 'Xem'}
              </button>
            </div>

            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2"
              >
                {searchHistory.map((hist, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickSearch(hist)}
                    className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/40 dark:hover:to-pink-900/40 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                  >
                    {hist}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              <CardTitle>Gợi ý phong cách</CardTitle>
            </div>
            <CardDescription>Nhập mô tả phong cách để nhận gợi ý sản phẩm</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="style">Mô tả phong cách bạn muốn</Label>
                <Input
                  id="style"
                  type="text"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="Ví dụ: casual summer beach style with pastel colors..."
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_STYLES.map((styleItem) => (
                  <Button key={styleItem.value} type="button" variant="outline" size="sm" onClick={() => handleQuickSearch(styleItem.value)}>
                    <span className="mr-1">{styleItem.icon}</span>
                    {styleItem.label.replace(/^.\s/, '')}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant={useFollowedShopsPref ? 'secondary' : 'outline'} size="sm" onClick={() => setUseFollowedShopsPref((v) => !v)}>
                  {useFollowedShopsPref ? 'Ưu tiên cửa hàng theo dõi' : 'Không ưu tiên cửa hàng theo dõi'}
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Tạo Gợi Ý
                    </>
                  )}
                </Button>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive">
                    {error}
                  </motion.p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {outfit.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-md border">
                <Star className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">
                Trang phục được gợi ý
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outfit.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl border bg-card overflow-hidden group"
                >
                  <div className="aspect-square bg-muted overflow-hidden relative">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-semibold mb-2">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-md border text-muted-foreground">
                        {product.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {product?.styleTags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-md border text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={product.shop.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Mua tại {product.shop.name}
                      </a>
                      <a
                        href={`/?garmentImage=${encodeURIComponent(product.imageUrl)}&category=auto`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm"
                      >
                        Thử ngay với AI
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
