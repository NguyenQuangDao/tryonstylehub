import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Store data with comprehensive information
const storesData: any[] = [
  {
    name: "Thời Trang Cao Cấp Việt Nam",
    slug: "thoi-trang-cao-cap-viet-nam",
    description: "Cửa hàng chuyên cung cấp các sản phẩm thời trang cao cấp với chất liệu nhập khẩu từ Ý và Pháp. Chúng tôi tự hào mang đến những thiết kế tinh tế, sang trọng phù hợp với gu thẩm mỹ của người Việt. Với hơn 10 năm kinh nghiệm trong ngành, chúng tôi cam kết mang lại trải nghiệm mua sắm tốt nhất cho khách hàng.",
    address: "123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
    phone: "028-1234-5678",
    email: "info@caocapfashion.vn",
    website: "https://caocapfashion.vn",
    openingHours: {
      monday: "08:00-21:00",
      tuesday: "08:00-21:00",
      wednesday: "08:00-21:00",
      thursday: "08:00-21:00",
      friday: "08:00-21:00",
      saturday: "09:00-22:00",
      sunday: "09:00-20:00"
    },
    policies: {
      returnPolicy: "Đổi trả trong vòng 7 ngày nếu sản phẩm còn nguyên tem mác",
      shippingPolicy: "Miễn phí vận chuyển cho đơn hàng trên 500.000đ",
      warrantyPolicy: "Bảo hành 1 năm cho tất cả sản phẩm",
      privacyPolicy: "Cam kết bảo mật thông tin khách hàng tuyệt đối"
    },
    socialMedia: {
      facebook: "https://facebook.com/caocapfashion",
      instagram: "https://instagram.com/caocapfashion",
      zalo: "https://zalo.me/caocapfashion"
    }
  },
  {
    name: "Thời Trang Trẻ Em Happy Kids",
    slug: "thoi-trang-tre-em-happy-kids",
    description: "Chuyên cung cấp quần áo trẻ em từ 0-15 tuổi với chất liệu an toàn, thiết kế dễ thương và giá cả hợp lý. Tất cả sản phẩm đều được kiểm tra chất lượng nghiêm ngặt, đảm bảo an toàn cho làn da nhạy cảm của trẻ nhỏ. Chúng tôi cập nhật mẫu mới hàng tuần theo xu hướng thời trang quốc tế.",
    address: "456 Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh",
    phone: "028-8765-4321",
    email: "info@happykids.vn",
    website: "https://happykids.vn",
    openingHours: {
      monday: "09:00-20:00",
      tuesday: "09:00-20:00",
      wednesday: "09:00-20:00",
      thursday: "09:00-20:00",
      friday: "09:00-20:00",
      saturday: "08:30-21:00",
      sunday: "08:30-21:00"
    },
    policies: {
      returnPolicy: "Đổi size miễn phí trong 30 ngày",
      shippingPolicy: "Giao hàng nhanh trong 2-4 giờ nội thành",
      warrantyPolicy: "1 đổi 1 nếu lỗi từ nhà sản xuất",
      privacyPolicy: "Bảo mật thông tin khách hàng"
    },
    socialMedia: {
      facebook: "https://facebook.com/happykidsfashion",
      instagram: "https://instagram.com/happykids.vn"
    }
  },
  {
    name: "Thời Trang Thể Thao Active Life",
    slug: "thoi-trang-the-thao-active-life",
    description: "Chuyên cung cấp trang phục và dụng cụ thể thao chất lượng cao từ các thương hiệu nổi tiếng thế giới. Với đầy đủ các môn thể thao từ gym, yoga, chạy bộ đến bơi lội và leo núi. Chúng tôi có đội ngũ tư vấn chuyên nghiệp giúp bạn chọn được trang phục phù hợp nhất với nhu cầu tập luyện.",
    address: "789 Lê Lợi, Quận 10, TP. Hồ Chí Minh",
    phone: "028-9876-5432",
    email: "info@activelife.vn",
    website: "https://activelife.vn",
    openingHours: {
      monday: "06:00-22:00",
      tuesday: "06:00-22:00",
      wednesday: "06:00-22:00",
      thursday: "06:00-22:00",
      friday: "06:00-22:00",
      saturday: "06:00-22:00",
      sunday: "07:00-21:00"
    },
    policies: {
      returnPolicy: "Đổi trả trong 30 ngày nếu chưa sử dụng",
      shippingPolicy: "Miễn phí giao hàng cho đơn trên 300.000đ",
      warrantyPolicy: "Bảo hành chính hãng từ nhà sản xuất",
      privacyPolicy: "Cam kết bảo mật thông tin"
    },
    socialMedia: {
      facebook: "https://facebook.com/activelifevn",
      instagram: "https://instagram.com/activelife.vn",
      youtube: "https://youtube.com/activelifevn"
    }
  },
  {
    name: "Thời Trang Công Sở Elegance",
    slug: "thoi-trang-cong-so-elegance",
    description: "Chuyên thời trang công sở cao cấp cho nam và nữ với phong cách hiện đại, lịch lãm. Các sản phẩm được thiết kế bởi các nhà thiết kế hàng đầu Việt Nam, sử dụng chất liệu cao cấp nhập khẩu. Phù hợp cho môi trường văn phòng chuyên nghiệp và các sự kiện quan trọng.",
    address: "321 Hai Bà Trưng, Quận 3, TP. Hồ Chí Minh",
    phone: "028-2345-6789",
    email: "info@elegance.vn",
    website: "https://elegance.vn",
    openingHours: {
      monday: "08:30-20:00",
      tuesday: "08:30-20:00",
      wednesday: "08:30-20:00",
      thursday: "08:30-20:00",
      friday: "08:30-20:00",
      saturday: "09:00-21:00",
      sunday: "10:00-19:00"
    },
    policies: {
      returnPolicy: "Đổi trả trong 14 ngày",
      shippingPolicy: "Giao hàng nhanh trong ngày",
      warrantyPolicy: "Bảo hành 6 tháng",
      privacyPolicy: "Bảo mật thông tin khách hàng"
    },
    socialMedia: {
      facebook: "https://facebook.com/elegancefashion",
      linkedin: "https://linkedin.com/company/elegance-vn"
    }
  },
  {
    name: "Thời Trang Dã Ngoại Adventure",
    slug: "thoi-trang-da-ngoai-adventure",
    description: "Chuyên trang phục và phụ kiện dã ngoại, du lịch, cắm trại. Tất cả sản phẩm đều được thiết kế với tiêu chí bền bỉ, chống thấm nước và thoải mái khi vận động. Phù hợp cho các chuyến đi rừng, leo núi, cắm trại và các hoạt động ngoài trời.",
    address: "654 Cách Mạng Tháng 8, Quận Tân Bình, TP. Hồ Chí Minh",
    phone: "028-7654-3210",
    email: "info@adventure.vn",
    website: "https://adventure.vn",
    openingHours: {
      monday: "09:00-21:00",
      tuesday: "09:00-21:00",
      wednesday: "09:00-21:00",
      thursday: "09:00-21:00",
      friday: "09:00-21:00",
      saturday: "08:00-22:00",
      sunday: "08:00-22:00"
    },
    policies: {
      returnPolicy: "Đổi trả trong 30 ngày",
      shippingPolicy: "Miễn phí ship cho đơn trên 500.000đ",
      warrantyPolicy: "Bảo hành 1 năm cho sản phẩm chính hãng",
      privacyPolicy: "Bảo mật thông tin"
    },
    socialMedia: {
      facebook: "https://facebook.com/adventureoutdoor",
      instagram: "https://instagram.com/adventure.vn"
    }
  }
];

// Generate more stores programmatically
const generateAdditionalStores = () => {
  const storeTypes = [
    { type: "Thời Trang", categories: ["Nam", "Nữ", "Trẻ Em", "Công Sở", "Thể Thao", "Dã Ngoại", "Dạ Hội", "Cưới", "Bầu", "Big Size"] },
    { type: "Phụ Kiện", categories: ["Túi Xách", "Giày Dép", "Trang Sức", "Đồng Hồ", "Kính Mắt", "Thắt Lưng", "Mũ Nón", "Khăn Choàng", "Ví Bóp"] },
    { type: "Chuyên Biệt", categories: ["Vintage", "Thiết Kế", "Handmade", "Organic", "Sustainable", "Luxury", "Streetwear", "Denim", "Linen"] }
  ];

  const cities = [
    "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Nha Trang", "Vũng Tàu", 
    "Cần Thơ", "Huế", "Hải Phòng", "Biên Hòa", "Buôn Ma Thuột"
  ];

  const streets = [
    "Nguyễn Trãi", "Trần Hưng Đạo", "Lê Lợi", "Hai Bà Trưng", "Cách Mạng Tháng 8",
    "Phạm Ngũ Lão", "Bùi Viện", "Đề Thám", "Võ Văn Tần", "Lý Tự Trọng"
  ];

  const additionalStores = [];
  
  for (let i = 0; i < 25; i++) {
    const storeType = storeTypes[Math.floor(Math.random() * storeTypes.length)];
    const category = storeType.categories[Math.floor(Math.random() * storeType.categories.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    
    const storeName = `${storeType.type} ${category} ${generateStoreSuffix()}`;
    const slug = generateSlug(storeName);
    
    additionalStores.push({
      name: storeName,
      slug: slug,
      description: generateStoreDescription(storeType.type, category),
      address: `${number} ${street}, ${city}`,
      phone: generatePhoneNumber(),
      email: `info@${slug}.vn`,
      website: `https://${slug}.vn`,
      openingHours: generateOpeningHours(),
      policies: generatePolicies(),
      socialMedia: generateSocialMedia(slug)
    });
  }
  
  return additionalStores;
};

const generateStoreSuffix = () => {
  const suffixes = ["Style", "Fashion", "Boutique", "Store", "Shop", "Gallery", "Studio", "Collection", "Trends", "Premium"];
  return suffixes[Math.floor(Math.random() * suffixes.length)];
};

const generateSlug = (name: string) => {
  return name.toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const generateStoreDescription = (type: string, category: string) => {
  const descriptions = [
    `Cửa hàng ${type} ${category} uy tín với nhiều năm kinh nghiệm. Chúng tôi cam kết mang đến những sản phẩm chất lượng cao với giá cả hợp lý. Đội ngũ nhân viên chuyên nghiệp sẽ tư vấn giúp bạn chọn được sản phẩm ưng ý nhất.`,
    
    `Chuyên cung cấp ${type.toLowerCase()} ${category.toLowerCase()} với đa dạng mẫu mã và kiểu dáng. Tất cả sản phẩm đều được tuyển chọn kỹ lưỡng về chất lượng. Chúng tôi luôn cập nhật xu hướng mới nhất để phục vụ quý khách hàng.`,
    
    `Địa chỉ tin cậy cho những tín đồ ${type.toLowerCase()} ${category.toLowerCase()}. Với phương châm "Chất lượng là danh dự", chúng tôi không ngừng nỗ lực mang đến trải nghiệm mua sắm tốt nhất. Cam kết hài lòng 100% hoặc hoàn tiền.`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

const generatePhoneNumber = (): string => {
  const prefixes = ['028', '024', '0236', '0258', '0254', '0292', '0234', '0225', '0251', '0262'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `${prefix}-${number}`;
};

const generateOpeningHours = (): any => {
  const patterns = [
    { open: "08:00", close: "21:00" },
    { open: "09:00", close: "20:00" },
    { open: "08:30", close: "20:30" },
    { open: "10:00", close: "22:00" }
  ];
  
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  return {
    monday: `${pattern.open}-${pattern.close}`,
    tuesday: `${pattern.open}-${pattern.close}`,
    wednesday: `${pattern.open}-${pattern.close}`,
    thursday: `${pattern.open}-${pattern.close}`,
    friday: `${pattern.open}-${pattern.close}`,
    saturday: `${pattern.open}-${pattern.close}`,
    sunday: `${pattern.open}-${Math.max(parseInt(pattern.close.split(':')[0]) - 1, 19)}:00`
  };
};

const generatePolicies = (): any => {
  const returnDays = [7, 14, 30];
  const shippingThreshold = [200000, 300000, 500000];
  const warrantyMonths = [3, 6, 12];
  
  return {
    returnPolicy: `Đổi trả trong vòng ${returnDays[Math.floor(Math.random() * returnDays.length)]} ngày`,
    shippingPolicy: `Miễn phí ship cho đơn trên ${shippingThreshold[Math.floor(Math.random() * shippingThreshold.length)].toLocaleString('vi-VN')}đ`,
    warrantyPolicy: `Bảo hành ${warrantyMonths[Math.floor(Math.random() * warrantyMonths.length)]} tháng`,
    privacyPolicy: "Bảo mật thông tin khách hàng"
  };
};

const generateSocialMedia = (slug: string): Record<string, string> => {
  const platforms = ['facebook', 'instagram', 'zalo', 'tiktok', 'youtube'];
  const socialMedia: Record<string, string> = {};
  
  const count = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < count; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    if (!socialMedia[platform]) {
      socialMedia[platform] = `https://${platform}.com/${slug}`;
    }
  }
  
  return socialMedia;
};

// Product data generator
const generateProducts = (shopId: string, categoryId: string, count: number = 25) => {
  const products = [];
  const productTypes = [
    {
      name: "Áo thun",
      materials: ["Cotton 100%", "Cotton pha", "Thun lạnh", "Modal"],
      colors: ["Trắng", "Đen", "Xám", "Xanh Navy", "Đỏ", "Vàng", "Xanh Lá", "Hồng"],
      sizes: ["S", "M", "L", "XL", "XXL"]
    },
    {
      name: "Quần jeans",
      materials: ["Denim 100%", "Denim co giãn", "Cotton denim"],
      colors: ["Xanh đậm", "Xanh nhạt", "Đen", "Xám", "Trắng"],
      sizes: ["28", "29", "30", "31", "32", "33", "34", "36"]
    },
    {
      name: "Váy đầm",
      materials: ["Lụa", "Cotton", "Linen", "Voan", "Thun"],
      colors: ["Đen", "Trắng", "Hồng", "Xanh", "Đỏ", "Vàng", "Tím", "Cam"],
      sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
      name: "Áo sơ mi",
      materials: ["Cotton", "Lụa", "Linen", "Kate", "Voan"],
      colors: ["Trắng", "Xanh", "Hồng", "Vàng", "Xám", "Đen", "Tím"],
      sizes: ["S", "M", "L", "XL", "XXL"]
    },
    {
      name: "Quần âu",
      materials: ["Polyester", "Cotton", "Linen", "Kaki"],
      colors: ["Đen", "Xám", "Xanh Navy", "Nâu", "Be"],
      sizes: ["28", "29", "30", "31", "32", "33", "34"]
    },
    {
      name: "Áo khoác",
      materials: ["Da", "Jean", "Nỉ", "Dù", "Vải dạ"],
      colors: ["Đen", "Nâu", "Xám", "Xanh", "Đỏ", "Vàng"],
      sizes: ["S", "M", "L", "XL", "XXL"]
    },
    {
      name: "Đầm dạ hội",
      materials: ["Lụa", "Vải cưới", "Đăng ten", "Nhung"],
      colors: ["Đen", "Đỏ", "Xanh Navy", "Hồng", "Vàng", "Bạc", "Vàng"],
      sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
      name: "Quần short",
      materials: ["Cotton", "Jean", "Kaki", "Thun"],
      colors: ["Xanh", "Đen", "Xám", "Nâu", "Be", "Trắng"],
      sizes: ["S", "M", "L", "XL", "XXL"]
    }
  ];

  for (let i = 0; i < count; i++) {
    const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
    const productName = `${productType.name} ${generateProductStyle()} ${generateProductFeature()}`;
    const basePrice = Math.floor(Math.random() * 500000) + 150000;
    const salePrice = Math.random() > 0.7 ? Math.floor(basePrice * (0.8 + Math.random() * 0.15)) : null;
    
    const color = productType.colors[Math.floor(Math.random() * productType.colors.length)];
    const material = productType.materials[Math.floor(Math.random() * productType.materials.length)];
    
    products.push({
      title: productName,
      description: generateProductDescription(productType.name, material, color),
      shortDescription: `${productType.name} chất liệu ${material} màu ${color}`,
      basePrice: basePrice,
      salePrice: salePrice,
      sku: generateSKU(shopId, i),
      stockQuantity: Math.floor(Math.random() * 100) + 10,
      weight: Math.floor(Math.random() * 500) + 100,
      dimensions: {
        length: Math.floor(Math.random() * 50) + 20,
        width: Math.floor(Math.random() * 40) + 15,
        height: Math.floor(Math.random() * 20) + 5
      },
      material: material,
      brand: generateBrandName(),
      tags: [productType.name.toLowerCase(), material.toLowerCase(), color.toLowerCase(), "thời trang"],
      specifications: {
        "Xuất xứ": "Việt Nam",
        "Thương hiệu": generateBrandName(),
        "Chất liệu": material,
        "Màu sắc": color,
        "Kiểu dáng": generateProductStyle()
      },
      features: [
        "Thiết kế thời trang",
        "Chất liệu cao cấp",
        "May tỉ mỉ",
        "Dễ dàng giặt ủi",
        "Bền màu theo thời gian"
      ],
      shippingInfo: {
        weight: Math.floor(Math.random() * 500) + 100,
        dimensions: "30x25x5cm",
        shippingMethod: ["Giao hàng nhanh", "Giao hàng tiêu chuẩn"]
      },
      warranty: "Bảo hành 3 tháng cho các lỗi may mặc",
      returnPolicy: "Đổi trả trong 7 ngày nếu sản phẩm còn nguyên tem mác",
      isFeatured: Math.random() > 0.8,
      isNew: Math.random() > 0.6,
      shopId: shopId,
      categoryId: categoryId,
      images: generateProductImages(productType.name, color)
    });
  }
  
  return products;
};

const generateProductStyle = () => {
  const styles = ["Cổ điển", "Hiện đại", "Trẻ trung", "Thanh lịch", "Cá tính", "Năng động", "Tối giản", "Sang trọng"];
  return styles[Math.floor(Math.random() * styles.length)];
};

const generateProductFeature = () => {
  const features = ["Co giãn", "Thoáng mát", "Thấm mồ hôi", "Chống nhăn", "Bền màu", "Giữ dáng", "Mềm mại", "Nhẹ nhàng"];
  return features[Math.floor(Math.random() * features.length)];
};

const generateProductDescription = (productType: string, material: string, color: string) => {
  const descriptions = [
    `${productType} cao cấp được làm từ chất liệu ${material} mềm mại, thoáng mát. Thiết kế ${generateProductStyle().toLowerCase()} phù hợp với nhiều hoàn cảnh. Màu ${color} dễ dàng phối đồ. Sản phẩm được may tỉ mỉ với đường chỉ chắc chắn, đảm bảo độ bền cao theo thời gian.`,
    
    `Sản phẩm ${productType.toLowerCase()} với chất liệu ${material} cao cấp mang lại cảm giác thoải mái khi mặc. Kiểu dáng ${generateProductStyle().toLowerCase()} phù hợp với xu hướng thời trang hiện đại. Màu ${color} trẻ trung, năng động. Được sản xuất với quy trình kiểm soát chất lượng nghiêm ngặt.`,
    
    `${productType} thời trang với thiết kế độc đáo, chất liệu ${material} mềm mại, thân thiện với làn da. Màu ${color} dễ phối đồ, phù hợp với nhiều phong cách. Sản phẩm được gia công tỉ mỉ, chắc chắn, bền đẹp theo thời gian. Phù hợp cho cả mặc hàng ngày và dự tiệc.`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

const generateSKU = (shopId: string, index: number) => {
  return `SKU-${shopId.substring(0, 8).toUpperCase()}-${String(index + 1).padStart(4, '0')}`;
};

const generateBrandName = () => {
  const brands = ["FashionViet", "StylePro", "TrendyWear", "ComfortStyle", "EliteFashion", "ModernLook", "ClassicWear", "UrbanStyle"];
  return brands[Math.floor(Math.random() * brands.length)];
};

const generateProductImages = (productType: string, color: string) => {
  const imageCount = Math.floor(Math.random() * 3) + 3; // 3-5 images
  const images = [];
  
  for (let i = 0; i < imageCount; i++) {
    images.push({
      url: `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(productType)}+${encodeURIComponent(color)}+${i + 1}`,
      alt: `${productType} màu ${color} - Ảnh ${i + 1}`,
      isPrimary: i === 0
    });
  }
  
  return images;
};

// Blog post generator
const generateBlogPosts = (count = 25) => {
  const blogPosts = [];
  
  const topics = [
    {
      title: "Xu hướng thời trang mùa hè 2024",
      category: "Xu hướng",
      tags: ["thời trang hè", "xu hướng 2024", "mùa hè", "thời trang"]
    },
    {
      title: "Cách phối đồ công sở thanh lịch",
      category: "Phong cách",
      tags: ["công sở", "phối đồ", "thanh lịch", "văn phòng"]
    },
    {
      title: "Chăm sóc quần áo đúng cách",
      category: "Chăm sóc",
      tags: ["chăm sóc", "giặt ủi", "bảo quản", "quần áo"]
    },
    {
      title: "Thời trang bền vững và trách nhiệm",
      category: "Bền vững",
      tags: ["bền vững", "trách nhiệm", "môi trường", "thời trang xanh"]
    },
    {
      title: "Phụ kiện thời trang nam nữ không thể thiếu",
      category: "Phụ kiện",
      tags: ["phụ kiện", "thời trang nam", "thời trang nữ", "phong cách"]
    }
  ];
  
  for (let i = 0; i < count; i++) {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const title = `${topic.title} - Bài ${i + 1}`;
    
    blogPosts.push({
      title: title,
      slug: generateSlug(title),
      excerpt: generateBlogExcerpt(),
      content: generateBlogContent(topic.title),
      featuredImage: `https://via.placeholder.com/1200x600/10B981/FFFFFF?text=${encodeURIComponent(topic.title)}`,
      media: generateBlogMedia(),
      category: topic.category,
      tags: topic.tags,
      isFeatured: Math.random() > 0.7,
      readingTime: Math.floor(Math.random() * 10) + 5,
      seoTitle: `${topic.title} | Thời trang chất lượng`,
      seoDescription: generateBlogExcerpt(),
      seoKeywords: topic.tags.join(", "),
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    });
  }
  
  return blogPosts;
};

const generateBlogExcerpt = () => {
  const excerpts = [
    "Khám phá những bí quyết thời trang mới nhất và cách phối đồ độc đáo cho mọi dịp.",
    "Tổng hợp các mẹo hay giúp bạn luôn tự tin với phong cách thời trang của mình.",
    "Chia sẻ kinh nghiệm chọn lựa và bảo quản trang phục từ các chuyên gia thời trang.",
    "Cập nhật xu hướng thời trang thế giới và cách áp dụng vào phong cách cá nhân."
  ];
  
  return excerpts[Math.floor(Math.random() * excerpts.length)];
};

const generateBlogContent = (topic: string) => {
  return `Bài viết về ${topic} này sẽ chia sẻ với bạn đọc những thông tin hữu ích và thú vị. 

## Giới thiệu

Trong thế giới thời trang luôn thay đổi không ngừng, việc cập nhật xu hướng và phong cách mới là điều rất quan trọng. Bài viết này sẽ giúp bạn hiểu rõ hơn về ${topic.toLowerCase()}.

## Nội dung chính

### 1. Xu hướng hiện tại

Hiện nay, ${topic.toLowerCase()} đang trở thành tâm điểm chú ý của giới mộ điệu thời trang. Nhiều nhà thiết kế đã sáng tạo ra những mẫu mã độc đáo, phù hợp với nhu cầu đa dạng của người tiêu dùng.

### 2. Cách áp dụng vào cuộc sống

Việc áp dụng ${topic.toLowerCase()} vào phong cách cá nhân cần có sự tinh tế và hiểu biết nhất định. Bạn nên:

- Lựa chọn những item phù hợp với vóc dáng và màu da
- Kết hợp hài hòa giữa các yếu tố thời trang
- Chú ý đến tính thực tiễn và sự thoải mái

### 3. Mẹo nhỏ hữu ích

Để có được phong cách hoàn hảo, bạn đừng quên:

+ Chăm sóc và bảo quản trang phục đúng cách
+ Đầu tư vào những món đồ cơ bản, dễ phối
+ Theo dõi các xu hướng nhưng không bị ràng buộc

## Kết luận

${topic} là một phần quan trọng trong văn hóa thời trang hiện đại. Hy vọng bài viết này đã mang đến cho bạn những thông tin bổ ích và truyền cảm hứng để bạn tự tin thể hiện phong cách riêng của mình.

Hãy tiếp tục theo dõi các bài viết tiếp theo để cập nhật thêm nhiều kiến thức thời trang thú vị nhé!`;
};

const generateBlogMedia = () => {
  const media = [];
  const count = Math.floor(Math.random() * 3) + 3; // 3-5 images
  
  for (let i = 0; i < count; i++) {
    media.push({
      url: `https://via.placeholder.com/800x600/6366F1/FFFFFF?text=Blog+Image+${i + 1}`,
      alt: `Hình ảnh minh họa ${i + 1}`,
      caption: `Mô tả cho hình ảnh ${i + 1}`
    });
  }
  
  return media;
};

async function main() {
  try {
    console.log('🚀 Bắt đầu seed dữ liệu toàn diện...');
    
    // Generate all stores
    const allStores = [...storesData, ...generateAdditionalStores()];
    console.log(`📦 Tạo ${allStores.length} cửa hàng...`);
    
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@aistylehub.com' },
      update: {},
      create: {
        email: 'admin@aistylehub.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Quản trị viên',
        role: 'ADMIN',
        tokenBalance: 1000
      }
    });
    
    console.log('👤 Admin user created:', adminUser.email);
    
    // Create categories
    const categories = [
      { name: 'Áo', slug: 'ao' },
      { name: 'Quần', slug: 'quan' },
      { name: 'Váy đầm', slug: 'vay-dam' },
      { name: 'Áo khoác', slug: 'ao-khoac' },
      { name: 'Đồ thể thao', slug: 'do-the-thao' },
      { name: 'Đồ ngủ', slug: 'do-ngu' },
      { name: 'Đồ bầu', slug: 'do-bau' },
      { name: 'Đồ trẻ em', slug: 'do-tre-em' }
    ];
    
    const createdCategories = [];
    for (const category of categories) {
      const created = await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: {
          name: category.name,
          slug: category.slug,
          imageUrl: `https://via.placeholder.com/400x300/10B981/FFFFFF?text=${encodeURIComponent(category.name)}`
        }
      });
      createdCategories.push(created);
    }
    
    console.log('📂 Categories created:', createdCategories.length);
    
    // Create stores with owners
    const createdStores = [];
    for (let i = 0; i < allStores.length; i++) {
      const storeData = allStores[i];
      
      // Create seller user for each store
      const sellerUser = await prisma.user.upsert({
        where: { email: `seller${i + 1}@aistylehub.com` },
        update: {},
        create: {
          email: `seller${i + 1}@aistylehub.com`,
          password: await bcrypt.hash('seller123', 10),
          name: `Chủ shop ${storeData.name}`,
          role: 'SELLER',
          tokenBalance: Math.floor(Math.random() * 500) + 100
        }
      });
      
      // Create store
      const store = await prisma.shop.create({
        data: ({
          name: storeData.name,
          slug: storeData.slug,
          description: storeData.description,
          logoUrl: `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(storeData.name.substring(0, 10))}`,
          bannerUrl: `https://via.placeholder.com/1200x400/10B981/FFFFFF?text=${encodeURIComponent(storeData.name)}`,
          openingHours: storeData.openingHours,
          policies: storeData.policies,
          socialMedia: storeData.socialMedia,
          status: 'ACTIVE',
          averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          totalSales: Math.floor(Math.random() * 1000),
          featured: Math.random() > 0.8,
          ownerId: sellerUser.id
        } as any)
      });
      
      createdStores.push(store);
      console.log(`✅ Store ${i + 1}/${allStores.length}: ${store.name}`);
      
      // Create products for this store
      const productCount = Math.floor(Math.random() * 6) + 25; // 25-30 products
      const products = generateProducts(store.id, createdCategories[Math.floor(Math.random() * createdCategories.length)].id, productCount);
      
      for (const product of products) {
        await prisma.product.create({
          data: product
        });
      }
      
      console.log(`   📦 Created ${productCount} products`);
    }
    
    // Create blog posts
    console.log('📝 Creating blog posts...');
    const blogPosts = generateBlogPosts(25);
    
    for (const post of blogPosts) {
      await prisma.blogPost.create({
        data: ({
          ...post,
          authorId: adminUser.id,
          shopId: Math.random() > 0.5 ? createdStores[Math.floor(Math.random() * createdStores.length)].id : null
        } as any)
      });
    }
    
    console.log('✅ Blog posts created:', blogPosts.length);
    
    // Create some regular users
    console.log('👥 Creating regular users...');
    for (let i = 0; i < 10; i++) {
      await prisma.user.upsert({
        where: { email: `user${i + 1}@aistylehub.com` },
        update: {},
        create: {
          email: `user${i + 1}@aistylehub.com`,
          password: await bcrypt.hash('user123', 10),
          name: `Người dùng ${i + 1}`,
          role: 'USER',
          tokenBalance: Math.floor(Math.random() * 200) + 50
        }
      });
    }
    
    console.log('🎉 Seed dữ liệu hoàn thành!');
    console.log(`📊 Tổng kết:`);
    console.log(`   - ${allStores.length} cửa hàng`);
    console.log(`   - ${createdCategories.length} danh mục`);
    console.log(`   - ${blogPosts.length} bài viết blog`);
    console.log(`   - 1 admin user`);
    console.log(`   - ${allStores.length} seller users`);
    console.log(`   - 10 regular users`);
    
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
