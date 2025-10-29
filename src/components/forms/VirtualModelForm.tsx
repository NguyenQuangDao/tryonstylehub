'use client';

import { Button, Input } from '@/components';
import { CreateVirtualModelInput, VirtualModel } from '@/types';
import { motion } from 'framer-motion';
import { AlertCircle, Save, User, X } from 'lucide-react';
import React, { FormEvent, useState } from 'react';
import AvatarUpload from './AvatarUpload';
import AvatarGenerator from './AvatarGenerator';

interface VirtualModelFormProps {
  onClose: () => void;
  onSave: (model: CreateVirtualModelInput) => Promise<void>;
  editModel?: VirtualModel | null;
}

export default function VirtualModelForm({ onClose, onSave, editModel }: VirtualModelFormProps) {
  // Basic Info
  const [avatarName, setAvatarName] = useState(editModel?.avatarName || '');
  
  // Body Metrics
  const [height, setHeight] = useState(editModel?.height || 170);
  const [weight, setWeight] = useState(editModel?.weight || 65);
  const [gender, setGender] = useState(editModel?.gender || 'male');
  
  // Appearance
  const [hairColor, setHairColor] = useState(editModel?.hairColor || 'black');
  const [hairStyle, setHairStyle] = useState(editModel?.hairStyle || 'short');
  const [skinTone, setSkinTone] = useState(editModel?.skinTone || 'medium');
  const [eyeColor, setEyeColor] = useState(editModel?.eyeColor || 'brown');
  
  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(editModel?.avatarImage || null);
  const [showAvatarGenerator, setShowAvatarGenerator] = useState(false);

  const handleImageUploaded = (imageUrl: string) => {
    setAvatarImageUrl(imageUrl);
    setError(null);
  };

  const handleUploadError = (error: string) => {
    setError(error);
  };

  const handleImageGenerated = (imageUrl: string) => {
    setAvatarImageUrl(imageUrl);
    setError(null);
    setShowAvatarGenerator(false);
  };

  const handleGeneratorError = (error: string) => {
    setError(error);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate required fields
    if (!avatarName.trim()) {
      setError('Vui lòng nhập tên người mẫu ảo');
      return;
    }

    if (height < 100 || height > 250) {
      setError('Chiều cao phải từ 100-250cm');
      return;
    }

    if (weight < 30 || weight > 200) {
      setError('Cân nặng phải từ 30-200kg');
      return;
    }

    setIsSaving(true);

    try {
      const modelData: CreateVirtualModelInput = {
        avatarName: avatarName.trim(),
        height,
        weight,
        gender,
        hairColor,
        hairStyle,
        skinTone,
        eyeColor,
        isPublic: false,
        avatarImage: avatarImageUrl || undefined
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {editModel ? 'Chỉnh sửa người mẫu ảo' : 'Tạo người mẫu ảo mới'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Avatar Image Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Avatar Image
              </h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={!showAvatarGenerator ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAvatarGenerator(false)}
                >
                  Upload
                </Button>
                <Button
                  type="button"
                  variant={showAvatarGenerator ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAvatarGenerator(true)}
                >
                  Tạo với AI
                </Button>
              </div>
            </div>
            
            {showAvatarGenerator ? (
              <AvatarGenerator
                onImageGenerated={handleImageGenerated}
                onError={handleGeneratorError}
              />
            ) : (
              <AvatarUpload
                onImageUploaded={handleImageUploaded}
                onError={handleUploadError}
                className="w-full"
                existingImage={avatarImageUrl}
              />
            )}
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên người mẫu ảo *
              </label>
              <Input
                type="text"
                value={avatarName}
                onChange={(e) => setAvatarName(e.target.value)}
                placeholder="Nhập tên người mẫu ảo"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính *
                </label>
                <select
                   value={gender}
                   onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'non-binary')}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   required
                 >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="non-binary">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chiều cao (cm) *
                </label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min="100"
                  max="250"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cân nặng (kg) *
                </label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  min="30"
                  max="200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Ngoại hình</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu da
                </label>
                <select
                   value={skinTone}
                   onChange={(e) => setSkinTone(e.target.value as 'very-light' | 'light' | 'medium' | 'tan' | 'brown' | 'dark')}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                  <option value="very-light">Rất sáng</option>
                  <option value="light">Sáng</option>
                  <option value="medium">Trung bình</option>
                  <option value="tan">Nâu nhạt</option>
                  <option value="brown">Nâu</option>
                  <option value="dark">Tối</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu mắt
                </label>
                <select
                   value={eyeColor}
                   onChange={(e) => setEyeColor(e.target.value as 'brown' | 'black' | 'blue' | 'green' | 'gray' | 'amber')}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="brown">Nâu</option>
                   <option value="black">Đen</option>
                   <option value="blue">Xanh dương</option>
                   <option value="green">Xanh lá</option>
                   <option value="gray">Xám</option>
                   <option value="amber">Hổ phách</option>
                 </select>
               </div>
 
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Màu tóc
                 </label>
                 <select
                   value={hairColor}
                   onChange={(e) => setHairColor(e.target.value as 'black' | 'brown' | 'blonde' | 'red' | 'white' | 'gray' | 'other')}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="black">Đen</option>
                   <option value="brown">Nâu</option>
                   <option value="blonde">Vàng</option>
                   <option value="red">Đỏ</option>
                   <option value="white">Trắng</option>
                   <option value="gray">Xám</option>
                   <option value="other">Khác</option>
                 </select>
               </div>
 
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Kiểu tóc
                 </label>
                 <select
                   value={hairStyle}
                   onChange={(e) => setHairStyle(e.target.value as 'long' | 'short' | 'curly' | 'straight' | 'bald' | 'wavy')}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                  <option value="short">Ngắn</option>
                  <option value="long">Dài</option>
                  <option value="curly">Xoăn</option>
                  <option value="straight">Thẳng</option>
                  <option value="wavy">Gợn sóng</option>
                  <option value="bald">Hói</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editModel ? 'Cập nhật' : 'Tạo mới'}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

