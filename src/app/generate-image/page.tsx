'use client'

import { InsufficientTokensModal, TokenDisplay } from '@/components/tokens/TokenComponents';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { TOKEN_CONFIG } from '@/config/tokens';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { Backpack, Camera, CloudSun, Download, Image as ImageIcon, Info, Loader2, Palette, Shirt, Sparkles, Sun, Wand2, Watch } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

export default function GenerateImagePage() {
  const { user } = useAuth()
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [improving, setImproving] = useState(false);
  const [improveError, setImproveError] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBackground, setSelectedBackground] = useState<string>('');
  const [accessories, setAccessories] = useState<{ hat: boolean; bag: boolean; jewelry: boolean; watch: boolean }>(
    { hat: false, bag: false, jewelry: false, watch: false }
  );
  const [insufficientOpen, setInsufficientOpen] = useState(false)
  const [insufficientInfo, setInsufficientInfo] = useState<{ required: number; current: number; operation: string }>({ required: TOKEN_CONFIG.COSTS.GENERATE_IMAGE.amount, current: 0, operation: 'Tạo ảnh AI' })

  const STYLE_PRESETS = ['casual', 'formal', 'streetwear', 'vintage', 'minimalist', 'bohemian'];
  const COLOR_PRESETS = ['pastel', 'neutral', 'monochrome', 'vivid', 'earth tones', 'black & white'];
  const CATEGORY_PRESETS = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'];
  const BACKGROUND_PRESETS = ['studio', 'street', 'beach', 'runway', 'boutique'];

  const composedPrompt = useMemo(() => {
    const parts: string[] = [];
    if (selectedCategories.length) {
      parts.push(`Outfit containing: ${selectedCategories.join(', ')}`);
    }
    if (selectedStyle) {
      parts.push(`Style: ${selectedStyle}`);
    }
    if (selectedColors.length) {
      parts.push(`Color palette: ${selectedColors.join(', ')}`);
    }
    const acc: string[] = [];
    if (accessories.hat) acc.push('hat');
    if (accessories.bag) acc.push('bag');
    if (accessories.jewelry) acc.push('jewelry');
    if (accessories.watch) acc.push('watch');
    if (acc.length) parts.push(`Accessories: ${acc.join(', ')}`);
    if (selectedBackground) {
      parts.push(`Background: ${selectedBackground}`);
    }
    parts.push('professional photography, high quality');
    return parts.join('; ');
  }, [selectedCategories, selectedStyle, selectedColors, accessories, selectedBackground]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const effectivePrompt = (prompt && prompt.length >= 10) ? prompt : composedPrompt;
    if (!effectivePrompt || effectivePrompt.length < 10) {
      setError('Vui lòng điền mô tả hoặc chọn thông số tạo ảnh');
      return;
    }

    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: effectivePrompt, quality: 'hd' }),
      });

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 402 && data?.insufficientTokens) {
          setInsufficientInfo({
            required: data.details?.required || TOKEN_CONFIG.COSTS.GENERATE_IMAGE.amount,
            current: data.details?.current || (user?.tokenBalance ?? 0),
            operation: 'Tạo ảnh AI'
          })
          setInsufficientOpen(true)
          setLoading(false)
          return
        }
        throw new Error(data.error || 'Không thể tạo ảnh');
      }

      const data = await response.json();

      if (data.success) {
        setImageUrl(data.imageUrl);
        setToastOpen(true);
      } else {
        setError(data.error || 'Đã xảy ra lỗi');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleImprovePrompt = async () => {
    if (!prompt || prompt.length < 5) {
      setImproveError('Vui lòng nhập mô tả trước khi cải tiến');
      return;
    }
    setImproveError('');
    setImproving(true);
    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, preferRemote: true, model: 'google/gemini-2.0-flash-exp:free' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không thể cải tiến prompt');
      }
      setPrompt(data.prompt);
    } catch (err) {
      setImproveError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cải tiến');
    } finally {
      setImproving(false);
    }
  };

  return (
    <ToastProvider>
      <div className="max-w-7xl mx-auto relative overflow-hidden">
        {/* Nền trang trí */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-pink-500 to-orange-500 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 relative z-10"
        >
          {/* Phần tiêu đề */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-100 dark:border-purple-900/30">
            <CardHeader className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <Wand2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent vietnamese-heading">
                    Tạo Ảnh AI
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Tạo ảnh thời trang
                  </CardDescription>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  AI-Powered
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
                  <Palette className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                  Chất lượng cao
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
                  <Camera className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  Nhanh chóng
                </Badge>
              </div>
          </CardHeader>
          </Card>

          {/* Hướng dẫn sử dụng */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className={`flex items-center justify-between ${showGuide ? 'mb-4' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl">Hướng Dẫn Sử Dụng</CardTitle>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowGuide(!showGuide)}
                  className="text-sm"
                >
                  {showGuide ? 'Ẩn' : 'Xem'}
                </Button>
              </div>
            </CardHeader>

            {showGuide && (
              <CardContent>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">✨ Mô Tả Chi Tiết</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">
                          Mô tả càng chi tiết càng tốt: màu sắc, phong cách, bối cảnh, ánh sáng để có kết quả tốt nhất.
                        </CardDescription>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">🎨 Phong Cách Thời Trang</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">
                          Chỉ định phong cách: casual, formal, vintage, modern, bohemian, minimalist, etc.
                        </CardDescription>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">📸 Chất Lượng Ảnh</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">
                          Thêm từ khóa: &quot;professional photography&quot;, &quot;high quality&quot;, &quot;4K&quot;, &quot;studio lighting&quot;.
                        </CardDescription>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">💡 Ví Dụ Prompt</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">
                          &quot;A stylish woman wearing a summer dress on a beach at sunset, professional photography, high quality&quot;
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </CardContent>
            )}
          </Card>

          <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-gray-200/50 dark:border-gray-800/50">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between">
                  <TokenDisplay balance={user?.tokenBalance ?? 0} />
                  <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16z"/></svg>
                    <span>Tiêu tốn {TOKEN_CONFIG.COSTS.GENERATE_IMAGE.amount} token</span>
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Loại trang phục</Label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_PRESETS.map((cat) => {
                        const active = selectedCategories.includes(cat);
                        return (
                          <Button
                            key={cat}
                            type="button"
                            variant={active ? 'default' : 'outline'}
                            onClick={() => {
                              setSelectedCategories((prev) => (
                                prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                              ));
                            }}
                            className="capitalize"
                          >
                            <Shirt className="h-4 w-4 mr-2" />{cat}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Phụ kiện</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant={accessories.hat ? 'default' : 'outline'} onClick={() => setAccessories(a => ({ ...a, hat: !a.hat }))}>🧢 Mũ</Button>
                      <Button type="button" variant={accessories.bag ? 'default' : 'outline'} onClick={() => setAccessories(a => ({ ...a, bag: !a.bag }))}><Backpack className="h-4 w-4 mr-2" />Túi</Button>
                      <Button type="button" variant={accessories.jewelry ? 'default' : 'outline'} onClick={() => setAccessories(a => ({ ...a, jewelry: !a.jewelry }))}>💎 Trang sức</Button>
                      <Button type="button" variant={accessories.watch ? 'default' : 'outline'} onClick={() => setAccessories(a => ({ ...a, watch: !a.watch }))}><Watch className="h-4 w-4 mr-2" />Đồng hồ</Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Phong cách</Label>
                    <div className="flex flex-wrap gap-2">
                      {STYLE_PRESETS.map((s) => (
                        <Button
                          key={s}
                          type="button"
                          variant={selectedStyle === s ? 'default' : 'outline'}
                          onClick={() => setSelectedStyle(selectedStyle === s ? '' : s)}
                          className="capitalize"
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Màu sắc</Label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map((c) => {
                        const active = selectedColors.includes(c);
                        return (
                          <Button
                            key={c}
                            type="button"
                            variant={active ? 'default' : 'outline'}
                            onClick={() => setSelectedColors(prev => (
                              prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                            ))}
                            className="capitalize"
                          >
                            <Palette className="h-4 w-4 mr-2" />{c}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-sm font-medium">Bối cảnh</Label>
                    <div className="flex flex-wrap gap-2">
                      {BACKGROUND_PRESETS.map((b) => (
                        <Button
                          key={b}
                          type="button"
                          variant={selectedBackground === b ? 'default' : 'outline'}
                          onClick={() => setSelectedBackground(selectedBackground === b ? '' : b)}
                          className="capitalize"
                        >
                          {b === 'studio' ? <Camera className="h-4 w-4 mr-2" /> : b === 'beach' ? <Sun className="h-4 w-4 mr-2" /> : <CloudSun className="h-4 w-4 mr-2" />}
                          {b}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="prompt" className="text-sm font-medium">
                    Mô tả ảnh bạn muốn tạo
                  </Label>

                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                    placeholder="Ví dụ: A stylish woman wearing a summer dress on a beach at sunset, professional photography, high quality..."
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {improveError && <span className="text-red-600">{improveError}</span>}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleImprovePrompt}
                      disabled={improving}
                      className="flex items-center gap-2"
                    >
                      {improving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Đang cải tiến...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4" />
                          <span>Cải tiến bằng AI</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin mr-3" />
                      <span>Đang tạo ảnh...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-6 w-6 mr-3" />
                      <span>Tạo Ảnh</span>
                    </>
                  )}
                </Button>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>

          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-gray-200/50 dark:border-gray-800/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-2xl">
                        Kết quả tạo ảnh
                      </CardTitle>
                    </div>

                    <Button
                      asChild
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <a
                        href={imageUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Tải xuống
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square max-w-2xl mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden shadow-lg relative">
                      <Image
                      src={imageUrl}
                      alt="Ảnh thời trang đã tạo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  {/* <div className="mt-6 flex justify-center">
                    <Button asChild variant="default" className="px-6 py-3">
                      <a href={`/?garmentImage=${encodeURIComponent(imageUrl)}&category=${encodeURIComponent(selectedCategories[0] || 'auto')}`}>
                        Dùng ảnh này để thử đồ ảo
                      </a>
                    </Button>
                  </div> */}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!imageUrl && !loading && (
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">
                  Sẵn sàng tạo ảnh
                </CardTitle>
                <CardDescription>
                  Ảnh của bạn sẽ xuất hiện ở đây sau khi tạo thành công
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </motion.div>
        <Toast open={toastOpen} onOpenChange={setToastOpen}>
          <ToastTitle>Đã lưu ảnh thành công</ToastTitle>
          <ToastDescription>Ảnh đã được lưu vào kho ảnh của bạn</ToastDescription>
        </Toast>
        <ToastViewport />
        <InsufficientTokensModal
          isOpen={insufficientOpen}
          onClose={() => setInsufficientOpen(false)}
          required={insufficientInfo.required}
          current={insufficientInfo.current}
          operation={insufficientInfo.operation}
        />
      </div>
    </ToastProvider>
  );
}
