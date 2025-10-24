"use client";

import {
  AssetUnlockedEvent,
  AvatarCreatorConfig,
  AvatarExportedEvent,
  AvatarCreator as ReadyPlayerMeAvatarCreator,
  UserAuthorizedEvent,
  UserSetEvent,
} from "@readyplayerme/react-avatar-creator";
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  Download,
  RefreshCw,
  Sparkles,
  User
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface AvatarCreatorProps {
  onAvatarCreated?: (avatarUrl: string) => void;
  onAvatarExported?: (data: unknown) => void;
  className?: string;
  // Customization parameters
  gender?: 'male' | 'female';
  bodyType?: 'fullbody' | 'halfbody';
  quality?: 'medium' | 'high';
  camera?: 'front' | 'side';
  // Pre-filled values
  presetGender?: 'male' | 'female';
  presetSkinTone?: string;
  presetHairColor?: string;
  presetHairStyle?: string;
  presetEyeColor?: string;
  presetClothing?: string;
}

export default function AvatarCreator({ 
  onAvatarCreated, 
  onAvatarExported,
  className = "",
  bodyType = 'fullbody',
  presetGender,
  presetSkinTone,
  presetHairColor,
  presetHairStyle,
  presetEyeColor,
  presetClothing
}: AvatarCreatorProps) {
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

  // Ready Player Me configuration
  const config: AvatarCreatorConfig = {
    clearCache: true,
    bodyType: bodyType as "fullbody" | "halfbody",
    quickStart: false,
    language: "en",
    // Pre-filled values
    ...(presetGender && { gender: presetGender }),
    ...(presetSkinTone && { skinTone: presetSkinTone }),
    ...(presetHairColor && { hairColor: presetHairColor }),
    ...(presetHairStyle && { hairStyle: presetHairStyle }),
    ...(presetEyeColor && { eyeColor: presetEyeColor }),
    ...(presetClothing && { clothing: presetClothing }),
  };

  // Event handlers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOnUserSet = (_event: UserSetEvent) => {
    // User set event handled
  };

  const handleOnAvatarExported = (event: AvatarExportedEvent) => {
    setAvatarUrl(event.data.url);
    setIsCreating(false);
    setShowSaveDialog(true);
    
    if (onAvatarCreated) {
      onAvatarCreated(event.data.url);
    }
    if (onAvatarExported) {
      onAvatarExported(event as unknown);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUserAuthorized = (_event: UserAuthorizedEvent) => {
    // User authorized event handled
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAssetUnlocked = (_event: AssetUnlockedEvent) => {
    // Asset unlocked event handled
  };

  // Load saved avatars
  const loadSavedAvatars = async () => {
    try {
      const response = await fetch('/api/avatar/list');
      const result = await response.json();
      if (result.success) {
        setSavedAvatars(result.data);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // Error loading saved avatars
    }
  };

  // Save avatar to database
  const saveAvatar = async (avatarName: string, avatarData: { id: number }) => {
    try {
      const response = await fetch('/api/avatar/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatarName,
          readyPlayerMeUrl: avatarUrl,
          readyPlayerMeId: avatarData.id,
          readyPlayerMeData: avatarData,
          formData: {
            gender: presetGender || 'male',
            skinTone: presetSkinTone || 'medium',
            hairColor: presetHairColor || 'black',
            hairStyle: presetHairStyle || 'short',
            eyeColor: presetEyeColor || 'brown',
            clothingStyle: presetClothing || 'casual',
            height: 170,
            weight: 65
          }
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowSaveDialog(false);
        setCurrentAvatarName('');
        await loadSavedAvatars(); // Reload the list
        return true;
      } else {
        throw new Error(result.error);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      setError('Failed to save avatar');
      return false;
    }
  };

  // Load specific avatar
  const loadAvatar = async (avatarName: string) => {
    try {
      const response = await fetch(`/api/avatar/load?avatarName=${encodeURIComponent(avatarName)}`);
      const result = await response.json();
      if (result.success) {
        const avatarData = result.data;
        setAvatarUrl(avatarData.readyPlayerMeUrl);
        setCurrentAvatarName(avatarData.avatarName);
        
      // Update config with loaded data
      if (avatarData.readyPlayerMeData) {
        // This would need to be handled by Ready Player Me component
      }
        return true;
      } else {
        throw new Error(result.error);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      setError('Failed to load avatar');
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
          Avatar Creator
        </h2>
      </div>

      {/* Avatar Creator Container */}
      <div className="relative">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Ready Player Me React Component */}
          <div style={{ width: "100%", height: "600px" }}>
            <ReadyPlayerMeAvatarCreator
              subdomain="demo"
              config={config}
              style={{ width: "100%", height: "100%", border: "none", margin: 0 }}
              onAvatarExported={handleOnAvatarExported}
              onUserAuthorized={handleUserAuthorized}
              onAssetUnlock={handleAssetUnlocked}
              onUserSet={handleOnUserSet}
            />
          </div>
        </div>
      </div>

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
                    onClick={() => loadAvatar(avatar.avatarName)}
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

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Hướng dẫn:
        </h4>
        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
          <li>Tùy chỉnh avatar theo ý muốn</li>
          <li>Click &quot;Done&quot; để tạo avatar</li>
          <li>Nhập tên để lưu avatar</li>
        </ol>
      </div>

      {/* Status */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
        >
          <RefreshCw className="w-5 h-5 text-green-500 mr-2 animate-spin" />
          <span className="text-green-700 dark:text-green-300">
            Đang tạo avatar...
          </span>
        </motion.div>
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
                    saveAvatar(currentAvatarName.trim(), { id: Date.now() });
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
