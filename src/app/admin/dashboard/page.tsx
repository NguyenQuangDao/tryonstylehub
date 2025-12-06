'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, ShoppingBag, UserCheck, TrendingUp } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  pendingApplications: number;
  totalProducts: number;
  activeProducts: number;
  totalTryOns: number;
  totalViews: number;
}

interface RecentApplication {
  id: string;
  businessName: string;
  businessType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth/login?callbackUrl=/admin/dashboard');
      return;
    }
    fetchDashboardData();
  }, [loading, user, router]);

  const fetchDashboardData = async () => {
    try {
      // Fetch admin stats
      const statsResponse = await fetch('/api/admin/dashboard/stats');
      const statsData = await statsResponse.json();

      if (statsResponse.ok) {
        setStats(statsData);
      }

      // Fetch recent applications
      const applicationsResponse = await fetch('/api/admin/seller-applications?limit=5');
      const applicationsData = await applicationsResponse.json();

      if (applicationsResponse.ok) {
        setRecentApplications(applicationsData.applications || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline">Chờ duyệt</Badge>;
      case 'APPROVED':
        return <Badge variant="default">Đã duyệt</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Từ chối</Badge>;
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
    <div className="py-2">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold modern-gradient-text">Bảng điều khiển quản trị</h1>
            <p className="text-gray-600 dark:text-gray-300">Quản lý người dùng, người bán và nội dung</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/admin/users')}>
              <Users className="h-4 w-4 mr-2" />
              Quản lý người dùng
            </Button>
            <Button onClick={() => router.push('/admin/seller-applications')}>
              <UserCheck className="h-4 w-4 mr-2" />
              Đơn đăng ký
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalSellers} người bán
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đơn đăng ký</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                <p className="text-xs text-muted-foreground">
                  Chờ duyệt
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
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
                  {stats.totalViews} lượt xem
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <Card className="rounded-3xl border-0 shadow-md">
        <CardHeader>
          <CardTitle>Đơn đăng ký gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {recentApplications.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Không có đơn đăng ký nào gần đây</p>
              <Button onClick={() => router.push('/admin/seller-applications')}>
                Xem tất cả đơn đăng ký
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{application.businessName}</h3>
                    <p className="text-sm text-gray-600">{application.businessType}</p>
                    <p className="text-xs text-gray-500">
                      {application.user.name} ({application.user.email})
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(application.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(application.status)}
                    <Button
                      size="sm"
                      onClick={() => router.push(`/admin/seller-applications`)}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
