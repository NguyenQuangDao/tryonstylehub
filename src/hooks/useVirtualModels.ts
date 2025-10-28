import { CreateVirtualModelInput, VirtualModel } from '@/types';
import { useCallback, useState } from 'react';

export interface UseVirtualModelsReturn {
  virtualModels: VirtualModel[];
  selectedVirtualModel: VirtualModel | null;
  isLoading: boolean;
  error: string | null;
  fetchVirtualModels: () => Promise<void>;
  selectVirtualModel: (model: VirtualModel | null) => void;
  saveVirtualModel: (modelData: CreateVirtualModelInput) => Promise<void>;
  deleteVirtualModel: (id: number) => Promise<void>;
}

export const useVirtualModels = (): UseVirtualModelsReturn => {
  const [virtualModels, setVirtualModels] = useState<VirtualModel[]>([]);
  const [selectedVirtualModel, setSelectedVirtualModel] = useState<VirtualModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVirtualModels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/virtual-models');
      if (response.ok) {
        const data = await response.json();
        setVirtualModels(data.virtualModels || []);
      } else {
        throw new Error('Failed to fetch virtual models');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching virtual models:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectVirtualModel = useCallback((model: VirtualModel | null) => {
    setSelectedVirtualModel(model);
  }, []);

  const saveVirtualModel = useCallback(async (modelData: CreateVirtualModelInput) => {
    try {
      setError(null);
      const response = await fetch('/api/virtual-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save virtual model');
      }

      await fetchVirtualModels();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, [fetchVirtualModels]);

  const deleteVirtualModel = useCallback(async (id: number) => {
    try {
      setError(null);
      const response = await fetch(`/api/virtual-models?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete virtual model');
      }

      await fetchVirtualModels();
      
      // Clear selection if deleted model was selected
      if (selectedVirtualModel?.id === id) {
        setSelectedVirtualModel(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, [fetchVirtualModels, selectedVirtualModel]);

  return {
    virtualModels,
    selectedVirtualModel,
    isLoading,
    error,
    fetchVirtualModels,
    selectVirtualModel,
    saveVirtualModel,
    deleteVirtualModel,
  };
};
