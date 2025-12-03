'use client';

import { VirtualModelForm, VirtualModelSelector } from '@/components/forms';
import OptimizedHomePage from '@/components/home/OptimizedHomePage';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useImageUpload, useVirtualModels } from '@/hooks';
import { CreateVirtualModelInput, VirtualModel } from '@/types';
import { ExternalLink, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

export default function HomePage() {
  const { createVirtualModel, updateVirtualModel } = useVirtualModels();
  const [selectedVirtualModel, setSelectedVirtualModel] = useState<VirtualModel | null>(null);
  const personImageUpload = useImageUpload();
  const garmentImageUpload = useImageUpload();
  const [selectedCategory, setSelectedCategory] = useState<string>('tops');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resultGallery, setResultGallery] = useState<string[]>([]);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Array<{ id: number; name: string; price: number; imageUrl: string; styleTags: string[]; shop: { name: string; url: string } }>>([]);
  const [featuredLoading, setFeaturedLoading] = useState<boolean>(false);

  // Modal states
  const [isVirtualModelSelectorOpen, setIsVirtualModelSelectorOpen] = useState(false);
  const [isVirtualModelFormOpen, setIsVirtualModelFormOpen] = useState(false);
  const [editingVirtualModel, setEditingVirtualModel] = useState<VirtualModel | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!personImageUpload.imagePreview && !selectedVirtualModel) {
      setErrorMessage('Vui lòng chọn ảnh người hoặc người mẫu ảo');
      return;
    }

    if (!garmentImageUpload.imagePreview) {
      setErrorMessage('Vui lòng chọn ảnh trang phục');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('category', selectedCategory);

      if (selectedVirtualModel) {
        formData.append('virtualModelId', selectedVirtualModel.id.toString());
      } else if (personImageUpload.imageFile) {
        formData.append('personImage', personImageUpload.imageFile);
      }

      if (garmentImageUpload.imageFile) {
        formData.append('garmentImage', garmentImageUpload.imageFile);
      }

      const response = await fetch('/api/tryon', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Có lỗi xảy ra khi thử đồ ảo');
      }

      const result = await response.json();
      setResultGallery(result.images || []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVirtualModelSave = async (data: CreateVirtualModelInput) => {
    try {
      if (editingVirtualModel) {
        await updateVirtualModel(editingVirtualModel.id, data);
      } else {
        await createVirtualModel(data);
      }
      setIsVirtualModelFormOpen(false);
      setEditingVirtualModel(null);
    } catch (error) {
      console.error('Error saving virtual model:', error);
    }
  };

  // Load featured products
  useEffect(() => {
    const run = async () => {
      try {
        setFeaturedLoading(true);
        const res = await fetch('/api/products');
        const data = await res.json();
        if (res.ok) {
          const list = (data.products || []) as typeof featuredProducts;
          const featured = list.filter((p) => Array.isArray(p.styleTags) && p.styleTags.includes('featured')).slice(0, 6);
          setFeaturedProducts(featured);
        }
      } catch { }
      finally {
        setFeaturedLoading(false);
      }
    };
    run();
  }, []);

  // Prefill from query params for seamless integration
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const garmentImage = url.searchParams.get('garmentImage');
      const category = url.searchParams.get('category');
      if (category) setSelectedCategory(category);
      if (garmentImage) {
        garmentImageUpload.loadExampleImage(garmentImage);
      }
    } catch {}
  }, []);

  return (
    <>
      <OptimizedHomePage
        selectedVirtualModel={selectedVirtualModel}
        setIsVirtualModelSelectorOpen={setIsVirtualModelSelectorOpen}
        personImageUpload={personImageUpload}
        garmentImageUpload={garmentImageUpload}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isLoading={isLoading}
        errorMessage={errorMessage}
        resultGallery={resultGallery}
        isComparisonMode={isComparisonMode}
        setIsComparisonMode={setIsComparisonMode}
        onClearSelectedVirtualModel={() => setSelectedVirtualModel(null)}
        onSubmit={handleSubmit}
      />


      {isVirtualModelSelectorOpen && (
        <VirtualModelSelector
          onClose={() => setIsVirtualModelSelectorOpen(false)}
          onSelect={(model) => {
            setSelectedVirtualModel(model);
            setIsVirtualModelSelectorOpen(false);
          }}
          onEdit={(model) => {
            setEditingVirtualModel(model);
            setIsVirtualModelFormOpen(true);
            setIsVirtualModelSelectorOpen(false);
          }}
          onCreateNew={() => {
            setEditingVirtualModel(null);
            setIsVirtualModelFormOpen(true);
            setIsVirtualModelSelectorOpen(false);
          }}
          selectedModelId={selectedVirtualModel?.id}
        />
      )}

      {isVirtualModelFormOpen && (
        <VirtualModelForm
          onClose={() => {
            setIsVirtualModelFormOpen(false);
            setEditingVirtualModel(null);
          }}
          onSave={handleVirtualModelSave}
          editModel={editingVirtualModel}
        />
      )}

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto mt-12 px-4">
        <h2 className="text-2xl font-bold mb-4">Sản phẩm nổi bật</h2>
        {featuredLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-28" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Chưa có sản phẩm nổi bật</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <Badge className="absolute top-4 right-4">
                    ${product.price.toFixed(2)}
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">{product.shop.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1" aria-label={`Xem chi tiết sản phẩm ${product.name}`}>
                      <Link href={`/products/${product.id}`}>Xem chi tiết</Link>
                    </Button>
                    <Button asChild variant="outline" aria-label={`Mở cửa hàng ${product.shop.name}`}>
                      <a href={product.shop.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Mua ngay
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
