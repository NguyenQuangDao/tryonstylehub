'use client';

import { useState, FormEvent } from 'react';
import OptimizedHomePage from '@/components/home/OptimizedHomePage';
import { VirtualModelForm, VirtualModelSelector } from '@/components/forms';
import ApiKeyModal from '@/components/modals/ApiKeyModal';
import TipsModal from '@/components/modals/TipsModal';
import { useApiKey, useVirtualModels, useImageUpload } from '@/hooks';
import { VirtualModel, CreateVirtualModelInput } from '@/types';

export default function HomePage() {
  const { apiKey, saveApiKey } = useApiKey();
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
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isVirtualModelSelectorOpen, setIsVirtualModelSelectorOpen] = useState(false);
  const [isVirtualModelFormOpen, setIsVirtualModelFormOpen] = useState(false);
  const [editingVirtualModel, setEditingVirtualModel] = useState<VirtualModel | null>(null);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

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
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Có lỗi xảy ra khi thử đồ ảo');
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
        setIsApiKeyModalOpen={setIsApiKeyModalOpen}
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
        setIsTipsModalOpen={setIsTipsModalOpen}
        onSubmit={handleSubmit}
      />

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={saveApiKey}
      />

      <TipsModal
        isOpen={isTipsModalOpen}
        onClose={() => setIsTipsModalOpen(false)}
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
