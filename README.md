# AIStyleHub - AI Virtual Try-On & Fashion Platform

![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.22-green?logo=prisma)
![License](https://img.shields.io/badge/license-MIT-green)

Một nền tảng thời trang AI toàn diện kết hợp **Virtual Try-On** từ FASHN, **AI Recommendations** từ OpenAI GPT-4, và **AI Image Generation** với DALL-E 3.

![AIStyleHub Preview](/public/preview.png)

## 🌟 Tính Năng Chính

### 1. 👗 Virtual Try-On (FASHN AI)
- Thử đồ ảo với công nghệ AI tiên tiến
- Hỗ trợ nhiều loại trang phục: áo, quần, váy, jumpsuit
- So sánh nhiều phiên bản model (v1.5, v1.6, staging)
- Chất lượng cao với 3 chế độ: Performance, Balanced, Quality
- Tích hợp image preprocessing tự động

### 2. 🤖 AI Fashion Recommendations (GPT-4)
- Gợi ý trang phục dựa trên mô tả phong cách
- Kết hợp sản phẩm thông minh với AI
- Tích hợp cơ sở dữ liệu sản phẩm
- Cache thông minh để tối ưu chi phí

### 3. 🎨 AI Image Generation (DALL-E 3)
- Tạo ảnh thời trang từ text prompts
- Chất lượng HD, photorealistic
- Tối ưu hóa chi phí với LRU cache
- Enhanced prompts tự động

### 4. 🔐 Authentication & User Management
- Đăng ký/Đăng nhập với JWT
- Quản lý profile người dùng
- Bảo mật với bcrypt password hashing
- Protected routes với middleware

### 5. 📦 Product Management
- Quản lý danh mục sản phẩm
- Tích hợp với shops
- Tags và categorization
- Prisma ORM với MySQL

### 6. 💰 Cost Tracking & Analytics
- Theo dõi chi phí API (OpenAI, FASHN)
- Dashboard thống kê chi tiết
- Báo cáo theo ngày/tuần/tháng
- Real-time cost monitoring

### 7. ☁️ AWS S3 Integration
- Upload và lưu trữ ảnh trên cloud
- Presigned URLs cho bảo mật
- Base64 to S3 converter
- Public và private bucket support

### 8. 🌙 Dark Mode & Modern UI
- Light/Dark/System theme
- Responsive design
- Framer Motion animations
- Tailwind CSS v4

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ và npm
- **MySQL** database (local hoặc cloud)
- **OpenAI API key** - [Get it here](https://platform.openai.com/api-keys)
- **FASHN API key** - [Get it here](https://app.fashn.ai)
- **AWS S3** (optional) - [Setup guide](https://aws.amazon.com/s3/)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/tryonstylehub.git
cd tryonstylehub

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Setup database
npm run prisma:generate
npm run db:push
npm run db:seed  # Optional: seed sample data

# 5. Run development server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## ⚙️ Environment Variables

Tạo file `.env.local` với các biến sau:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# JWT Secret (thay đổi trong production!)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# OpenAI API
OPENAI_API_KEY="sk-proj-your-openai-api-key"

# FASHN API
FASHN_API_KEY="your-fashn-api-key"

# AWS S3 (Optional)
AWS_S3_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 📁 Project Structure

```
tryonstylehub/
├── src/
│   ├── app/
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/              # Authentication endpoints
│   │   │   ├── products/          # Product management
│   │   │   ├── recommend/         # AI recommendations
│   │   │   ├── generate-image/    # DALL-E integration
│   │   │   ├── tryon/             # Virtual try-on
│   │   │   ├── cost-stats/        # Cost tracking
│   │   │   ├── upload/            # S3 upload
│   │   │   └── health/            # Health check
│   │   ├── components/            # React components
│   │   │   ├── Layout.tsx         # Main layout
│   │   │   ├── ThemeToggle.tsx    # Theme switcher
│   │   │   └── ui/                # UI components
│   │   ├── (pages)/
│   │   │   ├── login/             # Login page
│   │   │   ├── register/          # Register page
│   │   │   ├── profile/           # User profile
│   │   │   ├── dashboard/         # Analytics dashboard
│   │   │   ├── products/          # Product catalog
│   │   │   ├── recommend/         # AI recommendations
│   │   │   ├── generate-image/    # Image generation
│   │   │   └── page.tsx           # Homepage (Try-On)
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css            # Global styles
│   ├── lib/
│   │   ├── auth.ts                # Auth helpers
│   │   ├── auth-context.tsx       # Auth provider
│   │   ├── prisma.ts              # Prisma client
│   │   ├── cache.ts               # LRU cache
│   │   ├── cost-optimizer.ts      # Cost tracking
│   │   ├── openai-ai.ts           # OpenAI integrations
│   │   ├── s3.ts                  # AWS S3 utils
│   │   ├── theme.tsx              # Theme provider
│   │   └── db-check.ts            # Database utils
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   └── middleware.ts              # Auth middleware
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Database seeding
├── public/
│   ├── models/                    # Example model images
│   └── garments/                  # Example garment images
├── .env.local                     # Environment variables (create this)
├── .env.example                   # Environment template
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🎯 API Endpoints

### Authentication
```
POST   /api/auth/register    # Đăng ký tài khoản
POST   /api/auth/login       # Đăng nhập
GET    /api/auth/me          # Lấy thông tin user
POST   /api/auth/logout      # Đăng xuất
```

### Products & Fashion
```
GET    /api/products         # Danh sách sản phẩm
POST   /api/recommend        # AI recommendations
POST   /api/generate-image   # Tạo ảnh với DALL-E
POST   /api/tryon            # Virtual try-on
```

### Utilities
```
GET    /api/cost-stats       # Thống kê chi phí
POST   /api/upload           # Upload ảnh lên S3
GET    /api/health           # Health check
```

## 💡 Usage Guide

### 1. Virtual Try-On
1. Đăng nhập vào tài khoản (hoặc dùng không cần đăng nhập)
2. Upload ảnh model (người mẫu)
3. Upload ảnh garment (trang phục)
4. Chọn category và settings
5. Click "Run Try-On"

### 2. AI Recommendations
1. Vào trang `/recommend`
2. Nhập mô tả phong cách (VD: "casual summer beach style")
3. AI sẽ gợi ý outfit phù hợp từ database

### 3. AI Image Generation
1. Vào trang `/generate-image`
2. Nhập text prompt mô tả ảnh
3. DALL-E sẽ tạo ảnh thời trang chất lượng cao

### 4. Product Management
1. Vào trang `/products`
2. Xem danh sách sản phẩm
3. Click vào sản phẩm để xem chi tiết

### 5. Dashboard
1. Vào trang `/dashboard`
2. Xem thống kê chi phí API
3. Monitor usage theo thời gian

## 🗄️ Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  password  String   // Hashed
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id        Int      @id @default(autoincrement())
  name      String
  type      String
  imageUrl  String
  price     Float
  styleTags String   // JSON array
  shopId    Int
  shop      Shop     @relation(fields: [shopId], references: [id])
  outfits   Outfit[] @relation("OutfitProducts")
}

model Shop {
  id        Int       @id @default(autoincrement())
  name      String
  url       String
  products  Product[]
}

model Outfit {
  id        Int       @id @default(autoincrement())
  style     String
  imageUrl  String?
  products  Product[] @relation("OutfitProducts")
}

model TryOnHistory {
  id              Int      @id @default(autoincrement())
  userId          Int?
  modelImageUrl   String
  garmentImageUrl String
  resultImageUrl  String
  modelVersion    String
  createdAt       DateTime @default(now())
}

model CostTracking {
  id        Int      @id @default(autoincrement())
  userId    Int?
  service   String   // "openai", "fashn", "aws-s3"
  operation String   // "image-generation", "try-on", "upload"
  cost      Float
  details   String?  // JSON
  createdAt DateTime @default(now())
}
```

## 🔧 Development

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Database commands
npm run prisma:generate    # Generate Prisma Client
npm run db:push            # Push schema to database
npm run db:seed            # Seed sample data

# Open Prisma Studio
npx prisma studio
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# vercel.com/your-project/settings/environment-variables
```

### Docker

```bash
# Build image
docker build -t aistylehub .

# Run container
docker run -p 3000:3000 --env-file .env.local aistylehub
```

### Environment Variables Setup on Hosting
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Random secret key (min 32 chars)
- `OPENAI_API_KEY` - OpenAI API key
- `FASHN_API_KEY` - FASHN API key
- `AWS_*` - AWS credentials (optional)

## 🛠️ Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
mysql.server status  # macOS
sudo systemctl status mysql  # Linux

# Test connection
mysql -u username -p database_name
```

### API Key Issues
- Verify keys in `.env.local`
- Check OpenAI billing: https://platform.openai.com/account/billing
- Check FASHN dashboard: https://app.fashn.ai

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📊 Performance & Optimization

- **Image Preprocessing**: Auto resize to max 2000px height
- **LRU Cache**: Reduce API costs for repeated requests
- **Base64 Encoding**: Optimized for demo (use CDN in production)
- **Cost Tracking**: Real-time monitoring of API usage
- **Lazy Loading**: Components loaded on demand

## 🎨 Design System

- **Colors**: Tailwind CSS custom palette
- **Typography**: Geist Sans & Geist Mono fonts
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React icon library
- **Components**: Radix UI primitives

## 🔒 Security

- ✅ JWT authentication with httpOnly cookies
- ✅ Password hashing with bcrypt
- ✅ Protected routes with middleware
- ✅ Environment variables for secrets
- ✅ SQL injection protection with Prisma
- ✅ CORS configuration
- ✅ Rate limiting ready

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Chi tiết cài đặt
- [API Documentation](./API_DOCS.md) - API reference
- [FASHN API Docs](https://docs.fashn.ai) - FASHN official docs
- [OpenAI API Docs](https://platform.openai.com/docs) - OpenAI docs

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Changelog

### Version 2.0.0 (Latest)
- ✅ Full authentication system with JWT
- ✅ AI Recommendations with GPT-4
- ✅ AI Image Generation with DALL-E 3
- ✅ Product management with Prisma
- ✅ Cost tracking dashboard
- ✅ AWS S3 integration
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Database integration

### Version 1.0.0
- Virtual Try-On with FASHN AI
- Basic UI components
- Example images

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

**AIStyleHub Team**

- Virtual Try-On powered by [FASHN AI](https://fashn.ai)
- AI Features powered by [OpenAI](https://openai.com)
- Built with [Next.js](https://nextjs.org)

## 🙏 Acknowledgments

- FASHN AI for virtual try-on technology
- OpenAI for GPT-4 and DALL-E 3
- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Prisma for excellent ORM
- Tailwind CSS for styling system

## 📞 Support

- 📧 Email: support@aistylehub.com
- 💬 Discord: [Join our community](https://discord.gg/aistylehub)
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR_USERNAME/tryonstylehub/issues)
- 📖 Docs: [Documentation](https://docs.aistylehub.com)

---

⭐ Star this repo if you find it useful!

Made with ❤️ by AIStyleHub Team

