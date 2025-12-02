'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, User, Shield, MoreHorizontal } from 'lucide-react';

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

      <Card className="mb-4 border-0 shadow-md hover:shadow-lg transition-shadow rounded-3xl">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm người dùng"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 w-[200px] pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-8">View Option</Button>
              <Button variant="outline" className="h-8">Export</Button>
            </div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{u.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(u.role)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="rounded-sm px-1.5 py-0 text-xs font-normal"
                        >
                          {u.isActive ? 'Hoạt động' : 'Bị khóa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-sm">{u.tokenBalance}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Mở menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem
                              disabled={String(u.id) === String(user?.id)}
                              onClick={() => updateUserStatus(u.id, !u.isActive)}
                            >
                              {u.isActive ? 'Khóa người dùng' : 'Mở khóa người dùng'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => updateUserRole(u.id, 'ADMIN')} disabled={String(u.id) === String(user?.id)}>
                              Đặt vai trò Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserRole(u.id, 'SELLER')} disabled={String(u.id) === String(user?.id)}>
                              Đặt vai trò Người bán
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserRole(u.id, 'SHOPPER')} disabled={String(u.id) === String(user?.id)}>
                              Đặt vai trò Người mua
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
