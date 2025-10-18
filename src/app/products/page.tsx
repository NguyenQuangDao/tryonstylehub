'use client'

import { motion } from 'framer-motion';
import { ExternalLink, Filter, Heart, Info, Search, ShoppingBag, Sparkles, Star, Store, X } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [showShopModal, setShowShopModal] = useState(false);

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

  // Get unique shops
  const shops = Array.from(new Set(products.map(p => p.shop.name)));
  
  // Filter products based on search, filter, and shop
  const filteredProducts = products.filter(product => {
    const matchesFilter = filter === 'all' || product.type.toLowerCase() === filter.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.styleTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesShop = selectedShop === null || product.shop.name === selectedShop;
    
    return matchesFilter && matchesSearch && matchesShop;
  });

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
              <p className="text-lg text-gray-600 dark:text-gray-400 font-open-sans">
                Khám phá bộ sưu tập thời trang đa dạng và phong phú từ các cửa hàng uy tín
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-open-sans">Chất lượng cao</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-open-sans">Đánh giá tốt</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-open-sans">Yêu thích</span>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 vietnamese-heading">Hướng Dẫn Sử Dụng</h2>
            </div>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-open-sans"
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
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 vietnamese-heading">🔍 Tìm Kiếm Thông Minh</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-open-sans">
                    Tìm kiếm theo tên sản phẩm, cửa hàng hoặc tag. Sử dụng bộ lọc để thu hẹp kết quả theo loại sản phẩm.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 vietnamese-heading">🏪 Lọc Theo Shop</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-open-sans">
                    Chọn cửa hàng cụ thể để xem tất cả sản phẩm từ shop đó. Click vào icon shop để lọc nhanh.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 vietnamese-heading">🛒 Mua Sản Phẩm</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-open-sans">
                    Click &quot;Mua ngay&quot; để truy cập trực tiếp vào cửa hàng. Chúng tôi liên kết với các cửa hàng uy tín.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 vietnamese-heading">⭐ Đánh Giá & Tags</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-open-sans">
                    Xem đánh giá sao và các tag phong cách để chọn sản phẩm phù hợp nhất với bạn.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-800/50">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, shop hoặc tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-open-sans"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Category Filter */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-open-sans">Loại sản phẩm:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'dress', 'shirt', 'pants', 'shoes'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all font-open-sans ${
                      filter === type
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {type === 'all' ? 'Tất cả' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Shop Filter */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Store className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-open-sans">Cửa hàng:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedShop(null)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all font-open-sans ${
                    selectedShop === null
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Tất cả shop
                </button>
                {shops.slice(0, 4).map((shop) => (
                  <button
                    key={shop}
                    onClick={() => setSelectedShop(shop)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all font-open-sans ${
                      selectedShop === shop
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {shop}
                  </button>
                ))}
                {shops.length > 4 && (
                  <button
                    onClick={() => setShowShopModal(true)}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-open-sans"
                  >
                    +{shops.length - 4} khác
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-open-sans">
                Tìm thấy <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredProducts.length}</span> sản phẩm
              </span>
              {(searchTerm || selectedShop) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedShop(null);
                    setFilter('all');
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium font-open-sans"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-800/50">
            <ShoppingBag className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 vietnamese-heading">
              {searchTerm || selectedShop ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-open-sans">
              {searchTerm || selectedShop 
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem thêm sản phẩm' 
                : 'Sản phẩm sẽ được cập nhật sớm nhất có thể'
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
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors vietnamese-heading">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 rounded-full font-medium font-open-sans">
                      {product.type}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 font-open-sans">
                        {(Math.random() * 2 + 3).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.styleTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg font-medium font-open-sans"
                      >
                        {tag}
                      </span>
                    ))}
                    {product.styleTags.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 rounded-lg font-medium font-open-sans">
                        +{product.styleTags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <Store className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-open-sans">
                      {product.shop.name}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={product.shop.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-open-sans"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Mua ngay
                    </a>
                    <button
                      onClick={() => setSelectedShop(product.shop.name)}
                      className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 font-open-sans"
                      title="Xem tất cả sản phẩm từ shop này"
                    >
                      <Store className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Shop Modal */}
      {showShopModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-200/50 dark:border-gray-800/50"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 vietnamese-heading">
                  Tất cả cửa hàng
                </h2>
              </div>
              <button
                onClick={() => setShowShopModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setSelectedShop(null);
                    setShowShopModal(false);
                  }}
                  className={`p-4 rounded-xl text-left transition-all font-open-sans ${
                    selectedShop === null
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5" />
                    <span className="font-medium">Tất cả shop</span>
                  </div>
                  <p className="text-sm mt-1 opacity-75">
                    Xem tất cả sản phẩm từ mọi cửa hàng
                  </p>
                </button>
                
                {shops.map((shop) => {
                  const shopProducts = products.filter(p => p.shop.name === shop);
                  return (
                    <button
                      key={shop}
                      onClick={() => {
                        setSelectedShop(shop);
                        setShowShopModal(false);
                      }}
                      className={`p-4 rounded-xl text-left transition-all font-open-sans ${
                        selectedShop === shop
                          ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Store className="h-5 w-5" />
                          <span className="font-medium">{shop}</span>
                        </div>
                        <span className="text-sm opacity-75">
                          {shopProducts.length} sản phẩm
                        </span>
                      </div>
                      <p className="text-sm mt-1 opacity-75">
                        Xem tất cả sản phẩm từ {shop}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

