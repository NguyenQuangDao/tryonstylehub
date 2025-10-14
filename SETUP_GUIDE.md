# AIStyleHub - Setup Guide

## 🚀 Hướng Dẫn Cài Đặt Chi Tiết

### Bước 1: Cài đặt Dependencies

```bash
cd tryon-nextjs-app
npm install
```

### Bước 2: Cấu hình Database MySQL

#### Option 1: MySQL Local

1. **Cài đặt MySQL** (nếu chưa có):
```bash
# macOS
brew install mysql
brew services start mysql

# hoặc tải từ: https://dev.mysql.com/downloads/mysql/
```

2. **Tạo database**:
```bash
mysql -u root -p
```

```sql
CREATE DATABASE aistylehub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'aistylehub_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON aistylehub_db.* TO 'aistylehub_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

3. **Cập nhật `.env.local`**:
```env
DATABASE_URL="mysql://aistylehub_user:your_password@localhost:3306/aistylehub_db"
```

#### Option 2: MySQL Cloud (PlanetScale, Railway, etc.)

1. Tạo database trên dịch vụ cloud
2. Copy connection string vào `.env.local`

### Bước 3: Cấu hình Environment Variables

File `.env.local` đã được copy, kiểm tra và cập nhật các giá trị:

```env
# Database
DATABASE_URL="mysql://user:password@host:3306/database"

# JWT Secret - QUAN TRỌNG: Thay đổi trong production!
JWT_SECRET="your-random-secret-key-minimum-32-characters"

# OpenAI API (lấy từ: https://platform.openai.com/api-keys)
OPENAI_API_KEY="sk-proj-..."

# FASHN API (lấy từ: https://www.fashn.ai/)
FASHN_API_KEY="your-fashn-key"

# AWS S3 (Optional - cho upload ảnh)
AWS_S3_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
```

### Bước 4: Setup Database với Prisma

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (tạo tables)
npm run db:push

# Seed initial data (optional)
npm run db:seed
```

### Bước 5: Kiểm tra Health Check

```bash
# Start development server
npm run dev
```

Truy cập: http://localhost:3000/api/health

Kết quả mong đợi:
```json
{
  "status": "ok",
  "timestamp": "2025-10-14T...",
  "services": {
    "database": "connected",
    "openai": "configured",
    "fashn": "configured",
    "s3": "configured"
  },
  "environment": "development"
}
```

### Bước 6: Thiết lập AWS S3 (Optional)

1. **Tạo S3 Bucket**:
   - Đăng nhập AWS Console
   - Vào S3 service
   - Create bucket
   - Enable public access (nếu cần)

2. **Tạo IAM User**:
   - Vào IAM service
   - Create user với programmatic access
   - Attach policy: `AmazonS3FullAccess`
   - Save Access Key ID và Secret Access Key

3. **Cấu hình CORS** (nếu upload từ browser):
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": ["ETag"]
  }
]
```

4. **Update `.env.local`**:
```env
AWS_S3_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
```

### Bước 7: Test các chức năng

#### Test Authentication
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Test Products API
```bash
curl http://localhost:3000/api/products
```

#### Test AI Recommendations
```bash
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"style":"casual summer beach style"}'
```

## 🔧 Troubleshooting

### Lỗi Database Connection

```bash
# Kiểm tra MySQL đang chạy
mysql.server status  # macOS
sudo systemctl status mysql  # Linux

# Test connection
mysql -u aistylehub_user -p aistylehub_db
```

### Lỗi Prisma

```bash
# Reset và regenerate
npx prisma generate
npx prisma db push --force-reset

# Hoặc migrate
npx prisma migrate dev --name init
```

### Lỗi OpenAI API

- Kiểm tra API key valid: https://platform.openai.com/api-keys
- Kiểm tra billing: https://platform.openai.com/account/billing
- Check rate limits

### Lỗi AWS S3

- Verify IAM permissions
- Check bucket region
- Test với AWS CLI:
```bash
aws s3 ls s3://your-bucket-name --region us-east-1
```

## 📊 Database Schema

```prisma
User
- id, email (unique), name, password, avatar
- timestamps

Product  
- id, name, type, imageUrl, price, styleTags (JSON)
- shopId (FK), timestamps

Shop
- id, name, url, timestamps

Outfit
- id, style, imageUrl (optional)
- products (many-to-many)

TryOnHistory
- id, userId, modelImageUrl, garmentImageUrl, resultImageUrl
- modelVersion, timestamp

CostTracking
- id, userId, service, operation, cost, details (JSON)
- timestamp
```

## 🎯 Next Steps

1. ✅ Đăng ký tài khoản
2. ✅ Thêm sản phẩm (hoặc seed data)
3. ✅ Test Virtual Try-On
4. ✅ Test AI Recommendations
5. ✅ Test Image Generation
6. ✅ Monitor costs trong Dashboard

## 📱 Features Access

- **Homepage** (`/`): Virtual Try-On
- **Recommendations** (`/recommend`): AI Fashion Recommendations
- **Image Generation** (`/generate-image`): DALL-E Image Creator
- **Products** (`/products`): Product Catalog
- **Dashboard** (`/dashboard`): Cost Analytics
- **Profile** (`/profile`): User Settings

## 🔒 Security Notes

- ⚠️ **JWT_SECRET**: Thay đổi trong production!
- ⚠️ **Database**: Sử dụng strong password
- ⚠️ **API Keys**: Không commit vào git
- ⚠️ **S3 Bucket**: Cấu hình permissions cẩn thận

## 🚢 Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add OPENAI_API_KEY
vercel env add FASHN_API_KEY
```

### Docker

```bash
# Build
docker build -t aistylehub .

# Run
docker run -p 3000:3000 --env-file .env.local aistylehub
```

---

**Need Help?** Check README_AISTYLEHUB.md or create an issue.

