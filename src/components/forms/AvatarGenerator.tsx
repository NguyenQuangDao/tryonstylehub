'use client';

import { useState } from 'react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Download } from 'lucide-react';

interface AvatarGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
  onError: (error: string) => void;
}

export default function AvatarGenerator({ onImageGenerated, onError }: AvatarGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      onError('Vui lòng nhập mô tả cho avatar');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Portrait of a person: ${prompt}. Professional headshot, clean background, high quality`,
          quality,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Không thể tạo avatar');
      }

      setGeneratedImage(data.imageUrl);
      onImageGenerated(data.imageUrl);
    } catch (error) {
      console.error('Error generating avatar:', error);
      onError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo avatar');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseImage = () => {
    if (generatedImage) {
      onImageGenerated(generatedImage);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `avatar-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      onError('Không thể tải xuống ảnh');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Tạo Avatar với AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="avatar-prompt" className="text-sm font-medium">Mô tả avatar</label>
          <textarea
            id="avatar-prompt"
            placeholder="Ví dụ: Một người phụ nữ trẻ với tóc dài màu nâu, mắt xanh, nụ cười tươi..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            disabled={isGenerating}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quality" className="text-sm font-medium">Chất lượng</Label>
          <Select value={quality} onValueChange={(value: string) => setQuality(value as 'standard' | 'hd')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn chất lượng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Tiêu chuẩn (Nhanh hơn)</SelectItem>
              <SelectItem value="hd">HD (Chất lượng cao)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tạo avatar...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Tạo Avatar
            </>
          )}
        </Button>

        {generatedImage && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={generatedImage}
                alt="Generated avatar"
                className="w-full h-64 object-cover rounded-lg border"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUseImage} className="flex-1">
                Sử dụng Avatar này
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}