'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// danh mục sẽ được tải động từ API

const STYLE_TAGS = [
  'casual', 'formal', 'street', 'vintage', 'minimalist', 'bohemian',
  'sporty', 'elegant', 'trendy', 'classic', 'modern', 'retro',
  'chic', 'comfortable', 'business', 'party', 'summer', 'winter'
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const COLORS = ['Đen', 'Trắng', 'Xám', 'Nâu', 'Be', 'Navy', 'Xanh dương', 'Xanh lá', 'Đỏ', 'Hồng', 'Tím', 'Vàng', 'Cam'];


export default function EditProductPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    styleTags: [] as string[],
    images: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?callbackUrl=/seller/products');
      return;
    }

    if (!authLoading && user && user.role !== 'SELLER') {
      router.push('/');
      return;
    }

    if (!authLoading && user && user.role === 'SELLER') {
      const run = async () => {
        try {
          // tải danh mục
          const catRes = await fetch('/api/seller/categories');
          if (catRes.ok) {
            const catData = await catRes.json();
            setCategories((catData.categories || []).map((c: any) => c.name));
          }

          // nếu có id sản phẩm thì tải sản phẩm
          if (productId) {
            const response = await fetch(`/api/seller/products/${productId}`);
            const data = await response.json();

            if (response.ok) {
              setFormData({
                name: data.title ?? data.name ?? '',
                description: data.description ?? '',
                price: (data.basePrice !== undefined ? Number(data.basePrice) : data.price ?? 0).toString(),
                category: (data.category?.name ?? data.category ?? ''),
                styleTags: Array.isArray(data.styleTags) ? data.styleTags : [],
                images: Array.isArray(data.images) ? data.images.map((img: any) => (typeof img === 'string' ? img : img.url)).filter(Boolean) : [],
                sizes: Array.isArray(data.sizes) ? data.sizes : [],
                colors: Array.isArray(data.colors) ? data.colors : [],
                isFeatured: data.status ? data.status === 'PUBLISHED' : !!data.isFeatured,
                isActive: data.status ? data.status === 'PUBLISHED' : !!data.isActive,
              });
            } else {
              alert(data.error || 'Không tìm thấy sản phẩm');
              router.push('/seller/products');
            }
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          alert('Có lỗi xảy ra khi tải thông tin sản phẩm');
          router.push('/seller/products');
        } finally {
          setPageLoading(false);
        }
      };
      run();
    }
  }, [authLoading, user, router, productId]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.urls && data.urls.length > 0) {
            uploadedUrls.push(...data.urls);
          } else if (data.url) {
            uploadedUrls.push(data.url);
          }
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Có lỗi xảy ra khi tải ảnh lên');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Sản phẩm đã được cập nhật thành công!');
        router.push('/seller/products');
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Có lỗi xảy ra khi cập nhật sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productId) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/seller/products/${productId}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        alert('Sản phẩm đã được xóa thành công!');
        router.push('/seller/products');
      } else {
        alert((data as any)?.error || 'Có lỗi xảy ra khi xóa sản phẩm');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
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
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (pageLoading || authLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Chỉnh sửa sản phẩm</CardTitle>
            <TooltipProvider>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="h-11 min-w-[44px] px-4 transition-transform active:scale-95"
                    >
                      Quay lại
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Quay lại trang trước</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      form="edit-product-form"
                      className="h-11 min-w-[44px] px-4 transition-transform active:scale-95"
                      disabled={saving || formData.images.length === 0}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        'Lưu'
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Lưu thay đổi sản phẩm</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => router.push('/seller/products')}
                      className="h-11 min-w-[44px] px-4 transition-transform active:scale-95"
                    >
                      Hủy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Hủy và quay lại danh sách</TooltipContent>
                </Tooltip>
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          className="h-11 min-w-[44px] px-4 transition-transform active:scale-95"
                        >
                          Xóa
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Xóa sản phẩm này</TooltipContent>
                  </Tooltip>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Xóa sản phẩm</DialogTitle>
                      <DialogDescription>
                        Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="h-11 min-w-[44px] px-4">Hủy</Button>
                      <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="h-11 min-w-[44px] px-4">
                        {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Xóa
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-6">
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
                {Array.from(new Set([formData.category, ...categories].filter(Boolean))).map((category) => (
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
            </div>

            {/* Images */}
            <div>
              <Label>Hình ảnh sản phẩm</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploadingImages}
                />
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingImages ? 'Đang tải...' : 'Tải ảnh lên'}
                </Label>
              </div>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
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

            {/* Featured & Active */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                <Label htmlFor="isActive" className="mb-0">Đang hoạt động</Label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="flex-1 h-11 transition-transform active:scale-95"
                disabled={saving || formData.images.length === 0}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  'Cập nhật sản phẩm'
                )}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={() => router.push('/seller/products')}
                className="h-11 transition-transform active:scale-95"
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
