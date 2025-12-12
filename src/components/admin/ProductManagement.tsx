'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Package,
  Search,
  Star
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, statusFilter, categoryFilter, shopFilter, sortBy, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10', // Increased limit for table view
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
        if (selectedProduct && selectedProduct.id === productId) {
            setSelectedProduct({...selectedProduct, status: newStatus});
        }
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
        if (selectedProduct && selectedProduct.id === productId) {
            setSelectedProduct({...selectedProduct, isFeatured: !featured});
        }
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
      <div className="p-6 space-y-4">
         <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
         <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
         <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 w-full bg-gray-200 rounded animate-pulse"></div>
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

      {/* Product Table */}
      <div className="rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Cửa hàng</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Tồn kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Không tìm thấy sản phẩm nào
                    </TableCell>
                </TableRow>
            ) : (
                products.map((product) => (
                <TableRow key={product.id}>
                    <TableCell>
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                                <img 
                                src={product.images[0].url} 
                                alt={product.images[0].alt}
                                className="w-full h-full object-cover"
                                />
                            ) : (
                                <Package className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="font-medium truncate max-w-[200px]" title={product.title}>{product.title}</div>
                            <div className="text-xs text-muted-foreground font-mono">{product.sku}</div>
                        </div>
                    </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline">{product.category.name}</Badge>
                    </TableCell>
                    <TableCell>
                        <span className="text-sm truncate max-w-[150px] block" title={product.shop.name}>{product.shop.name}</span>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-medium text-red-600">
                                {formatCurrency(product.salePrice || product.basePrice)}
                            </span>
                            {product.salePrice && (
                                <span className="text-xs text-gray-400 line-through">
                                    {formatCurrency(product.basePrice)}
                                </span>
                            )}
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={product.stockQuantity > 10 ? 'outline' : 'destructive'}>
                            {product.stockQuantity}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <Badge className={getStatusColor(product.status)}>
                            {product.status === 'PUBLISHED' ? 'Đã đăng' : 
                            product.status === 'DRAFT' ? 'Nháp' : 
                            'Đã lưu trữ'}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{product.rating.toFixed(1)}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(product)}>
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className={product.isFeatured ? "text-yellow-500" : "text-gray-400"}
                                onClick={() => toggleFeatured(product.id, product.isFeatured)}
                            >
                                <Star className={`h-4 w-4 ${product.isFeatured ? 'fill-current' : ''}`} />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center space-x-2">
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Chi tiết sản phẩm</DialogTitle>
                <DialogDescription>Thông tin chi tiết về sản phẩm</DialogDescription>
            </DialogHeader>
            {selectedProduct && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Images */}
                        <div>
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                    <img 
                                        src={selectedProduct.images[0].url} 
                                        alt={selectedProduct.images[0].alt}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Package className="h-24 w-24 text-gray-300" />
                                )}
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {selectedProduct.images.slice(1).map((img, idx) => (
                                    <div key={idx} className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                                        <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedProduct.title}</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline">{selectedProduct.category.name}</Badge>
                                    <Badge className={getStatusColor(selectedProduct.status)}>
                                        {selectedProduct.status === 'PUBLISHED' ? 'Đã đăng' : 
                                        selectedProduct.status === 'DRAFT' ? 'Nháp' : 
                                        'Đã lưu trữ'}
                                    </Badge>
                                    {selectedProduct.isFeatured && (
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                            Nổi bật
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-red-600">
                                    {formatCurrency(selectedProduct.salePrice || selectedProduct.basePrice)}
                                </span>
                                {selectedProduct.salePrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                        {formatCurrency(selectedProduct.basePrice)}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block">Mã sản phẩm (SKU)</span>
                                    <span className="font-mono">{selectedProduct.sku}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Tồn kho</span>
                                    <span className="font-medium">{selectedProduct.stockQuantity}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Thương hiệu</span>
                                    <span>{selectedProduct.brand || "---"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Chất liệu</span>
                                    <span>{selectedProduct.material || "---"}</span>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <span className="text-gray-500 block mb-1">Cửa hàng</span>
                                <div className="font-medium">{selectedProduct.shop.name}</div>
                                <div className="text-sm text-muted-foreground">@{selectedProduct.shop.slug}</div>
                            </div>

                            <div className="border-t pt-4">
                                <span className="text-gray-500 block mb-1">Thống kê</span>
                                <div className="flex gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Eye className="h-4 w-4 text-gray-400" />
                                        <span>{selectedProduct.viewCount} xem</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-400" />
                                        <span>{selectedProduct.rating.toFixed(1)} ({selectedProduct.reviewCount} đánh giá)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="border-t pt-6">
                        <h3 className="font-semibold mb-2">Mô tả sản phẩm</h3>
                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                            {selectedProduct.description}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => setSelectedProduct(null)}>Đóng</Button>
                        <Button 
                            variant={selectedProduct.status === 'PUBLISHED' ? 'secondary' : 'default'}
                            onClick={() => updateProductStatus(selectedProduct.id, selectedProduct.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}
                        >
                            {selectedProduct.status === 'PUBLISHED' ? 'Gỡ sản phẩm (Nháp)' : 'Đăng sản phẩm'}
                        </Button>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
