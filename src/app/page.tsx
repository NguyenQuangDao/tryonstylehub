'use client';

import { FileInput } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useApiKey, useImageUpload, useVirtualModels } from '@/hooks';
import { cn } from '@/lib/utils';
import { VirtualModel, CreateVirtualModelInput } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Camera, 
  ChevronLeft, 
  ChevronRight, 
  Lightbulb, 
  Loader2, 
  RefreshCw, 
  Shirt, 
  Sparkles, 
  Users, 
  X 
} from 'lucide-react';
import Image from 'next/image';
import { FormEvent, useCallback, useState } from 'react';
import ApiKeyModal from '@/components/modals/ApiKeyModal';
import TipsModal from '@/components/modals/TipsModal';
import VirtualModelForm from '@/components/forms/VirtualModelForm';
import VirtualModelSelector from '@/components/forms/VirtualModelSelector';

export default function Home() {
  // API Key management
  const { apiKey, saveApiKey } = useApiKey();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Virtual Models management
  const { createVirtualModel, updateVirtualModel } = useVirtualModels();
  const [selectedVirtualModel, setSelectedVirtualModel] = useState<VirtualModel | null>(null);
  const [isVirtualModelSelectorOpen, setIsVirtualModelSelectorOpen] = useState(false);
  const [isVirtualModelFormOpen, setIsVirtualModelFormOpen] = useState(false);
  const [editingVirtualModel, setEditingVirtualModel] = useState<VirtualModel | null>(null);

  // Image upload hooks
  const personImageUpload = useImageUpload();
  const garmentImageUpload = useImageUpload();

  // Form state
  const [selectedCategory, setSelectedCategory] = useState('tops');
  const [selectedMode] = useState('tryon-v1');
  const [autoSegmentation] = useState(true);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resultGallery, setResultGallery] = useState<string[]>([]);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);

  // Example images
  const personExamples = [
    '/examples/person1.jpg',
    '/examples/person2.jpg',
    '/examples/person3.jpg',
    '/examples/person4.jpg'
  ];

  const garmentExamples = [
    '/examples/garment1.jpg',
    '/examples/garment2.jpg',
    '/examples/garment3.jpg',
    '/examples/garment4.jpg'
  ];

  const [currentPersonExample, setCurrentPersonExample] = useState(0);
  const [currentGarmentExample, setCurrentGarmentExample] = useState(0);

  // Handlers
  const handlePersonExampleChange = useCallback((direction: 'left' | 'right') => {
    setCurrentPersonExample(prev => {
      if (direction === 'left') {
        return prev === 0 ? personExamples.length - 1 : prev - 1;
      } else {
        return prev === personExamples.length - 1 ? 0 : prev + 1;
      }
    });
  }, [personExamples.length]);

  const handleGarmentExampleChange = useCallback((direction: 'left' | 'right') => {
    setCurrentGarmentExample(prev => {
      if (direction === 'left') {
        return prev === 0 ? garmentExamples.length - 1 : prev - 1;
      } else {
        return prev === garmentExamples.length - 1 ? 0 : prev + 1;
      }
    });
  }, [garmentExamples.length]);

  const handleSelectPersonExample = useCallback(() => {
    const exampleUrl = personExamples[currentPersonExample];
    personImageUpload.loadExampleImage(exampleUrl);
  }, [currentPersonExample, personExamples, personImageUpload]);

  const handleSelectGarmentExample = useCallback(() => {
    const exampleUrl = garmentExamples[currentGarmentExample];
    garmentImageUpload.loadExampleImage(exampleUrl);
  }, [currentGarmentExample, garmentExamples, garmentImageUpload]);

  const handleReset = useCallback(() => {
    personImageUpload.clearImage();
    garmentImageUpload.clearImage();
    setSelectedVirtualModel(null);
    setResultGallery([]);
    setErrorMessage('');
    setIsComparisonMode(false);
  }, [personImageUpload, garmentImageUpload]);

  const handleOpenVirtualModelSelector = useCallback(() => {
    setIsVirtualModelSelectorOpen(true);
  }, []);

  const handleCloseVirtualModelSelector = useCallback(() => {
    setIsVirtualModelSelectorOpen(false);
  }, []);

  const handleSelectVirtualModel = useCallback((model: VirtualModel) => {
    setSelectedVirtualModel(model);
    setIsVirtualModelSelectorOpen(false);
  }, []);

  const handleOpenVirtualModelForm = useCallback((model?: VirtualModel) => {
    setEditingVirtualModel(model || null);
    setIsVirtualModelFormOpen(true);
    setIsVirtualModelSelectorOpen(false);
  }, []);

  const handleCloseVirtualModelForm = useCallback(() => {
    setIsVirtualModelFormOpen(false);
    setEditingVirtualModel(null);
  }, []);

  const handleSaveVirtualModel = useCallback(async (modelData: CreateVirtualModelInput) => {
    try {
      if (editingVirtualModel) {
        await updateVirtualModel(editingVirtualModel.id, modelData);
      } else {
        await createVirtualModel(modelData);
      }
      setIsVirtualModelFormOpen(false);
      setEditingVirtualModel(null);
    } catch (error) {
      console.error('Error saving virtual model:', error);
    }
  }, [editingVirtualModel, updateVirtualModel, createVirtualModel]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    if ((!personImageUpload.imageFile && !selectedVirtualModel) || !garmentImageUpload.imageFile) {
      setErrorMessage('Vui lòng tải lên cả ảnh người mẫu và ảnh trang phục');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      
      if (selectedVirtualModel) {
        formData.append('virtualModelId', selectedVirtualModel.id.toString());
      } else if (personImageUpload.imageFile) {
        formData.append('personImage', personImageUpload.imageFile);
      }
      
      if (garmentImageUpload.imageFile) {
        formData.append('garmentImage', garmentImageUpload.imageFile);
      }
      
      formData.append('category', selectedCategory);
      formData.append('mode', selectedMode);
      formData.append('autoSegmentation', autoSegmentation.toString());

      const response = await fetch('/api/tryon', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi xử lý ảnh');
      }

      if (data.success && data.results) {
        setResultGallery(data.results);
      } else {
        throw new Error('Không nhận được kết quả từ server');
      }
    } catch (error) {
      console.error('Try-on error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý ảnh');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        {/* Hero Section */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 border-0 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-pink-400/5"></div>
          <CardHeader className="relative z-10 text-center py-16 px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Thử Đồ Ảo
              </CardTitle>
              <CardDescription className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Trải nghiệm công nghệ AI tiên tiến để thử đồ ảo một cách nhanh chóng và chính xác
              </CardDescription>
            </motion.div>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-8">{/* Person Image Card */}
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Ảnh Người Mẫu</CardTitle>
                <CardDescription>
                  Tải lên ảnh của bạn hoặc chọn từ thư viện ảnh mẫu
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-base font-semibold">Tải lên ảnh của bạn</Label>
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
                    className="aspect-[2/3]"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Hoặc chọn ảnh mẫu</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handlePersonExampleChange('left')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handlePersonExampleChange('right')}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 relative group cursor-pointer" onClick={handleSelectPersonExample}>
                  <Image
                    src={personExamples[currentPersonExample]}
                    alt={`Person example ${currentPersonExample + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Chọn ảnh này
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpenVirtualModelSelector}
                    className="w-full"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Chọn Avatar Ảo
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Garment Image Card */}
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <Shirt className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Ảnh Trang Phục</CardTitle>
                <CardDescription>
                  Tải lên ảnh trang phục bạn muốn thử
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    className="aspect-[2/3]"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Hoặc chọn ảnh mẫu</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleGarmentExampleChange('left')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleGarmentExampleChange('right')}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 relative group cursor-pointer" onClick={handleSelectGarmentExample}>
                  <Image
                    src={garmentExamples[currentGarmentExample]}
                    alt={`Garment example ${currentGarmentExample + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Chọn ảnh này
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Loại trang phục</Label>
              <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tops" id="tops" />
                    <Label htmlFor="tops">Áo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottoms" id="bottoms" />
                    <Label htmlFor="bottoms">Quần</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dresses" id="dresses" />
                    <Label htmlFor="dresses">Váy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="outerwear" id="outerwear" />
                    <Label htmlFor="outerwear">Áo khoác</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Controls Section */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
          <div className="absolute inset-0 gradient-bg-subtle opacity-30"></div>
          <CardContent className="relative z-10 p-8">
            {(!personImageUpload.imageFile && !selectedVirtualModel) || !garmentImageUpload.imageFile ? (
              <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm text-center">
                  Vui lòng tải lên cả ảnh người mẫu và ảnh trang phục để bắt đầu thử đồ
                </p>
              </div>
            ) : null}

            <div className="space-y-10">
              <div className="text-center">
                <Button
                  type="submit"
                  disabled={isLoading || (!personImageUpload.imageFile && !selectedVirtualModel) || !garmentImageUpload.imageFile}
                  size="lg"
                  className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-3" />
                      Thử Đồ Ngay
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Đặt lại
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsTipsModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  Mẹo sử dụng
                </Button>
              </div>

              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl"
                >
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 dark:text-red-300 text-sm">{errorMessage}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Try-On Results Section */}
      {(isLoading || resultGallery.length > 0) && (
        <Card className="bg-gradient-to-br from-background via-background to-muted/20">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Kết Quả Thử Đồ</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Xem kết quả thử đồ ảo của bạn
                  </CardDescription>
                </div>
              </div>

              {resultGallery.length > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsComparisonMode(!isComparisonMode)}
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    {isComparisonMode ? 'Tắt so sánh' : 'So sánh'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 space-y-6"
              >
                <div className="relative">
                  <div className="h-20 w-20 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 animate-spin" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-center">Đang xử lý ảnh...</p>
                  <p className="text-sm text-muted-foreground text-center">
                    AI đang tạo ra kết quả thử đồ tuyệt vời cho bạn
                  </p>
                </div>
              </motion.div>
            )}

            {!isLoading && resultGallery.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {resultGallery.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-[2/3] flex items-center justify-center overflow-hidden">
                      <Image
                        src={result}
                        alt={`Try-on result ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="absolute top-2 left-2 z-10">
                      <div className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm shadow-lg",
                        "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      )}>
                        Kết quả {index + 1}
                      </div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                      <div className="bg-blue-600/90 text-white py-2 px-4 rounded-full text-sm flex items-center gap-2 shadow-lg backdrop-blur-sm border border-white/20">
                        <Sparkles className="w-4 h-4" />
                        Kết quả AI
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <TipsModal
        isOpen={isTipsModalOpen}
        onClose={() => setIsTipsModalOpen(false)}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={saveApiKey}
      />

      <AnimatePresence>
        {isVirtualModelSelectorOpen && (
          <VirtualModelSelector
            onClose={handleCloseVirtualModelSelector}
            onSelect={handleSelectVirtualModel}
            onCreateNew={() => handleOpenVirtualModelForm()}
            onEdit={(model) => {
              setEditingVirtualModel(model);
              setIsVirtualModelFormOpen(true);
              setIsVirtualModelSelectorOpen(false);
            }}
            selectedModelId={selectedVirtualModel?.id}
          />
        )}

        {isVirtualModelFormOpen && (
          <VirtualModelForm
            onClose={handleCloseVirtualModelForm}
            onSave={handleSaveVirtualModel}
            editModel={editingVirtualModel}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
