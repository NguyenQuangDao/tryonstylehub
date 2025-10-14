'use client'

import { motion } from 'framer-motion';
import { DollarSign, Image, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CostStats {
  daily: number;
  weekly: number;
  monthly: number;
}

export default function DashboardPage() {
  const [costStats, setCostStats] = useState<CostStats>({ daily: 0, weekly: 0, monthly: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCostStats();
  }, []);

  const fetchCostStats = async () => {
    try {
      const response = await fetch('/api/cost-stats');
      if (response.ok) {
        const data = await response.json();
        setCostStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching cost stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Chi phí hôm nay',
      value: `$${costStats.daily.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Chi phí tuần này',
      value: `$${costStats.weekly.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Chi phí tháng này',
      value: `$${costStats.monthly.toFixed(2)}`,
      icon: Sparkles,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
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
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 vietnamese-heading">Bảng Điều Khiển</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Theo dõi chi phí và hoạt động của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Tính năng</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
              <Image className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Virtual Try-On</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Thử đồ ảo với công nghệ AI tiên tiến
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
              <Sparkles className="h-8 w-8 text-green-600 dark:text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">AI Recommendations</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nhận gợi ý trang phục phù hợp với phong cách
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

