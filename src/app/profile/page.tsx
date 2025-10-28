'use client'

import { Button, VirtualModelForm } from '@/components';
import { useAuth } from '@/lib/auth-context';
import { CreateVirtualModelInput, VirtualModel } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit2, Mail, Plus, Trash2, User as UserIcon, Users } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Virtual Model states
  const [virtualModels, setVirtualModels] = useState<VirtualModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [isVirtualModelFormOpen, setIsVirtualModelFormOpen] = useState(false);
  const [editingVirtualModel, setEditingVirtualModel] = useState<VirtualModel | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch virtual models
  useEffect(() => {
    if (user) {
      fetchVirtualModels();
    }
  }, [user]);

  const fetchVirtualModels = async () => {
    try {
      setIsLoadingModels(true);
      const response = await fetch('/api/virtual-models');
      if (response.ok) {
        const data = await response.json();
        setVirtualModels(data.virtualModels || []);
      }
    } catch (error) {
      console.error('Error fetching virtual models:', error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleOpenForm = () => {
    setEditingVirtualModel(null);
    setIsVirtualModelFormOpen(true);
  };

  const handleEditModel = (model: VirtualModel) => {
    setEditingVirtualModel(model);
    setIsVirtualModelFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsVirtualModelFormOpen(false);
    setEditingVirtualModel(null);
  };

  const handleSaveModel = async (modelData: CreateVirtualModelInput) => {
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
        throw new Error('Failed to save virtual model');
      }

      await fetchVirtualModels();
      handleCloseForm();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteModel = async (modelId: number) => {
    try {
      const response = await fetch(`/api/virtual-models?id=${modelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete virtual model');
      }

      setVirtualModels(virtualModels.filter(m => m.id !== modelId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting virtual model:', error);
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

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 vietnamese-heading">Hồ Sơ Cá Nhân</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Quản lý thông tin tài khoản của bạn
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} width={96} height={96} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <UserIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tên</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Virtual Models Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 vietnamese-heading">
                  Người Mẫu Ảo
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Quản lý các người mẫu ảo của bạn
                </p>
              </div>
            </div>
            <Button
              onClick={handleOpenForm}
              variant="primary"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden md:inline">Tạo mới</span>
            </Button>
          </div>

          {/* Loading State */}
          {isLoadingModels && (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!isLoadingModels && virtualModels.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Chưa có người mẫu ảo
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Tạo người mẫu ảo đầu tiên của bạn để bắt đầu
              </p>
              <Button
                onClick={handleOpenForm}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Tạo người mẫu ảo
              </Button>
            </div>
          )}

          {/* Virtual Models Grid */}
          {!isLoadingModels && virtualModels.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {virtualModels.map((model) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all bg-white dark:bg-gray-800"
                >
                  {/* Model Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                      <UserIcon className="w-6 h-6 text-white" />
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
                      onClick={() => handleEditModel(model)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Chỉnh sửa</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(model.id)}
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
                              onClick={() => handleDeleteModel(model.id)}
                              variant="primary"
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
      </motion.div>

      {/* Virtual Model Form Modal */}
      <AnimatePresence>
        {isVirtualModelFormOpen && (
          <VirtualModelForm
            onClose={handleCloseForm}
            onSave={handleSaveModel}
            editModel={editingVirtualModel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

