'use client';

import { FileInput } from '@/components';
import { TokenDisplay } from '@/components/tokens/TokenComponents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TOKEN_CONFIG } from '@/config/tokens';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { VirtualModel } from '@/types';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Lightbulb,
  Loader2,
  Shirt,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { FormEvent } from 'react';

interface ImageUpload {
  imagePreview: string | null;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  clearImage: () => void;
  loadExampleImage: (url: string) => void;
}

interface OptimizedHomePageProps {
  selectedVirtualModel: VirtualModel | null;
  setIsVirtualModelSelectorOpen: (open: boolean) => void;
  personImageUpload: ImageUpload;
  garmentImageUpload: ImageUpload;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  quality: 'standard' | 'high';
  setQuality: (q: 'standard' | 'high') => void;
  isLoading: boolean;
  errorMessage: string;
  resultGallery: string[];
  isComparisonMode: boolean;
  setIsComparisonMode: (mode: boolean) => void;
  setIsTipsModalOpen?: (open: boolean) => void;
  onClearSelectedVirtualModel?: () => void;
  onSubmit: (e: FormEvent) => void;
}

export default function OptimizedHomePage({
  selectedVirtualModel,
  setIsVirtualModelSelectorOpen,
  personImageUpload,
  garmentImageUpload,
  selectedCategory,
  setSelectedCategory,
  quality,
  setQuality,
  isLoading,
  errorMessage,
  resultGallery,
  isComparisonMode,
  setIsComparisonMode,
  setIsTipsModalOpen,
  onClearSelectedVirtualModel,
  onSubmit
}: OptimizedHomePageProps) {
  const { user } = useAuth()
  // Example images
  const personExamples = [
    '/image/personExamples/mau1.png',
    '/image/personExamples/mau2.png',
    '/image/personExamples/mau3.png',
    '/image/personExamples/mau4.png'
  ];

  const garmentExamples = [
    '/image/garmentExamples/do1.png',
    '/image/garmentExamples/do2.png',
    '/image/garmentExamples/do3.png',
    '/image/garmentExamples/do4.png'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-pulse" />
      )}
      {/* Hero Section */}
      <div className="relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Thử đồ ảo bằng AI
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-3 max-w-2xl mx-auto">
              Giao diện tối giản, nhất quán. Tải ảnh nhanh và thao tác mượt mà.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="flex items-center justify-between">
            <TokenDisplay balance={user?.tokenBalance ?? 0} />
            <div className="flex items-center gap-3">
              <Button type="button" variant={quality === 'standard' ? 'default' : 'outline'} onClick={() => setQuality('standard')} className="flex items-center gap-2">
                Chất lượng thường
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-black">{TOKEN_CONFIG.COSTS.TRY_ON_STANDARD.amount} token</span>
              </Button>
              <Button type="button" variant={quality === 'high' ? 'default' : 'outline'} onClick={() => setQuality('high')} className="flex items-center gap-2">
                Chất lượng cao
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-black">{TOKEN_CONFIG.COSTS.TRY_ON_HIGH.amount} token</span>
              </Button>
            </div>
          </div>
          {/* Upload Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Person/Avatar Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full border shadow-sm rounded-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-base">Ảnh người mẫu</CardTitle>
                      <CardDescription className="text-xs">Chọn hoặc tải lên ảnh người</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Tải lên ảnh người mẫu</Label>
                    {personImageUpload.imagePreview ? (
                      <div className="relative group">
                        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden bg-muted/20">
                          <Image
                            src={personImageUpload.imagePreview}
                            alt="Xem trước người mẫu"
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={personImageUpload.clearImage}
                          aria-label="Xóa ảnh người mẫu"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : selectedVirtualModel?.avatarImage ? (
                      <div className="relative group">
                        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden bg-muted/20">
                          <Image
                            src={selectedVirtualModel.avatarImage}
                            alt={selectedVirtualModel.avatarName}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            if (onClearSelectedVirtualModel) {
                              onClearSelectedVirtualModel();
                            } else {
                              setIsVirtualModelSelectorOpen(true);
                            }
                          }}
                          aria-label="Bỏ chọn người mẫu ảo"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <FileInput
                        onChange={personImageUpload.handleImageChange}
                        accept="image/*"
                        label="Chọn ảnh người mẫu"
                        className="h-64 md:h-80 border border-dashed"
                      />
                    )}
                  </div>



                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Ảnh mẫu người</Label>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => setIsVirtualModelSelectorOpen(true)}
                        className="h-auto p-0 text-blue-600 font-normal hover:no-underline hover:text-blue-700"
                      >
                        Chọn người mẫu ảo
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {personExamples.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative h-32 md:h-36 rounded-lg overflow-hidden bg-muted/20 border group cursor-pointer"
                          onClick={() => personImageUpload.loadExampleImage(url)}
                          role="button"
                          aria-label={`Chọn ảnh người mẫu ví dụ ${idx + 1}`}
                        >
                          <Image src={url} alt={`Ví dụ người mẫu ${idx + 1}`} fill className="object-contain transition-transform duration-300 group-hover:scale-105" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>

              </Card>
            </motion.div>

            {/* Garment Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="h-full border shadow-sm rounded-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Shirt className="w-6 h-6 text-purple-600" />
                    <div>
                      <CardTitle className="text-base">Ảnh trang phục</CardTitle>
                      <CardDescription className="text-xs">Chọn hoặc tải lên ảnh trang phục</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Garment Upload */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Tải lên ảnh trang phục</Label>
                    {garmentImageUpload.imagePreview ? (
                      <div className="relative group">
                        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden bg-muted/20">
                          <Image
                            src={garmentImageUpload.imagePreview}
                            alt="Xem trước trang phục"
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={garmentImageUpload.clearImage}
                          aria-label="Xóa ảnh trang phục"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <FileInput
                        onChange={garmentImageUpload.handleImageChange}
                        accept="image/*"
                        label="Chọn ảnh trang phục"
                        className="h-64 md:h-80 border border-dashed"
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Ảnh mẫu trang phục</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {garmentExamples.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative h-32 md:h-36 rounded-lg overflow-hidden bg-muted/20 border group cursor-pointer"
                          onClick={() => garmentImageUpload.loadExampleImage(url)}
                          role="button"
                          aria-label={`Chọn ảnh trang phục ví dụ ${idx + 1}`}
                        >
                          <Image src={url} alt={`Ví dụ trang phục ${idx + 1}`} fill className="object-contain transition-transform duration-300 group-hover:scale-105" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Category Selection */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-md mx-auto">
              <Label className="text-sm font-medium">Loại trang phục</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger aria-label="Chọn loại trang phục" className="mt-2">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tops">Áo</SelectItem>
                  <SelectItem value="bottoms">Quần/Váy</SelectItem>
                  <SelectItem value="dress">Đầm</SelectItem>
                  <SelectItem value="outerwear">Áo khoác</SelectItem>
                  <SelectItem value="accessories">Phụ kiện</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Provider Selection removed: hệ thống chỉ dùng FASHN trên server */}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsTipsModalOpen?.(true)}
              className="px-6"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Hướng dẫn
            </Button>

            <Button
              type="submit"
              className="px-6"
              aria-live="polite"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Thử đồ ngay
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="alert"
              aria-live="polite"
              className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-300 text-center text-sm"
            >
              {errorMessage}
            </motion.div>
          )}
        </form>

        {/* Results Section */}
        {resultGallery.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <Card className="border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-start">
                  <div>
                    <CardTitle className="text-lg">Kết quả thử đồ</CardTitle>
                    <CardDescription className="text-xs">Ảnh đã được xử lý bằng AI</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}>
                  {resultGallery.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="relative group"
                    >
                      <div className="aspect-[3/4] md:aspect-[2/3] rounded-lg overflow-hidden bg-muted/20">
                        <Image
                          src={result}
                          alt={`Kết quả thử đồ ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-2xl flex items-center justify-center">
                        <Button
                          variant="secondary"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = result;
                            link.download = `tryon-result-${index + 1}.jpg`;
                            link.click();
                          }}
                        >
                          Tải xuống
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isLoading && resultGallery.length === 0 && (
          <div className="mt-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-3xl border shadow-sm bg-gradient-to-br from-purple-100/60 to-blue-100/60 dark:from-purple-900/30 dark:to-blue-900/30"
            >
              <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-400/30 to-sky-400/30 blur-3xl animate-pulse" />
                <div className="absolute bottom-[-3rem] right-[-2rem] h-56 w-56 rounded-full bg-gradient-to-tr from-violet-500/25 to-cyan-500/25 blur-2xl animate-[pulse_2s_ease-in-out_infinite]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className="relative aspect-[3/4] md:aspect-[2/3] rounded-2xl bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.08),transparent_60%)]" />
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-white/50 dark:ring-white/10" />

                    <div className="absolute top-3 left-3 text-[11px] px-2 py-1 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-sm text-gray-700 dark:text-gray-300">
                      Đang tạo ảnh...
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ repeat: Infinity, repeatType: 'mirror', duration: 1.2 }}
                        className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300"
                      >
                        <Sparkles className="w-4 h-4 animate-[spin_3s_linear_infinite]" />
                        <span>Phép màu AI đang hoạt động</span>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
