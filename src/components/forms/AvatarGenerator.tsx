'use client';

import { Button, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PromptService } from '@/services';
import { Download, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useState } from 'react';

interface UserInfo {
  gender: 'male' | 'female' | 'non-binary';
  height: number;
  weight: number;
  skinTone: 'very-light' | 'light' | 'medium' | 'tan' | 'brown' | 'dark';
  eyeColor: 'brown' | 'black' | 'blue' | 'green' | 'gray' | 'amber';
  hairColor: 'black' | 'brown' | 'blonde' | 'red' | 'white' | 'gray' | 'other';
  hairStyle: 'long' | 'short' | 'curly' | 'straight' | 'bald' | 'wavy';
}

interface AvatarGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
  onError: (error: string) => void;
  userInfo?: UserInfo;
}

export default function AvatarGenerator({ onImageGenerated, onError, userInfo }: AvatarGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [range, setRange] = useState<'upper-body' | 'full-body'>('full-body');
  const [pose, setPose] = useState<'standing' | 'walking' | 'hands-on-hips' | 'arms-crossed' | 'leaning'>('standing');

  const generatePromptFromUserInfo = async () => {
    if (!userInfo) {
      onError('Không có thông tin người dùng để tạo prompt');
      return;
    }

    setIsGeneratingPrompt(true);
    try {
      const promptService = new PromptService();
      const generatedPrompt = prompt.trim()
        ? await promptService.composeAndImprovePrompt(userInfo, prompt)
        : await promptService.generatePrompt(userInfo);
      setPrompt(generatedPrompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
      onError('Không thể tạo prompt tự động. Vui lòng nhập prompt thủ công.');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

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
          prompt: prompt,
          quality,
          range,
          pose,
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
          <div className="flex items-center justify-between">
            <label htmlFor="avatar-prompt" className="text-sm font-medium">Mô tả avatar</label>
            {userInfo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generatePromptFromUserInfo}
                disabled={isGeneratingPrompt || isGenerating}
                className="flex items-center gap-1"
              >
                {isGeneratingPrompt ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Tạo tự động / Tối ưu prompt
                  </>
                )}
              </Button>
            )}
          </div>
          <textarea
            id="avatar-prompt"
            placeholder="Ví dụ: Mô tả cấu trúc khuôn mặt, dáng đứng, độ cao – tránh từ ngữ về màu sắc, ánh sáng, nền."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            disabled={isGenerating || isGeneratingPrompt}
            className="w-full min-h-[200px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Hướng dẫn: Ưu tiên mô tả cấu trúc (grayscale, viền/đường nét), tránh màu sắc, camera, ánh sáng, nền. Chọn phạm vi và tư thế bên dưới.
          </p>
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

        <div className="space-y-2">
          <Label htmlFor="range" className="text-sm font-medium">Phạm vi tạo ảnh</Label>
          <Select value={range} onValueChange={(value: string) => setRange(value as 'upper-body' | 'full-body')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn phạm vi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upper-body">Nửa thân trên</SelectItem>
              <SelectItem value="full-body">Toàn thân (đầu đến chân)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pose" className="text-sm font-medium">Tư thế toàn thân</Label>
          <Select value={pose} onValueChange={(value: string) => setPose(value as 'standing' | 'walking' | 'hands-on-hips' | 'arms-crossed' | 'leaning')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn tư thế" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standing">Đứng thẳng, tay thả lỏng</SelectItem>
              <SelectItem value="walking">Bước nhẹ, tay vung tự nhiên</SelectItem>
              <SelectItem value="hands-on-hips">Đặt tay lên hông</SelectItem>
              <SelectItem value="arms-crossed">Khoanh tay</SelectItem>
              <SelectItem value="leaning">Nghiêng người nhẹ</SelectItem>
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

        <div className="rounded-md border p-3 text-xs text-muted-foreground">
          <div className="font-medium mb-1">Prompt (Tiếng Việt)</div>
          <div>
            Phạm vi: {range === 'full-body' ? 'Toàn thân' : 'Nửa thân trên'}; Tư thế: {
              pose === 'standing' ? 'Đứng thẳng, tay thả lỏng'
              : pose === 'walking' ? 'Bước nhẹ, tay vung tự nhiên'
              : pose === 'hands-on-hips' ? 'Đặt tay lên hông'
              : pose === 'arms-crossed' ? 'Khoanh tay'
              : 'Nghiêng người nhẹ'
            }. Mô tả cấu trúc: ảnh grayscale, độ tương phản cao, nhấn mạnh đường viền, tập trung hình dạng; bất biến góc quay; không yêu cầu nền.
          </div>
        </div>

        {generatedImage && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={generatedImage}
                alt="Generated avatar"
                className="w-full h-64 object-contain rounded-lg border"
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
