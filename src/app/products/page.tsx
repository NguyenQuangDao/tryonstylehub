'use client'

import { motion } from 'framer-motion';
import { ExternalLink, Filter, Heart, Info, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  imageUrl: string;
  styleTags: string[];
  shop: {
    name: string;
    url: string;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = filter === 'all' ? products : products.filter(p => p.type.toLowerCase() === filter.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-purple-500 to-pink-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-purple-500 to-pink-500 rounded-full blur-3xl"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 relative z-10"
      >
        {/* Hero Section */}
        <div className="text-center space-y-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 shadow-lg border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
        <div>
              <h1 className="text-display-sm md:text-display-md font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent vietnamese-heading">
                Sản Phẩm Thời Trang
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Khám phá bộ sưu tập thời trang đa dạng và phong phú
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chất lượng cao</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Đánh giá tốt</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Yêu thích</span>
            </div>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-6 border border-blue-200 dark:border-blue-800">
        <div className={`flex items-center justify-between ${showGuide ? 'mb-4' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Info className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Hướng Dẫn Sử Dụng</h2>
            </div>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {showGuide ? 'Ẩn' : 'Xem'}
            </button>
          </div>
          
          {showGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🔍 Tìm Kiếm Sản Phẩm</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sử dụng bộ lọc để tìm sản phẩm theo loại. Click vào sản phẩm để xem chi tiết.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🛒 Mua Sản Phẩm</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click vào link cửa hàng để mua sản phẩm. Chúng tôi liên kết với các cửa hàng uy tín.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">⭐ Đánh Giá</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Xem đánh giá và nhận xét từ khách hàng để chọn sản phẩm phù hợp nhất.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">💡 Gợi Ý</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sử dụng AI để nhận gợi ý trang phục phù hợp với phong cách của bạn.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Filter Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lọc theo loại:</span>
            <div className="flex gap-2">
              {['all', 'dress', 'shirt', 'pants', 'shoes'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === type
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {type === 'all' ? 'Tất cả' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredProducts.length} sản phẩm
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl shadow-lg">
            <ShoppingBag className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {filter === 'all' ? 'Chưa có sản phẩm nào' : 'Không tìm thấy sản phẩm'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' 
                ? 'Sản phẩm sẽ được cập nhật sớm nhất có thể' 
                : 'Thử chọn bộ lọc khác để xem thêm sản phẩm'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 overflow-hidden group hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    ${product.price.toFixed(2)}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 rounded-full font-medium">
                      {product.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {product.styleTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={product.shop.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Mua tại {product.shop.name}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

