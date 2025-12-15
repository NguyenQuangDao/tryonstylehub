# Quy tắc thiết kế Trang Thử Đồ Ảo bằng AI

## Mục tiêu & Kiến trúc
- Cho phép người dùng thử trang phục lên ảnh người thật hoặc “Người Mẫu Ảo” với thao tác tối giản, phản hồi nhanh.
- Tăng tỷ lệ hoàn thành tác vụ bằng hướng dẫn rõ, hiển thị token, cảnh báo thiếu tokens, và kết quả trực quan.
- Client component: `HomePage` điều phối trạng thái; UI chính trong `OptimizedHomePage` với form submit tới `/api/tryon`.

## Bố cục tổng thể
- Nền gradient nhẹ, nội dung theo chiều dọc: Hero → Token/Quality → Upload (Người/Trang phục) → Category → CTA → Error → Results.
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` đảm bảo biên an toàn (src/app/page.tsx:155-173, src/components/home/OptimizedHomePage.tsx:111).
- Hero: tiêu đề trung tâm, mô tả ngắn để gắn định vị sản phẩm (src/components/home/OptimizedHomePage.tsx:92-107).

## Token & Chất lượng
- Hiển thị số dư token dưới dạng component `TokenDisplay` và hai nút chọn chất lượng với giá token đi kèm (src/components/home/OptimizedHomePage.tsx:114-123).
- Quy tắc: chất lượng cao tiêu tốn nhiều token hơn; mô tả rõ chi phí.
- Khi server trả 402 và `insufficientTokens`, mở modal `InsufficientTokensModal` với thông tin `required/current/operation` (src/app/page.tsx:73-85,275-281).

## Khu vực Upload Người/Người Mẫu Ảo
- Card “Ảnh người mẫu” với icon `User`: hỗ trợ 3 trạng thái
  - Tải lên ảnh người: preview bằng `next/image` trong vùng `h-64 md:h-80`, nút xóa overlay (src/components/home/OptimizedHomePage.tsx:145-168).
  - Người Mẫu Ảo đang chọn: hiển thị `avatarImage` với nút bỏ chọn/đổi người mẫu (src/components/home/OptimizedHomePage.tsx:169-196).
  - Chưa có: hiển thị `FileInput` đường viền nét đứt `border-dashed`, nhãn rõ ràng (src/components/home/OptimizedHomePage.tsx:198-204).
- Ví dụ ảnh người: lưới 2×/4× có hover nhẹ, click để load (src/components/home/OptimizedHomePage.tsx:222-235).
- Mở `VirtualModelSelector` qua nút link “Chọn người mẫu ảo”; form tạo/sửa `VirtualModelForm` theo luồng (src/app/page.tsx:176-206).

## Khu vực Upload Trang Phục
- Card “Ảnh trang phục” với icon `Shirt`: tương tự phần người, gồm preview/xóa hoặc `FileInput`, và lưới mẫu (src/components/home/OptimizedHomePage.tsx:258-309).
- Quy tắc: chấp nhận ảnh `image/*` với preview an toàn, tôn trọng tỷ lệ (object-cover/contain tùy ngữ cảnh).

## Category & Tùy Chọn
- `Select` loại trang phục: `tops`, `bottoms`, `dress`, `outerwear`, `accessories` (src/components/home/OptimizedHomePage.tsx:320-333).
- Prefill từ query `?garmentImage=&category=` để seamless từ sản phẩm nổi bật (src/app/page.tsx:132-145).

## CTA & Hành động
- Nút “Hướng dẫn” mở panel chỉ dẫn nhanh (src/components/home/OptimizedHomePage.tsx:346-354).
- Nút “Thử đồ ngay” hiển thị spinner khi `isLoading`, dùng `aria-live="polite"` để a11y (src/components/home/OptimizedHomePage.tsx:356-373,359).
- `handleSubmit` kiểm tra tiền đề: phải có người (ảnh hoặc người mẫu ảo) và ảnh trang phục; set loading/error rõ ràng; gửi `FormData` (src/app/page.tsx:35-96).

## Kết quả
- Grid kết quả responsive 1/2/3 cột, ảnh `object-contain` với hover scale nhẹ; overlay nút “Tải xuống” khi hover (src/components/home/OptimizedHomePage.tsx:391-447).
- Skeleton/placeholder khi đang tạo ảnh mà chưa có kết quả, hiển thị trạng thái “Phép màu AI đang hoạt động” (src/components/home/OptimizedHomePage.tsx:450-496).

## API & Máy chủ
- `/api/tryon` nhận ảnh người hoặc `virtualModelId`, ảnh trang phục hoặc URL; chuẩn hóa ảnh sang base64, set `tryon-v1.6`, polling kết quả, hậu xử lý `sharp`, upload S3, ghi `gallery.json`, trừ token (src/app/api/tryon/route.ts:78-115,160-179,180-279).
- Validate category hợp lệ, đảm bảo lỗi có thông điệp rõ (src/app/api/tryon/route.ts:155-169,280-289).
- Khi thiếu API key, lỗi server-side minh bạch; rate limit/unauthorized trả về mã phù hợp (src/app/api/tryon/route.ts:90-99,291-309).

## Khả năng truy cập (a11y)
- Label đầy đủ cho input, alt mô tả ảnh, aria cho nút xóa/bỏ chọn; `aria-live` cho lỗi và CTA submit.
- Vùng chạm đủ lớn; focus ring rõ theo token theme; tránh `outline-none` nếu không có ring thay thế.
- Nội dung văn bản tương phản: dùng `text-foreground`, `muted-foreground`; tránh màu hard-code.

## Hiệu năng
- Ảnh: sử dụng `sizes` đúng viewport; object-contain đối với kết quả để tránh crop; giới hạn chiều cao preview nhằm giảm reflow.
- API: debounce hành động phụ (ví dụ mở hướng dẫn), còn submit thì một lần; xử lý lỗi mạng ổn định.
- Polling server: giới hạn thời gian, interval hợp lý; khi hoàn tất mới trừ token.

## Dark Mode & Theme
- Nền gradient có biến thể dark (`dark:from-gray-900 ...`), card và text tuân thủ token theme (src/components/home/OptimizedHomePage.tsx:87-90,100-105).
- Không hard-code màu; sử dụng `bg-card`, `border-border`, `primary`, `muted-foreground`.

## Vi mô tương tác
- Hover nhẹ trên card, ảnh; overlay xóa/“Tải xuống” xuất hiện mượt.
- Line loading bar ở top khi `isLoading` để báo tiến trình (src/components/home/OptimizedHomePage.tsx:88-90).

## Không nên
- Không cho phép submit khi thiếu dữ liệu tối thiểu; hiển thị thông báo cụ thể.
- Không hard-code màu đen/trắng cho nút/viền; dùng token theme.
- Không lạm dụng animation; chỉ dùng framer-motion ở mức nhẹ, tránh ảnh hưởng hiệu năng.

## Tham chiếu mã nguồn
- Orchestrator & modal tokens: `src/app/page.tsx:35-96`, `73-85`, `275-281`
- Optimized Home UI: `src/components/home/OptimizedHomePage.tsx:92-107`, `114-123`, `127-239`, `241-311`, `320-333`, `340-375`, `377-387`, `391-447`, `450-496`
- API Try-On server: `src/app/api/tryon/route.ts:78-115`, `155-169`, `176-186`, `187-279`, `280-289`, `291-309`
