'use client';

import { VirtualModelForm, VirtualModelSelector } from '@/components/forms';
import OptimizedHomePage from '@/components/home/OptimizedHomePage';
import { InsufficientTokensModal } from '@/components/tokens/TokenComponents';
import { TOKEN_CONFIG } from '@/config/tokens';
import { useImageUpload, useVirtualModels } from '@/hooks';
import { useAuth } from '@/lib/auth-context';
import { CreateVirtualModelInput, VirtualModel } from '@/types';
import { FormEvent, useEffect, useState } from 'react';

export default function HomePage() {
  const { user, refetchUser } = useAuth()
  const { createVirtualModel, updateVirtualModel } = useVirtualModels();
  const [selectedVirtualModel, setSelectedVirtualModel] = useState<VirtualModel | null>(null);
  const personImageUpload = useImageUpload();
  const garmentImageUpload = useImageUpload();
  const [prefilledGarmentUrl, setPrefilledGarmentUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('tops');
  const [quality, setQuality] = useState<'standard' | 'high'>('standard')
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
  const [insufficientOpen, setInsufficientOpen] = useState(false)
  const [insufficientInfo, setInsufficientInfo] = useState<{ required: number; current: number; operation: string }>({ required: TOKEN_CONFIG.COSTS.TRY_ON_STANDARD.amount, current: 0, operation: 'Phối đồ ảo' })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!personImageUpload.imagePreview && !selectedVirtualModel) {
      setErrorMessage('Vui lòng chọn ảnh người hoặc người mẫu ảo');
      return;
    }

    if (!garmentImageUpload.imagePreview && !prefilledGarmentUrl) {
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
      } else if (prefilledGarmentUrl) {
        formData.append('garmentImageUrl', prefilledGarmentUrl);
      }
      formData.append('quality', quality)

      const response = await fetch('/api/tryon', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 402 && errorData?.insufficientTokens) {
          const required = quality === 'high' ? TOKEN_CONFIG.COSTS.TRY_ON_HIGH.amount : TOKEN_CONFIG.COSTS.TRY_ON_STANDARD.amount
          setInsufficientInfo({
            required,
            current: errorData.details?.current || (user?.tokenBalance ?? 0),
            operation: quality === 'high' ? 'Phối đồ ảo (cao)' : 'Phối đồ ảo (thường)'
          })
          setInsufficientOpen(true)
          setIsLoading(false)
          return
        }
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
        setPrefilledGarmentUrl(garmentImage);
        garmentImageUpload.loadExampleImage(`/api/image-proxy?url=${encodeURIComponent(garmentImage)}`);
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
        quality={quality}
        setQuality={setQuality}
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

      <InsufficientTokensModal
        isOpen={insufficientOpen}
        onClose={() => setInsufficientOpen(false)}
        required={insufficientInfo.required}
        current={insufficientInfo.current}
        operation={insufficientInfo.operation}
      />
    </>
  );
}
