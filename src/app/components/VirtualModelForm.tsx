'use client';

import { CreateVirtualModelInput, VirtualModel } from '@/types';
import { motion } from 'framer-motion';
import { AlertCircle, Save, Sparkles, User, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import AvatarCreator from './AvatarCreator';
import Button from './ui/button';
import Input from './ui/input';

interface VirtualModelFormProps {
  onClose: () => void;
  onSave: (model: CreateVirtualModelInput) => Promise<void>;
  editModel?: VirtualModel | null;
}

export default function VirtualModelForm({ onClose, onSave, editModel }: VirtualModelFormProps) {
  // Basic Info - chỉ giữ tên
  const [avatarName, setAvatarName] = useState(editModel?.avatarName || '');
  
  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Avatar preview state
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const [, setAvatarPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate required fields
    if (!avatarName.trim()) {
      setError('Vui lòng nhập tên người mẫu ảo');
      return;
    }

    setIsSaving(true);

    try {
      const modelData: CreateVirtualModelInput = {
        avatarName: avatarName.trim(),
        isPublic: false,
        
        // Default values for required fields
        gender: 'male',
        hairColor: 'black',
        hairStyle: 'short',
        skinTone: 'medium',
        eyeColor: 'brown',
        clothingStyle: 'casual',
        
        // Default body metrics
        height: 170,
        weight: 60,
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
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-250px)] custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Preview Section - Left Side with 3D Effect */}
            <div className="lg:col-span-1 space-y-4">
              <div className="sticky top-0">
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
                  {/* Avatar Preview Header */}
                  <div className="mb-4">
                    <h3 className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      Avatar Creator
                    </h3>
                    
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                 <p className="text-xs text-green-700 dark:text-green-300 text-center">
                   Tạo avatar tùy chỉnh miễn phí
                 </p>
                    </motion.div>
                  </div>
                  
                  
                  {/* Avatar Preview Content */}
                    <div className="space-y-4">
                      {!showAvatarPreview ? (
                        <div className="text-center p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                          <User className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Sẵn sàng tạo Avatar
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Điền thông tin và click &quot;Preview Avatar&quot; để tạo avatar
                          </p>
                          <Button
                            onClick={() => {
                              setShowAvatarPreview(true);
                            }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg"
                          >
                            Preview Avatar
                          </Button>
                        </div>
                      ) : (
                        <AvatarCreator
                          onAvatarCreated={(avatarUrl) => {
                            setAvatarPreviewUrl(avatarUrl);
                          }}
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          onAvatarExported={(_data) => {
                            // Avatar exported
                          }}
                          className="w-full"
                        />
                      )}
                    </div>
                </div>
                </motion.div>
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
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <div className="flex items-center gap-3">
                  <div className="text-purple-600 dark:text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Thông tin cơ bản
                  </h3>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800">
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
                </div>
              </div>
            </div>

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

