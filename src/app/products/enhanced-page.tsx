'use client'

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronDown,
    ExternalLink,
    Filter,
    Grid3x3,
    Heart,
    Info,
    List,
    Search,
    ShoppingBag,
    Sparkles,
    Star,
    Store,
    TrendingUp,
    X
} from 'lucide-react';
import Image from 'next/image';
import { formatVND } from '@/utils/currency';
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

export default function EnhancedProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showGuide, setShowGuide] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedShop, setSelectedShop] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'featured'>('newest');
    const [wishlist, setWishlist] = useState<number[]>([]);
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

    useEffect(() => {
        const stored = localStorage.getItem('wishlist');
        if (stored) {
            try {
                setWishlist(JSON.parse(stored));
            } catch {
                // Silent fail
            }
        }
    }, []);

    const toggleWishlist = (id: number) => {
        setWishlist((prev) => {
            const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
            localStorage.setItem('wishlist', JSON.stringify(next));
            return next;
        });
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
        const min = minPrice ? parseFloat(minPrice) : undefined;
        const max = maxPrice ? parseFloat(maxPrice) : undefined;
        const matchesPrice = (min === undefined || product.price >= min) && (max === undefined || product.price <= max);

        return matchesFilter && matchesSearch && matchesShop && matchesPrice;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'newest') return (b.id ?? 0) - (a.id ?? 0);
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        // featured: ưu tiên có tag 'featured', sau đó theo giá giảm
        const aFeat = a.styleTags.includes('featured') ? 1 : 0;
        const bFeat = b.styleTags.includes('featured') ? 1 : 0;
        if (aFeat !== bFeat) return bFeat - aFeat;
        return b.price - a.price;
    });

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-8">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i}>
                                <Skeleton className="h-64 w-full" />
                                <CardContent className="p-4 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Hero Section */}
            <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border-none shadow-lg">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                            <ShoppingBag className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent vietnamese-heading">
                            Sản Phẩm Thời Trang
                        </CardTitle>
                        <CardDescription className="text-lg mt-2">
                            Khám phá bộ sưu tập thời trang đa dạng và phong phú từ các cửa hàng uy tín
                        </CardDescription>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {[
                            { icon: Sparkles, label: 'Chất lượng cao', color: 'text-blue-600 dark:text-blue-400' },
                            { icon: Star, label: 'Đánh giá tốt', color: 'text-yellow-600 dark:text-yellow-400' },
                            { icon: Heart, label: 'Yêu thích', color: 'text-red-600 dark:text-red-400' }
                        ].map((item, idx) => (
                            <Badge key={idx} variant="secondary" className="px-4 py-2">
                                <item.icon className={`h-4 w-4 mr-2 ${item.color}`} />
                                {item.label}
                            </Badge>
                        ))}
                    </div>
                </CardHeader>
            </Card>

            {/* Usage Guide */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                <Info className="h-5 w-5 text-white" />
                            </div>
                            <CardTitle>Hướng Dẫn Sử Dụng</CardTitle>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowGuide(!showGuide)}>
                            {showGuide ? 'Ẩn' : 'Xem'}
                            <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showGuide ? 'rotate-180' : ''}`} />
                        </Button>
                    </div>
                </CardHeader>

                <AnimatePresence>
                    {showGuide && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { title: '🔍 Tìm Kiếm Thông Minh', desc: 'Tìm kiếm theo tên sản phẩm, cửa hàng hoặc tag. Sử dụng bộ lọc để thu hẹp kết quả theo loại sản phẩm.' },
                                        { title: '🏪 Lọc Theo Shop', desc: 'Chọn cửa hàng cụ thể để xem tất cả sản phẩm từ shop đó. Click vào icon shop để lọc nhanh.' },
                                        { title: '🛒 Mua Sản Phẩm', desc: 'Click "Mua ngay" để truy cập trực tiếp vào cửa hàng. Chúng tôi liên kết với các cửa hàng uy tín.' },
                                        { title: '⭐ Đánh Giá & Tags', desc: 'Xem đánh giá sao và các tag phong cách để chọn sản phẩm phù hợp nhất với bạn.' }
                                    ].map((item, idx) => (
                                        <Card key={idx} className="bg-muted/50">
                                            <CardHeader>
                                                <CardTitle className="text-base">{item.title}</CardTitle>
                                                <CardDescription>{item.desc}</CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            {/* Search and Filters */}
            <Card>
                <CardContent className="pt-6 space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm, shop hoặc tag..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                        {searchTerm && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <Tabs defaultValue="filters" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="filters">
                                <Filter className="h-4 w-4 mr-2" />
                                Bộ lọc
                            </TabsTrigger>
                            <TabsTrigger value="sort">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Sắp xếp
                            </TabsTrigger>
                            <TabsTrigger value="view">
                                <Grid3x3 className="h-4 w-4 mr-2" />
                                Hiển thị
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="filters" className="space-y-4">
                            {/* Category Filter */}
                            <div className="space-y-2">
                                <Label>Loại sản phẩm</Label>
                                <Select value={filter} onValueChange={setFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại sản phẩm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="dress">Dress</SelectItem>
                                        <SelectItem value="shirt">Shirt</SelectItem>
                                        <SelectItem value="pants">Pants</SelectItem>
                                        <SelectItem value="shoes">Shoes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Shop Filter */}
                            <div className="space-y-2">
                                <Label>Cửa hàng</Label>
                                <Select value={selectedShop || 'all'} onValueChange={(val) => setSelectedShop(val === 'all' ? null : val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn cửa hàng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả shop</SelectItem>
                                        {shops.map((shop) => (
                                            <SelectItem key={shop} value={shop}>{shop}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Price Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Giá từ</Label>
                                    <Input
                                        type="number"
                                        placeholder="$0"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Giá đến</Label>
                                    <Input
                                        type="number"
                                        placeholder="$999"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="sort" className="space-y-2">
                            <Label>Sắp xếp theo</Label>
                            <Select value={sortBy} onValueChange={(val) => setSortBy(val as typeof sortBy)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Mới nhất</SelectItem>
                                    <SelectItem value="featured">Nổi bật</SelectItem>
                                    <SelectItem value="price_asc">Giá tăng dần</SelectItem>
                                    <SelectItem value="price_desc">Giá giảm dần</SelectItem>
                                </SelectContent>
                            </Select>
                        </TabsContent>

                        <TabsContent value="view" className="space-y-2">
                            <Label>Kiểu hiển thị</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    className="flex-1"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3x3 className="h-4 w-4 mr-2" />
                                    Lưới
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    className="flex-1"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4 mr-2" />
                                    Danh sách
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <Separator />

                    {/* Results Count */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Tìm thấy <span className="font-semibold text-foreground">{filteredProducts.length}</span> sản phẩm
                        </p>
                        {(searchTerm || selectedShop || filter !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedShop(null);
                                    setFilter('all');
                                    setMinPrice('');
                                    setMaxPrice('');
                                }}
                            >
                                Xóa bộ lọc
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Products Display */}
            {sortedProducts.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <ShoppingBag className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                        <CardTitle className="mb-2">
                            {searchTerm || selectedShop ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
                        </CardTitle>
                        <CardDescription>
                            {searchTerm || selectedShop
                                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem thêm sản phẩm'
                                : 'Sản phẩm sẽ được cập nhật sớm nhất có thể'
                            }
                        </CardDescription>
                    </CardContent>
                </Card>
            ) : (
                <div className={viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                    : 'space-y-4'
                }>
                    {sortedProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                                    {product.imageUrl ? (
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Price Badge */}
                                    <Badge className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600">
                                        {formatVND(product.price)}
                                    </Badge>

                                    {/* Wishlist */}
                                    <Button
                                        size="icon"
                                        variant={wishlist.includes(product.id) ? 'default' : 'secondary'}
                                        onClick={() => toggleWishlist(product.id)}
                                        className="absolute top-3 left-3"
                                    >
                                        <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
                                    </Button>
                                </div>

                                <CardContent className="p-4">
                                    <CardTitle className="text-base mb-2 group-hover:text-primary transition-colors truncate">
                                        {product.name}
                                    </CardTitle>

                                    <div className="flex items-center justify-between mb-3">
                                        <Badge variant="secondary">{product.type}</Badge>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Star className="h-4 w-4 fill-current" />
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {(Math.random() * 2 + 3).toFixed(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {product.styleTags.slice(0, 2).map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {product.styleTags.length > 2 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{product.styleTags.length - 2}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mb-3 p-2 bg-muted rounded-lg">
                                        <Store className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs font-medium truncate">
                                            {product.shop.name}
                                        </span>
                                    </div>
                                </CardContent>

                                <CardFooter className="p-4 pt-0 flex gap-2">
                                    <Button asChild className="flex-1" size="sm">
                                        <a
                                            href={product.shop.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Mua ngay
                                        </a>
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <a href={`/products/${product.id}`}>
                                            <Info className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
