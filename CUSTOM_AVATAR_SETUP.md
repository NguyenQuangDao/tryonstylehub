# Ready Player Me Custom Avatar Creator Setup

## Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục `tryonstylehub/` với nội dung:

```env
# Ready Player Me Configuration
# Get these from https://studio.readyplayer.me/
READY_PLAYER_ME_API_KEY=your_api_key_here
READY_PLAYER_ME_APP_ID=your_app_id_here

# Database
DATABASE_URL="file:./dev.db"

# Session
IRON_SESSION_PASSWORD="your-super-secret-password-here"

# Next.js
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Cách lấy API Key và App ID

1. Truy cập [Ready Player Me Studio](https://studio.readyplayer.me/)
2. Đăng nhập hoặc tạo tài khoản
3. Tạo một ứng dụng mới
4. Lấy `API Key` từ trang Settings
5. Lấy `App ID` từ header của trang ứng dụng

## Tính năng Custom Avatar Creator

### Giao diện tùy chỉnh
- **Giới tính**: Nam/Nữ với icon trực quan
- **Màu da**: 3 tùy chọn (Sáng, Trung bình, Tối) với preview màu
- **Tóc**: Màu tóc (Đen, Nâu, Vàng, Đỏ) và kiểu tóc (Ngắn, Trung bình, Dài, Xoăn)
- **Mắt**: 4 màu mắt (Nâu, Xanh dương, Xanh lá, Xám) với preview màu
- **Trang phục**: 4 phong cách (Thoải mái, Chính thức, Thể thao, Công sở) với icon

### Tích hợp Ready Player Me API
- Sử dụng [Guest Accounts](https://docs.readyplayer.me/ready-player-me/integration-guides/web-and-native-integration/user-management/guest-accounts) để tạo user không cần đăng nhập
- Tạo avatar với customization parameters
- Lưu avatar vào database với session tracking

### API Endpoints
- `POST /api/readyplayer/guest-user` - Tạo guest user
- `POST /api/readyplayer/generate-avatar` - Tạo avatar với customization
- `POST /api/avatar/save` - Lưu avatar vào database
- `GET /api/avatar/list` - Lấy danh sách avatars đã lưu
- `GET /api/avatar/load` - Load avatar cụ thể
- `DELETE /api/avatar/load` - Xóa avatar

## Cách sử dụng

1. Người dùng chọn các tùy chọn customization
2. Click "Tạo Avatar" để generate
3. Avatar được tạo và hiển thị trong preview panel
4. Có thể lưu avatar với tên tùy chỉnh
5. Avatar được lưu vào database và có thể load lại sau

## Lợi ích

- **Không iframe**: Giao diện hoàn toàn tùy chỉnh
- **UX tốt hơn**: Chỉ hiển thị các tùy chọn cần thiết
- **Tích hợp sâu**: Sử dụng Ready Player Me API trực tiếp
- **Lưu trữ**: Avatar được lưu trong database của bạn
- **Session tracking**: Hỗ trợ cả user đăng nhập và anonymous
