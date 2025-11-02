'use client'

import { motion } from 'framer-motion';
import { Camera, Download, Image as ImageIcon, Info, Loader2, Palette, Sparkles, Wand2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-100 dark:border-purple-900/30">
          <CardHeader className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <Wand2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent vietnamese-heading">
                  Tạo Ảnh AI
                </CardTitle>
                <CardDescription className="text-lg">
                  Tạo ảnh thời trang với công nghệ DALL-E 3 tiên tiến
                </CardDescription>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                AI-Powered
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
                <Palette className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                Chất lượng cao
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
                <Camera className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Nhanh chóng
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Usage Guide */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <div className={`flex items-center justify-between ${showGuide ? 'mb-4' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <Info className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">Hướng Dẫn Sử Dụng</CardTitle>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowGuide(!showGuide)}
                className="text-sm"
              >
                {showGuide ? 'Ẩn' : 'Xem'}
              </Button>
            </div>
          </CardHeader>
          
          {showGuide && (
            <CardContent>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">✨ Mô Tả Chi Tiết</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        Mô tả càng chi tiết càng tốt: màu sắc, phong cách, bối cảnh, ánh sáng để có kết quả tốt nhất.
                      </CardDescription>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">🎨 Phong Cách Thời Trang</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        Chỉ định phong cách: casual, formal, vintage, modern, bohemian, minimalist, etc.
                      </CardDescription>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">📸 Chất Lượng Ảnh</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        Thêm từ khóa: &quot;professional photography&quot;, &quot;high quality&quot;, &quot;4K&quot;, &quot;studio lighting&quot;.
                      </CardDescription>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">💡 Ví Dụ Prompt</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        &quot;A stylish woman wearing a summer dress on a beach at sunset, professional photography, high quality&quot;
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </CardContent>
          )}
        </Card>

        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-gray-200/50 dark:border-gray-800/50">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="prompt" className="text-sm font-medium">
                  Mô tả ảnh bạn muốn tạo
                </Label>
                
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                  placeholder="Ví dụ: A stylish woman wearing a summer dress on a beach at sunset, professional photography, high quality..."
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin mr-3" />
                    <span>Đang tạo ảnh...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6 mr-3" />
                    <span>Tạo Ảnh</span>
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>

        {imageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-gray-200/50 dark:border-gray-800/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-2xl">
                      Kết quả tạo ảnh
                    </CardTitle>
                  </div>
                  
                  <Button
                    asChild
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <a
                      href={imageUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Tải xuống
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-square max-w-2xl mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden shadow-lg relative">
                  <Image
                    src={imageUrl}
                    alt="Generated fashion image"
                    fill
                    className="object-contain"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!imageUrl && !loading && (
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-xl mb-2">
                Sẵn sàng tạo ảnh
              </CardTitle>
              <CardDescription>
                Ảnh của bạn sẽ xuất hiện ở đây sau khi tạo thành công
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

