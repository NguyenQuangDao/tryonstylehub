'use client';

import { CreateVirtualModelInput, VirtualModel } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, CheckCircle, ChevronDown, ChevronUp, Dumbbell, Image as ImageIcon, Maximize2, Minimize2, RotateCcw, Save, Sparkles, Star, User, User as UserIcon, Weight, X, Zap, ZoomIn, ZoomOut } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import AvatarCreator from './AvatarCreator';
import BodyPreview from './BodyPreview';
import Button from './ui/button';
import Input from './ui/input';
import Select from './ui/select';

interface VirtualModelFormProps {
  onClose: () => void;
  onSave: (model: CreateVirtualModelInput) => Promise<void>;
  editModel?: VirtualModel | null;
}

export default function VirtualModelForm({ onClose, onSave, editModel }: VirtualModelFormProps) {
  // Basic Info
  const [avatarName, setAvatarName] = useState(editModel?.avatarName || '');
  const [isPublic, setIsPublic] = useState(editModel?.isPublic || false);
  
  // Required Fields - Body Metrics
  const [height] = useState(editModel?.height?.toString() || '');
  const [weight] = useState(editModel?.weight?.toString() || '');
  const [gender, setGender] = useState(editModel?.gender || 'male');
  
  // Required Fields - Appearance
  const [hairColor, setHairColor] = useState(editModel?.hairColor || 'black');
  const [hairStyle, setHairStyle] = useState(editModel?.hairStyle || 'short');
  
  // Optional Fields - Body Metrics
  const [bodyShape, setBodyShape] = useState(editModel?.bodyShape || '');
  const [skinTone, setSkinTone] = useState(editModel?.skinTone || '');
  const [muscleLevel, setMuscleLevel] = useState(editModel?.muscleLevel?.toString() || '');
  const [fatLevel, setFatLevel] = useState(editModel?.fatLevel?.toString() || '');
  const [shoulderWidth] = useState(editModel?.shoulderWidth?.toString() || '');
  const [waistSize] = useState(editModel?.waistSize?.toString() || '');
  const [hipSize] = useState(editModel?.hipSize?.toString() || '');
  const [legLength] = useState(editModel?.legLength?.toString() || '');
  
  // Optional Fields - Appearance
  const [eyeColor, setEyeColor] = useState(editModel?.eyeColor || '');
  const [faceShape] = useState(editModel?.faceShape || '');
  const [beardStyle] = useState(editModel?.beardStyle || 'none');
  const [tattoos] = useState(editModel?.tattoos || '');
  const [piercings] = useState(editModel?.piercings || '');
  
  // Optional Fields - Style
  const [clothingStyle, setClothingStyle] = useState(editModel?.clothingStyle || '');
  const [footwearType, setFootwearType] = useState(editModel?.footwearType || '');
  const [accessories] = useState<string[]>(
    Array.isArray(editModel?.accessories) ? editModel.accessories : []
  );
  const [colorPalette] = useState<string[]>(
    Array.isArray(editModel?.colorPalette) ? editModel.colorPalette : []
  );
  const [ageAppearance] = useState(editModel?.ageAppearance?.toString() || '');
  const [bodyProportionPreset, setBodyProportionPreset] = useState(editModel?.bodyProportionPreset || '');
  
  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    bodyMetrics: true,
    appearance: true,
    style: false,
    advanced: false,
  });

  // Progress tracking
  const [completionProgress, setCompletionProgress] = useState(0);

  // Preview mode: 'svg' (free, instant) or 'avatar' (3D avatar creator)
  const [previewMode, setPreviewMode] = useState<'svg' | 'avatar'>('svg');
  
  // Avatar preview state
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const [, setAvatarPreviewUrl] = useState<string | null>(null);

  // Zoom & Pan states
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate completion progress
  useEffect(() => {
    const requiredFields = [avatarName, gender, skinTone, hairColor, hairStyle, eyeColor, clothingStyle];
    
    const totalFields = 7; // Only required fields for Avatar Creator
    const filledFields = requiredFields.filter(f => f && f.toString().trim()).length;
    const progress = Math.round((filledFields / totalFields) * 100);
    setCompletionProgress(progress);
  }, [avatarName, gender, skinTone, hairColor, hairStyle, eyeColor, clothingStyle]);

  // Quick templates
  const applyTemplate = (templateId: string) => {
    const templates: Record<string, Partial<CreateVirtualModelInput>> = {
      athlete: {
        bodyShape: 'athletic',
        muscleLevel: 4,
        fatLevel: 2,
        clothingStyle: 'sport',
        footwearType: 'sneaker',
      },
      model: {
        bodyShape: 'slim',
        muscleLevel: 2,
        fatLevel: 2,
        clothingStyle: 'elegant',
        bodyProportionPreset: 'supermodel',
      },
      casual: {
        bodyShape: 'balanced',
        muscleLevel: 3,
        fatLevel: 3,
        clothingStyle: 'casual',
        footwearType: 'sneaker',
      },
      business: {
        bodyShape: 'balanced',
        muscleLevel: 3,
        fatLevel: 3,
        clothingStyle: 'business',
        footwearType: 'formal',
      },
    };

    const template = templates[templateId];
    if (template) {
      if (template.bodyShape) setBodyShape(template.bodyShape);
      if (template.muscleLevel) setMuscleLevel(template.muscleLevel.toString());
      if (template.fatLevel) setFatLevel(template.fatLevel.toString());
      if (template.clothingStyle) setClothingStyle(template.clothingStyle);
      if (template.footwearType) setFootwearType(template.footwearType);
      if (template.bodyProportionPreset) setBodyProportionPreset(template.bodyProportionPreset);
    }
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Mapping function to convert form values to Ready Player Me values
  const mapFormToRPM = () => {
    const skinToneMap: Record<string, string> = {
      'light': 'light',
      'medium': 'medium', 
      'dark': 'dark'
    };

    const hairColorMap: Record<string, string> = {
      'black': 'black',
      'brown': 'brown',
      'blonde': 'blonde',
      'red': 'red',
      'gray': 'gray'
    };

    const hairStyleMap: Record<string, string> = {
      'short': 'short',
      'medium': 'medium',
      'long': 'long',
      'curly': 'curly',
      'straight': 'straight'
    };

    const eyeColorMap: Record<string, string> = {
      'brown': 'brown',
      'blue': 'blue',
      'green': 'green',
      'gray': 'gray'
    };

    const clothingMap: Record<string, string> = {
      'casual': 'casual',
      'formal': 'formal',
      'sport': 'sport',
      'business': 'business'
    };

    return {
      gender: gender as 'male' | 'female',
      skinTone: skinToneMap[skinTone] || 'medium',
      hairColor: hairColorMap[hairColor] || 'black',
      hairStyle: hairStyleMap[hairStyle] || 'short',
      eyeColor: eyeColorMap[eyeColor] || 'brown',
      clothing: clothingMap[clothingStyle] || 'casual'
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate required fields for Avatar Creator
    if (!avatarName.trim()) {
      setError('Vui lòng nhập tên người mẫu ảo');
      return;
    }
    if (!gender) {
      setError('Vui lòng chọn giới tính');
      return;
    }
    if (!skinTone) {
      setError('Vui lòng chọn màu da');
      return;
    }
    if (!hairColor) {
      setError('Vui lòng chọn màu tóc');
      return;
    }
    if (!hairStyle) {
      setError('Vui lòng chọn kiểu tóc');
      return;
    }
    if (!eyeColor) {
      setError('Vui lòng chọn màu mắt');
      return;
    }
    if (!clothingStyle) {
      setError('Vui lòng chọn phong cách trang phục');
      return;
    }

    setIsSaving(true);

    try {
      const modelData: CreateVirtualModelInput = {
        avatarName: avatarName.trim(),
        isPublic,
        
        // Required fields for Avatar Creator
        gender,
        hairColor,
        hairStyle,
        skinTone,
        eyeColor,
        clothingStyle,
        
        // Optional fields (only if they exist)
        height: height ? parseFloat(height) : 170,
        weight: weight ? parseFloat(weight) : 60,
        ...(bodyShape && { bodyShape }),
        ...(muscleLevel && { muscleLevel: parseInt(muscleLevel) }),
        ...(fatLevel && { fatLevel: parseInt(fatLevel) }),
        ...(shoulderWidth && { shoulderWidth: parseFloat(shoulderWidth) }),
        ...(waistSize && { waistSize: parseFloat(waistSize) }),
        ...(hipSize && { hipSize: parseFloat(hipSize) }),
        ...(legLength && { legLength: parseFloat(legLength) }),
        ...(faceShape && { faceShape }),
        ...(beardStyle && beardStyle !== 'none' && { beardStyle }),
        ...(tattoos && { tattoos }),
        ...(piercings && { piercings }),
        ...(accessories.length > 0 && { accessories }),
        ...(footwearType && { footwearType }),
        ...(colorPalette.length > 0 && { colorPalette }),
        ...(ageAppearance && { ageAppearance: parseInt(ageAppearance) }),
        ...(bodyProportionPreset && { bodyProportionPreset }),
      };

      await onSave(modelData);
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Có lỗi xảy ra khi lưu người mẫu ảo');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Hero Header */}
        <div className="relative overflow-hidden border-b border-gray-200 dark:border-gray-700">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-5" />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
          
          <div className="relative p-6 md:p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {/* Animated icon */}
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
                </motion.div>
                
            <div>
                  <motion.h2 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
                  >
                    {editModel ? 'Chỉnh sửa Người Mẫu Ảo' : 'Tạo Người Mẫu Ảo AI'}
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl"
                  >
                    Thiết kế người mẫu hoàn hảo với công nghệ AI tiên tiến • Preview real-time
                  </motion.p>
            </div>
          </div>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
            onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>

            {/* Progress Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tiến độ hoàn thành
                </span>
                <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {completionProgress}%
                </span>
              </div>
              
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionProgress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse" />
                </motion.div>
              </div>
              
              {/* Milestone badges */}
              <div className="flex justify-between mt-3">
                <div className={`flex items-center gap-1 text-xs transition-all ${completionProgress >= 25 ? 'text-indigo-600 font-bold scale-110' : 'text-gray-400'}`}>
                  <CheckCircle className="w-3 h-3" />
                  Cơ bản
                </div>
                <div className={`flex items-center gap-1 text-xs transition-all ${completionProgress >= 50 ? 'text-purple-600 font-bold scale-110' : 'text-gray-400'}`}>
                  <CheckCircle className="w-3 h-3" />
                  Chi tiết
                </div>
                <div className={`flex items-center gap-1 text-xs transition-all ${completionProgress >= 75 ? 'text-pink-600 font-bold scale-110' : 'text-gray-400'}`}>
                  <CheckCircle className="w-3 h-3" />
                  Nâng cao
                </div>
                <div className={`flex items-center gap-1 text-xs transition-all ${completionProgress >= 100 ? 'text-green-600 font-bold scale-110' : 'text-gray-400'}`}>
                  <Star className="w-3 h-3" />
                  Hoàn hảo
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-250px)] custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Preview Section - Left Side with 3D Effect */}
            <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8' : 'lg:col-span-1'} space-y-4`}>
              <div className={`${isFullscreen ? 'w-full max-w-2xl' : 'sticky top-0'}`}>
                {/* 3D Card Container */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group"
                >
                  {/* 3D Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
                  
                  {/* Main Card */}
                  <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border-2 border-indigo-200 dark:border-indigo-800 shadow-2xl backdrop-blur-sm"
                    style={{
                      transform: 'perspective(1000px) rotateX(2deg)',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                  {/* Preview Mode Toggle - Enhanced & Clearer */}
                  <div className="mb-4">
                    <h3 className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      Chọn Chế Độ Preview
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* SVG Mode Card */}
                      <motion.button
                        type="button"
                        onClick={() => setPreviewMode('svg')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          previewMode === 'svg'
                            ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                            <Zap className="w-5 h-5 text-indigo-600" />
                          </div>
                          {previewMode === 'svg' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="p-1 rounded-full bg-indigo-600"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                          ⚡ SVG Preview
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Miễn phí • Tức thì • Real-time
                        </div>
                      </motion.button>

                      {/* AI Mode Card */}
                      <motion.button
                        type="button"
                        onClick={() => setPreviewMode('avatar')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                          previewMode === 'avatar'
                            ? 'border-pink-600 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/30 dark:to-purple-900/30 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-pink-300 dark:hover:border-pink-700'
                        }`}
                      >
                        {/* FREE Badge */}
                        <motion.div
                          animate={{ 
                            boxShadow: ['0 0 0px rgba(16, 185, 129, 0)', '0 0 20px rgba(16, 185, 129, 0.4)', '0 0 0px rgba(16, 185, 129, 0)']
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-1 -right-1 px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold rounded-bl-lg rounded-tr-lg"
                        >
                          FREE! 🆓
                        </motion.div>
                        
                        <div className="flex items-start justify-between mb-2">
                          <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/40">
                            <ImageIcon className="w-5 h-5 text-pink-600" />
                          </div>
                          {previewMode === 'avatar' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="p-1 rounded-full bg-pink-600"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                          🎭 3D Avatar
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Avatar 3D • Ready Player Me
                        </div>
                      </motion.button>
                    </div>

                    {/* Helper Text */}
                    {previewMode === 'svg' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                          💡 Tip: Muốn avatar 3D? Chọn <strong>&ldquo;3D Avatar&rdquo;</strong> bên phải!
                        </p>
                      </motion.div>
                    )}
                    
                    {previewMode === 'avatar' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                      >
                        <p className="text-xs text-green-700 dark:text-green-300 text-center">
                          🎉 Chế độ Avatar 3D đã bật! Scroll xuống để tạo avatar với Ready Player Me
                        </p>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Zoom Controls - Only for SVG mode */}
                  {previewMode === 'svg' && (
                  <div className="flex items-center justify-end mb-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 0.5}
                        className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-800 rounded transition-colors disabled:opacity-30"
                        title="Zoom out"
                      >
                        <ZoomOut className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </button>
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400 min-w-[45px] text-center">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 3}
                        className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-800 rounded transition-colors disabled:opacity-30"
                        title="Zoom in"
                      >
                        <ZoomIn className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </button>
                      <button
                        type="button"
                        onClick={handleResetZoom}
                        className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-800 rounded transition-colors"
                        title="Reset zoom"
                      >
                        <RotateCcw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </button>
                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-800 rounded transition-colors"
                        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                      >
                        {isFullscreen ? (
                          <Minimize2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <Maximize2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  )}
                  
                  {/* Preview Content - Switch between SVG and AI */}
                  {previewMode === 'svg' ? (
                  <div 
                    ref={previewContainerRef}
                    className={`${isFullscreen ? 'aspect-[1/2] max-h-[80vh]' : 'aspect-[1/2]'} bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 relative ${zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <div
                      style={{
                        transform: `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)`,
                        transformOrigin: 'center center',
                        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                      }}
                    >
                    {(height && weight && gender && hairColor && hairStyle) ? (
                      <BodyPreview
                        height={parseFloat(height) || 170}
                        weight={parseFloat(weight) || 60}
                        gender={gender}
                        bodyShape={bodyShape}
                        skinTone={skinTone}
                        hairColor={hairColor}
                        hairStyle={hairStyle}
                        muscleLevel={muscleLevel ? parseInt(muscleLevel) : undefined}
                        fatLevel={fatLevel ? parseInt(fatLevel) : undefined}
                        shoulderWidth={shoulderWidth ? parseFloat(shoulderWidth) : undefined}
                        waistSize={waistSize ? parseFloat(waistSize) : undefined}
                        hipSize={hipSize ? parseFloat(hipSize) : undefined}
                        legLength={legLength ? parseFloat(legLength) : undefined}
                        eyeColor={eyeColor}
                        faceShape={faceShape}
                        beardStyle={beardStyle}
                        tattoos={tattoos}
                        piercings={piercings}
                        clothingStyle={clothingStyle}
                        accessories={accessories}
                        footwearType={footwearType}
                        colorPalette={colorPalette}
                        ageAppearance={ageAppearance ? parseInt(ageAppearance) : undefined}
                        bodyProportionPreset={bodyProportionPreset}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center p-4">
                          <UserIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Nhập các thông số bắt buộc (*) để xem preview
                          </p>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                  ) : (
                    <div className="space-y-4">
                      {!showAvatarPreview ? (
                        <div className="text-center p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                          <User className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Sẵn sàng tạo Avatar 3D
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Điền thông tin bên phải và click &quot;Preview Avatar&quot; để tạo avatar 3D
                          </p>
                          <Button
                            onClick={() => {
                              const mappedValues = mapFormToRPM();
                              console.log('Form values:', { gender, skinTone, hairColor, hairStyle, eyeColor, clothingStyle });
                              console.log('Mapped values:', mappedValues);
                              setShowAvatarPreview(true);
                            }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg"
                          >
                            🎭 Preview Avatar
                          </Button>
                        </div>
                      ) : (
                        <AvatarCreator
                          onAvatarCreated={(avatarUrl) => {
                            console.log('Avatar created:', avatarUrl);
                            setAvatarPreviewUrl(avatarUrl);
                          }}
                          onAvatarExported={(data) => {
                            console.log('Avatar exported:', data);
                          }}
                          className="w-full"
                          // Pass mapped form data as parameters
                          gender={mapFormToRPM().gender}
                          bodyType="fullbody"
                          quality="high"
                          camera="front"
                          presetGender={mapFormToRPM().gender}
                          presetSkinTone={mapFormToRPM().skinTone}
                          presetHairColor={mapFormToRPM().hairColor}
                          presetHairStyle={mapFormToRPM().hairStyle}
                          presetEyeColor={mapFormToRPM().eyeColor}
                          presetClothing={mapFormToRPM().clothing}
                        />
                      )}
                    </div>
                  )}

                  {previewMode === 'svg' && (
                  <div className="mt-3 space-y-2">
                    <motion.div 
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="p-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4 text-indigo-600" />
                        <p className="text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center">
                          Preview real-time • Không tốn token AI
                      </p>
                    </div>
                    </motion.div>
                    {zoomLevel > 1 && (
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-xs text-purple-700 dark:text-purple-300 text-center">
                          🖱️ Kéo để di chuyển • Scroll để zoom
                        </p>
                      </div>
                    )}
                  </div>
                  )}

                  {/* Mode explanation */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-200 dark:border-blue-800"
                  >
                    {previewMode === 'svg' ? (
                      <div className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                            SVG Preview - Miễn phí & Tức thì
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                            Cập nhật real-time khi bạn thay đổi thông số
                          </p>
                </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <ImageIcon className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-pink-900 dark:text-pink-300">
                            3D Avatar - Ready Player Me
                          </p>
                          <p className="text-xs text-pink-700 dark:text-pink-400 mt-1">
                            Tạo avatar 3D tùy chỉnh hoàn toàn miễn phí
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
                </motion.div>

                {/* Enhanced Stats Info with 3D cards */}
                {(height && weight) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 space-y-3"
                  >
                    {/* BMI Card with 3D effect */}
                    <motion.div 
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all" />
                      <div className="relative p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                              <Weight className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">BMI Index</span>
                          </div>
                          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {(parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)}
                        </span>
                      </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ 
                            width: `${Math.min(100, ((parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)) / 30) * 100)}%` 
                          }}
                            transition={{ duration: 0.8 }}
                            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2 rounded-full relative"
                          >
                            <div className="absolute inset-0 bg-white/30 animate-pulse" />
                          </motion.div>
                      </div>
                    </div>
                    </motion.div>

                    {/* Muscle Level Card */}
                    {muscleLevel && (
                      <motion.div 
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all" />
                        <div className="relative p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-purple-200 dark:border-purple-800 shadow-lg">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                                <Dumbbell className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Độ cơ bắp</span>
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {muscleLevel}/5
                          </span>
                        </div>
                          <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                              <motion.div
                              key={level}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: level * 0.1 }}
                                className={`flex-1 h-8 rounded-lg transition-all ${
                                level <= parseInt(muscleLevel)
                                    ? 'bg-gradient-to-t from-purple-500 to-pink-500 shadow-lg scale-100'
                                    : 'bg-gray-200 dark:bg-gray-700 scale-95'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Form Fields - Right Side */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Quick Templates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-pink-900/10 rounded-2xl" />
              <div className="relative p-6 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-5 h-5 text-indigo-600" />
                  </motion.div>
                  Mẫu nhanh
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(Áp dụng 1 click)</span>
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'athlete', emoji: '💪', name: 'Vận động viên', color: 'from-blue-500 to-cyan-500' },
                    { id: 'model', emoji: '✨', name: 'Siêu mẫu', color: 'from-purple-500 to-pink-500' },
                    { id: 'casual', emoji: '👔', name: 'Thường ngày', color: 'from-green-500 to-emerald-500' },
                    { id: 'business', emoji: '💼', name: 'Công sở', color: 'from-orange-500 to-red-500' },
                  ].map((template, index) => (
                    <motion.button
                      key={template.id}
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => applyTemplate(template.id)}
                      className="relative p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-transparent transition-all group overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                      <div className="relative">
                        <div className="text-3xl mb-2">{template.emoji}</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{template.name}</div>
                      </div>
                      <div className={`absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br ${template.color} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Basic Information */}
            <Section
              title="Thông tin cơ bản"
              icon={<Sparkles className="w-5 h-5" />}
              expanded={expandedSections.basic}
              onToggle={() => toggleSection('basic')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Tên người mẫu ảo *"
                    value={avatarName}
                    onChange={(e) => setAvatarName(e.target.value)}
                    placeholder="VD: Người mẫu của tôi"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Công khai (cho phép người khác xem)
                    </span>
                  </label>
                </div>
              </div>
            </Section>

            {/* Avatar Customization - Only fields supported by Ready Player Me */}
            <Section
              title="Tùy chỉnh Avatar 3D"
              icon={<User className="w-5 h-5" />}
              expanded={expandedSections.bodyMetrics}
              onToggle={() => toggleSection('bodyMetrics')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Required fields for Avatar */}
                <Select
                  label="Giới tính *"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                  options={[
                    { value: 'male', label: 'Nam' },
                    { value: 'female', label: 'Nữ' },
                  ]}
                  required
                />
                
                <Select
                  label="Màu da *"
                  value={skinTone}
                  onChange={(e) => setSkinTone(e.target.value)}
                  options={[
                    { value: 'light', label: 'Sáng' },
                    { value: 'medium', label: 'Trung bình' },
                    { value: 'dark', label: 'Tối' },
                  ]}
                  required
                />
                
                <Select
                  label="Màu tóc *"
                  value={hairColor}
                  onChange={(e) => setHairColor(e.target.value as 'black' | 'brown' | 'gray' | 'red' | 'white' | 'blonde' | 'other')}
                  options={[
                    { value: 'black', label: 'Đen' },
                    { value: 'brown', label: 'Nâu' },
                    { value: 'blonde', label: 'Vàng' },
                    { value: 'red', label: 'Đỏ' },
                    { value: 'gray', label: 'Xám' },
                  ]}
                  required
                />
                
                <Select
                  label="Kiểu tóc *"
                  value={hairStyle}
                  onChange={(e) => setHairStyle(e.target.value as 'wavy' | 'long' | 'short' | 'curly' | 'straight' | 'bald')}
                  options={[
                    { value: 'short', label: 'Ngắn' },
                    { value: 'medium', label: 'Trung bình' },
                    { value: 'long', label: 'Dài' },
                    { value: 'curly', label: 'Xoăn' },
                    { value: 'straight', label: 'Thẳng' },
                  ]}
                  required
                />
                
                <Select
                  label="Màu mắt *"
                  value={eyeColor}
                  onChange={(e) => setEyeColor(e.target.value)}
                  options={[
                    { value: 'brown', label: 'Nâu' },
                    { value: 'blue', label: 'Xanh dương' },
                    { value: 'green', label: 'Xanh lá' },
                    { value: 'gray', label: 'Xám' },
                  ]}
                  required
                />
                
                <Select
                  label="Phong cách trang phục *"
                  value={clothingStyle}
                  onChange={(e) => setClothingStyle(e.target.value)}
                  options={[
                    { value: 'casual', label: 'Thoải mái' },
                    { value: 'formal', label: 'Chính thức' },
                    { value: 'sport', label: 'Thể thao' },
                    { value: 'business', label: 'Công sở' },
                  ]}
                  required
                />
              </div>
            </Section>

              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{editModel ? 'Cập nhật' : 'Tạo mới'}</span>
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Section Component
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ title, icon, expanded, onToggle, children }: SectionProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-purple-600 dark:text-purple-400">
            {icon}
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white dark:bg-gray-800">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

