'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Package,
  Store,
  Star,
  DollarSign,
  Box
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  salePrice?: number;
  sku: string;
  stockQuantity: number;
  material?: string;
  brand?: string;
  status: string;
  isFeatured: boolean;
  isNew: boolean;
  viewCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  shop: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [shopFilter, setShopFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, statusFilter, categoryFilter, shopFilter, sortBy, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter,
        shop: shopFilter,
        sortBy: sortBy
      });
      
      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProductStatus = async (productId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  const toggleFeatured = async (productId: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !featured }),
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi tất cả sản phẩm trong hệ thống
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PUBLISHED">Đã đăng</SelectItem>
                <SelectItem value="DRAFT">Nháp</SelectItem>
                <SelectItem value="ARCHIVED">Đã lưu trữ</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                <SelectItem value="ao">Áo</SelectItem>
                <SelectItem value="quan">Quần</SelectItem>
                <SelectItem value="vay-dam">Váy đầm</SelectItem>
                <SelectItem value="ao-khoac">Áo khoác</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={shopFilter} onValueChange={setShopFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Cửa hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cửa hàng</SelectItem>
                <SelectItem value="featured">Cửa hàng nổi bật</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Ngày tạo</SelectItem>
                <SelectItem value="title">Tên sản phẩm</SelectItem>
                <SelectItem value="basePrice">Giá</SelectItem>
                <SelectItem value="stockQuantity">Tồn kho</SelectItem>
                <SelectItem value="rating">Đánh giá</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="relative mb-4">
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0].url} 
                      alt={product.images[0].alt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                
                {/* Badges */}
                <div className="absolute top-2 left-2 space-y-1">
                  {product.isFeatured && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 text-xs">
                      <Star className="h-2 w-2 mr-1" />
                      Nổi bật
                    </Badge>
                  )}
                  {product.isNew && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                      Mới
                    </Badge>
                  )}
                </div>
                
                <div className="absolute top-2 right-2">
                  <Badge className={getStatusColor(product.status)}>
                    {product.status === 'PUBLISHED' ? 'Đã đăng' : 
                     product.status === 'DRAFT' ? 'Nháp' : 
                     'Đã lưu trữ'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{product.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{product.category.name}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.shortDescription || product.description.substring(0, 100) + '...'}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Price */}
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(product.salePrice || product.basePrice)}
                </span>
                {product.salePrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(product.basePrice)}
                  </span>
                )}
              </div>
              
              {/* Stock */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tồn kho:</span>
                <Badge variant={product.stockQuantity > 10 ? 'outline' : 'destructive'}>
                  {product.stockQuantity} còn hàng
                </Badge>
              </div>
              
              {/* Rating */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Đánh giá:</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="font-medium">{product.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({product.reviewCount})</span>
                </div>
              </div>
              
              {/* Shop Info */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cửa hàng:</span>
                <span className="font-medium truncate">{product.shop.name}</span>
              </div>
              
              {/* SKU */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">SKU:</span>
                <span className="font-mono text-xs">{product.sku}</span>
              </div>
              
              {/* Views */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Lượt xem:</span>
                <span className="font-medium">{product.viewCount}</span>
              </div>
              
              {/* Date */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Ngày tạo:</span>
                <span className="text-gray-500">{formatDate(product.createdAt)}</span>
              </div>
              
              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => toggleFeatured(product.id, product.isFeatured)}
                >
                  <Star className={`h-3 w-3 mr-1 ${product.isFeatured ? 'fill-current' : ''}`} />
                  {product.isFeatured ? 'Bỏ nổi bật' : 'Nổi bật'}
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant={product.status === 'PUBLISHED' ? 'destructive' : 'default'}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateProductStatus(product.id, product.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}
                >
                  {product.status === 'PUBLISHED' ? 'Chuyển nháp' : 'Đăng bán'}
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Trước
          </Button>
          
          <span className="text-sm text-gray-600">
            Trang {currentPage} / {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}