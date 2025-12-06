'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Edit,
    Eye,
    Globe,
    Mail,
    MapPin,
    Phone,
    Search,
    Star
} from 'lucide-react';
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
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
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
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
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

      {/* Shop Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shops.map((shop) => (
          <Card key={shop.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={shop.logoUrl} alt={shop.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {shop.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{shop.name}</h3>
                    <p className="text-sm text-gray-500 truncate">@{shop.slug}</p>
                  </div>
                </div>
                {shop.featured && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1" />
                    Nổi bật
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-2">
                {shop.description || 'Chưa có mô tả'}
              </p>
              
              <div className="space-y-2 text-sm">
                {shop.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3 w-3 text-gray-400" />
                    <span className="truncate">{shop.email}</span>
                  </div>
                )}
                {shop.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span>{shop.phone}</span>
                  </div>
                )}
                {shop.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="truncate">{shop.address}</span>
                  </div>
                )}
                {shop.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-3 w-3 text-gray-400" />
                    <span className="truncate">{shop.website}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{shop.averageRating.toFixed(1)}</span>
                  
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {shop.totalProducts} SP
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(shop.status)}>
                  {shop.status === 'ACTIVE' ? 'Đang hoạt động' : 
                   shop.status === 'PENDING' ? 'Chờ duyệt' : 
                   'Đã tạm dừng'}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatDate(shop.createdAt)}
                </span>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => toggleFeatured(shop.id, shop.featured)}
                >
                  <Star className={`h-3 w-3 mr-1 ${shop.featured ? 'fill-current' : ''}`} />
                  {shop.featured ? 'Bỏ nổi bật' : 'Nổi bật'}
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant={shop.status === 'ACTIVE' ? 'destructive' : 'default'}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateShopStatus(shop.id, shop.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                >
                  {shop.status === 'ACTIVE' ? 'Tạm dừng' : 'Kích hoạt'}
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
