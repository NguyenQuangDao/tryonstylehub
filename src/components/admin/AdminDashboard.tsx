'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Package,
  Store,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import ProductManagement from './ProductManagement';
import ShopManagement from './ShopManagement';
import UserManagement from './UserManagement';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalStores: number;
    totalProducts: number;
    totalBlogPosts: number;
  };
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
      <Tabs defaultValue="stores" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stores">Danh sách cửa hàng</TabsTrigger>
          <TabsTrigger value="products">Danh sách sản phẩm</TabsTrigger>
          <TabsTrigger value="users">Danh sách người dùng</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stores" className="space-y-4">
          <ShopManagement />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
