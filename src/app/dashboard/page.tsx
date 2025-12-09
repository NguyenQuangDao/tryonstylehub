'use client'

import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  CreditCard,
  Image as ImageIcon,
  Sparkles,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface CostStats {
  daily: number;
  weekly: number;
  monthly: number;
}

interface Transaction {
  id: string
  createdAt: string
  paypalOrderId: string
  amount: number
  tokens: number
  status: string
}

export default function EnhancedDashboardPage() {
  const [costStats, setCostStats] = useState<CostStats>({ daily: 0, weekly: 0, monthly: 0 });
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch cost stats
      const costRes = await fetch('/api/cost-stats');
      if (costRes.ok) {
        const data = await costRes.json();
        setCostStats(data.stats);
      }

      // Fetch token balance
      const balanceRes = await fetch('/api/tokens/balance');
      if (balanceRes.ok) {
        const data = await balanceRes.json();
        if (data.success && data.data && typeof data.data.balance === 'number') {
          setTokenBalance(data.data.balance);
        }
      }

      // Fetch transaction history
      const historyRes = await fetch('/api/tokens/purchase');
      if (historyRes.ok) {
        const data = await historyRes.json();
        if (data.success && Array.isArray(data.data)) {
          setTransactions(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Số dư Token',
      value: `${tokenBalance} Token`,
      icon: Sparkles,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      action: {
        label: 'Nạp thêm',
        href: '/tokens',
      }
    },
  ];

  const features = [
    {
      title: 'Virtual Try-On',
      description: 'Thử đồ ảo với công nghệ AI tiên tiến. Tốn 1 token/lần.',
      icon: ImageIcon,
      color: 'from-blue-600 to-cyan-600',
      href: '/',
    },
    {
      title: 'Tạo Ảnh AI',
      description: 'Tạo hình ảnh thời trang ảo từ thông số đầu vào.',
      icon: Sparkles,
      color: 'from-purple-600 to-pink-600',
      href: '/generate-image',
    },
    {
      title: 'Gợi Ý Đồ',
      description: 'Đề xuất phối đồ thông minh, cá nhân hóa theo sở thích.',
      icon: Zap,
      color: 'from-green-600 to-lime-600',
      href: '/recommend',
    },
    {
      title: 'Product Store',
      description: 'Khám phá hàng ngàn sản phẩm thời trang từ các shop uy tín.',
      icon: Activity,
      color: 'from-green-600 to-emerald-600',
      href: '/products',
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent vietnamese-heading">
            Bảng Điều Khiển
          </h1>
          <p className="text-muted-foreground mt-2">
            Quản lý token và theo dõi hoạt động của bạn
          </p>
        </div>
        <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" asChild>
          <a href="/tokens">
            <Sparkles className="w-5 h-5 mr-2" />
            Nạp Token
          </a>
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <DashboardOverview
        items={stats.map((s) => ({
          title: s.title,
          value: s.value,
          icon: s.icon,
        }))}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">
            <CreditCard className="h-4 w-4 mr-2" />
            Lịch sử Giao dịch
          </TabsTrigger>
          <TabsTrigger value="features">
            <Zap className="h-4 w-4 mr-2" />
            Tính năng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử Giao dịch</CardTitle>
              <CardDescription>Các giao dịch nạp token gần đây của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {tx.paypalOrderId.substring(0, 16)}...
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">
                          +{tx.tokens} Token
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {`$${Number(tx.amount).toFixed(2)}`}
                        </p>
                      </div>
                      <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                        {tx.status === 'completed' ? 'Thành công' : 'Đang xử lý'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Chưa có giao dịch nào</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <a href={feature.href} className="block">
                    <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
                      <CardHeader>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="ghost" className="w-full">
                          Khám phá →
                        </Button>
                      </CardContent>
                    </Card>
                  </a>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
