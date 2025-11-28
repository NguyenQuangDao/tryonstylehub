'use client';

import { FileInput } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
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
  isLoading: boolean;
  errorMessage: string;
  resultGallery: string[];
  isComparisonMode: boolean;
  setIsComparisonMode: (mode: boolean) => void;
  setIsTipsModalOpen?: (open: boolean) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function OptimizedHomePage({
  // selectedVirtualModel,
  setIsVirtualModelSelectorOpen,
  personImageUpload,
  garmentImageUpload,
  selectedCategory,
  setSelectedCategory,
  isLoading,
  errorMessage,
  resultGallery,
  isComparisonMode,
  setIsComparisonMode,
  setIsTipsModalOpen,
  onSubmit
}: OptimizedHomePageProps) {
  // Example images
  const personExamples = [
    'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1',
    'https://images.pexels.com/photos/936114/pexels-photo-936114.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1',
    'https://images.pexels.com/photos/1055686/pexels-photo-1055686.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1',
    'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1'
  ];

  const garmentExamples = [
    'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1',
    'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1',
    'https://images.pexels.com/photos/7679721/pexels-photo-7679721.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1',
    'https://images.pexels.com/photos/7679723/pexels-photo-7679723.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1'
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
                            alt="Person preview"
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
                          <Image src={url} alt={`Person example ${idx + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
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
                            alt="Garment preview"
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
                          <Image src={url} alt={`Garment example ${idx + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Kết quả thử đồ</CardTitle>
                    <CardDescription className="text-xs">Ảnh đã được xử lý bằng AI</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsComparisonMode(!isComparisonMode)}
                  >
                    {isComparisonMode ? 'Xem lưới' : 'So sánh'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "grid gap-4",
                  isComparisonMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
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
                          alt={`Try-on result ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
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
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] md:aspect-[2/3] rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
