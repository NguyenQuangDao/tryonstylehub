## Mục tiêu
- Sửa toàn bộ lỗi trong các file bạn chỉ định.
- Tối ưu hệ thống (Prisma, API, UI đồng nhất dữ liệu, upload).
- Tạo `.env.example` mẫu và tài liệu hướng dẫn cấu hình + giải thích.

## Lỗi phát hiện & Hướng sửa theo từng file

### 1) Seller Products Listing UI (`src/app/seller/products/page.tsx`)
- Vấn đề dữ liệu: UI đang định nghĩa `images: string[]` nhưng API trả về quan hệ `images` là mảng object `{ url, altText }` → gây lỗi khi truy cập `product.images[0]` như string.
  - Tham chiếu: `src/app/seller/products/page.tsx:12-26`, dùng `images: string[]`; hiển thị: `187-191`.
- Sửa: 
  - Cập nhật interface `Product` thành `images: Array<{ url: string; altText?: string }>` và thêm `status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT'` cho đồng bộ với API.
  - Render ảnh: dùng `product.images[0]?.url ?? '/placeholder-image.jpg'`.
  - Trạng thái hiển thị: nếu có `status`, overlay “Ngừng bán” dựa theo `status !== 'ACTIVE'`; nếu chỉ có `isActive`, giữ logic hiện có nhưng ưu tiên `status` nếu tồn tại.
  - Hành động toggle: gửi `PATCH` theo trường hệ thống đang dùng (`isActive` hoặc `status`). Nếu có endpoint chuẩn `status`, gửi `{ status: currentStatus ? 'INACTIVE' : 'ACTIVE' }`.

### 2) Seller Dashboard (`src/app/seller/dashboard/page.tsx`)
- Đã dùng đúng dạng `images[0].url` và `status` → phù hợp với API.
- Tối ưu nhỏ:
  - Kiểm tra null-safe: `product.images?.[0]?.url` ở `239-241`.
  - Xử lý price theo VND formatter thống nhất như listing để đồng bộ hiển thị.

### 3) Seller New Product Form (`src/app/seller/products/new/page.tsx`)
- API yêu cầu `styleTags` phải có ít nhất 1 phần tử (`productSchema` yêu cầu `min(1)`), nhưng UI không chặn submit khi chưa chọn tag → trả lỗi.
  - Tham chiếu: API `src/app/api/seller/products/route.ts:14-15`.
- Sửa:
  - Disable nút submit nếu `styleTags.length === 0` (bên cạnh `images.length === 0`).
  - Hiển thị cảnh báo: “Vui lòng chọn ít nhất một thẻ phong cách”.
- Upload ảnh: đang POST `FormData` tới `/api/upload` và nhận `urls` hoặc `url`. Đồng bộ hóa logic thêm ảnh ok.

### 4) Seller Application Page (`src/app/seller/apply/page.tsx`)
- Hoạt động ổn; tăng cường:
  - Thêm xử lý lỗi mạng rõ ràng khi `checkExistingApplication` và khi submit (toast hoặc alert với chi tiết).
  - Bảo vệ route theo role nếu cần (hiện tại chỉ kiểm tra đăng nhập là đủ).

### 5) Seller Products API (`src/app/api/seller/products/route.ts`)
- Vấn đề đồng nhất dữ liệu:
  - `styleTags/sizes/colors` đang lưu JSON string (`JSON.stringify(...)`) tại `136-139`; phía client có nơi mong mỏi mảng.
- Phương án sửa (ưu tiên nhanh, ít rủi ro):
  - Giữ schema DB hiện tại; ở GET, chuyển đổi `styleTags/sizes/colors` từ string → mảng trước khi trả ra response, đảm bảo UI luôn nhận mảng.
  - Sử dụng Prisma singleton thay vì khởi tạo mới `PrismaClient()` mỗi file để tránh rò kết nối.
- Phân trang + lọc: logic OK; thêm `status` và `category` filter đã hỗ trợ.

### 6) Auth Config (`src/lib/auth-config.ts`)
- Dùng `PrismaClient` trực tiếp trong file cấu hình auth có thể tạo nhiều instance.
- Sửa:
  - Chuyển sang dùng `import { prisma } from '@/lib/prisma'` (singleton) để tối ưu kết nối.
  - Đảm bảo callback `jwt` và `session` đồng bộ thêm `shopId` như hiện tại.

### 7) Layout (`aistylehub/src/app/layout.tsx`)
- Kiểm tra sự tồn tại `./providers` và đảm bảo bao bọc NextAuth, Theme, v.v. Nếu thiếu, bổ sung.
- Không cần thay đổi lớn.

## Tối ưu Hệ Thống
- Prisma:
  - Tạo `src/lib/prisma.ts` singleton và dùng ở toàn bộ API/Auth để tránh “PrismaClient already in use” và giảm chi phí kết nối.
- S3 & Upload:
  - Chuẩn hóa biến môi trường: code `src/lib/s3.ts` đang dùng `AWS_S3_BUCKET` nhưng `.env` hiện có `AWS_S3_BUCKET_NAME` → đổi về một tên duy nhất. Đề xuất: dùng `AWS_S3_BUCKET`.
  - Đảm bảo upload API trả về đồng nhất `{ urls: string[] }`.
- Kiểu dữ liệu API:
  - Luôn serialize `styleTags/sizes/colors` thành mảng khi trả về (dù DB lưu dạng string) để UI đồng nhất.
- UI/UX:
  - Thêm validation rõ ràng ở form tạo sản phẩm: tags/sizes/colors.
  - Dùng formatter VND thống nhất.

## `.env.example` (mẫu sẽ tạo)
- Nội dung đề xuất:
  - Database: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DATABASE_URL`.
  - NextAuth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
  - AWS S3: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_S3_REGION`.
  - Ứng dụng: `NEXT_PUBLIC_APP_URL`.
  - Dịch vụ AI (nếu dùng): `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, `FASHN_API_KEY`, `DIFFUSERS_API_URL`.
- Giá trị: đặt placeholder, tuyệt đối không commit khóa thật.

## Tài liệu hướng dẫn cấu hình (sẽ tạo)
- Mục tiêu: file hướng dẫn cấu hình và giải thích biến `.env` + cách chạy dự án.
- Nội dung chính:
  - Chuẩn bị: Node.js, PNPM/NPM, MySQL.
  - Tạo `.env` từ `.env.example` và điền giá trị.
  - Thiết lập DB: `npm run prisma:generate`, `npm run db:push`, `npm run db:seed` (nếu có).
  - Chạy dev: `npm run dev`.
  - Cấu hình AWS S3: hướng dẫn tạo bucket, quyền public-read (hoặc dùng CloudFront), điền `AWS_S3_*`.
  - Cấu hình Google OAuth: tạo Client ID/Secret, set `NEXTAUTH_URL`, callback trong Google Console.

## Kế hoạch thực hiện
1. Sửa UI Listing sản phẩm để tương thích dữ liệu API (images/status) và thêm phòng thủ null.
2. Bổ sung validation bắt buộc thẻ phong cách ở form tạo sản phẩm.
3. Chuẩn hóa API trả mảng cho `styleTags/sizes/colors` trong GET.
4. Chuyển toàn bộ sử dụng Prisma về singleton `lib/prisma`.
5. Chuẩn hóa biến môi trường AWS S3 và cập nhật nơi sử dụng.
6. Tạo file `.env.example` với placeholder.
7. Tạo tài liệu cấu hình (docs) với hướng dẫn chi tiết.

## Kiểm thử & Xác minh
- Mở trang `/seller/products` xác nhận hiển thị ảnh, badge trạng thái, thao tác toggle/xóa chạy đúng.
- Tạo sản phẩm mới với đủ điều kiện (ít nhất 1 ảnh + 1 style tag).
- Kiểm tra dashboard người bán: số liệu và hình ảnh hiển thị ổn.
- Kiểm tra upload ảnh → URL từ S3 hiển thị được công khai.

Vui lòng xác nhận để mình bắt đầu áp dụng các thay đổi, tạo `.env.example` và tài liệu cấu hình.