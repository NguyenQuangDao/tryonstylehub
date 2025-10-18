# 🎨 Hướng dẫn Setup Virtual Model (Người mẫu ảo)

## 📋 Tổng quan

Virtual Model là tính năng cho phép người dùng tạo và lưu trữ các "người mẫu ảo" tùy chỉnh với đầy đủ thông số cơ thể, ngoại hình và phong cách. Mỗi người dùng có thể tạo nhiều virtual models và sử dụng chúng trong quá trình try-on.

## 🛠️ Các bước Setup

### 1. Cập nhật Database Schema

Schema đã được cập nhật trong `prisma/schema.prisma` với model `VirtualModel`. Bạn cần chạy các lệnh sau:

```bash
# Di chuyển vào thư mục dự án
cd tryonstylehub

# Generate Prisma Client với schema mới
npx prisma generate

# Tạo migration và áp dụng vào database
npx prisma migrate dev --name add_virtual_model

# Hoặc nếu bạn muốn push trực tiếp mà không tạo migration:
npx prisma db push
```

### 2. Khởi động lại Development Server

Sau khi generate Prisma Client, khởi động lại server:

```bash
npm run dev
```

## 📁 Cấu trúc File đã tạo

### API Routes
- **`/api/virtual-models/route.ts`**: API endpoints cho CRUD operations
  - `GET`: Lấy danh sách virtual models của user
  - `POST`: Tạo virtual model mới
  - `PUT`: Cập nhật virtual model
  - `DELETE`: Xóa virtual model

### Components
- **`VirtualModelForm.tsx`**: Form để tạo/chỉnh sửa virtual model với đầy đủ các trường
  - Thông tin cơ bản (tên, công khai)
  - Thông số cơ thể (chiều cao, cân nặng, giới tính, dáng người, màu da...)
  - Ngoại hình (tóc, mắt, khuôn mặt, râu, hình xăm...)
  - Phong cách (trang phục, giày dép)
  - Nâng cao (tuổi hiển thị, preset tỷ lệ cơ thể)

- **`VirtualModelSelector.tsx`**: Component để chọn và quản lý virtual models
  - Hiển thị danh sách virtual models đã tạo
  - Chọn virtual model để sử dụng
  - Chỉnh sửa hoặc xóa virtual model
  - Tạo virtual model mới

### Types
- **`types/index.ts`**: TypeScript interfaces cho VirtualModel và CreateVirtualModelInput

### Database Schema
- **`prisma/schema.prisma`**: Model VirtualModel với các trường:

#### Trường bắt buộc:
- `avatarName`: Tên người mẫu ảo
- `height`: Chiều cao (cm)
- `weight`: Cân nặng (kg)
- `gender`: Giới tính (male, female, non-binary)
- `hairColor`: Màu tóc
- `hairStyle`: Kiểu tóc

#### Trường tùy chọn:
- **Body Metrics**: bodyShape, skinTone, muscleLevel, fatLevel, shoulderWidth, waistSize, hipSize, legLength
- **Appearance**: eyeColor, faceShape, beardStyle, tattoos, piercings
- **Style**: clothingStyle, footwearType, colorPalette, accessories
- **Advanced**: ageAppearance, bodyProportionPreset

## 🎯 Cách sử dụng

### 1. Tạo Virtual Model mới

1. Click vào nút **"Người mẫu ảo"** (màu tím) ở góc phải của card "Ảnh Người Mẫu"
2. Trong modal hiện ra, click **"Tạo người mẫu ảo mới"**
3. Điền các thông tin bắt buộc:
   - Tên người mẫu ảo
   - Chiều cao (140-220 cm)
   - Cân nặng (35-150 kg)
   - Giới tính
   - Màu tóc
   - Kiểu tóc
4. Tùy chọn điền các thông tin bổ sung trong các section khác
5. Click **"Tạo mới"** để lưu

### 2. Chọn Virtual Model

1. Click vào nút **"Người mẫu ảo"**
2. Chọn một virtual model từ danh sách
3. Thông tin virtual model sẽ hiển thị trên card "Ảnh Người Mẫu"

### 3. Chỉnh sửa Virtual Model

1. Click vào nút **"Người mẫu ảo"**
2. Click nút **"Chỉnh sửa"** trên virtual model muốn sửa
3. Cập nhật thông tin
4. Click **"Cập nhật"** để lưu

### 4. Xóa Virtual Model

1. Click vào nút **"Người mẫu ảo"**
2. Click nút xóa (icon thùng rác) trên virtual model
3. Xác nhận xóa

## 🔐 Bảo mật

- Virtual models được liên kết với user ID
- Chỉ user tạo ra mới có thể xem, sửa, xóa virtual models của mình
- API routes có authentication check qua JWT token

## 🌟 Tính năng mở rộng (Future)

- **Generate AI Image**: Tự động tạo ảnh người mẫu từ thông số virtual model
- **Share Virtual Models**: Cho phép chia sẻ virtual models công khai
- **Virtual Model Templates**: Các template có sẵn để người dùng chọn
- **3D Avatar Preview**: Xem preview 3D của virtual model
- **Body Measurement Guide**: Hướng dẫn đo các chỉ số cơ thể chính xác

## ❓ Troubleshooting

### Lỗi: "Property 'virtualModel' does not exist on type 'PrismaClient'"

**Giải pháp**: Chạy `npx prisma generate` để generate Prisma Client mới với schema đã cập nhật.

### Lỗi: "Unauthorized" khi gọi API

**Giải pháp**: Đảm bảo user đã đăng nhập. Virtual models chỉ hoạt động với authenticated users.

### Database migration failed

**Giải pháp**: 
1. Kiểm tra DATABASE_URL trong `.env`
2. Đảm bảo MySQL server đang chạy
3. Thử sử dụng `npx prisma db push` thay vì migrate

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Console logs trong browser (F12)
2. Terminal logs của Next.js server
3. Database connection
4. Prisma Client đã được generate

---

**Created**: October 2025  
**Version**: 1.0.0

