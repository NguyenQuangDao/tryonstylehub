'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Globe,
  Mail,
  MapPin,
  Phone,
  Search,
  Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  email?: string;
  website?: string;
  phone?: string;
  address?: string;
  openingHours?: any;
  policies?: any;
  socialMedia?: any;
  status: string;
  averageRating: number;
  
  totalProducts: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ShopManagement() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10', // Increased limit for table view or keep 10/12
        search: searchTerm,
        status: statusFilter,
        sortBy: sortBy
      });
      const response = await fetch(`/api/admin/shops?${params}`);
      const data = await response.json();
      setShops(data.shops);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch shops:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const updateShopStatus = async (shopId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/shops/${shopId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchShops();
        if (selectedShop && selectedShop.id === shopId) {
            setSelectedShop({...selectedShop, status: newStatus});
        }
      }
    } catch (error) {
      console.error('Failed to update shop status:', error);
    }
  };

  const toggleFeatured = async (shopId: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/admin/shops/${shopId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !featured }),
      });

      if (response.ok) {
        fetchShops();
        if (selectedShop && selectedShop.id === shopId) {
            setSelectedShop({...selectedShop, featured: !featured});
        }
      }
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
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
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED':
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý cửa hàng</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi tất cả cửa hàng trong hệ thống
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm cửa hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                <SelectItem value="SUSPENDED">Đã tạm dừng</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Ngày tạo</SelectItem>
                <SelectItem value="name">Tên cửa hàng</SelectItem>
                <SelectItem value="averageRating">Đánh giá</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Shop Table */}
      <div className="rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cửa hàng</TableHead>
              <TableHead>Chủ sở hữu</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Không tìm thấy cửa hàng nào
                    </TableCell>
                </TableRow>
            ) : (
                shops.map((shop) => (
                <TableRow key={shop.id}>
                    <TableCell>
                    <div className="flex items-center space-x-3">
                        <Avatar>
                        <AvatarImage src={shop.logoUrl} alt={shop.name} />
                        <AvatarFallback>{shop.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                        <div className="font-medium flex items-center gap-2">
                            {shop.name}
                            {shop.featured && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                        </div>
                        <div className="text-sm text-muted-foreground">@{shop.slug}</div>
                        </div>
                    </div>
                    </TableCell>
                    <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{shop.owner.name}</span>
                        <span className="text-xs text-muted-foreground">{shop.owner.email}</span>
                    </div>
                    </TableCell>
                    <TableCell>
                    <Badge className={getStatusColor(shop.status)}>
                        {shop.status === 'ACTIVE' ? 'Hoạt động' : 
                        shop.status === 'PENDING' ? 'Chờ duyệt' : 
                        'Tạm dừng'}
                    </Badge>
                    </TableCell>
                    <TableCell>
                        <span className="font-medium">{shop.totalProducts}</span>
                    </TableCell>
                    <TableCell>
                    <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{shop.averageRating.toFixed(1)}</span>
                    </div>
                    </TableCell>
                    <TableCell>
                        <span className="text-sm text-muted-foreground">{formatDate(shop.createdAt)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedShop(shop)}>
                        <Eye className="h-4 w-4" />
                        </Button>
                        {/* <Button 
                            variant="ghost" 
                            size="icon"
                            className={shop.featured ? "text-yellow-500" : "text-gray-400"}
                            onClick={() => toggleFeatured(shop.id, shop.featured)}
                        >
                            <Star className={`h-4 w-4 ${shop.featured ? 'fill-current' : ''}`} />
                        </Button> */}
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
      <Dialog open={!!selectedShop} onOpenChange={(open) => !open && setSelectedShop(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
                <DialogTitle>Chi tiết cửa hàng</DialogTitle>
                <DialogDescription>Thông tin chi tiết về cửa hàng và chủ sở hữu</DialogDescription>
            </DialogHeader>
            {selectedShop && (
                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={selectedShop.logoUrl} alt={selectedShop.name} />
                            <AvatarFallback className="text-xl">{selectedShop.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                {selectedShop.name}
                                <Badge className={getStatusColor(selectedShop.status)}>
                                    {selectedShop.status === 'ACTIVE' ? 'Hoạt động' : 
                                    selectedShop.status === 'PENDING' ? 'Chờ duyệt' : 
                                    'Tạm dừng'}
                                </Badge>
                            </h2>
                            <p className="text-muted-foreground">@{selectedShop.slug}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    {selectedShop.averageRating.toFixed(1)} Đánh giá
                                </span>
                                <span>•</span>
                                <span>{selectedShop.totalProducts} Sản phẩm</span>
                                <span>•</span>
                                <span>Ngày tạo: {formatDate(selectedShop.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="font-semibold mb-2">Mô tả</h3>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                            {selectedShop.description || "Chưa có mô tả"}
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold mb-2">Thông tin liên hệ</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span>{selectedShop.email || "Chưa cập nhật"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span>{selectedShop.phone || "Chưa cập nhật"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-gray-400" />
                                    <span>{selectedShop.website || "Chưa cập nhật"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{selectedShop.address || "Chưa cập nhật"}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Chủ sở hữu</h3>
                            <div className="space-y-2 text-sm">
                                <div className="font-medium">{selectedShop.owner.name}</div>
                                <div className="text-muted-foreground">{selectedShop.owner.email}</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => setSelectedShop(null)}>Đóng</Button>
                        {/* <Button 
                            variant={selectedShop.status === 'ACTIVE' ? 'destructive' : 'default'}
                            onClick={() => updateShopStatus(selectedShop.id, selectedShop.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                        >
                            {selectedShop.status === 'ACTIVE' ? 'Tạm dừng cửa hàng' : 'Kích hoạt cửa hàng'}
                        </Button> */}
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
