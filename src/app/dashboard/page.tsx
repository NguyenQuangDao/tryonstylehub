'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { DollarSign, Image as ImageIcon, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CostStats {
  daily: number;
  weekly: number;
  monthly: number;
}

interface Transaction {
  id: number
  createdAt: string
  stripePaymentId: string
  amount: number
  tokens: number
  status: string
}

export default function DashboardPage() {
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
        setTokenBalance(data.data.balance);
      }

      // Fetch transaction history
      const historyRes = await fetch('/api/tokens/purchase');
      if (historyRes.ok) {
        const data = await historyRes.json();
        setTransactions(data.data);
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
    {
      title: 'Chi phí hôm nay',
      value: `$${costStats.daily.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Chi phí tháng này',
      value: `$${costStats.monthly.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 vietnamese-heading">Bảng Điều Khiển</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Quản lý token và theo dõi hoạt động
            </p>
          </div>
          <a
            href="/tokens"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Nạp Token
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg border-gray-200 dark:border-gray-800 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                        </div>
                      </div>
                      {stat.action && (
                        <a
                          href={stat.action.href}
                          className="text-sm font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1 rounded-full"
                        >
                          {stat.action.label} →
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Transaction History */}
        <Card className="shadow-lg border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Lịch sử Giao dịch</CardTitle>
            <CardDescription>Các giao dịch nạp token gần đây của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Thời gian</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Mã giao dịch</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Số tiền</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Token</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-300">
                          {new Date(tx.createdAt).toLocaleDateString('vi-VN')} {new Date(tx.createdAt).toLocaleTimeString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-500">
                          {tx.stripePaymentId.substring(0, 12)}...
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-300">
                          {tx.amount > 1000
                            ? `${tx.amount.toLocaleString('vi-VN')}₫`
                            : `$${tx.amount}`
                          }
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-purple-600">
                          +{tx.tokens}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${tx.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }
                          `}>
                            {tx.status === 'completed' ? 'Thành công' : 'Đang xử lý'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Chưa có giao dịch nào
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0 transform transition-all hover:scale-[1.02] cursor-pointer">
            <CardContent className="p-6">
              <ImageIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-4" />
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Virtual Try-On</CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Thử đồ ảo với công nghệ AI tiên tiến. Tốn 1 token/lần.
              </CardDescription>
              <a href="/try-on" className="text-blue-600 font-semibold hover:underline">Thử ngay →</a>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-0 transform transition-all hover:scale-[1.02] cursor-pointer">
            <CardContent className="p-6">
              <Sparkles className="h-8 w-8 text-green-600 dark:text-green-400 mb-4" />
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">AI Recommendations</CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Nhận gợi ý trang phục phù hợp. Tốn 1 token/lần.
              </CardDescription>
              <a href="/recommend" className="text-green-600 font-semibold hover:underline">Khám phá →</a>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

