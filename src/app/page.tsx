'use client';

import { CreateVirtualModelInput, VirtualModel } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb, RefreshCw, Shirt, Sparkles, UserRound, Users, X, Zap } from 'lucide-react';
import Image from 'next/image';
import pica from 'pica';
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { ReactCompareSlider, ReactCompareSliderImage, useReactCompareSliderRef } from 'react-compare-slider';
import ApiKeyModal from './components/ApiKeyModal';
import TipsModal from './components/TipsModal';
import VirtualModelForm from './components/VirtualModelForm';
import VirtualModelSelector from './components/VirtualModelSelector';
import Button from './components/ui/button';
import Checkbox from './components/ui/checkbox';
import { Dropdown } from './components/ui/dropdown';
import FileInput from './components/ui/file-input';
import RadioGroup from './components/ui/radio-group';
import { cn } from './lib/utils';

// Map display names to API values
const CATEGORY_API_MAPPING: { [key: string]: string } = {
  "Auto": "auto",
  "Top": "tops",
  "Bottom": "bottoms",
  "Full-body": "one-pieces"
};

// Sample images for examples
const modelExamples = [
  'https://mjc1kvq4a1.ufs.sh/f/7ZFSVc14Zv0C8dvOAdbI21g63JATVpzHqifdbOhcmUeZFvPl',
  'https://mjc1kvq4a1.ufs.sh/f/7ZFSVc14Zv0Csg1xV5QSBjvaUSEcZtbnN695WHDuFpOqyYmi',
  'https://mjc1kvq4a1.ufs.sh/f/7ZFSVc14Zv0CHZRDgQFXB9Y7ge5vh286IQ1uZocGnkCqxSOa',
  'https://mjc1kvq4a1.ufs.sh/f/7ZFSVc14Zv0CAOAqzwJROP5XLHFwxVJrYC3gjzd9SsckvIKo',
  '/models/model-example.png',
];

const garmentExamples = [
  // '/garments/garment-example.jpg',
  '/garments/women-dress.png',
  '/garments/man-shirt.png',
];

const MAX_IMAGE_HEIGHT = 2000;
const JPEG_QUALITY = 0.95;



export default function Home() {
  // Input states
  const [modelImageFile, setModelImageFile] = useState<File | null>(null);
  const [modelImagePreview, setModelImagePreview] = useState<string | null>(null);
  const [garmentImageFile, setGarmentImageFile] = useState<File | null>(null);
  const [garmentImagePreview, setGarmentImagePreview] = useState<string | null>(null);

  // API parameter states
  const [segmentationFree, setSegmentationFree] = useState(true);
  const [garmentPhotoType, setGarmentPhotoType] = useState('Auto');
  const [category, setCategory] = useState('Auto');
  const [mode, setMode] = useState('Quality');
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1000000));
  const [numSamples, setNumSamples] = useState<number>(1);
  const [modelVersion, setModelVersion] = useState('tryon-v1.6');
  const [comparison, setComparison] = useState(false);
  const [comparisonModel1, setComparisonModel1] = useState('tryon-v1.5');
  const [comparisonModel2, setComparisonModel2] = useState('tryon-v1.6');

  // Output states
  const [resultGallery, setResultGallery] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Advanced settings toggle
  // const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Tips modal state
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);

  // Example carousel states
  const [modelExampleIndex, setModelExampleIndex] = useState(0);
  const [garmentExampleIndex, setGarmentExampleIndex] = useState(0);

  // Results modal state
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  // Comparison modal state
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [selectedResults, setSelectedResults] = useState<number[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Animation state for comparison slider
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'right' | 'left'>('right');

  // Ref for programmatic control of the comparison slider
  const compareSliderRef = useReactCompareSliderRef();

  // API key modal state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  // Virtual Model states
  const [isVirtualModelSelectorOpen, setIsVirtualModelSelectorOpen] = useState(false);
  const [isVirtualModelFormOpen, setIsVirtualModelFormOpen] = useState(false);
  const [selectedVirtualModel, setSelectedVirtualModel] = useState<VirtualModel | null>(null);
  const [editingVirtualModel, setEditingVirtualModel] = useState<VirtualModel | null>(null);
  const [virtualModels, setVirtualModels] = useState<VirtualModel[]>([]);
  const [isLoadingVirtualModels, setIsLoadingVirtualModels] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('fashn_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Load virtual models on mount
  useEffect(() => {
    fetchVirtualModels();
  }, []);

  const fetchVirtualModels = async () => {
    try {
      setIsLoadingVirtualModels(true);
      const response = await fetch('/api/virtual-models');
      if (response.ok) {
        const data = await response.json();
        setVirtualModels(data.virtualModels || []);
      }
    } catch (error) {
      console.error('Error fetching virtual models:', error);
    } finally {
      setIsLoadingVirtualModels(false);
    }
  };

  // Handle navigating results in modal
  const navigateResult = useCallback((direction: 'prev' | 'next') => {
    setCurrentResultIndex(prevIndex => {
      if (direction === 'prev' && prevIndex > 0) {
        return prevIndex - 1;
      }
      if (direction === 'next' && prevIndex < resultGallery.length - 1) {
        return prevIndex + 1;
      }
      return prevIndex;
    });
  }, [resultGallery.length]);

  // Keyboard navigation for results modal
  useEffect(() => {
    if (!isResultsModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateResult('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateResult('next');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsResultsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isResultsModalOpen, navigateResult]);

  // Handle saving API key
  const handleSaveApiKey = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('fashn_api_key', newApiKey);
    setIsApiKeyModalOpen(false);
  };

  // Virtual Model handlers
  const handleOpenVirtualModelSelector = () => {
    setIsVirtualModelSelectorOpen(true);
  };

  const handleCloseVirtualModelSelector = () => {
    setIsVirtualModelSelectorOpen(false);
  };

  const handleOpenVirtualModelForm = () => {
    setEditingVirtualModel(null);
    setIsVirtualModelFormOpen(true);
    setIsVirtualModelSelectorOpen(false);
  };

  const handleCloseVirtualModelForm = () => {
    setIsVirtualModelFormOpen(false);
    setEditingVirtualModel(null);
  };

  const handleEditVirtualModel = (model: VirtualModel) => {
    setEditingVirtualModel(model);
    setIsVirtualModelFormOpen(true);
    setIsVirtualModelSelectorOpen(false);
  };

  const handleSelectVirtualModel = (model: VirtualModel) => {
    setSelectedVirtualModel(model);
    setIsVirtualModelSelectorOpen(false);
    // Refresh the list after selection
    fetchVirtualModels();
  };

  const handleQuickSelectVirtualModel = (modelId: string) => {
    if (modelId === '') {
      setSelectedVirtualModel(null);
      return;
    }
    const model = virtualModels.find(m => m.id === parseInt(modelId));
    if (model) {
      setSelectedVirtualModel(model);
    }
  };

  const handleSaveVirtualModel = async (modelData: CreateVirtualModelInput) => {
    try {
      const method = editingVirtualModel ? 'PUT' : 'POST';
      const url = editingVirtualModel
        ? `/api/virtual-models?id=${editingVirtualModel.id}`
        : '/api/virtual-models';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save virtual model');
      }

      const data = await response.json();

      // If we just edited, update the selected model if it was selected
      if (editingVirtualModel && selectedVirtualModel?.id === editingVirtualModel.id) {
        setSelectedVirtualModel(data.virtualModel);
      }

      // Refresh virtual models list
      await fetchVirtualModels();

      handleCloseVirtualModelForm();
    } catch (err: unknown) {
      const error = err as Error;
      throw new Error(error.message || 'Có lỗi xảy ra khi lưu người mẫu ảo');
    }
  };

  // Automated comparison slider animation
  useEffect(() => {
    let animationActive = true;

    if (isAnimating && compareSliderRef.current) {
      const animateSlider = async () => {
        let step = 0;
        while (animationActive && isAnimating) {
          const positions = [85, 25, 50];
          const directions: ('right' | 'left')[] = ['right', 'left', 'right'];

          const currentPos = positions[step % positions.length];
          const currentDir = directions[step % directions.length];

          if (compareSliderRef.current && animationActive) {
            compareSliderRef.current.setPosition(currentPos);
            setSliderPosition(currentPos);
            setAnimationDirection(currentDir);
            await new Promise(resolve => setTimeout(resolve, 2500));
          }

          step++;
        }
      };

      animateSlider();
    }

    return () => {
      animationActive = false;
    };
  }, [isAnimating, compareSliderRef]);

  // Animation control functions
  const startSliderAnimation = () => setIsAnimating(true);
  const stopSliderAnimation = () => setIsAnimating(false);
  const resetSliderPosition = () => {
    setIsAnimating(false);
    setSliderPosition(50);
    setAnimationDirection('right');
    compareSliderRef.current?.setPosition(50);
  };

  // Touch/swipe handlers for model examples
  const handleModelSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && modelExampleIndex > 0) {
      setModelExampleIndex(modelExampleIndex - 1);
    } else if (direction === 'right' && modelExampleIndex < modelExamples.length - 1) {
      setModelExampleIndex(modelExampleIndex + 1);
    }
  };

  // Touch/swipe handlers for garment examples
  const handleGarmentSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && garmentExampleIndex > 0) {
      setGarmentExampleIndex(garmentExampleIndex - 1);
    } else if (direction === 'right' && garmentExampleIndex < garmentExamples.length - 1) {
      setGarmentExampleIndex(garmentExampleIndex + 1);
    }
  };

  // File input change handler
  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    setImageFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));

      // Clear validation errors when both images are available
      if (setImageFile === setModelImageFile && garmentImageFile) {
        setError(null);
      } else if (setImageFile === setGarmentImageFile && modelImageFile) {
        setError(null);
      }
    } else {
      setImageFile(null);
      setPreview(null);
    }
  };

  // Handle opening results modal
  const openResultsModal = (index: number) => {
    setCurrentResultIndex(index);
    setIsResultsModalOpen(true);
  };

  // Handle comparison mode
  const toggleComparisonMode = () => {
    setIsComparisonMode(!isComparisonMode);
    setSelectedResults([]);
  };

  const handleResultSelection = (index: number) => {
    if (!isComparisonMode) {
      openResultsModal(index);
      return;
    }

    if (selectedResults.includes(index)) {
      setSelectedResults(selectedResults.filter(i => i !== index));
    } else if (selectedResults.length < 2) {
      const newSelection = [...selectedResults, index];
      setSelectedResults(newSelection);

      // Auto-open comparison modal when 2 results are selected
      if (newSelection.length === 2) {
        setIsComparisonModalOpen(true);
      }
    }
  };

  const closeComparisonModal = () => {
    setIsComparisonModalOpen(false);
    setSelectedResults([]);
    setIsComparisonMode(false);
    setIsAnimating(false);
    setSliderPosition(50);
    setAnimationDirection('right');
    compareSliderRef.current?.setPosition(50);
  };

  // Load example images
  const loadExampleImage = async (
    imageUrl: string,
    setImageFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void
  ) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
      const file = new File([blob], filename, { type: blob.type });
      setImageFile(file);
      setPreview(URL.createObjectURL(file));

      // Clear validation errors when both images are available
      if (setImageFile === setModelImageFile && garmentImageFile) {
        setError(null);
      } else if (setImageFile === setGarmentImageFile && modelImageFile) {
        setError(null);
      }
    } catch (err) {
      console.error("Failed to load example image:", err);
      setError("Không thể tải ảnh mẫu.");
    }
  };

  // Clear all form data
  const handleReset = () => {
    setModelImageFile(null);
    setModelImagePreview(null);
    setGarmentImageFile(null);
    setGarmentImagePreview(null);
    setResultGallery([]);
    setError(null);
    setSegmentationFree(true);
    setGarmentPhotoType('Auto');
    setCategory('Auto');
    setMode('Quality');
    setSeed(Math.floor(Math.random() * 1000000));
    setNumSamples(1);
    setModelVersion('tryon-v1.6');
    setComparison(false);
    setComparisonModel1('tryon-v1.5');
    setComparisonModel2('tryon-v1.6');
    setIsComparisonMode(false);
    setSelectedResults([]);
    setIsComparisonModalOpen(false);
  };

  /**
   * Resize image using pica for high-quality downscaling
   * - Uses Lanczos filtering for better quality
   * - Maintains aspect ratio
   * - Returns resized File object
   */
  const resizeImagePica = async (file: File, maxDimension = MAX_IMAGE_HEIGHT): Promise<File> => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.src = objectUrl;

    await img.decode();
    const { width, height } = img;

    // If both dimensions are below the threshold, skip resizing
    if (width <= maxDimension && height <= maxDimension) {
      URL.revokeObjectURL(objectUrl);
      return file;
    }

    // Calculate new dimensions (fit: inside)
    const aspect = width / height;
    let newWidth, newHeight;
    if (width > height) {
      newWidth = maxDimension;
      newHeight = Math.round(maxDimension / aspect);
    } else {
      newHeight = maxDimension;
      newWidth = Math.round(maxDimension * aspect);
    }

    // Source canvas
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    const ctx = sourceCanvas.getContext('2d');
    ctx?.drawImage(img, 0, 0);

    // Target canvas
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = newWidth;
    targetCanvas.height = newHeight;

    // Use pica for high-quality downscale (Lanczos)
    const picaInstance = pica();
    await picaInstance.resize(sourceCanvas, targetCanvas);

    // Convert to Blob, then to File
    const outputBlob = await picaInstance.toBlob(targetCanvas, file.type || 'image/png', JPEG_QUALITY);
    const resizedFile = new File([outputBlob], file.name, { type: outputBlob.type });

    URL.revokeObjectURL(objectUrl);
    return resizedFile;
  };

  // Convert file to base64
  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!modelImageFile || !garmentImageFile) {
      setError("Vui lòng chọn cả ảnh người mẫu và ảnh trang phục.");
      return;
    }

    // No need to check API key here - backend will use env var if available
    // Only show modal if backend explicitly requires it

    setIsLoading(true);
    setError(null);

    try {
      // Preprocess images according to FASHN API best practices
      // Base64 encoding is used for simplicity, though CDN-hosted images are recommended for production
      let modelImageBase64, garmentImageBase64;

      try {
        const resizedModelFile = await resizeImagePica(modelImageFile);
        const resizedGarmentFile = await resizeImagePica(garmentImageFile);
        modelImageBase64 = await fileToBase64(resizedModelFile);
        garmentImageBase64 = await fileToBase64(resizedGarmentFile);
      } catch (preprocessError) {
        console.warn('Image preprocessing failed, falling back to direct base64 conversion:', preprocessError);
        modelImageBase64 = await fileToBase64(modelImageFile);
        garmentImageBase64 = await fileToBase64(garmentImageFile);
      }

      const basePayload = {
        model_image: modelImageBase64,
        garment_image: garmentImageBase64,
        garment_photo_type: garmentPhotoType.toLowerCase(),
        category: CATEGORY_API_MAPPING[category],
        mode: mode.toLowerCase(),
        segmentation_free: segmentationFree,
        seed: seed,
        num_samples: numSamples,
        api_key: apiKey || '', // Send empty string if no local key, backend will use env var
      };

      if (comparison) {
        // Run both selected models in parallel for comparison
        const [model1Response, model2Response] = await Promise.all([
          fetch('/api/tryon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...basePayload, model_name: comparisonModel1 }),
          }),
          fetch('/api/tryon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...basePayload, model_name: comparisonModel2 }),
          })
        ]);

        const [model1Data, model2Data] = await Promise.all([
          model1Response.json(),
          model2Response.json()
        ]);

        // Check for errors in either response
        if (!model1Response.ok) {
          if (model1Data.requiresApiKey) {
            setIsApiKeyModalOpen(true);
          }
          throw new Error(`${comparisonModel1} API failed: ${model1Data.error || model1Response.statusText}`);
        }
        if (!model2Response.ok) {
          throw new Error(`${comparisonModel2} API failed: ${model2Data.error || model2Response.statusText}`);
        }

        // Combine results from both APIs
        const model1Results = model1Data.output || [];
        const model2Results = model2Data.output || [];
        setResultGallery([...model1Results, ...model2Results]);

      } else {
        // Single API call
        const payload = { ...basePayload, model_name: modelVersion };

        const response = await fetch('/api/tryon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          // Check if API key is required/invalid
          if (data.requiresApiKey) {
            setIsApiKeyModalOpen(true);
          }
          throw new Error(data.error || `API request failed with status ${response.status}`);
        }

        setResultGallery(data.output || []);
      }

    } catch (err: unknown) {
      console.error("Try-on error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-8 responsive-container">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-section text-center space-y-6 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="floating-element mb-2"
        >
          <h1 className="text-display-lg md:text-display-md lg:text-display-sm font-extrabold modern-gradient-text vietnamese-heading">
            Thử Đồ Ảo AI
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-0 text-body-lg md:text-title-lg lg:text-headline-sm text-gray-700 dark:text-gray-200 max-w-5xl mx-auto font-light vietnamese-text"
        >
          Trải nghiệm công nghệ thử đồ ảo tiên tiến nhất với AI - Xem ngay kết quả trang phục trên người bạn
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 pt-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="flex items-center gap-3 px-6 py-3 glass-effect rounded-2xl shadow-lg bg-white/90 dark:bg-gray-800/90 border border-indigo-200 dark:border-indigo-700/50"
          >
            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-base font-semibold text-gray-800 dark:text-gray-200">AI-Powered</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="flex items-center gap-3 px-6 py-3 glass-effect rounded-2xl shadow-lg bg-white/90 dark:bg-gray-800/90 border border-purple-200 dark:border-purple-700/50"
          >
            <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span className="text-base font-semibold text-gray-800 dark:text-gray-200">Chất Lượng Cao</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="flex items-center gap-3 px-6 py-3 glass-effect rounded-2xl shadow-lg bg-white/90 dark:bg-gray-800/90 border border-pink-200 dark:border-pink-700/50"
          >
            <Shirt className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            <span className="text-base font-semibold text-gray-800 dark:text-gray-200">Thời Trang Hiện Đại</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Tips Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="modern-card glass-effect flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl modern-gradient-bg flex items-center justify-center flex-shrink-0 pulse-glow">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-headline-sm sm:text-headline-md font-semibold text-gray-900 dark:text-gray-100 vietnamese-heading">
              Mẹo để có kết quả tốt nhất
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Khám phá các mẹo và thủ thuật để tối ưu hóa trải nghiệm thử đồ ảo
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsTipsModalOpen(true)}
          className="modern-button bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700"
        >
          <Lightbulb className="h-4 w-4 mr-2 text-yellow-600 dark:text-yellow-400" />
          Xem Mẹo
        </Button>

        <TipsModal
          isOpen={isTipsModalOpen}
          onClose={() => setIsTipsModalOpen(false)}
        />
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2 }}
        onSubmit={handleSubmit}
        className="mt-10 space-y-8"
      >
        {/* Images Section - 2 Column Layout */}
        <div className="modern-grid grid-cols-1 lg:grid-cols-2">
          {/* Model Image Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="modern-card group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg"
                >
                  <UserRound className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-headline-sm md:text-headline-md font-semibold modern-gradient-text vietnamese-heading">
                    Ảnh Người Mẫu
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Tải lên ảnh người mẫu hoặc chọn từ ví dụ
                  </p>
                </div>
              </div>

              {/* Virtual Model Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenVirtualModelSelector}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                title="Quản lý người mẫu ảo"
              >
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium hidden md:inline">Quản lý</span>
              </motion.button>
            </div>

            {/* Virtual Model Quick Select */}
            {!isLoadingVirtualModels && virtualModels.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                      Chưa có người mẫu ảo
                    </h4>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                      Tạo người mẫu ảo với thông số cơ thể của bạn để dễ dàng thử đồ
                    </p>
                    <button
                      onClick={handleOpenVirtualModelForm}
                      className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Tạo ngay →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}


            {/* Selected Virtual Model Info */}
            {selectedVirtualModel && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <UserRound className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                        {selectedVirtualModel.avatarName}
                      </p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        {selectedVirtualModel.height} cm • {selectedVirtualModel.weight} kg • {selectedVirtualModel.gender}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVirtualModel(null)}
                    className="p-1.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </button>
                </div>
              </motion.div>
            )}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {modelImagePreview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <div className="modern-image-container aspect-[2/2.5] max-w-[400px] max-h-[500px] mx-auto flex items-center justify-center overflow-hidden">
                      <Image
                        src={modelImagePreview}
                        alt="Model Preview"
                        className="max-w-full max-h-full object-contain p-4"
                        width={400}
                        height={500}
                        unoptimized
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => {
                        setModelImageFile(null);
                        setModelImagePreview(null);
                      }}
                      className="absolute -top-3 -right-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full p-2 shadow-lg cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="modern-image-container aspect-[2/2.5] max-w-[400px] max-h-[500px] mx-auto border-2 border-dashed border-blue-300 dark:border-blue-700 relative overflow-hidden"
                  >
                    {/* Top overlay with text */}
                    <div className="absolute top-4 left-4 right-4 z-10">
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 backdrop-blur-sm text-white px-4 py-2.5 rounded-full shadow-lg">
                        <UserRound className="h-5 w-5" />
                        <p className="text-sm font-medium">Chọn ảnh người mẫu</p>
                      </div>
                    </div>

                    {/* Main example content taking most space */}
                    {modelExamples.length > 0 ? (
                      <div className="w-full h-full relative">
                        <motion.button
                          key={modelExampleIndex}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.2}
                          onDragEnd={(e, info) => {
                            if (info.offset.x > 50) {
                              handleModelSwipe('left');
                            } else if (info.offset.x < -50) {
                              handleModelSwipe('right');
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            loadExampleImage(modelExamples[modelExampleIndex], setModelImageFile, setModelImagePreview);
                          }}
                          className="w-full h-full cursor-pointer group"
                        >
                          <Image
                            src={modelExamples[modelExampleIndex]}
                            alt={`Model Example ${modelExampleIndex + 1}`}
                            width={400}
                            height={500}
                            className="w-full h-full object-contain pointer-events-none"
                          />

                          {/* Swipe hint overlay */}
                          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/90 dark:bg-gray-900/95 text-black dark:text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-600/30 text-white">
                              👆 Nhấn để sử dụng • Vuốt để xem thêm
                            </div>
                          </div>
                        </motion.button>

                        {/* Navigation controls at bottom */}
                        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-6">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleModelSwipe('left');
                            }}
                            disabled={modelExampleIndex === 0}
                            className="w-10 h-10 rounded-full bg-black/70 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-white/30 dark:border-gray-600/50 flex items-center justify-center disabled:opacity-30 text-white cursor-pointer disabled:cursor-not-allowed"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </motion.button>

                          {/* Dots indicator */}
                          <div className="flex gap-2">
                            {modelExamples.map((_, idx) => (
                              <motion.div
                                key={idx}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === modelExampleIndex ? 'bg-white scale-125' : 'bg-white/50'
                                  }`}
                                whileHover={{ scale: 1.3 }}
                              />
                            ))}
                          </div>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleModelSwipe('right');
                            }}
                            disabled={modelExampleIndex === modelExamples.length - 1}
                            className="w-10 h-10 rounded-full bg-black/70 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-white/30 dark:border-gray-600/50 flex items-center justify-center disabled:opacity-30 text-white cursor-pointer disabled:cursor-not-allowed"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <UserRound className="h-16 w-16 text-blue-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Không có ví dụ
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <FileInput
                onChange={(e) => handleImageChange(e, setModelImageFile, setModelImagePreview)}
                accept="image/*"
                label="Tải lên ảnh người mẫu"
              />

              {virtualModels.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chọn người mẫu ảo của bạn
                  </label>
                  <select
                    value={selectedVirtualModel?.id.toString() || ''}
                    onChange={(e) => handleQuickSelectVirtualModel(e.target.value)}
                    disabled={isLoadingVirtualModels}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Không chọn --</option>
                    {virtualModels.map(model => (
                      <option key={model.id} value={model.id.toString()}>
                        {model.avatarName} ({model.gender === 'male' ? 'Nam' : model.gender === 'female' ? 'Nữ' : 'Phi nhị giới'}, {model.height}cm, {model.weight}kg)
                      </option>
                    ))}
                  </select>
                  {isLoadingVirtualModels && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Đang tải danh sách...
                    </p>
                  )}
                </div>
              )}
              <div className="pt-4">
                <Checkbox
                  checked={segmentationFree}
                  onChange={(e) => setSegmentationFree(e.target.checked)}
                  label="Phân đoạn tự động"
                  description="Để AI tự động xử lý phân đoạn hình ảnh"
                />
              </div>


            </div>
          </motion.div>

          {/* Garment Image Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="modern-card group"
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 flex items-center justify-center shadow-lg"
              >
                <Shirt className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h3 className="text-headline-sm md:text-headline-md font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent vietnamese-heading">
                  Ảnh Trang Phục
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tải lên ảnh trang phục hoặc chọn từ ví dụ
                </p>
              </div>
            </div>
            <div className="space-y-6">

              <AnimatePresence mode="wait">
                {garmentImagePreview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <div className="modern-image-container aspect-[2/2.5] max-w-[400px] max-h-[500px] mx-auto flex items-center justify-center overflow-hidden">
                      <Image
                        src={garmentImagePreview}
                        alt="Garment Preview"
                        className="max-w-full max-h-full object-contain p-4"
                        width={400}
                        height={500}
                        unoptimized
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => {
                        setGarmentImageFile(null);
                        setGarmentImagePreview(null);
                      }}
                      className="absolute -top-3 -right-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full p-2 shadow-lg cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="modern-image-container aspect-[2/2.5] max-w-[400px] max-h-[500px] mx-auto border-2 border-dashed border-purple-300 dark:border-purple-700 relative overflow-hidden"
                  >
                    {/* Top overlay with text */}
                    <div className="absolute top-4 left-4 right-4 z-10">
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-sm text-white px-4 py-2.5 rounded-full shadow-lg">
                        <Shirt className="h-5 w-5" />
                        <p className="text-sm font-medium">Chọn ảnh trang phục</p>
                      </div>
                    </div>

                    {/* Main example content taking most space */}
                    {garmentExamples.length > 0 ? (
                      <div className="w-full h-full relative">
                        <motion.button
                          key={garmentExampleIndex}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.2}
                          onDragEnd={(e, info) => {
                            if (info.offset.x > 50) {
                              handleGarmentSwipe('left');
                            } else if (info.offset.x < -50) {
                              handleGarmentSwipe('right');
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            loadExampleImage(garmentExamples[garmentExampleIndex], setGarmentImageFile, setGarmentImagePreview);
                          }}
                          className="w-full h-full cursor-pointer group"
                        >
                          <Image
                            src={garmentExamples[garmentExampleIndex]}
                            alt={`Garment Example ${garmentExampleIndex + 1}`}
                            width={400}
                            height={500}
                            className="w-full h-full object-contain pointer-events-none"
                          />

                          {/* Swipe hint overlay */}
                          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/90 dark:bg-gray-900/95 text-black dark:text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-600/30 text-white">
                              👆 Nhấn để sử dụng • Vuốt để xem thêm
                            </div>
                          </div>
                        </motion.button>

                        {/* Navigation controls at bottom */}
                        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-6">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGarmentSwipe('left');
                            }}
                            disabled={garmentExampleIndex === 0}
                            className="w-10 h-10 rounded-full bg-black/70 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-white/30 dark:border-gray-600/50 flex items-center justify-center disabled:opacity-30 text-white cursor-pointer disabled:cursor-not-allowed"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </motion.button>

                          {/* Dots indicator */}
                          <div className="flex gap-2">
                            {garmentExamples.map((_, idx) => (
                              <motion.div
                                key={idx}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === garmentExampleIndex ? 'bg-white scale-125' : 'bg-white/50'
                                  }`}
                                whileHover={{ scale: 1.3 }}
                              />
                            ))}
                          </div>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGarmentSwipe('right');
                            }}
                            disabled={garmentExampleIndex === garmentExamples.length - 1}
                            className="w-10 h-10 rounded-full bg-black/70 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-white/30 dark:border-gray-600/50 flex items-center justify-center disabled:opacity-30 text-white cursor-pointer disabled:cursor-not-allowed"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <Shirt className="h-16 w-16 text-purple-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Không có ví dụ
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <FileInput
                onChange={(e) => handleImageChange(e, setGarmentImageFile, setGarmentImagePreview)}
                accept="image/*"
                label="Tải lên ảnh trang phục"
              />

              <div className="pt-2">
                <Dropdown
                  label="⚙️ Cài đặt trang phục"
                  className="mt-2"
                >
                  <div className="space-y-4">
                    <RadioGroup
                      label="Loại ảnh"
                      name="garmentPhotoType"
                      options={[
                        { label: "Tự động", value: "Auto", description: "AI tự động nhận diện loại ảnh" },
                        { label: "Phẳng", value: "Flat-Lay", description: "Ảnh trang phục nằm phẳng" },
                        { label: "Người mẫu", value: "Model", description: "Trang phục được mặc trên người" }
                      ]}
                      value={garmentPhotoType}
                      onChange={setGarmentPhotoType}
                      variant="card"
                      layout="vertical"
                    />

                    <RadioGroup
                      label="Phân loại"
                      name="category"
                      options={[
                        { label: "Tự động", value: "Auto", description: "Tự động phát hiện loại trang phục" },
                        { label: "Áo", value: "Top", description: "Trang phục phần thân trên như áo sơ mi, áo thun" },
                        { label: "Quần", value: "Bottom", description: "Trang phục phần thân dưới như quần, váy" },
                        { label: "Toàn thân", value: "Full-body", description: "Trang phục toàn thân như váy dài, jumpsuit" }
                      ]}
                      value={category}
                      onChange={setCategory}
                    />
                  </div>
                </Dropdown>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls Section - Full Width Below */}
        <div className="modern-card-enhanced relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 gradient-bg-subtle opacity-30"></div>
          <div className="absolute inset-0 opacity-10 dark:opacity-20">
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-pink-500 to-blue-500 dark:from-pink-400 dark:to-blue-400 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="relative z-10">
            {/* Header */}
            {/* <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-3xl gradient-bg-modern flex items-center justify-center shadow-2xl pulse-glow-enhanced">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-headline-lg md:text-display-sm font-bold modern-gradient-text mb-2 vietnamese-heading">
                    Điều Khiển Thử Đồ
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    Cài đặt và điều khiển quá trình thử đồ ảo với AI tiên tiến
                  </p>
                </div>
              </div>
            </div> */}
            {(!modelImageFile || !garmentImageFile) && (
              <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium text-center">
                  ⚠️ Vui lòng tải lên cả ảnh người mẫu và ảnh trang phục để tiếp tục
                </p>
              </div>
            )}
            {/* Main Controls */}
            <div className="space-y-10">
              {/* Primary Action */}
              <div className="text-center">
                <Button
                  type="submit"
                  disabled={isLoading || !modelImageFile || !garmentImageFile}
                  loading={isLoading}
                  className="modern-button-enhanced bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-4">
                      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang tạo kết quả thử đồ...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-4">
                      <Sparkles className="h-8 w-8" />
                      <span>Thử Đồ Ngay</span>
                    </span>
                  )}
                </Button>


              </div>

              {/* Secondary Actions */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="px-10 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-semibold transition-all hover:scale-105 hover:shadow-lg text-gray-700 dark:text-gray-300"
                  title="Đặt lại tất cả"
                >
                  <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="ml-2">Đặt lại</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTipsModalOpen(true)}
                  className="px-10 py-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl font-semibold transition-all hover:scale-105 hover:shadow-lg text-blue-700 dark:text-blue-300"
                >
                  <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="ml-2">Mẹo sử dụng</span>
                </Button>
              </div>

              {/* Status Indicators */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">AI Sẵn sàng</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Chất lượng cao</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-full">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Xử lý nhanh</span>
                </div>
              </div>

              <RadioGroup
                className='hidden'
                label="Run Mode"
                name="mode"
                options={[
                  { label: "Quality", value: "Quality", description: "Highest quality but slower generation" }
                ]}
                value={mode}
                onChange={setMode}
                variant="card"
                layout="horizontal"
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 rounded-xl border-2 border-red-200 dark:border-red-800 max-w-2xl mx-auto"
                >
                  <div className="flex items-start gap-3">
                    <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.form>

      {/* Try-On Results Section */}
      <AnimatePresence mode="wait">
        {(isLoading || resultGallery.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="mt-8"
          >
            <div className="modern-card">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold modern-gradient-text">
                      Kết Quả Thử Đồ
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Xem kết quả thử đồ ảo của bạn
                    </p>
                  </div>
                </div>
                {resultGallery.length > 1 && !isLoading && (
                  <div className="flex items-center gap-2">
                    {isComparisonMode && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Chọn 2 kết quả để so sánh ({selectedResults.length}/2)
                      </span>
                    )}
                    <Button
                      variant={isComparisonMode ? "primary" : "outline"}
                      size="sm"
                      onClick={toggleComparisonMode}
                      className="flex items-center gap-1"
                    >
                      {isComparisonMode ? (
                        <>
                          <X className="h-4 w-4" />
                          Hủy
                        </>
                      ) : (
                        <>
                          ⚖️
                          So Sánh
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 text-center space-y-6"
                    >
                      <div className="relative">
                        <div className="h-20 w-20 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 animate-spin" />
                        <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          Đang tạo kết quả thử đồ ảo...
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-300 animate-pulse">
                          Vui lòng chờ trong giây lát
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="modern-grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    >
                      {resultGallery.map((url, index) => {
                        const isSelected = selectedResults.includes(index);
                        const canSelect = isComparisonMode && (selectedResults.length < 2 || isSelected);

                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              transition: { delay: index * 0.05, duration: 0.2 }
                            }}
                            className={cn(
                              "relative group cursor-pointer",
                              isSelected && "ring-2 ring-blue-500 ring-offset-2",
                              isComparisonMode && !canSelect && "opacity-50 cursor-not-allowed"
                            )}
                            onClick={() => handleResultSelection(index)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleResultSelection(index);
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={isComparisonMode ? `${isSelected ? 'Deselect' : 'Select'} result ${index + 1} for comparison` : `View result ${index + 1} in full screen`}
                          >
                            <div className="modern-image-container aspect-[2/3] flex items-center justify-center overflow-hidden">
                              <Image
                                src={url}
                                alt={`Result ${index + 1}`}
                                className="max-w-full max-h-full object-contain p-3"
                                width={300}
                                height={400}
                                unoptimized
                              />
                            </div>

                            {/* Selection indicator */}
                            {isComparisonMode && (
                              <div className="absolute top-2 left-2 z-10">
                                <div className={cn(
                                  "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold",
                                  isSelected ? "bg-blue-500 border-blue-500 text-white" : "bg-white/90 border-gray-400 text-gray-600"
                                )}>
                                  {isSelected ? selectedResults.indexOf(index) + 1 : ""}
                                </div>
                              </div>
                            )}

                            {/* Hover overlay */}
                            {!isComparisonMode && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 dark:from-white/30 to-transparent">
                                <div className="bg-blue-600/90 dark:bg-blue-500/90 text-white dark:text-gray-900 py-2 px-4 rounded-full text-sm flex items-center gap-2 shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-800/20">
                                  <Zap className="h-4 w-4" />
                                  Nhấn để xem toàn màn hình
                                </div>
                              </div>
                            )}

                            {/* Comparison mode overlay */}
                            {isComparisonMode && canSelect && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-purple-900/60 dark:from-purple-100/30 to-transparent">
                                <div className="bg-purple-600/90 dark:bg-purple-500/90 text-white dark:text-gray-900 py-2 px-4 rounded-full text-sm flex items-center gap-2 shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-800/20">
                                  ⚖️
                                  {isSelected ? 'Bỏ chọn' : 'Chọn để so sánh'}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen Results Modal */}
      <AnimatePresence>
        {isResultsModalOpen && resultGallery.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 w-screen h-screen bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh'
            }}
            onClick={() => setIsResultsModalOpen(false)}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsResultsModalOpen(false)}
                className="absolute top-4 right-4 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 backdrop-blur-sm transition-colors cursor-pointer"
              >
                <X className="h-6 w-6" />
              </motion.button>

              {/* Image counter */}
              <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{currentResultIndex + 1} / {resultGallery.length}</span>
                  {resultGallery.length > 1 && (
                    <span className="text-xs opacity-90">• Dùng phím ← →</span>
                  )}
                </div>
              </div>

              {/* Previous button */}
              {currentResultIndex > 0 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateResult('prev');
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 backdrop-blur-sm transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
              )}

              {/* Next button */}
              {currentResultIndex < resultGallery.length - 1 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateResult('next');
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 backdrop-blur-sm transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              )}

              {/* Main image */}
              <motion.div
                key={currentResultIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-full h-full flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={resultGallery[currentResultIndex]}
                  alt={`Result ${currentResultIndex + 1}`}
                  className="w-auto h-auto max-w-[min(400px,calc(100vw-2rem))] max-h-[min(533px,calc(100vh-2rem))] object-contain"
                  width={1200}
                  height={1600}
                  unoptimized
                />
              </motion.div>

              {/* Download button */}
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={resultGallery[currentResultIndex]}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="absolute bottom-4 right-4 z-10 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 backdrop-blur-sm transition-all shadow-lg cursor-pointer"
                onClick={(e) => e.stopPropagation()}
                style={{ marginRight: '1rem' }}
              >
                <Zap className="h-4 w-4" />
                Tải Xuống
              </motion.a>

              {/* Dots indicator for multiple results */}
              {resultGallery.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
                  {resultGallery.map((_, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentResultIndex(idx);
                      }}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${idx === currentResultIndex ? 'bg-white scale-125' : 'bg-white/50'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {isComparisonModalOpen && selectedResults.length === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 w-screen h-screen bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh'
            }}
            onClick={closeComparisonModal}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeComparisonModal}
                className="absolute top-4 right-4 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 backdrop-blur-sm transition-colors cursor-pointer"
              >
                <X className="h-6 w-6" />
              </motion.button>

              {/* Title and Status Info */}
              <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-full text-sm backdrop-blur-sm shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">⚖️ So Sánh Kết Quả</span>
                  <span className="text-xs opacity-90">• Kéo hoặc dùng tự động</span>
                  {isAnimating && (
                    <div className="text-xs opacity-90 flex items-center gap-1">
                      <span>Đang di chuyển:</span>
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {animationDirection === 'right' ? '→' : '←'}
                      </motion.span>
                      <span className="text-yellow-300 font-semibold">
                        {Math.round(sliderPosition)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Animation Control Buttons */}
              <div
                className="absolute bottom-4 left-4 z-10 bg-black/80 text-white px-5 py-2.5 rounded-full text-sm backdrop-blur-sm shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAnimating) {
                        stopSliderAnimation();
                      } else {
                        startSliderAnimation();
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${isAnimating
                      ? 'bg-red-500/90 hover:bg-red-500 shadow-md'
                      : 'bg-green-500/90 hover:bg-green-500 shadow-md'
                      }`}
                  >
                    {isAnimating ? '⏸️ Tạm Dừng' : '▶️ Tự Động'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      resetSliderPosition();
                    }}
                    className="px-4 py-1.5 bg-blue-500/90 hover:bg-blue-500 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-md"
                  >
                    🔄 Về Giữa
                  </motion.button>
                </div>
              </div>

              {/* Comparison container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="relative w-full h-full flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full max-w-2xl aspect-[2/3] overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                  <ReactCompareSlider
                    ref={compareSliderRef}
                    itemOne={
                      <ReactCompareSliderImage
                        src={resultGallery[selectedResults[0]]}
                        alt={`${comparisonModel1} result`}
                      />
                    }
                    itemTwo={
                      <ReactCompareSliderImage
                        src={resultGallery[selectedResults[1]]}
                        alt={`${comparisonModel2} result`}
                      />
                    }
                    position={sliderPosition}
                    onPositionChange={(position: number) => {
                      if (!isAnimating) {
                        setSliderPosition(position);
                      }
                    }}
                    changePositionOnHover={false}
                    disabled={isAnimating}
                    transition="1.5s ease-in-out"
                    style={{ width: '100%', height: '100%' }}
                  />

                  {/* Model Labels */}
                  <div className="absolute top-1/2 left-3 -translate-y-1/2 z-20 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                    {comparisonModel1.replace('tryon-', '')}
                  </div>
                  <div className="absolute top-1/2 right-3 -translate-y-1/2 z-20 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                    {comparisonModel2.replace('tryon-', '')}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
      />

      {/* Virtual Model Selector Modal */}
      <AnimatePresence>
        {isVirtualModelSelectorOpen && (
          <VirtualModelSelector
            onClose={handleCloseVirtualModelSelector}
            onSelect={handleSelectVirtualModel}
            onCreateNew={handleOpenVirtualModelForm}
            onEdit={handleEditVirtualModel}
            selectedModelId={selectedVirtualModel?.id}
          />
        )}
      </AnimatePresence>

      {/* Virtual Model Form Modal */}
      <AnimatePresence>
        {isVirtualModelFormOpen && (
          <VirtualModelForm
            onClose={handleCloseVirtualModelForm}
            onSave={handleSaveVirtualModel}
            editModel={editingVirtualModel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
