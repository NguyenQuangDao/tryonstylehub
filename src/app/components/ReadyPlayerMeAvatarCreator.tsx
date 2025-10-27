"use client";

import {
    AssetUnlockedEvent,
    AvatarCreator,
    AvatarCreatorConfig,
    AvatarExportedEvent,
    UserAuthorizedEvent,
    UserSetEvent
} from '@readyplayerme/react-avatar-creator';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    Download,
    Palette,
    RefreshCw,
    Scissors,
    Settings,
    Sparkles,
    User
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ReadyPlayerMeAvatarCreatorProps {
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

export default function ReadyPlayerMeAvatarCreator({ 
  onAvatarCreated, 
  onAvatarExported,
  className = ""
}: ReadyPlayerMeAvatarCreatorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [savedAvatars, setSavedAvatars] = useState<Array<{
    id: number;
    avatarName: string;
    readyPlayerMeUrl?: string;
    updatedAt: string;
  }>>([]);
  const [currentAvatarName, setCurrentAvatarName] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);

  // Customization state
  const [customization, setCustomization] = useState<AvatarCustomization>({
    gender: 'male',
    skinTone: 'medium',
    hairColor: 'black',
    hairStyle: 'short',
    eyeColor: 'brown',
    clothingStyle: 'casual'
  });

  // Ready Player Me configuration
  const config: AvatarCreatorConfig = {
    clearCache: true,
    bodyType: 'fullbody',
    quickStart: false,
    language: 'en',
    // Pre-filled values
    gender: customization.gender,
    skinTone: customization.skinTone,
    hairColor: customization.hairColor,
    hairStyle: customization.hairStyle,
    eyeColor: customization.eyeColor,
    clothing: customization.clothingStyle,
  };

  // Event handlers
  const handleOnUserSet = (event: UserSetEvent) => {
    console.log(`User ID is: ${event.data.id}`);
  };

  const handleOnAvatarExported = (event: AvatarExportedEvent) => {
    setAvatarUrl(event.data.url);
    setIsCreating(false);
    setShowSaveDialog(true);
    setShowAvatarCreator(false);
    
    if (onAvatarCreated) {
      onAvatarCreated(event.data.url);
    }
    if (onAvatarExported) {
      onAvatarExported(event as unknown);
    }
  };

  const handleUserAuthorized = (event: UserAuthorizedEvent) => {
    console.log('User authorized:', event);
  };

  const handleAssetUnlocked = (event: AssetUnlockedEvent) => {
    console.log('Asset unlocked:', event);
  };

  // Load saved avatars
  const loadSavedAvatars = async () => {
    try {
      const response = await fetch('/api/avatar/list');
      const result = await response.json();
      if (result.success) {
        setSavedAvatars(result.data);
      }
    } catch {
      // Error loading saved avatars
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
          readyPlayerMeUrl: avatarUrl,
          readyPlayerMeId: Date.now().toString(),
          readyPlayerMeData: customization,
          formData: {
            gender: customization.gender,
            skinTone: customization.skinTone,
            hairColor: customization.hairColor,
            hairStyle: customization.hairStyle,
            eyeColor: customization.eyeColor,
            clothingStyle: customization.clothingStyle,
            height: 170,
            weight: 65
          }
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
          Ready Player Me Avatar Creator
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tạo avatar 3D chuyên nghiệp với Ready Player Me
        </p>
      </div>

      {/* Customization Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-indigo-600" />
          Tùy chỉnh Avatar
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Gender Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                    customization.gender === option.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{option.icon}</div>
                  <div className="text-xs font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Skin Tone */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Màu da
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { value: 'light', label: 'Sáng', color: '#FDBCB4' },
                { value: 'medium', label: 'TB', color: '#E8A87C' },
                { value: 'dark', label: 'Tối', color: '#8B4513' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCustomization(prev => ({ ...prev, skinTone: option.value }))}
                  className={`p-2 rounded border transition-all ${
                    customization.skinTone === option.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-full mx-auto mb-1 border border-gray-300"
                    style={{ backgroundColor: option.color }}
                  />
                  <div className="text-xs font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Hair Color */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              Màu tóc
            </label>
            <div className="grid grid-cols-4 gap-1">
              {['black', 'brown', 'blonde', 'red'].map((color) => (
                <button
                  key={color}
                  onClick={() => setCustomization(prev => ({ ...prev, hairColor: color }))}
                  className={`p-2 rounded border transition-all ${
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
        </div>

        {/* Create Avatar Button */}
        <button
          onClick={() => setShowAvatarCreator(true)}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Tạo Avatar 3D
        </button>
      </div>

      {/* Avatar Creator Modal */}
      {showAvatarCreator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-6xl h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Ready Player Me Avatar Creator</h3>
              <button
                onClick={() => setShowAvatarCreator(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Avatar Creator */}
            <div className="h-[calc(100%-80px)]">
              <AvatarCreator
                subdomain="demo"
                config={config}
                style={{ width: "100%", height: "100%", border: "none" }}
                onAvatarExported={handleOnAvatarExported}
                onUserSet={handleOnUserSet}
                onUserAuthorized={handleUserAuthorized}
                onAssetUnlock={handleAssetUnlocked}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Preview Panel */}
      {avatarUrl && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Avatar đã tạo</h3>
          <div className="text-center">
            <Image 
              src={avatarUrl} 
              alt="Generated Avatar"
              width={300}
              height={300}
              className="rounded-lg shadow-lg mx-auto mb-4"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Avatar đã được tạo thành công!
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
                  setShowAvatarCreator(true);
                }}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tạo mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Avatars */}
      {savedAvatars.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold mb-4">Avatars đã lưu</h3>
          <div className="grid grid-cols-2 gap-3">
            {savedAvatars.map((avatar) => (
              <div key={avatar.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{avatar.avatarName}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(avatar.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {avatar.readyPlayerMeUrl && (
                  <Image 
                    src={avatar.readyPlayerMeUrl} 
                    alt={avatar.avatarName}
                    width={200}
                    height={80}
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        // Load full avatar data from API
                        const response = await fetch(`/api/avatar/load?avatarName=${encodeURIComponent(avatar.avatarName)}`);
                        const result = await response.json();
                        
                        if (result.success && result.data) {
                          const avatarData = result.data;
                          const url = avatarData.readyPlayerMeUrl || null;
                          
                          // Set local state
                          setAvatarUrl(url);
                          
                          // Trigger callbacks to notify parent component
                          if (url && onAvatarCreated) {
                            onAvatarCreated(url);
                          }
                          if (onAvatarExported) {
                            // Use actual data from database
                            const exportData = {
                              id: avatarData.id?.toString() || avatar.id.toString(),
                              url: url,
                              gender: avatarData.gender || 'male',
                              skinTone: avatarData.skinTone || 'medium',
                              hairColor: avatarData.hairColor || 'black',
                              hairStyle: avatarData.hairStyle || 'short',
                              eyeColor: avatarData.eyeColor || 'brown',
                              clothingStyle: avatarData.clothingStyle || 'casual'
                            };
                            onAvatarExported(exportData);
                          }
                        } else {
                          console.error('Failed to load avatar:', result.error);
                        }
                      } catch (error) {
                        console.error('Error loading avatar:', error);
                      }
                    }}
                    className="flex-1 px-2 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa avatar này?')) {
                        fetch(`/api/avatar/load?avatarName=${encodeURIComponent(avatar.avatarName)}`, {
                          method: 'DELETE'
                        }).then(() => loadSavedAvatars());
                      }
                    }}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>
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
    </div>
  );
}
