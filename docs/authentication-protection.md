# Hệ thống bảo vệ đăng nhập cho website

## Thay đổi đã thực hiện

### 1. **Middleware được cập nhật** (`src/middleware.ts`)
- **Trước đây**: Chỉ bảo vệ một số route nhất định (`/dashboard`, `/profile`, `/products`)
- **Bây giờ**: Bảo vệ **TẤT CẢ** các routes, yêu cầu đăng nhập cho toàn bộ website

#### Các route công khai (không cần đăng nhập):
- `/login` - Trang đăng nhập
- `/register` - Trang đăng ký
- `/api/*` - Tất cả API routes

#### Tất cả các route khác yêu cầu đăng nhập:
- `/` - Trang chủ
- `/dashboard` - Dashboard
- `/profile` - Hồ sơ người dùng
- `/products` - Sản phẩm
- Và tất cả các trang khác

### 2. **Tính năng redirect thông minh**
Khi người dùng chưa đăng nhập cố gắng truy cập một trang:
- Họ sẽ được chuyển đến `/login?redirect=/trang-ban-dau`
- Sau khi đăng nhập thành công, họ sẽ tự động quay về trang mà họ muốn truy cập

### 3. **Login page được cải thiện** (`src/app/login/page.tsx`)
- Hỗ trợ tham số `redirect` từ URL
- Tự động chuyển người dùng về trang ban đầu sau khi đăng nhập
- Nếu không có trang redirect, mặc định sẽ về trang chủ `/`

## Cách hoạt động

### Kịch bản 1: Người dùng chưa đăng nhập
1. Người dùng truy cập `https://yourdomain.com/`
2. Middleware kiểm tra token trong cookies
3. Không tìm thấy token → Redirect đến `/login?redirect=/`
4. Người dùng đăng nhập thành công
5. Tự động chuyển về trang chủ `/`

### Kịch bản 2: Người dùng đã đăng nhập
1. Người dùng truy cập bất kỳ trang nào
2. Middleware kiểm tra và xác thực token
3. Token hợp lệ → Cho phép truy cập
4. Token không hợp lệ → Redirect đến `/login`

### Kịch bản 3: Người dùng đã đăng nhập cố truy cập /login
1. Người dùng đã đăng nhập cố truy cập `/login`
2. Middleware phát hiện token hợp lệ
3. Tự động redirect về trang chủ `/`

## Cách test

### Test 1: Truy cập trang chủ khi chưa đăng nhập
```bash
# Mở browser ở chế độ incognito
# Truy cập http://localhost:3000
# Kết quả mong đợi: Được redirect đến /login?redirect=/
```

### Test 2: Đăng nhập và redirect về trang ban đầu
```bash
# Sau khi bị redirect đến /login?redirect=/
# Đăng nhập với tài khoản hợp lệ
# Kết quả mong đợi: Được redirect về trang chủ /
```

### Test 3: Người dùng đã đăng nhập truy cập /login
```bash
# Đăng nhập vào hệ thống
# Truy cập http://localhost:3000/login
# Kết quả mong đợi: Được redirect về trang chủ /
```

### Test 4: Truy cập một trang cụ thể khi chưa đăng nhập
```bash
# Mở browser ở chế độ incognito
# Truy cập http://localhost:3000/dashboard
# Kết quả mong đợi: Được redirect đến /login?redirect=/dashboard
# Sau khi đăng nhập: Được redirect về /dashboard
```

## Lưu ý quan trọng

1. **Static files không bị ảnh hưởng**: Các file tĩnh như ảnh, CSS, JS vẫn được load bình thường
2. **API routes có thể cần xử lý riêng**: Các API endpoint cần có authentication riêng tại controller
3. **Token timeout**: Token có thời hạn 7 ngày, sau đó người dùng cần đăng nhập lại

## Tạo tài khoản test

Để test, bạn cần tạo tài khoản thông qua trang `/register` hoặc sử dụng API:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

## Tắt bảo vệ đăng nhập (nếu cần)

Nếu bạn muốn tạm thời tắt bảo vệ đăng nhập, thêm route vào `publicPaths` trong `src/middleware.ts`:

```typescript
const publicPaths = ['/login', '/register', '/']; // Thêm '/' để cho phép trang chủ công khai
```
