'use client';

import { VirtualModelForm, VirtualModelSelector } from '@/components/forms';
import OptimizedHomePage from '@/components/home/OptimizedHomePage';
import { useApiKey, useImageUpload, useVirtualModels } from '@/hooks';
import { CreateVirtualModelInput, VirtualModel } from '@/types';
import { FormEvent, useState } from 'react';

export default function HomePage() {
  const { apiKey } = useApiKey();
  const { createVirtualModel, updateVirtualModel } = useVirtualModels();
  const [selectedVirtualModel, setSelectedVirtualModel] = useState<VirtualModel | null>(null);
  const personImageUpload = useImageUpload();
  const garmentImageUpload = useImageUpload();
  const [selectedCategory, setSelectedCategory] = useState<string>('tops');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resultGallery, setResultGallery] = useState<string[]>([]);
  const [isComparisonMode, setIsComparisonMode] = useState(false);

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
      formData.append('apiKey', apiKey || '');
      
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

  return (
    <>
      <OptimizedHomePage
        apiKey={apiKey}
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
    </>
  );
}
