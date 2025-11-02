'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from '@/components/ui';

interface BodyPart {
  id: string;
  name: string;
  category:
    | 'hair'
    | 'head'
    | 'torso'
    | 'leftArm'
    | 'rightArm'
    | 'legs'
    | 'feet'
    | 'accessories';
  imagePath: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
  opacity?: number;
}

interface BodyComposition {
  id: string;
  name: string;
  parts: BodyPart[];
  baseImage?: string;
  canvasSize: {
    width: number;
    height: number;
  };
}

export default function BodyPartsComposer() {
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [selectedParts, setSelectedParts] = useState<BodyPart[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('head');
  const [compositions, setCompositions] = useState<BodyComposition[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [compositionName, setCompositionName] = useState('');
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 1000 });

  const categories = [
    { value: 'hair', label: 'Tóc' },
    { value: 'head', label: 'Đầu (không tóc)' },
    { value: 'torso', label: 'Thân' },
    { value: 'leftArm', label: 'Tay trái' },
    { value: 'rightArm', label: 'Tay phải' },
    { value: 'legs', label: 'Chân' },
    { value: 'feet', label: 'Bàn chân' },
    { value: 'accessories', label: 'Phụ kiện' }
  ];

  // Load body parts
  const loadBodyParts = useCallback(async (category?: string) => {
    try {
      setLoading(true);
      const url = category 
        ? `/api/body-parts?category=${category}`
        : '/api/body-parts';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setBodyParts(data.data);
      }
    } catch (error) {
      console.error('Error loading body parts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load compositions
  const loadCompositions = useCallback(async () => {
    try {
      const response = await fetch('/api/body-parts/compositions');
      const data = await response.json();
      
      if (data.success) {
        setCompositions(data.data);
      }
    } catch (error) {
      console.error('Error loading compositions:', error);
    }
  }, []);

  useEffect(() => {
    loadBodyParts(currentCategory);
    loadCompositions();
  }, [currentCategory, loadBodyParts, loadCompositions]);

  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
  };

  const handlePartSelect = (part: BodyPart) => {
    setSelectedParts(prev => {
      // Remove existing part of same category
      const filtered = prev.filter(p => p.category !== part.category);
      return [...filtered, part];
    });
  };

  const handlePartRemove = (partId: string) => {
    setSelectedParts(prev => prev.filter(p => p.id !== partId));
  };

  const handleCompose = async () => {
    if (selectedParts.length === 0) {
      alert('Vui lòng chọn ít nhất một bộ phận');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/body-parts/compose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parts: selectedParts,
          canvasSize,
          compositionName: compositionName || `Composition ${Date.now()}`
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedImage(data.data.imageUrl);
        
        // Save composition
        if (compositionName) {
          await fetch('/api/body-parts/compositions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: compositionName,
              parts: selectedParts,
              canvasSize
            }),
          });
          
          loadCompositions();
        }
      } else {
        alert(data.error || 'Lỗi khi ghép ảnh');
      }
    } catch (error) {
      console.error('Error composing image:', error);
      alert('Lỗi khi ghép ảnh');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadComposition = (composition: BodyComposition) => {
    setSelectedParts(composition.parts);
    setCanvasSize(composition.canvasSize);
    setCompositionName(composition.name);
  };

  const handlePartPositionChange = (partId: string, field: string, value: number) => {
    setSelectedParts(prev => prev.map(part => 
      part.id === partId 
        ? { ...part, position: { ...part.position, [field]: value } }
        : part
    ));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Body Parts Selection */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Chọn Bộ Phận Cơ Thể</h2>
            
            {/* Category Selection */}
            <div className="mb-4">
              <Label className="block text-sm font-medium mb-2">Danh mục:</Label>
              <Select value={currentCategory} onValueChange={(value: string) => handleCategoryChange(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Body Parts Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {bodyParts.map(part => (
                <div
                  key={part.id}
                  className="border rounded p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handlePartSelect(part)}
                >
                  <div className="text-sm font-medium">{part.name}</div>
                  <div className="text-xs text-gray-500">{part.category}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Parts */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-4">Bộ Phận Đã Chọn</h3>
            <div className="space-y-2">
              {selectedParts.map(part => (
                <div key={part.id} className="border rounded p-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{part.name}</span>
                    <button
                      onClick={() => handlePartRemove(part.id)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                  
                  {/* Position Controls */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label>X:</label>
                      <input
                        type="number"
                        value={part.position.x}
                        onChange={(e) => handlePartPositionChange(part.id, 'x', parseInt(e.target.value))}
                        className="w-full h-6 p-1 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label>Y:</label>
                      <input
                        type="number"
                        value={part.position.y}
                        onChange={(e) => handlePartPositionChange(part.id, 'y', parseInt(e.target.value))}
                        className="w-full h-6 p-1 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label>W:</label>
                      <input
                        type="number"
                        value={part.position.width}
                        onChange={(e) => handlePartPositionChange(part.id, 'width', parseInt(e.target.value))}
                        className="w-full h-6 p-1 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label>H:</label>
                      <input
                        type="number"
                        value={part.position.height}
                        onChange={(e) => handlePartPositionChange(part.id, 'height', parseInt(e.target.value))}
                        className="w-full h-6 p-1 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Canvas Preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Canvas Preview</h2>
            
            {/* Canvas Size Controls */}
            <div className="mb-4 space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Chiều rộng:</label>
                <input
                  type="range"
                  min="300"
                  max="1200"
                  step="50"
                  value={canvasSize.width}
                  onChange={(e) => setCanvasSize(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{canvasSize.width}px</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Chiều cao:</label>
                <input
                  type="range"
                  min="400"
                  max="2000"
                  step="50"
                  value={canvasSize.height}
                  onChange={(e) => setCanvasSize(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{canvasSize.height}px</span>
              </div>
            </div>

            {/* Canvas Preview */}
            <div 
              className="border-2 border-dashed border-gray-300 bg-gray-50 mx-auto"
              style={{ 
                width: Math.min(canvasSize.width, 400), 
                height: Math.min(canvasSize.height, 600),
                position: 'relative'
              }}
            >
              {selectedParts.map(part => (
                <div
                  key={part.id}
                  className="absolute border border-blue-500 bg-blue-100 bg-opacity-50"
                  style={{
                    left: (part.position.x / canvasSize.width) * Math.min(canvasSize.width, 400),
                    top: (part.position.y / canvasSize.height) * Math.min(canvasSize.height, 600),
                    width: (part.position.width / canvasSize.width) * Math.min(canvasSize.width, 400),
                    height: (part.position.height / canvasSize.height) * Math.min(canvasSize.height, 600),
                  }}
                >
                  <div className="text-xs p-1">{part.name}</div>
                </div>
              ))}
            </div>

            {/* Composition Name */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Tên Composition:</label>
              <input
                type="text"
                value={compositionName}
                onChange={(e) => setCompositionName(e.target.value)}
                placeholder="Nhập tên composition..."
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleCompose}
              disabled={loading || selectedParts.length === 0}
              className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang ghép ảnh...' : 'Ghép Ảnh'}
            </button>
          </div>
        </div>

        {/* Right Panel - Generated Image & Compositions */}
        <div className="space-y-4">
          {/* Generated Image */}
          {generatedImage && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-bold mb-4">Ảnh Đã Ghép</h3>
              <Image
                src={generatedImage}
                alt="Generated composition"
                className="w-full rounded"
                width={400}
                height={600}
              />
            </div>
          )}

          {/* Saved Compositions */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-4">Compositions Đã Lưu</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {compositions.map(composition => (
                <div
                  key={composition.id}
                  className="border rounded p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleLoadComposition(composition)}
                >
                  <div className="text-sm font-medium">{composition.name}</div>
                  <div className="text-xs text-gray-500">
                    {composition.parts.length} bộ phận
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}