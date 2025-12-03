'use client';

export const dynamic = 'force-dynamic';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/lib/auth-context';
import { PLACEHOLDER_IMAGE } from '@/lib/placeholder-image';
import { Edit, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: Array<{ url: string; altText?: string }>;
  styleTags: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  isFeatured: boolean;
  isActive?: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
}

export default function SellerProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categoryOptions = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth/login?callbackUrl=/seller/products');
      return;
    }
    fetchProducts();
  }, [loading, user, router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/seller/products');
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
      } else {
        console.error('Error fetching products:', data.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const deleteProduct = async (productId: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setProducts(products.filter((p: Product) => p.id !== productId));
        alert('Sản phẩm đã được xóa thành công!');
      } else {
        alert((data as { error?: string })?.error || 'Có lỗi xảy ra khi xóa sản phẩm');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setProducts(products.map((p: Product) =>
          p.id === productId ? { ...p, isActive: !currentStatus } : p
        ));
      } else {
        const data = await response.json();
        alert(data.error || 'Có lỗi xảy ra khi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (pageLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => router.push('/seller/products/new')} className="h-11 px-4 transition-transform active:scale-95">
                <Plus className="h-4 w-4 mr-2" />
                Thêm sản phẩm mới
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tạo sản phẩm mới</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="">Tất cả danh mục</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <Image
                src={product.images?.[0]?.url || PLACEHOLDER_IMAGE}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
                unoptimized
              />
              {product.isFeatured && (
                <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                  Nổi bật
                </Badge>
              )}
              {((product.status && product.status !== 'ACTIVE') || (product.isActive === false)) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Badge variant="destructive">Ngừng bán</Badge>
                </div>
              )}
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
              <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-green-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {product?.styleTags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {product?.styleTags?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.styleTags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/seller/products/${product.id}/edit`)}
                          className="flex-1 h-11 transition-transform active:scale-95"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Sửa
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Chỉnh sửa sản phẩm</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => toggleProductStatus(product.id, !!product.isActive)}
                          className="flex-1 h-11 transition-transform active:scale-95"
                        >
                          {product.isActive ? 'Ngừng' : 'Kích hoạt'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{product.isActive ? 'Ngừng bán' : 'Kích hoạt bán'}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          onClick={() => setDeleteTarget(product)}
                          className="h-11 w-11 p-0 transition-transform active:scale-95"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Xóa sản phẩm</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory ? 'Không tìm thấy sản phẩm nào phù hợp' : 'Bạn chưa có sản phẩm nào'}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => router.push('/seller/products/new')} className="h-11 px-4 transition-transform active:scale-95">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo sản phẩm đầu tiên
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tạo sản phẩm mới</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa sản phẩm</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa &quot;{deleteTarget?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="h-11 min-w-[44px] px-4">Hủy</Button>
            <Button variant="destructive" onClick={() => deleteProduct(deleteTarget!.id)} disabled={deleting} className="h-11 min-w-[44px] px-4">
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
