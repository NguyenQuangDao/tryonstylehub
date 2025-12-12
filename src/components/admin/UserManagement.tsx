'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/lib/auth-context';
import { Loader2, MoreHorizontal, Search, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  tokenBalance: number;
  createdAt: string;
  updatedAt: string;
  shop?: {
    id: string;
    name: string;
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  };
}

export default function UserManagement() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      // Assuming this component is used in admin context, so redirect to admin login or just login
      router.push('/auth/login?callbackUrl=/admin'); 
      return;
    }
    const timer = setTimeout(() => {
      fetchUsers(currentPage);
    }, 500);
    return () => clearTimeout(timer);
  }, [loading, user, router, currentPage, searchTerm, selectedRole]);

  const fetchUsers = async (page: number) => {
    setPageLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        role: selectedRole === 'ALL' ? '' : selectedRole
      });
      
      const response = await fetch(`/api/admin/users?${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalUsers(data.pagination.total);
        }
      } else {
        console.error('Error fetching users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setPageLoading(false);
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
          user.id === userId ? { ...user, role: role as 'USER' | 'SELLER' | 'ADMIN' } : user
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const getRoleBadge = (role: string) => {

    switch (role) {
      case 'ADMIN':
        return <Badge variant="destructive">Quản trị</Badge>;
      case 'SELLER':
        return <Badge variant="default">Người bán</Badge>;
      case 'USER':
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
        
      </div>

      <Card className="mb-4 border-0 shadow-md hover:shadow-lg transition-shadow rounded-3xl">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm người dùng"
                value={searchTerm}
                onChange={handleSearchChange}
                className="h-8 w-[200px] pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedRole || "ALL"} onValueChange={(value) => { setSelectedRole(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Lọc theo vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                  <SelectItem value="SELLER">Người bán</SelectItem>
                  <SelectItem value="USER">Người dùng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow rounded-3xl">
        <CardHeader>
          <CardTitle>Danh sách người dùng ({totalUsers})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || selectedRole ? 'Không tìm thấy người dùng nào phù hợp' : 'Chưa có người dùng nào'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => updateUserRole(u.id, 'ADMIN')} disabled={String(u.id) === String(user?.id)}>
                              Đặt vai trò Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserRole(u.id, 'SELLER')} disabled={String(u.id) === String(user?.id)}>
                              Đặt vai trò Người bán
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserRole(u.id, 'USER')} disabled={String(u.id) === String(user?.id)}>
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

              {/* Pagination Controls */}
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || pageLoading}
                >
                  Trước
                </Button>
                <div className="text-sm font-medium">
                  Trang {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || pageLoading}
                >
                  Sau
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
