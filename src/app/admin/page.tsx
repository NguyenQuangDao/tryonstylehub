'use client';

import AdminDashboard from '@/components/admin/AdminDashboard';
import ProductManagement from '@/components/admin/ProductManagement';
import ShopManagement from '@/components/admin/ShopManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    FileText,
    LayoutDashboard,
    Package,
    Settings,
    Store,
    Users
} from 'lucide-react';
import { useState } from 'react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản trị hệ thống</h1>
          <p className="text-gray-600">Quản lý cửa hàng, sản phẩm, người dùng và nội dung</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2 bg-white p-2 rounded-lg border">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger value="stores" className="flex items-center space-x-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Cửa hàng</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Sản phẩm</span>
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Blog</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Người dùng</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Cài đặt</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="stores" className="mt-0">
            <ShopManagement />
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="blog" className="mt-0">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Quản lý blog</h2>
              <p className="text-gray-600">Chức năng quản lý blog sẽ được thêm vào sớm.</p>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Quản lý người dùng</h2>
              <p className="text-gray-600">Chức năng quản lý người dùng sẽ được thêm vào sớm.</p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Cài đặt hệ thống</h2>
              <p className="text-gray-600">Chức năng cài đặt sẽ được thêm vào sớm.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}