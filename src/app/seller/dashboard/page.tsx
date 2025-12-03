'use client';

export const dynamic = 'force-dynamic';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { PLACEHOLDER_IMAGE } from '@/lib/placeholder-image';
import { Edit, Eye, Loader2, Package, Plus, Trash2, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  isFeatured: boolean;
  stock: number;
  images: Array<{ url: string; altText: string }>;
  _count: {
    tryOnHistory: number;
    productViews: number;
    reviews: number;
  };
  createdAt: string;
}

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalTryOns: number;
  totalViews: number;
  recentProducts: Product[];
}

export default function SellerDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth/login?callbackUrl=/seller/dashboard');
      return;
    }
    const run = async () => {
      try {
        const statsResponse = await fetch('/api/seller/dashboard/stats');
        const statsData = await statsResponse.json();

        if (statsResponse.ok) {
          setStats(statsData);
        }

        await fetchProducts(1);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setPageLoading(false);
      }
    };
    run();
  }, [loading, user, router]);

  const fetchProducts = async (page: number) => {
    try {
      const response = await fetch(`/api/seller/products?page=${page}&limit=10`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Có lỗi xảy ra khi tải sản phẩm');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        await fetchProducts(1);
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default">Đang hoạt động</Badge>;
      case 'INACTIVE':
        return <Badge variant="secondary">Không hoạt động</Badge>;
      case 'DRAFT':
        return <Badge variant="outline">Nháp</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Bảng điều khiển người bán</h1>
            <p className="text-gray-600">Quản lý cửa hàng và sản phẩm của bạn</p>
          </div>
          <Button onClick={() => router.push('/seller/products/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm mới
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeProducts} đang hoạt động
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lượt thử</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTryOns}</div>
                <p className="text-xs text-muted-foreground">
                  Tổng lượt thử trang phục
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lượt xem</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
                <p className="text-xs text-muted-foreground">
                  Tổng lượt xem sản phẩm
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ chuyển đổi</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalViews > 0 ? Math.round((stats.totalTryOns / stats.totalViews) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Thử trang phục / Xem sản phẩm
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Recent Products */}
      <Card>
        <CardHeader>
          <CardTitle>Sản phẩm gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Bạn chưa có sản phẩm nào</p>
              <Button onClick={() => router.push('/seller/products/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo sản phẩm đầu tiên
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.images?.[0]?.url || PLACEHOLDER_IMAGE}
                      alt={product.images?.[0]?.altText || product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.category}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(product.status)}
                        {product.isFeatured && <Badge variant="default">Nổi bật</Badge>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                      </p>
                      <p className="text-sm text-gray-600">Kho: {product.stock}</p>
                      <div className="flex space-x-2 text-xs text-gray-500 mt-1">
                        <span>Thử: {product._count.tryOnHistory}</span>
                        <span>Xem: {product._count.productViews}</span>
                        <span>Đánh giá: {product._count.reviews}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/seller/products/${product.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/seller/products/${product.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => fetchProducts(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="flex items-center px-4">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => fetchProducts(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}