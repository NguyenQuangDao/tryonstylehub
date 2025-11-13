'use client';

import { FileInput } from '@/components';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { VirtualModel } from '@/types';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Lightbulb,
  Loader2,
  Shirt,
  Sparkles,
  Star,
  User,
  X,
  // Upload,
  Zap
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
  apiKey: string | null;
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
  apiKey,
  // selectedVirtualModel,
  setIsVirtualModelSelectorOpen,
  personImageUpload,
  garmentImageUpload,
  // selectedCategory,
  // setSelectedCategory,
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
    'https://images.pexels.com/photos/3772510/pexels-photo-3772510.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1',
    'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1',
    'https://images.pexels.com/photos/936114/pexels-photo-936114.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1',
    'https://images.pexels.com/photos/1055686/pexels-photo-1055686.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1'
  ];

  const garmentExamples = [
    'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1',
    'https://images.pexels.com/photos/4046319/pexels-photo-4046319.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1',
    'https://images.pexels.com/photos/7679721/pexels-photo-7679721.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1',
    'https://images.pexels.com/photos/7679723/pexels-photo-7679723.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1'
  ];

  // const [currentPersonExample, setCurrentPersonExample] = useState(0);
  // const [currentGarmentExample, setCurrentGarmentExample] = useState(0);

  // Handlers
  // const handlePersonExampleChange = useCallback((direction: 'left' | 'right') => {
  //   setCurrentPersonExample(prev => {
  //     if (direction === 'left') {
  //       return prev === 0 ? personExamples.length - 1 : prev - 1;
  //     } else {
  //       return prev === personExamples.length - 1 ? 0 : prev + 1;
  //     }
  //   });
  // }, [personExamples.length]);

  // const handleGarmentExampleChange = useCallback((direction: 'left' | 'right') => {
  //   setCurrentGarmentExample(prev => {
  //     if (direction === 'left') {
  //       return prev === 0 ? garmentExamples.length - 1 : prev - 1;
  //     } else {
  //       return prev === garmentExamples.length - 1 ? 0 : prev + 1;
  //     }
  //   });
  // }, [garmentExamples.length]);

  // const handleSelectPersonExample = useCallback(() => {
  //   const exampleUrl = personExamples[currentPersonExample];
  //   personImageUpload.loadExampleImage(exampleUrl);
  // }, [currentPersonExample, personExamples, personImageUpload]);

  // const handleSelectGarmentExample = useCallback(() => {
  //   const exampleUrl = garmentExamples[currentGarmentExample];
  //   garmentImageUpload.loadExampleImage(exampleUrl);
  // }, [currentGarmentExample, garmentExamples, garmentImageUpload]);

  // const categories = [
  //   { id: 'tops', label: 'Áo', icon: Shirt },
  //   { id: 'bottoms', label: 'Quần', icon: Users },
  //   { id: 'dresses', label: 'Váy', icon: Sparkles },
  //   { id: 'outerwear', label: 'Áo khoác', icon: Camera }
  // ];

  // const canSubmit = (personImageUpload.imagePreview || selectedVirtualModel) && 
  //                  garmentImageUpload.imagePreview && 
  //                  selectedCategory && 
  //                  apiKey;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Thử Đồ Ảo
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Trải nghiệm công nghệ AI tiên tiến để thử đồ ảo một cách chân thực và nhanh chóng
            </p>
            <div className="flex items-center justify-center gap-4 mb-8">
              <Badge variant="secondary" className="px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Nhanh chóng
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                Chất lượng cao
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                AI tiên tiến
              </Badge>
            </div>
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
              <Card className="h-full border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Tải ảnh mẫu</CardTitle>
                      <CardDescription>Tải ảnh</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Tải lên ảnh người mẫu</Label>
                    {personImageUpload.imagePreview ? (
                      <div className="relative group">
                        <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700">
                          <Image
                            src={personImageUpload.imagePreview}
                            alt="Person preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={personImageUpload.clearImage}
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
                        className="aspect-[2/3] border-2 border-dashed border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                      />
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsVirtualModelSelectorOpen(true)}
                      className="px-6"
                    >
                      Chọn người mẫu ảo
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Ảnh mẫu</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {personExamples.map((url, idx) => (
                        <div
                          key={idx}
                          className="aspect-[2/3] rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 relative group cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                          onClick={() => personImageUpload.loadExampleImage(url)}
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
              <Card className="h-full border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Shirt className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Chọn trang phục</CardTitle>
                      <CardDescription>Tải ảnh trang phục muốn thử</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Garment Upload */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Tải lên ảnh trang phục</Label>
                    {garmentImageUpload.imagePreview ? (
                      <div className="relative group">
                        <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700">
                          <Image
                            src={garmentImageUpload.imagePreview}
                            alt="Garment preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={garmentImageUpload.clearImage}
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
                        className="aspect-[2/3] border-2 border-dashed border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Ảnh mẫu trang phục</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {garmentExamples.map((url, idx) => (
                        <div
                          key={idx}
                          className="aspect-[2/3] rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 relative group cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                          onClick={() => garmentImageUpload.loadExampleImage(url)}
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
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Loại trang phục</CardTitle>
                <CardDescription>Chọn loại trang phục để AI xử lý chính xác hơn</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <div key={category.id} className="relative">
                          <RadioGroupItem 
                            value={category.id} 
                            id={category.id}
                            className="peer sr-only"
                          />
                          <Label 
                            htmlFor={category.id}
                            className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:border-blue-400 dark:hover:border-blue-500 peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/30"
                          >
                            <Icon className="w-8 h-8 text-gray-600 dark:text-gray-400 peer-checked:text-blue-600" />
                            <span className="font-medium">{category.label}</span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div> */}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTipsModalOpen?.(true)}
              className="px-8 py-3"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Xem hướng dẫn
            </Button>
            
            {!apiKey && (
              // <Button
              //   type="button"
              //   variant="outline"
              //   onClick={() => setIsApiKeyModalOpen(true)}
              //   className="px-8 py-3"
              // >
              //   <Upload className="w-4 h-4 mr-2" />
              //   Cấu hình API Key
              // </Button>
              ""
            )}

            <Button
              type="submit"
              // disabled={!canSubmit || isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300 text-center"
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
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Kết quả thử đồ</CardTitle>
                    <CardDescription>Ảnh đã được xử lý bằng AI</CardDescription>
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
                  "grid gap-6",
                  isComparisonMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}>
                  {resultGallery.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="relative group"
                    >
                      <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900">
                        <Image
                          src={result}
                          alt={`Try-on result ${index + 1}`}
                          fill
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
      </div>
    </div>
  );
}