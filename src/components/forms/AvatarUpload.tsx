"use client";

import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';

interface AvatarUploadProps {
  onImageUploaded?: (imageUrl: string) => void;
  onError?: (error: string) => void;
  className?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  existingImage?: string | null; // URL of existing image
}

export default function AvatarUpload({
  onImageUploaded,
  onError,
  className = "",
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  existingImage = null
}: AvatarUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(existingImage);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Only ${acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} files are allowed.`;
    }

    if (file.size > maxSize * 1024 * 1024) {
      return `File too large. Maximum size is ${maxSize}MB.`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/avatar/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedImage(result.data.url);
        onImageUploaded?.(result.data.url);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setError(null);
  };

  return (
    <div className={`w-full ${className}`}>
      {!uploadedImage ? (
        <motion.div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging 
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${error ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <input
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          <div className="flex flex-col items-center space-y-4">
            {isUploading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Upload className="w-12 h-12 text-blue-500" />
                </motion.div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Uploading...
                </p>
              </>
            ) : (
              <>
                <div className={`p-4 rounded-full ${error ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {error ? (
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Drop your avatar image here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    or click to browse files
                  </p>
                </div>

                <div className="text-xs text-gray-400 dark:text-gray-500">
                  <p>Supported formats: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}</p>
                  <p>Maximum size: {maxSize}MB</p>
                </div>
              </>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md"
            >
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </p>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <Image
              src={uploadedImage}
              alt="Uploaded avatar"
              width={400}
              height={400}
              className="w-full h-64 object-cover"
            />
            
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md"
          >
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Avatar uploaded successfully!
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}