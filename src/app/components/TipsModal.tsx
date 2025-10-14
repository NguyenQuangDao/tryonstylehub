import { Camera, Lightbulb, RectangleHorizontal, Sparkles, Target, Users, Zap } from 'lucide-react';
import React from 'react';
import { cn } from '../lib/utils';
import { Modal } from './ui/modal';

type Tip = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  bgColor: string;
};

const tips: Tip[] = [
  {
    id: 1,
    title: 'Tỷ lệ 2:3',
    description: 'Sử dụng ảnh theo hướng dọc (tỷ lệ 2:3) để có kết quả thử đồ ảo tốt nhất.',
    icon: <RectangleHorizontal className="h-6 w-6" />,
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
  },
  {
    id: 2,
    title: 'Một người mỗi ảnh',
    description: 'Đảm bảo mỗi ảnh chỉ chứa một người để tránh nhầm lẫn trong quá trình thử đồ ảo.',
    icon: <Users className="h-6 w-6" />,
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
  },
  {
    id: 3,
    title: 'Tập trung vào chủ thể',
    description: 'Chụp ảnh tập trung vào người hoặc trang phục, tránh quá nhiều nền hoặc yếu tố gây phân tâm.',
    icon: <Camera className="h-6 w-6" />,
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
  },
  {
    id: 4,
    title: 'Tư thế tương tự',
    description: 'Để có kết quả tốt nhất, hãy cố gắng khớp tư thế của người mẫu với tư thế của người mặc trang phục.',
    icon: <Target className="h-6 w-6" />,
    gradient: 'from-orange-500 to-red-500',
    bgColor: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
  },
  {
    id: 5,
    title: 'Ảnh chất lượng cao',
    description: 'Sử dụng ảnh rõ nét, sáng tốt với độ phân giải cao để có kết quả thử đồ ảo chính xác và thực tế nhất.',
    icon: <Sparkles className="h-6 w-6" />,
    gradient: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
  }
];

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TipsModal({ isOpen, onClose }: TipsModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className="max-w-5xl"
    >
      <div className="relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Mẹo Sử Dụng
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Các mẹo để có kết quả thử đồ ảo tốt nhất
              </p>
            </div>
          </div>
        </div>
        
        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip, index) => (
            <div
              key={tip.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl",
                tip.bgColor
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center mb-4 shadow-lg",
                tip.gradient
              )}>
                <div className="text-white">
                  {tip.icon}
                </div>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-200">
                  {tip.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {tip.description}
                </p>
              </div>
              
              {/* Background decoration */}
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className={cn(
                  "w-20 h-20 rounded-full bg-gradient-to-r",
                  tip.gradient
                )}>
                </div>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              💡 Lưu ý: Tuân thủ các mẹo trên sẽ giúp bạn có được kết quả thử đồ ảo chất lượng cao và chính xác nhất!
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}