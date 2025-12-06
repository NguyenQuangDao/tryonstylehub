'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, Heart, Info, Loader2, Palette, Sparkles, Star, Wand2, Zap } from 'lucide-react';
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
  { label: '🏖️ Summer Beach', value: 'casual summer beach style with pastel colors', icon: '🏖️' },
  { label: '💼 Office Professional', value: 'professional business casual for office work', icon: '💼' },
  { label: '🌆 Urban Street', value: 'modern urban streetwear with edgy vibe', icon: '🌆' },
  { label: '🌸 Romantic Date', value: 'romantic elegant date night outfit', icon: '🌸' },
  { label: '🏃 Athletic Casual', value: 'comfortable athletic casual sporty style', icon: '🏃' },
  { label: '✨ Party Glam', value: 'glamorous party outfit with bold colors', icon: '✨' },
];

export default function RecommendPage() {
  const [style, setStyle] = useState('');
  const [outfit, setOutfit] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [useWishlistPref, setUseWishlistPref] = useState(true);
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
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const followedShops = JSON.parse(localStorage.getItem('followedShops') || '[]');
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: searchValue,
          wishlistIds: useWishlistPref ? wishlist : [],
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
    <div className="max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-green-500 to-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 relative z-10"
      >
        {/* Hero Section */}
        <div className="text-center space-y-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-3xl p-8 shadow-lg border border-green-100 dark:border-green-900/30">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Wand2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent vietnamese-heading">
                Gợi Ý AI
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Nhận gợi ý trang phục phù hợp với phong cách của bạn
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phong cách đa dạng</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cá nhân hóa</span>
            </div>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-3xl p-6 border border-green-200 dark:border-green-800">
          <div className={`flex items-center justify-between ${showGuide ? 'mb-4' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                <Info className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Hướng Dẫn Sử Dụng</h2>
            </div>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {showGuide ? 'Ẩn' : 'Xem'}
            </button>
          </div>

          {showGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🎯 Mô Tả Phong Cách</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mô tả phong cách bạn muốn: casual, formal, vintage, modern, bohemian, minimalist, etc.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🌤️ Hoàn Cảnh Sử Dụng</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Chỉ định hoàn cảnh: đi làm, đi chơi, dự tiệc, đi du lịch, ở nhà, etc.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🎨 Màu Sắc Yêu Thích</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nêu màu sắc bạn thích: pastel, đen trắng, màu sắc rực rỡ, tone trung tính, etc.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">💡 Ví Dụ Prompt</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    &quot;casual summer beach style with pastel colors for vacation&quot;
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Style Filters */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Phong Cách Phổ Biến</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {POPULAR_STYLES.map((styleItem) => (
              <button
                key={styleItem.value}
                onClick={() => handleQuickSearch(styleItem.value)}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl hover:from-green-50 hover:to-blue-50 dark:hover:from-green-900/20 dark:hover:to-blue-900/20 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{styleItem.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                  {styleItem.label.replace(/^.\s/, '')}
                </span>
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
                <Button type="button" variant={useWishlistPref ? 'secondary' : 'outline'} size="sm" onClick={() => setUseWishlistPref((v) => !v)}>
                  {useWishlistPref ? 'Ưu tiên sản phẩm yêu thích' : 'Không ưu tiên sản phẩm yêu thích'}
                </Button>
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
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
                  className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 overflow-hidden group hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden relative">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-green-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      ${product.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 text-green-600 dark:text-green-400 rounded-full font-medium">
                        {product.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {product?.styleTags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <a
                      href={product.shop.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Mua tại {product.shop.name}
                    </a>
                    <div className="mt-3">
                      <a
                        href={`/?garmentImage=${encodeURIComponent(product.imageUrl)}&category=auto`}
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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
