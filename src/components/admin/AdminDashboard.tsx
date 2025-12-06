'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Eye,
  Package,
  Star,
  Store,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalStores: number;
    totalProducts: number;
    totalBlogPosts: number;
    totalOrders: number;
    totalRevenue: number;
  };
  recent: {
    users: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
      avatarUrl?: string;
    }>;
    stores: Array<{
      id: string;
      name: string;
      slug: string;
      logoUrl?: string;
      status: string;
      averageRating: number;
      totalSales: number;
      createdAt: string;
      owner: {
        name: string;
        email: string;
      };
    }>;
    products: Array<{
      id: string;
      title: string;
      basePrice: number;
      salePrice?: number;
      isFeatured: boolean;
      isNew: boolean;
      stockQuantity: number;
      createdAt: string;
      shop: {
        name: string;
        slug: string;
      };
      category: {
        name: string;
        slug: string;
      };
    }>;
  };
  topStores: Array<{
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    totalSales: number;
    averageRating: number;
    createdAt: string;
  }>;
  monthlyStats: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  timeRange: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    (async () => {
      await fetch(`/api/admin/dashboard/stats?range=${timeRange}`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error('Failed to fetch dashboard stats:', err))
        .finally(() => setLoading(false))
    })()
  }, [timeRange]);

  

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          Failed to load dashboard data
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Tổng người dùng",
      value: formatNumber(stats.overview.totalUsers),
      icon: Users,
      description: "Người dùng đã đăng ký",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Tổng cửa hàng",
      value: formatNumber(stats.overview.totalStores),
      icon: Store,
      description: "Cửa hàng đang hoạt động",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Tổng sản phẩm",
      value: formatNumber(stats.overview.totalProducts),
      icon: Package,
      description: "Sản phẩm đã đăng",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển quản trị</h1>
          <p className="text-muted-foreground">
            Tổng quan về hệ thống và hoạt động kinh doanh
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="24h">24 giờ qua</option>
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} ${card.color} p-2 rounded-lg`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="stores">Cửa hàng</TabsTrigger>
          <TabsTrigger value="products">Sản phẩm</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Top Stores */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Cửa hàng hàng đầu</CardTitle>
                <CardDescription>
                  Cửa hàng có doanh số cao nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topStores.slice(0, 5).map((store, index) => (
                    <div key={store.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={store.logoUrl} alt={store.name} />
                          <AvatarFallback>{store.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{store.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{store.averageRating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        Top {index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            
          </div>
        </TabsContent>

        <TabsContent value="stores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cửa hàng gần đây</CardTitle>
              <CardDescription>
                Danh sách các cửa hàng mới được tạo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent.stores.map((store) => (
                  <div key={store.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={store.logoUrl} alt={store.name} />
                        <AvatarFallback>{store.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{store.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Chủ: {store.owner.name} • {store.owner.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={store.status === 'ACTIVE' ? 'outline' : 'secondary'}>
                        {store.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm gần đây</CardTitle>
              <CardDescription>
                Danh sách các sản phẩm mới được đăng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent.products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{product.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.shop.name} • {product.category.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm font-medium">
                            {formatCurrency(product.salePrice || product.basePrice)}
                          </span>
                          {product.salePrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatCurrency(product.basePrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {product.isFeatured && (
                        <Badge variant="outline" className="text-yellow-600">
                          <Star className="h-3 w-3 mr-1" />
                          Nổi bật
                        </Badge>
                      )}
                      {product.isNew && (
                        <Badge variant="outline" className="text-green-600">
                          Mới
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {product.stockQuantity} còn hàng
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Người dùng gần đây</CardTitle>
              <CardDescription>
                Danh sách người dùng mới đăng ký
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'SELLER' ? 'outline' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
