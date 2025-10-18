'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ChevronDown, ChevronUp, Maximize2, Minimize2, RotateCcw, Save, Sparkles, User, User as UserIcon, X, ZoomIn, ZoomOut } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';
import { CreateVirtualModelInput, VirtualModel } from '../types';
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
  const [height, setHeight] = useState(editModel?.height?.toString() || '');
  const [weight, setWeight] = useState(editModel?.weight?.toString() || '');
  const [gender, setGender] = useState(editModel?.gender || 'male');
  
  // Required Fields - Appearance
  const [hairColor, setHairColor] = useState(editModel?.hairColor || 'black');
  const [hairStyle, setHairStyle] = useState(editModel?.hairStyle || 'short');
  
  // Optional Fields - Body Metrics
  const [bodyShape, setBodyShape] = useState(editModel?.bodyShape || '');
  const [skinTone, setSkinTone] = useState(editModel?.skinTone || '');
  const [muscleLevel, setMuscleLevel] = useState(editModel?.muscleLevel?.toString() || '');
  const [fatLevel, setFatLevel] = useState(editModel?.fatLevel?.toString() || '');
  const [shoulderWidth, setShoulderWidth] = useState(editModel?.shoulderWidth?.toString() || '');
  const [waistSize, setWaistSize] = useState(editModel?.waistSize?.toString() || '');
  const [hipSize, setHipSize] = useState(editModel?.hipSize?.toString() || '');
  const [legLength, setLegLength] = useState(editModel?.legLength?.toString() || '');
  
  // Optional Fields - Appearance
  const [eyeColor, setEyeColor] = useState(editModel?.eyeColor || '');
  const [faceShape, setFaceShape] = useState(editModel?.faceShape || '');
  const [beardStyle, setBeardStyle] = useState(editModel?.beardStyle || 'none');
  const [tattoos, setTattoos] = useState(editModel?.tattoos || '');
  const [piercings, setPiercings] = useState(editModel?.piercings || '');
  
  // Optional Fields - Style
  const [clothingStyle, setClothingStyle] = useState(editModel?.clothingStyle || '');
  const [footwearType, setFootwearType] = useState(editModel?.footwearType || '');
  const [accessories, setAccessories] = useState<string[]>(
    editModel?.accessories || []
  );
  const [colorPalette, setColorPalette] = useState<string[]>(
    editModel?.colorPalette || []
  );
  const [ageAppearance, setAgeAppearance] = useState(editModel?.ageAppearance?.toString() || '');
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate required fields
    if (!avatarName.trim()) {
      setError('Vui lòng nhập tên người mẫu ảo');
      return;
    }
    if (!height || parseFloat(height) < 140 || parseFloat(height) > 220) {
      setError('Chiều cao phải từ 140-220 cm');
      return;
    }
    if (!weight || parseFloat(weight) < 35 || parseFloat(weight) > 150) {
      setError('Cân nặng phải từ 35-150 kg');
      return;
    }

    setIsSaving(true);

    try {
      const modelData: CreateVirtualModelInput = {
        avatarName: avatarName.trim(),
        isPublic,
        
        // Required fields
        height: parseFloat(height),
        weight: parseFloat(weight),
        gender,
        hairColor,
        hairStyle,
        
        // Optional fields
        ...(bodyShape && { bodyShape }),
        ...(skinTone && { skinTone }),
        ...(muscleLevel && { muscleLevel: parseInt(muscleLevel) }),
        ...(fatLevel && { fatLevel: parseInt(fatLevel) }),
        ...(shoulderWidth && { shoulderWidth: parseFloat(shoulderWidth) }),
        ...(waistSize && { waistSize: parseFloat(waistSize) }),
        ...(hipSize && { hipSize: parseFloat(hipSize) }),
        ...(legLength && { legLength: parseFloat(legLength) }),
        ...(eyeColor && { eyeColor }),
        ...(faceShape && { faceShape }),
        ...(beardStyle && beardStyle !== 'none' && { beardStyle }),
        ...(tattoos && { tattoos }),
        ...(piercings && { piercings }),
        ...(clothingStyle && { clothingStyle }),
        ...(accessories.length > 0 && { accessories }),
        ...(footwearType && { footwearType }),
        ...(colorPalette.length > 0 && { colorPalette }),
        ...(ageAppearance && { ageAppearance: parseInt(ageAppearance) }),
        ...(bodyProportionPreset && { bodyProportionPreset }),
      };

      await onSave(modelData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu người mẫu ảo');
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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editModel ? 'Chỉnh sửa người mẫu ảo' : 'Tạo người mẫu ảo'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tùy chỉnh người mẫu ảo của bạn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Preview Section - Left Side */}
            <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8' : 'lg:col-span-1'} space-y-4`}>
              <div className={`${isFullscreen ? 'w-full max-w-2xl' : 'sticky top-0'}`}>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Xem trước cơ thể
                    </h3>
                    
                    {/* Zoom Controls */}
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
                  
                  {/* SVG Preview Container with Pan & Zoom */}
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

                  <div className="mt-3 space-y-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                        ⚡ Preview real-time • Không tốn token
                      </p>
                    </div>
                    {zoomLevel > 1 && (
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-xs text-purple-700 dark:text-purple-300 text-center">
                          🖱️ Kéo để di chuyển • Scroll để zoom
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Info */}
                {(height && weight) && (
                  <div className="mt-4 space-y-2">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">BMI</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {(parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
                          style={{ 
                            width: `${Math.min(100, ((parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)) / 30) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {muscleLevel && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Độ cơ bắp</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {muscleLevel}/5
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`flex-1 h-1.5 rounded-full ${
                                level <= parseInt(muscleLevel)
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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

            {/* Body Metrics */}
            <Section
              title="Thông số cơ thể"
              icon={<User className="w-5 h-5" />}
              expanded={expandedSections.bodyMetrics}
              onToggle={() => toggleSection('bodyMetrics')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Required */}
                <Input
                  label="Chiều cao (cm) *"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                  min="140"
                  max="220"
                  required
                />
                <Input
                  label="Cân nặng (kg) *"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="60"
                  min="35"
                  max="150"
                  required
                />
                <Select
                  label="Giới tính *"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  options={[
                    { value: 'male', label: 'Nam' },
                    { value: 'female', label: 'Nữ' },
                    { value: 'non-binary', label: 'Phi nhị giới' },
                  ]}
                  required
                />
                
                {/* Optional */}
                <Select
                  label="Dáng người"
                  value={bodyShape}
                  onChange={(e) => setBodyShape(e.target.value)}
                  options={[
                    { value: '', label: 'Không chọn' },
                    { value: 'slim', label: 'Gầy' },
                    { value: 'athletic', label: 'Thể thao' },
                    { value: 'balanced', label: 'Cân đối' },
                    { value: 'muscular', label: 'Vạm vỡ' },
                    { value: 'curvy', label: 'Đẫy đà' },
                    { value: 'plus-size', label: 'Mập mạp' },
                  ]}
                />
                <Select
                  label="Màu da"
                  value={skinTone}
                  onChange={(e) => setSkinTone(e.target.value)}
                  options={[
                    { value: '', label: 'Không chọn' },
                    { value: 'very-light', label: 'Rất sáng' },
                    { value: 'light', label: 'Sáng' },
                    { value: 'medium', label: 'Trung bình' },
                    { value: 'tan', label: 'Ngăm' },
                    { value: 'brown', label: 'Nâu' },
                    { value: 'dark', label: 'Tối' },
                  ]}
                />
                <Input
                  label="Độ cơ bắp (1-5)"
                  type="number"
                  value={muscleLevel}
                  onChange={(e) => setMuscleLevel(e.target.value)}
                  placeholder="3"
                  min="1"
                  max="5"
                />
                <Input
                  label="Tỷ lệ mỡ (1-5)"
                  type="number"
                  value={fatLevel}
                  onChange={(e) => setFatLevel(e.target.value)}
                  placeholder="3"
                  min="1"
                  max="5"
                />
                <Input
                  label="Độ rộng vai (cm)"
                  type="number"
                  value={shoulderWidth}
                  onChange={(e) => setShoulderWidth(e.target.value)}
                  placeholder="40"
                  min="30"
                  max="60"
                />
                <Input
                  label="Vòng eo (cm)"
                  type="number"
                  value={waistSize}
                  onChange={(e) => setWaistSize(e.target.value)}
                  placeholder="75"
                  min="50"
                  max="120"
                />
                <Input
                  label="Vòng mông (cm)"
                  type="number"
                  value={hipSize}
                  onChange={(e) => setHipSize(e.target.value)}
                  placeholder="90"
                  min="60"
                  max="130"
                />
                <Input
                  label="Chiều dài chân (cm)"
                  type="number"
                  value={legLength}
                  onChange={(e) => setLegLength(e.target.value)}
                  placeholder="85"
                  min="60"
                  max="120"
                />
              </div>
            </Section>

            {/* Appearance */}
            <Section
              title="Ngoại hình"
              icon={<Sparkles className="w-5 h-5" />}
              expanded={expandedSections.appearance}
              onToggle={() => toggleSection('appearance')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Required */}
                <Select
                  label="Màu tóc *"
                  value={hairColor}
                  onChange={(e) => setHairColor(e.target.value)}
                  options={[
                    { value: 'black', label: 'Đen' },
                    { value: 'brown', label: 'Nâu' },
                    { value: 'blonde', label: 'Vàng' },
                    { value: 'red', label: 'Đỏ' },
                    { value: 'white', label: 'Trắng' },
                    { value: 'gray', label: 'Xám' },
                    { value: 'purple', label: 'Tím' },
                    { value: 'blue', label: 'Xanh dương' },
                    { value: 'green', label: 'Xanh lá' },
                    { value: 'pink', label: 'Hồng' },
                    { value: 'other', label: 'Khác' },
                  ]}
                  required
                />
                <Select
                  label="Kiểu tóc *"
                  value={hairStyle}
                  onChange={(e) => setHairStyle(e.target.value)}
                  options={[
                    { value: 'long', label: 'Dài' },
                    { value: 'short', label: 'Ngắn' },
                    { value: 'medium', label: 'Trung bình' },
                    { value: 'curly', label: 'Uốn xoăn' },
                    { value: 'straight', label: 'Thẳng' },
                    { value: 'wavy', label: 'Gợn sóng' },
                    { value: 'bald', label: 'Cạo sát' },
                    { value: 'buzz-cut', label: 'Cắt ngắn' },
                    { value: 'ponytail', label: 'Đuôi ngựa' },
                    { value: 'bun', label: 'Búi tóc' },
                  ]}
                  required
                />
                
                {/* Optional */}
                <Select
                  label="Màu mắt"
                  value={eyeColor}
                  onChange={(e) => setEyeColor(e.target.value)}
                  options={[
                    { value: '', label: 'Không chọn' },
                    { value: 'brown', label: 'Nâu' },
                    { value: 'black', label: 'Đen' },
                    { value: 'blue', label: 'Xanh dương' },
                    { value: 'green', label: 'Xanh lá' },
                    { value: 'gray', label: 'Xám' },
                    { value: 'amber', label: 'Hổ phách' },
                    { value: 'hazel', label: 'Nâu xanh' },
                  ]}
                />
                <Select
                  label="Dáng khuôn mặt"
                  value={faceShape}
                  onChange={(e) => setFaceShape(e.target.value)}
                  options={[
                    { value: '', label: 'Không chọn' },
                    { value: 'round', label: 'Tròn' },
                    { value: 'oval', label: 'Oval' },
                    { value: 'square', label: 'Vuông' },
                    { value: 'triangle', label: 'Tam giác' },
                    { value: 'diamond', label: 'Kim cương' },
                    { value: 'heart', label: 'Trái tim' },
                    { value: 'long', label: 'Dài' },
                  ]}
                />
                <Select
                  label="Kiểu râu"
                  value={beardStyle}
                  onChange={(e) => setBeardStyle(e.target.value)}
                  options={[
                    { value: 'none', label: 'Không' },
                    { value: 'goatee', label: 'Râu quai nón' },
                    { value: 'full', label: 'Râu đầy' },
                    { value: 'stubble', label: 'Râu ngắn' },
                    { value: 'mustache', label: 'Ria mép' },
                    { value: 'beard-no-mustache', label: 'Râu không ria' },
                    { value: 'van-dyke', label: 'Râu Van Dyke' },
                  ]}
                />
                <Input
                  label="Hình xăm"
                  value={tattoos}
                  onChange={(e) => setTattoos(e.target.value)}
                  placeholder="VD: Cánh tay trái, lưng"
                />
                <Input
                  label="Khuyên"
                  value={piercings}
                  onChange={(e) => setPiercings(e.target.value)}
                  placeholder="VD: Tai, mũi"
                />
              </div>
            </Section>

            {/* Style */}
            <Section
              title="Phong cách"
              icon={<Sparkles className="w-5 h-5" />}
              expanded={expandedSections.style}
              onToggle={() => toggleSection('style')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Phong cách trang phục"
                  value={clothingStyle}
                  onChange={(e) => setClothingStyle(e.target.value)}
                  options={[
                    { value: '', label: 'Không chọn' },
                    { value: 'sport', label: 'Thể thao' },
                    { value: 'elegant', label: 'Thanh lịch' },
                    { value: 'street', label: 'Đường phố' },
                    { value: 'gothic', label: 'Gothic' },
                    { value: 'casual', label: 'Thoải mái' },
                    { value: 'business', label: 'Công sở' },
                    { value: 'formal', label: 'Chính thức' },
                    { value: 'bohemian', label: 'Bohemian' },
                    { value: 'vintage', label: 'Cổ điển' },
                    { value: 'preppy', label: 'Preppy' },
                    { value: 'minimalist', label: 'Tối giản' },
                  ]}
                />
                <Select
                  label="Loại giày dép"
                  value={footwearType}
                  onChange={(e) => setFootwearType(e.target.value)}
                  options={[
                    { value: '', label: 'Không chọn' },
                    { value: 'sneaker', label: 'Giày thể thao' },
                    { value: 'heels', label: 'Giày cao gót' },
                    { value: 'sandals', label: 'Dép' },
                    { value: 'boots', label: 'Bốt' },
                    { value: 'formal', label: 'Giày tây' },
                    { value: 'loafers', label: 'Giày lười' },
                    { value: 'flats', label: 'Giày bệt' },
                    { value: 'slippers', label: 'Dép lê' },
                  ]}
                />
                
                {/* Accessories */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phụ kiện
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['Kính', 'Đồng hồ', 'Vòng cổ', 'Mũ', 'Thắt lưng', 'Túi xách'].map((item) => (
                      <label key={item} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                        <input
                          type="checkbox"
                          checked={accessories.includes(item)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAccessories([...accessories, item]);
                            } else {
                              setAccessories(accessories.filter(a => a !== item));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                      </label>
                    ))}
                  </div>
                  {accessories.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Đã chọn: {accessories.join(', ')}
                    </p>
                  )}
                </div>

                {/* Color Palette */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bảng màu yêu thích
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['#000000', '#FFFFFF', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          if (colorPalette.includes(color)) {
                            setColorPalette(colorPalette.filter(c => c !== color));
                          } else if (colorPalette.length < 4) {
                            setColorPalette([...colorPalette, color]);
                          }
                        }}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          colorPalette.includes(color)
                            ? 'border-purple-500 scale-110'
                            : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  {colorPalette.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Đã chọn {colorPalette.length}/4 màu
                    </p>
                  )}
                </div>
              </div>
            </Section>

            {/* Advanced */}
            <Section
              title="Nâng cao"
              icon={<Sparkles className="w-5 h-5" />}
              expanded={expandedSections.advanced}
              onToggle={() => toggleSection('advanced')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tuổi hiển thị"
                  type="number"
                  value={ageAppearance}
                  onChange={(e) => setAgeAppearance(e.target.value)}
                  placeholder="25"
                  min="16"
                  max="80"
                />
                <Select
                  label="Preset tỷ lệ cơ thể"
                  value={bodyProportionPreset}
                  onChange={(e) => setBodyProportionPreset(e.target.value)}
                  options={[
                    { value: '', label: 'Không chọn' },
                    { value: 'supermodel', label: 'Siêu mẫu' },
                    { value: 'athletic', label: 'Thể hình' },
                    { value: 'realistic', label: 'Người thật' },
                    { value: 'petite', label: 'Nhỏ nhắn' },
                    { value: 'tall', label: 'Cao lớn' },
                    { value: 'average', label: 'Trung bình' },
                  ]}
                />
              </div>
            </Section>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
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

