'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Search, User, Shield } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'SHOPPER' | 'SELLER' | 'ADMIN';
  isActive: boolean;
  tokenBalance: number;
  createdAt: string;
  updatedAt: string;
  shop?: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth/login?callbackUrl=/admin/users');
      return;
    }
    fetchUsers();
  }, [loading, user, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        console.error('Error fetching users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isActive } : user
        ));
      } else {
        const data = await response.json();
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái người dùng');
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: role as 'SHOPPER' | 'SELLER' | 'ADMIN' } : user
        ));
      } else {
        const data = await response.json();
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Có lỗi xảy ra khi cập nhật vai trò người dùng');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="destructive">Admin</Badge>;
      case 'SELLER':
        return <Badge variant="default">Người bán</Badge>;
      case 'SHOPPER':
        return <Badge variant="outline">Người mua</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

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
        <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/admin/dashboard')}>
            <Shield className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button onClick={() => router.push('/admin/seller-applications')}>
            <User className="h-4 w-4 mr-2" />
            Đơn đăng ký
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-0 shadow-md hover:shadow-lg transition-shadow rounded-3xl">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="">Tất cả vai trò</option>
              <option value="SHOPPER">Người mua</option>
              <option value="SELLER">Người bán</option>
              <option value="ADMIN">Admin</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('');
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow rounded-3xl">
        <CardHeader>
          <CardTitle>Danh sách người dùng ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || selectedRole ? 'Không tìm thấy người dùng nào phù hợp' : 'Chưa có người dùng nào'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Người dùng</th>
                    <th className="text-left p-4">Vai trò</th>
                    <th className="text-left p-4">Trạng thái</th>
                    <th className="text-left p-4">Token</th>
                    <th className="text-left p-4">Ngày tạo</th>
                    <th className="text-left p-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-accent/10">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="p-4">
                        <Badge variant={u.isActive ? 'default' : 'destructive'}>
                          {u.isActive ? 'Hoạt động' : 'Bị khóa'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">{u.tokenBalance}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.id, e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                            disabled={String(u.id) === String(user?.id)}
                          >
                            <option value="SHOPPER">Người mua</option>
                            <option value="SELLER">Người bán</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          <Button
                            size="sm"
                            variant={u.isActive ? 'destructive' : 'default'}
                            onClick={() => updateUserStatus(u.id, !u.isActive)}
                            disabled={String(u.id) === String(user?.id)}
                          >
                            {u.isActive ? 'Khóa' : 'Mở'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}