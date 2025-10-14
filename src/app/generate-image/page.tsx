'use client'

import { motion } from 'framer-motion';
import { Camera, Download, Image as ImageIcon, Info, Loader2, Palette, Sparkles, Wand2 } from 'lucide-react';
import { useState } from 'react';

export default function GenerateImagePage() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (prompt.length < 10) {
      setError('Vui lòng nhập ít nhất 10 ký tự');
      return;
    }

    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, quality: 'hd' }),
      });

      if (!response.ok) {
        throw new Error('Không thể tạo ảnh');
      }

      const data = await response.json();
      
      if (data.success) {
        setImageUrl(data.imageUrl);
      } else {
        setError(data.error || 'Đã xảy ra lỗi');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-pink-500 to-orange-500 rounded-full blur-3xl"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 relative z-10"
      >
        {/* Hero Section */}
        <div className="text-center space-y-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 shadow-lg border border-purple-100 dark:border-purple-900/30">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
              <Wand2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent vietnamese-heading">
                Tạo Ảnh AI
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Tạo ảnh thời trang với công nghệ DALL-E 3 tiên tiến
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <Palette className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chất lượng cao</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <Camera className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nhanh chóng</span>
            </div>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-6 border border-purple-200 dark:border-purple-800">
        <div className={`flex items-center justify-between ${showGuide ? 'mb-4' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <Info className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Hướng Dẫn Sử Dụng</h2>
            </div>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {showGuide ? 'Ẩn' : 'Xem'}
            </button>
          </div>
          
          {showGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">✨ Mô Tả Chi Tiết</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mô tả càng chi tiết càng tốt: màu sắc, phong cách, bối cảnh, ánh sáng để có kết quả tốt nhất.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🎨 Phong Cách Thời Trang</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Chỉ định phong cách: casual, formal, vintage, modern, bohemian, minimalist, etc.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📸 Chất Lượng Ảnh</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Thêm từ khóa: "professional photography", "high quality", "4K", "studio lighting".
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">💡 Ví Dụ Prompt</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    "A stylish woman wearing a summer dress on a beach at sunset, professional photography, high quality"
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 p-8">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Mô tả ảnh bạn muốn tạo
          </label>
          
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none placeholder-gray-400"
            placeholder="Ví dụ: A stylish woman wearing a summer dress on a beach at sunset, professional photography, high quality..."
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Đang tạo ảnh...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-6 w-6" />
                <span>Tạo Ảnh</span>
              </>
            )}
          </button>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </motion.p>
          )}
        </form>

        {imageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Kết quả tạo ảnh
                </h2>
              </div>
              
              <a
                href={imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download className="h-5 w-5" />
                Tải xuống
              </a>
            </div>

            <div className="aspect-square max-w-2xl mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={imageUrl}
                alt="Generated fashion image"
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        )}

        {!imageUrl && !loading && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <ImageIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Sẵn sàng tạo ảnh
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Ảnh của bạn sẽ xuất hiện ở đây sau khi tạo thành công
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

