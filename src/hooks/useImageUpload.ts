import { useCallback, useState } from 'react';

export interface UseImageUploadReturn {
  imageFile: File | null;
  imagePreview: string | null;
  isLoading: boolean;
  error: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearImage: () => void;
  loadExampleImage: (imageUrl: string) => Promise<void>;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  }, []);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setError(null);
  }, []);

  const loadExampleImage = useCallback(async (imageUrl: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
      const file = new File([blob], filename, { type: blob.type });
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } catch (err) {
      console.error("Failed to load example image:", err);
      setError("Không thể tải ảnh mẫu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    imageFile,
    imagePreview,
    isLoading,
    error,
    handleImageChange,
    clearImage,
    loadExampleImage,
  };
};
