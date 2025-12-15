# Tài Liệu Chức Năng Hệ Thống AIStyleHub
**Phiên bản tài liệu**: 1.0.0
**Ngày cập nhật**: 2025-12-13

Tài liệu này liệt kê chi tiết các chức năng hiện có trong hệ thống AIStyleHub, bao gồm logic xử lý, vị trí file và các tham số liên quan.

---

## 1. Module Xác Thực (Authentication)

### 1.1 Đăng Nhập (Login)
- **Mục đích**: Xác thực người dùng và cấp phát session token.
- **File**: `src/app/api/auth/login/route.ts`
- **Vị trí**: Dòng 7 - 105
- **Phương thức**: `POST`
- **Tham số đầu vào**:
  - `email` (string): Email người dùng.
  - `password` (string): Mật khẩu.
- **Kết quả đầu ra**: JSON chứa thông tin user và cookie `token`.
- **Hàm liên quan**: 
  - `isValidEmail` (lib/auth)
  - `verifyPassword` (lib/auth)
  - `createToken` (lib/auth)

### 1.2 Đăng Ký (Register)
- **Mục đích**: Tạo tài khoản mới và tặng token khởi tạo.
- **File**: `src/app/api/auth/register/route.ts`
- **Vị trí**: Dòng 9 - 100+
- **Phương thức**: `POST`
- **Tham số đầu vào**:
  - `email` (string)
  - `name` (string)
  - `password` (string)
- **Logic xử lý chính**:
  - Kiểm tra email tồn tại.
  - Hash mật khẩu.
  - Tạo user mới với số dư token miễn phí (`TOKEN_CONFIG.FREE_TOKENS_ON_SIGNUP`).
  - Ghi log giao dịch tặng token.
  - Tự động đăng nhập sau khi đăng ký.

### 1.3 Lấy Thông Tin Người Dùng (Get Current User)
- **Mục đích**: Lấy thông tin user hiện tại dựa trên cookie session.
- **File**: `src/app/api/auth/me/route.ts`
- **Vị trí**: Dòng 6 - 46
- **Phương thức**: `GET`
- **Tham số đầu vào**: Cookie `token`.
- **Kết quả đầu ra**: JSON object `user` và thời gian hết hạn `exp`.

### 1.4 Helper Functions (Thư viện Auth)
- **File**: `src/lib/auth.ts`
- **Chức năng chi tiết**:
  - `hashPassword` (Dòng 24-27): Mã hóa mật khẩu với bcrypt.
  - `verifyPassword` (Dòng 32-34): Kiểm tra mật khẩu.
  - `createToken` (Dòng 39-46): Tạo JWT token (HS256).
  - `verifyToken` (Dòng 51-58): Xác thực và giải mã JWT token.
  - `isValidEmail` (Dòng 63-66): Regex kiểm tra định dạng email.
  - `isValidPassword` (Dòng 71-76): Kiểm tra độ dài mật khẩu (min 6 chars).

---

## 2. Module Token & Thanh Toán (Token System)

### 2.1 Mua Token (Purchase Token)
- **Mục đích**: Xử lý giao dịch mua gói token.
- **File**: `src/app/api/tokens/purchase/route.ts`
- **Vị trí**: Dòng 14 - 100+
- **Phương thức**: `POST`
- **Tham số đầu vào**:
  - `packageId` (string): ID gói token.
  - `paymentMethodId` (string): ID phương thức thanh toán.
- **Logic xử lý chính**:
  - Kiểm tra gói token hợp lệ.
  - Ghi log `PURCHASE_INITIATED`.
  - Gọi `processPayment` để trừ tiền (Mock hoặc Real Gateway).
  - Cộng token và ghi log kết quả.

### 2.2 Xem Số Dư Token (Get Balance)
- **Mục đích**: Lấy số dư hiện tại và lịch sử giao dịch gần nhất.
- **File**: `src/app/api/tokens/balance/route.ts`
- **Vị trí**: Dòng 6 - 61
- **Phương thức**: `GET`
- **Kết quả đầu ra**:
  - `balance`: Số dư hiện tại.
  - `totalPurchased`: Tổng token đã mua.
  - `totalUsed`: Tổng token đã sử dụng.
  - `recentPurchases`: 5 giao dịch gần nhất.

### 2.3 Token Middleware
- **Mục đích**: Kiểm soát quyền truy cập dựa trên số dư token.
- **File**: `src/lib/token-middleware.ts`
- **Chức năng chi tiết**:
  - `requireTokens` (Dòng 19-73): Middleware kiểm tra xem user có đủ token cho thao tác không. Trả về lỗi nếu không đủ.
  - `chargeTokens` (Dòng 79-86): Hàm trừ token sau khi thao tác thành công.
  - `createInsufficientTokensResponse` (Dòng 91-100+): Tạo response lỗi chuẩn hóa khi thiếu token.

---

## 3. Module AI Try-On (Thử Đồ Ảo)

### 3.1 Xử Lý Thử Đồ (Process Try-On)
- **Mục đích**: Nhận ảnh và gửi yêu cầu ghép đồ sang AI Service (Fashn.ai).
- **File**: `src/app/api/tryon/route.ts`
- **Vị trí**: Dòng 78 - 100+
- **Phương thức**: `POST`
- **Tham số đầu vào** (FormData):
  - `personImage` (File): Ảnh người mẫu.
  - `garmentImage` (File): Ảnh trang phục.
  - `category` (string): Loại trang phục (tops, bottoms, dresses).
- **Logic xử lý chính**:
  - Validate input và API Key.
  - Chuyển đổi file ảnh sang Base64 (`fileToBase64`, `urlToBase64`).
  - (Dự kiến) Gọi Fashn API để xử lý.
  - (Dự kiến) Trừ token người dùng.

### 3.2 Kiểm Tra Trạng Thái Job (Check Status)
- **Mục đích**: Kiểm tra tiến độ xử lý của task AI.
- **File**: `src/app/api/tryon/status/[jobId]/route.ts`
- **Vị trí**: Dòng 10 - 18
- **Trạng thái**: Hiện tại trả về `501 Not Implemented` (Tính năng đang tạm khóa hoặc chưa hoàn thiện model Job).

---

## 4. Module Blog

### 4.1 Quản Lý Bài Viết (Posts Management)
- **File**: `src/app/api/blog/posts/route.ts`
- **Phương thức GET** (Dòng 21-70):
  - **Chức năng**: Lấy danh sách bài viết, hỗ trợ tìm kiếm, lọc theo danh mục/tác giả, phân trang.
  - **Tham số**: `q`, `category`, `sort`, `page`, `limit`, `author`.
- **Phương thức POST** (Dòng 72-100+):
  - **Chức năng**: Tạo bài viết mới.
  - **Tham số**: `title`, `content`, `category`, `tags`, `media` (files).
  - **Logic**: Validate file upload (ảnh < 10MB, video < 100MB) và lưu vào DB.

---

## 5. Module Cửa Hàng & Người Bán (Shop & Seller)

### 5.1 Đăng Ký Cửa Hàng (Register Shop API)
- **Mục đích**: Xử lý logic backend cho việc tạo shop mới.
- **File**: `src/app/api/seller/register-shop/route.ts` (Tham chiếu từ Client Form)
- **Logic**: Nhận thông tin shop, validate và tạo record trong bảng Shop.

### 5.2 Form Đăng Ký (Client Form)
- **File**: `src/components/forms/register-shop-form.tsx`
- **Vị trí**: Dòng 21 - 100+
- **Chức năng**:
  - Form UI nhập thông tin shop (Tên, mô tả, địa chỉ, logo...).
  - Validate dữ liệu client-side.
  - Upload logo và gửi request tạo shop.
  - Chặn đăng ký nếu user đã sở hữu shop.

---

## 6. Module Tiện Ích (Utilities)

### 6.1 Upload File (S3)
- **Mục đích**: Upload file lên AWS S3 (hoặc Compatible Storage).
- **File**: `src/app/api/upload/route.ts`
- **Vị trí**: Dòng 5 - 46
- **Phương thức**: `POST`
- **Tham số**: `file` (Multipart form data).
- **Logic**:
  - Validate loại file (ảnh) và kích thước (< 10MB).
  - Gọi `uploadFileToS3` để đẩy file lên cloud.
  - Trả về danh sách URL công khai của file.
