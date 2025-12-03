"use client";

import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  Palette,
  RefreshCw,
  Scissors,
  Settings,
  Shirt,
  Sparkles,
  User
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface CustomAvatarCreatorProps {
  onAvatarCreated?: (avatarUrl: string) => void;
  onAvatarExported?: (data: unknown) => void;
  className?: string;
}

interface AvatarCustomization {
  gender: 'male' | 'female';
  skinTone: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  clothingStyle: string;
}

export default function CustomAvatarCreator({ 
  onAvatarCreated, 
  onAvatarExported,
  className = ""
}: CustomAvatarCreatorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [savedAvatars, setSavedAvatars] = useState<Array<{
    id: number;
    avatarName: string;
    avatarImage?: string;
    updatedAt: string;
  }>>([]);
  const [currentAvatarName, setCurrentAvatarName] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Customization state
  const [customization, setCustomization] = useState<AvatarCustomization>({
    gender: 'male',
    skinTone: 'medium',
    hairColor: 'black',
    hairStyle: 'short',
    eyeColor: 'brown',
    clothingStyle: 'casual'
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('avatarDefaults')
      if (raw) {
        const d = JSON.parse(raw)
        setCustomization(prev => ({
          ...prev,
          gender: d.gender || prev.gender,
          skinTone: d.skinTone || prev.skinTone,
          hairColor: d.hairColor || prev.hairColor,
          hairStyle: d.hairStyle || prev.hairStyle,
          eyeColor: d.eyeColor || prev.eyeColor,
        }))
      }
    } catch {}
  }, [])

  // Ready Player Me API integration
  const createGuestUser = async () => {
    try {
      const response = await fetch('/api/readyplayer/guest-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      if (result.success) {
        return result.data.userId;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating guest user:', error);
      throw error;
    }
  };

  const generateAvatar = async () => {
    setIsCreating(true);
    try {
      // Create guest user
      const userId = await createGuestUser();
      
      // Generate avatar with customization
      const response = await fetch('/api/readyplayer/generate-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          customization
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAvatarUrl(result.data.avatarUrl);
        setShowSaveDialog(true);
        
        if (onAvatarCreated) {
          onAvatarCreated(result.data.avatarUrl);
        }
        if (onAvatarExported) {
          onAvatarExported(result.data);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error generating avatar:', error);
      setError('Failed to generate avatar');
    } finally {
      setIsCreating(false);
    }
  };

  // Load saved avatars
  const loadSavedAvatars = async () => {
    try {
      const response = await fetch('/api/avatar/list');
      const data = await response.json();
      
      if (data.success) {
        setSavedAvatars(data.data);
      }
    } catch (error) {
      console.error('Error loading saved avatars:', error);
    }
  };

  // Load avatar from database
  const loadAvatar = async (avatarName: string) => {
    try {
      const response = await fetch(`/api/avatar/load?avatarName=${encodeURIComponent(avatarName)}`);
      const data = await response.json();
      
      if (data.success) {
        const avatar = data.data;
        setCurrentAvatarName(avatar.avatarName);
        setAvatarUrl(avatar.avatarImage || null);
        
        // Update customization based on avatar data
        setCustomization({
          gender: avatar.gender || 'male',
          skinTone: avatar.skinTone || 'medium',
          hairColor: avatar.hairColor || 'black',
          hairStyle: avatar.hairStyle || 'short',
          eyeColor: avatar.eyeColor || 'brown',
          clothingStyle: avatar.clothingStyle || 'casual'
        });
      }
    } catch (error) {
      console.error('Error loading avatar:', error);
    }
  };

  // Save avatar to database
  const saveAvatar = async (avatarName: string) => {
    try {
      const response = await fetch('/api/avatar/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatarName,
          height: 170,
          weight: 65,
          gender: customization.gender,
          hairColor: customization.hairColor,
          hairStyle: customization.hairStyle,
          skinTone: customization.skinTone,
          eyeColor: customization.eyeColor,
          isPublic: false
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowSaveDialog(false);
        setCurrentAvatarName('');
        await loadSavedAvatars();
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch {
      setError('Failed to save avatar');
      return false;
    }
  };

  // Initialize component
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    // Load saved avatars
    loadSavedAvatars();
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <Sparkles className="w-12 h-12 text-indigo-500" />
        </motion.div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Đang tải...
        </h3>
        
        <div className="mt-4 flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ 
                duration: 0.6, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
              className="w-2 h-2 bg-indigo-500 rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
          Lỗi tải
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 text-center mb-4">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4"
        >
          <User className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Custom Avatar Creator
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tùy chỉnh avatar theo ý muốn của bạn
        </p>
      </div>

      {/* Custom Avatar Creator Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customization Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Tùy chỉnh Avatar
          </h3>
          
          {/* Gender Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Giới tính
            </label>
            <div className="flex gap-2">
              {[
                { value: 'male', label: 'Nam', icon: '👨' },
                { value: 'female', label: 'Nữ', icon: '👩' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCustomization(prev => ({ ...prev, gender: option.value as 'male' | 'female' }))}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    customization.gender === option.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Skin Tone */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Màu da
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'light', label: 'Sáng', color: '#FDBCB4' },
                { value: 'medium', label: 'Trung bình', color: '#E8A87C' },
                { value: 'dark', label: 'Tối', color: '#8B4513' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCustomization(prev => ({ ...prev, skinTone: option.value }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    customization.skinTone === option.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className="w-8 h-8 rounded-full mx-auto mb-2 border-2 border-gray-300"
                    style={{ backgroundColor: option.color }}
                  />
                  <div className="text-xs font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Hair */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              Tóc
            </label>
            <div className="space-y-3">
              {/* Hair Color */}
              <div>
                <div className="text-xs text-gray-500 mb-1">Màu tóc</div>
                <div className="grid grid-cols-4 gap-1">
                  {['black', 'brown', 'blonde', 'red'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setCustomization(prev => ({ ...prev, hairColor: color }))}
                      className={`p-2 rounded border ${
                        customization.hairColor === color
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full mx-auto ${
                        color === 'black' ? 'bg-gray-900' :
                        color === 'brown' ? 'bg-amber-800' :
                        color === 'blonde' ? 'bg-yellow-300' :
                        'bg-red-600'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Hair Style */}
              <div>
                <div className="text-xs text-gray-500 mb-1">Kiểu tóc</div>
                <div className="grid grid-cols-2 gap-2">
                  {['short', 'medium', 'long', 'curly'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setCustomization(prev => ({ ...prev, hairStyle: style }))}
                      className={`p-2 rounded border text-xs ${
                        customization.hairStyle === style
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {style === 'short' ? 'Ngắn' :
                       style === 'medium' ? 'Trung bình' :
                       style === 'long' ? 'Dài' : 'Xoăn'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Eyes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Mắt
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'brown', label: 'Nâu', color: '#8B4513' },
                { value: 'blue', label: 'Xanh dương', color: '#4169E1' },
                { value: 'green', label: 'Xanh lá', color: '#228B22' },
                { value: 'gray', label: 'Xám', color: '#708090' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCustomization(prev => ({ ...prev, eyeColor: option.value }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    customization.eyeColor === option.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover-gray-300'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-full mx-auto mb-2 border-2 border-gray-300"
                    style={{ backgroundColor: option.color }}
                  />
                  <div className="text-xs font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Clothing */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Shirt className="w-4 h-4" />
              Trang phục
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'casual', label: 'Thoải mái', icon: '👕' },
                { value: 'formal', label: 'Chính thức', icon: '👔' },
                { value: 'sport', label: 'Thể thao', icon: '🏃' },
                { value: 'business', label: 'Công sở', icon: '💼' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCustomization(prev => ({ ...prev, clothingStyle: option.value }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    customization.clothingStyle === option.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{option.icon}</div>
                  <div className="text-xs font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateAvatar}
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang tạo avatar...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Tạo Avatar
              </>
            )}
          </button>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Preview</h3>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 min-h-[400px] flex items-center justify-center">
            {avatarUrl ? (
              <div className="text-center">
                <Image 
                  src={avatarUrl} 
                  alt="Generated Avatar"
                  width={300}
                  height={300}
                  className="rounded-lg shadow-lg"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Avatar đã được tạo thành công!
                </p>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <User className="w-24 h-24 mx-auto mb-4 opacity-50" />
                <p>Avatar sẽ hiển thị ở đây sau khi tạo</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Avatars */}
      {savedAvatars.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold mb-4">Avatars đã lưu</h3>
          <div className="grid grid-cols-2 gap-3">
            {savedAvatars.map((avatar) => (
              <motion.div
                key={avatar.id}
                className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-blue-300 transition-colors"
                onClick={() => loadAvatar(avatar.avatarName)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {avatar.avatarImage && (
                  <Image
                    src={avatar.avatarImage}
                    alt={avatar.avatarName}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-lg mx-auto mb-2"
                  />
                )}
                <h4 className="font-medium text-center text-gray-900">{avatar.avatarName}</h4>
                <p className="text-xs text-gray-500 text-center">
                  {new Date(avatar.updatedAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold mb-4">Lưu Avatar</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Nhập tên để lưu avatar này:
            </p>
            
            <input
              type="text"
              value={currentAvatarName}
              onChange={(e) => setCurrentAvatarName(e.target.value)}
              placeholder="Tên avatar..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (currentAvatarName.trim()) {
                    saveAvatar(currentAvatarName.trim());
                  }
                }}
                disabled={!currentAvatarName.trim()}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                Lưu
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {avatarUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
        >
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            ✅ Avatar đã được tạo thành công!
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300 mb-3">
            Avatar của bạn đã sẵn sàng để sử dụng
          </p>
          
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => window.open(avatarUrl, '_blank')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Xem Avatar
            </button>
            
            <button
              onClick={() => {
                setAvatarUrl(null);
                setIsCreating(true);
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tạo mới
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
