import { useCallback, useState, useEffect } from 'react';

export interface UseImageUploadReturn {
  imageFile: File | null;
  imagePreview: string | null;
  isLoading: boolean;
  error: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearImage: () => void;
  loadExampleImage: (imageUrl: string) => Promise<void>;
  saveImageToStorage: (key: string) => void;
  loadImageFromStorage: (key: string) => void;
}

export const useImageUpload = (storageKey?: string): UseImageUploadReturn => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved image on mount if storageKey is provided
  useEffect(() => {
    if (storageKey) {
      loadImageFromStorage(storageKey);
    }
  }, [storageKey]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
      
      // Auto-save to storage if storageKey is provided
      if (storageKey) {
        saveImageToStorage(storageKey);
      }
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  }, [storageKey]);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    
    // Clear from storage if storageKey is provided
    if (storageKey) {
      localStorage.removeItem(`image_${storageKey}`);
      localStorage.removeItem(`preview_${storageKey}`);
    }
  }, [storageKey]);

  const saveImageToStorage = useCallback((key: string) => {
    if (imageFile && imagePreview) {
      try {
        // Convert file to base64 for storage
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          localStorage.setItem(`image_${key}`, base64);
          localStorage.setItem(`preview_${key}`, imagePreview);
          localStorage.setItem(`filename_${key}`, imageFile.name);
          localStorage.setItem(`filetype_${key}`, imageFile.type);
        };
        reader.readAsDataURL(imageFile);
      } catch (err) {
        console.error('Failed to save image to storage:', err);
      }
    }
  }, [imageFile, imagePreview]);

  const loadImageFromStorage = useCallback((key: string) => {
    try {
      const base64 = localStorage.getItem(`image_${key}`);
      const preview = localStorage.getItem(`preview_${key}`);
      const filename = localStorage.getItem(`filename_${key}`);
      const filetype = localStorage.getItem(`filetype_${key}`);
      
      if (base64 && preview && filename && filetype) {
        // Convert base64 back to file
        fetch(base64)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], filename, { type: filetype });
            setImageFile(file);
            setImagePreview(preview);
          })
          .catch(err => {
            console.error('Failed to restore image from storage:', err);
          });
      }
    } catch (err) {
      console.error('Failed to load image from storage:', err);
    }
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
    saveImageToStorage,
    loadImageFromStorage,
  };
};
