"use client";

import { motion } from 'framer-motion';
import {
    AlertCircle,
    CheckCircle,
    Download,
    RefreshCw,
    Sparkles,
    User
} from 'lucide-react';
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
  gender = 'male',
  bodyType = 'fullbody',
  quality = 'high',
  camera = 'front',
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

  // Build Ready Player Me URL with parameters
  const buildAvatarUrl = () => {
    const baseUrl = 'https://demo.readyplayer.me/avatar';
    const params = new URLSearchParams();
    
    // Basic parameters
    params.append('frameApi', 'true');
    params.append('gender', gender);
    params.append('bodyType', bodyType);
    params.append('quality', quality);
    params.append('camera', camera);
    
    // Pre-filled values (only supported ones)
    if (presetGender) params.append('gender', presetGender);
    if (presetSkinTone) params.append('skinTone', presetSkinTone);
    if (presetHairColor) params.append('hairColor', presetHairColor);
    if (presetHairStyle) params.append('hairStyle', presetHairStyle);
    if (presetEyeColor) params.append('eyeColor', presetEyeColor);
    if (presetClothing) params.append('clothing', presetClothing);
    
    const finalUrl = `${baseUrl}?${params.toString()}`;
    console.log('Ready Player Me URL:', finalUrl);
    return finalUrl;
  };

  // Load Ready Player Me iframe
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    // Listen for Ready Player Me events
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://demo.readyplayer.me') return;
      
      if (event.data.type === 'vrm.downloaded') {
        console.log('Avatar downloaded:', event.data);
        setAvatarUrl(event.data.url);
        setIsCreating(false);
        
        if (onAvatarCreated) {
          onAvatarCreated(event.data.url);
        }
        if (onAvatarExported) {
          onAvatarExported(event.data);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Load Ready Player Me iframe after component mounts
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('message', handleMessage);
    };
  }, [onAvatarCreated, onAvatarExported]);

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
          Đang tải Avatar Creator...
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Ready Player Me đang khởi động
        </p>
        
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
          Lỗi tải Avatar Creator
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
          Tạo Avatar 3D
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400">
          Sử dụng Ready Player Me để tạo avatar 3D thực tế
        </p>
      </div>

      {/* Avatar Creator Container */}
      <div className="relative">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Ready Player Me iframe */}
          <iframe
            src={buildAvatarUrl()}
            title="Ready Player Me Avatar Creator"
            className="w-full h-[600px] border-0"
            allow="camera; microphone"
            onLoad={() => {
              console.log('Ready Player Me iframe loaded with params:', buildAvatarUrl());
              setIsCreating(false);
            }}
            onError={() => {
              console.error('Ready Player Me iframe error');
              setError('Không thể tải Ready Player Me. Vui lòng kiểm tra kết nối mạng.');
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          📋 Hướng dẫn sử dụng:
        </h4>
        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
          <li>Chọn giới tính và màu da</li>
          <li>Tùy chỉnh khuôn mặt, tóc, mắt</li>
          <li>Chọn trang phục và phụ kiện</li>
          <li>Click &ldquo;Done&rdquo; để tạo avatar</li>
          <li>Avatar sẽ được lưu tự động</li>
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
