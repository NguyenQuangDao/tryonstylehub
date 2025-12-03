'use client';

export const dynamic = 'force-dynamic';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const CATEGORIES = [
  'Áo thun', 'Áo sơ mi', 'Áo khoác', 'Quần jean', 'Quần dài', 'Quần short',
  'Váy', 'Đầm', 'Chân váy', 'Áo len', 'Áo hoodie', 'Áo blazer',
  'Đồ thể thao', 'Đồ ngủ', 'Đồ bơi', 'Phụ kiện'
];

const STYLE_TAGS = [
  'casual', 'formal', 'street', 'vintage', 'minimalist', 'bohemian',
  'sporty', 'elegant', 'trendy', 'classic', 'modern', 'retro',
  'chic', 'comfortable', 'business', 'party', 'summer', 'winter'
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const COLORS = ['Đen', 'Trắng', 'Xám', 'Nâu', 'Be', 'Navy', 'Xanh dương', 'Xanh lá', 'Đỏ', 'Hồng', 'Tím', 'Vàng', 'Cam'];

export default function NewProductPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    styleTags: [] as string[],
    images: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    stock: '',
    isFeatured: false,
  });

  if (!loading && !user) {
    router.push('/auth/login?callbackUrl=/seller/products/new');
    return null;
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024;
    const valid: File[] = [];
    const previews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!allowed.includes(f.type)) continue;
      if (!f.size || f.size > maxSize) continue;
      valid.push(f);
      previews.push(URL.createObjectURL(f));
    }
    if (valid.length === 0) {
      alert('Vui lòng chọn ảnh định dạng jpg, png, webp và kích thước ≤ 10MB');
      return;
    }
    setSelectedFiles(prev => [...prev, ...valid]);
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setUploadProgress(0);

    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('price', formData.price);
      fd.append('category', formData.category);
      fd.append('stock', formData.stock);
      fd.append('isFeatured', String(formData.isFeatured));
      selectedFiles.forEach((file) => fd.append('images', file));

      const xhr = new XMLHttpRequest();
      const responsePromise = new Promise<Response>((resolve, reject) => {
        xhr.open('POST', '/api/seller/products');
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };
        xhr.onload = () => {
          const blob = new Blob([xhr.response], { type: xhr.getResponseHeader('Content-Type') || 'application/json' });
          const resp = new Response(blob, { status: xhr.status, statusText: xhr.statusText });
          resolve(resp);
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(fd);
      });

      const response = await responsePromise;
      
      const data = await response.json();

      if (response.ok) {
        alert('Sản phẩm đã được tạo thành công!');
        router.push('/dashboard/seller');
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Có lỗi xảy ra khi tạo sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStyleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      styleTags: prev.styleTags.includes(tag)
        ? prev.styleTags.filter(t => t !== tag)
        : [...prev.styleTags, tag],
    }));
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const toggleColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color],
    }));
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Thêm sản phẩm mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Tên sản phẩm *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              <div>
                <Label htmlFor="price">Giá *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Danh mục *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
                className="w-full p-2 border rounded-md"
              >
                <option value="">Chọn danh mục</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="description">Mô tả *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                placeholder="Mô tả chi tiết về sản phẩm"
                rows={4}
                minLength={10}
                maxLength={2000}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/2000 ký tự
              </p>
            </div>

            {/* Style Tags */}
            <div>
              <Label>Thẻ phong cách</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {STYLE_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant={formData.styleTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleStyleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              {formData.styleTags.length === 0 && (
                <p className="text-sm text-red-600 mt-2">Vui lòng chọn ít nhất một thẻ phong cách</p>
              )}
            </div>

            {/* Images */}
            <div>
              <Label>Hình ảnh sản phẩm</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                  disabled={submitting}
                />
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {submitting ? 'Đang tải...' : 'Tải ảnh lên'}
                </Label>
              </div>
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full h-32 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                        {!imageLoaded[index] && (
                          <div className="animate-pulse w-full h-full bg-gray-200" />
                        )}
                        <Image
                          src={image}
                          alt={`Product image ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                          className={imageLoaded[index] ? 'object-cover rounded-lg' : 'hidden'}
                          unoptimized
                          onLoadingComplete={() => setImageLoaded(prev => ({ ...prev, [index]: true }))}
                          onError={() => setImageLoaded(prev => ({ ...prev, [index]: false }))}
                        />
                        {imageLoaded[index] === false && (
                          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">Không thể hiển thị ảnh</div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sizes and Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Kích thước</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SIZES.map(size => (
                    <Badge
                      key={size}
                      variant={formData.sizes.includes(size) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Màu sắc</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {COLORS.map(color => (
                    <Badge
                      key={color}
                      variant={formData.colors.includes(color) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleColor(color)}
                    >
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Stock and Featured */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="stock">Số lượng tồn kho</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="mr-2"
                />
                <Label htmlFor="isFeatured" className="mb-0">Sản phẩm nổi bật</Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={submitting || imagePreviews.length === 0 || formData.styleTags.length === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo... {uploadProgress > 0 ? `${uploadProgress}%` : ''}
                </>
              ) : (
                'Tạo sản phẩm'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
