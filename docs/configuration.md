# Hướng dẫn cấu hình AIStyleHub

## Yêu cầu hệ thống
- Node.js 18+
- NPM/PNPM
- MySQL 8+
- Tài khoản AWS (nếu dùng S3 upload)
- Tài khoản Google OAuth (NextAuth)

## Biến môi trường (.env)
Sao chép `.env.example` thành `.env` và điền giá trị thật:

- Ứng dụng
  - `NEXT_PUBLIC_APP_URL`: URL public của app (ví dụ: http://localhost:3000)
  - `NEXTAUTH_URL`: URL cho NextAuth
  - `NEXTAUTH_SECRET`: chuỗi bí mật NextAuth
- Cơ sở dữ liệu
  - `DATABASE_URL`: chuỗi kết nối MySQL
  - Hoặc điền `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
- Google OAuth
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- AWS S3
  - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_S3_REGION`
  - `SAVE_TO_S3`: `true` để bật lưu ảnh lên S3
- Dịch vụ AI
  - `FASHN_API_KEY`: khóa API FASHN sử dụng cố định phía server

Lưu ý: Hệ thống ưu tiên `AWS_S3_BUCKET`; nếu trước đây dùng `AWS_S3_BUCKET_NAME`, vẫn nhận.

## Thiết lập cơ sở dữ liệu
- Cài đặt dependencies: `npm install`
- Generate Prisma: `npm run prisma:generate`
- Push schema: `npm run db:push`
- Seed dữ liệu (nếu có): `npm run db:seed`

## Chạy ứng dụng
- Dev server: `npm run dev`
- App sẽ chạy tại `http://localhost:3000`

## Cấu hình Google OAuth
- Tạo OAuth Client trong Google Cloud Console
- Thêm Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- Điền `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` vào `.env`

## Cấu hình AWS S3
- Tạo S3 Bucket và chọn region
- Tạo IAM User với quyền ghi đọc S3
- Điền `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_S3_REGION`
- Kiểm tra upload bằng trang tạo sản phẩm và xem ảnh hiển thị

## Ghi chú triển khai
- Prisma: dùng singleton `src/lib/prisma.ts` để tránh rò rỉ kết nối
- API sản phẩm: trả về `styleTags/sizes/colors` dạng mảng cho UI đồng nhất
- Upload: API trả `{ urls: string[] }` và UI hợp nhất mảng ảnh vào form