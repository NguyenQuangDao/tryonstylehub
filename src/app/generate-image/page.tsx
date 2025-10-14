'use client'

import { motion } from 'framer-motion';
import { Download, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function GenerateImagePage() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tạo Ảnh AI</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tạo ảnh thời trang với công nghệ DALL-E 3
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Mô tả ảnh bạn muốn tạo
          </label>
          
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            placeholder="Ví dụ: A stylish woman wearing a summer dress on a beach at sunset, professional photography, high quality..."
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang tạo ảnh...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Tạo Ảnh
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
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Kết quả
              </h2>
              
              <a
                href={imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Download className="h-5 w-5" />
                Tải xuống
              </a>
            </div>

            <div className="aspect-square max-w-2xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt="Generated fashion image"
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        )}

        {!imageUrl && !loading && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Ảnh của bạn sẽ xuất hiện ở đây
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

