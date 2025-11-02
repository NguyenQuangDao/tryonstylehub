'use client';

import { Button } from '@/components';
import { VirtualModel } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit2, Plus, Trash2, User, UserCheck, Users, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface VirtualModelSelectorProps {
  onClose: () => void;
  onSelect: (model: VirtualModel) => void;
  onCreateNew: () => void;
  onEdit: (model: VirtualModel) => void;
  selectedModelId?: number | null;
}

export default function VirtualModelSelector({
  onClose,
  onSelect,
  onCreateNew,
  onEdit,
  selectedModelId,
}: VirtualModelSelectorProps) {
  const [models, setModels] = useState<VirtualModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/virtual-models');
      
      if (!response.ok) {
        throw new Error('Failed to fetch virtual models');
      }

      const data = await response.json();
      setModels(data.virtualModels || []);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (modelId: number) => {
    try {
      const response = await fetch(`/api/virtual-models?id=${modelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete virtual model');
      }

      // Remove from local state
      setModels(models.filter(m => m.id !== modelId));
      setDeleteConfirm(null);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
    }
  }; 

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      case 'non-binary': return 'Phi nhị giới';
      default: return gender;
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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Người mẫu ảo của bạn
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chọn hoặc tạo người mẫu ảo mới
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

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {/* Create New Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateNew}
            className="w-full flex items-center justify-center gap-3 p-6 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group mb-6"
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full group-hover:bg-purple-200 dark:group-hover:bg-purple-900 transition-colors">
              <Plus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tạo người mẫu ảo mới
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tùy chỉnh người mẫu ảo theo cơ thể của bạn
              </p>
            </div>
          </motion.button>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full inline-block mb-3">
                  <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <Button
                  onClick={fetchModels}
                  variant="secondary"
                  className="mt-4"
                >
                  Thử lại
                </Button>
              </div>
            </div>
          )}

          {/* Models Grid */}
          {!isLoading && !error && models.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full inline-block mb-3">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Bạn chưa có người mẫu ảo nào
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Tạo người mẫu ảo đầu tiên của bạn ngay
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && models.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {models.map((model) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative p-5 border-2 rounded-xl transition-all cursor-pointer ${
                    selectedModelId === model.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-gray-750'
                  }`}
                  onClick={() => onSelect(model)}
                >
                  {/* Selected Indicator */}
                  {selectedModelId === model.id && (
                    <div className="absolute top-3 right-3">
                      <div className="p-1 bg-purple-500 rounded-full">
                        <UserCheck className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Model Info */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Avatar Image or Icon */}
                    <div className="relative">
                      {model.avatarImage ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-purple-200 dark:border-purple-700">
                          <Image
                            src={model.avatarImage}
                            alt={model.avatarName}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {model.avatarName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>{getGenderLabel(model.gender)}</span>
                        <span>•</span>
                        <span>{model.height} cm</span>
                        <span>•</span>
                        <span>{model.weight} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Model Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-500">Tóc:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {model.hairStyle} - {model.hairColor}
                      </span>
                    </div>
                    {model.bodyShape && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-500">Dáng người:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {model.bodyShape}
                        </span>
                      </div>
                    )}
                    {model.skinTone && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-500">Màu da:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {model.skinTone}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(model);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Chỉnh sửa</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(model.id);
                      }}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Delete Confirmation */}
                  <AnimatePresence>
                    {deleteConfirm === model.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-center">
                          <p className="text-gray-900 dark:text-white font-medium mb-4">
                            Xóa người mẫu này?
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setDeleteConfirm(null)}
                              variant="secondary"
                              className="flex-1"
                            >
                              Hủy
                            </Button>
                            <Button
                              onClick={() => handleDelete(model.id)}
                              variant="default"
                              className="flex-1 bg-red-500 hover:bg-red-600"
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <Button onClick={onClose} variant="secondary">
            Đóng
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

