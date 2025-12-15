# Flow upload ảnh và tạo sản phẩm

## Mục tiêu
- Chỉ upload ảnh lên S3 khi người dùng bấm tạo sản phẩm.
- Hiển thị preview với placeholder khi ảnh tải chậm/lỗi.
- Validate định dạng và kích thước ảnh.
- Hiển thị tiến trình upload.
- Lưu metadata ảnh vào database và rollback nếu tạo sản phẩm thất bại.

## Frontend
- Trang `src/app/seller/products/new/page.tsx` giữ danh sách `selectedFiles` và `imagePreviews` (blob URL) để hiển thị trước khi upload.
- Khi submit, gửi `FormData` gồm các trường sản phẩm và `images` (nhiều file) tới API `POST /api/seller/products`.
- Tiến trình upload được cập nhật qua `XMLHttpRequest.upload.onprogress`.
- Preview sử dụng placeholder skeleton; fallback khi lỗi hiển thị thông báo.

## Backend
- API `POST /api/seller/products` nhận `FormData`, validate file (jpg/png/webp, ≤10MB), upload từng ảnh lên S3 bằng AWS SDK v3.
- Trích xuất metadata (width, height, size, format) bằng `sharp` và lưu vào trường `Product.images` (Json).
- Tự động tạo `Category` nếu chưa tồn tại theo tên đã chọn.
- Nếu tạo sản phẩm thất bại, thực hiện rollback: xóa các object đã upload trên S3.

## AWS S3
- Sử dụng `@aws-sdk/client-s3` v3.
- Upload dùng `PutObjectCommand`, `ContentType` đúng loại ảnh; nếu bucket không hỗ trợ ACL, tự động bỏ ACL.
- Xóa object dùng `DeleteObjectCommand` phục vụ rollback.

## Kiểm thử
- `vitest` với môi trường `jsdom`.
- Unit test cho `validateImageFile` và `generateS3Key` tại `src/lib/__tests__`.

## Biến môi trường
- `AWS_S3_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` hoặc `AWS_S3_BUCKET_NAME`.
- Tùy chọn: `AWS_S3_PUBLIC_BASE_URL`, `AWS_S3_USE_ACL`.

## Lưu ý
- Trường bắt buộc: tên, mô tả, giá, danh mục và ít nhất một ảnh hợp lệ.
- `Product.status`: PUBLISHED nếu bật nổi bật, ngược lại DRAFT.
