# Quy tắc thiết kế Trang Tạo Ảnh AI

## Mục tiêu & Kiến trúc
- Cho phép người dùng tạo ảnh thời trang bằng AI với mô tả tự do hoặc cấu hình nhanh bằng preset.
- Tăng tỷ lệ hoàn tất qua hiển thị token, hướng dẫn, cải tiến prompt, phản hồi rõ ràng và khả năng dùng ảnh để thử đồ ảo.
- Client component điều phối toàn bộ UI; gửi POST `/api/generate-image`, cải tiến prompt qua `/api/generate-prompt`.

## Bố cục tổng thể
- Trật tự: Hero → Hướng dẫn (expand/collapse) → Form (token, preset, prompt, CTA) → Error → Kết quả/Empty state → Toast → Modal thiếu tokens.
- Container: `max-w-7xl mx-auto relative overflow-hidden` với background pattern gradient nhẹ (src/app/generate-image/page.tsx:144-149).
- Hero: thẻ gradient với icon, title nổi bật và badge mô tả năng lực (src/app/generate-image/page.tsx:156-188).

## Hướng dẫn sử dụng
- Thẻ hướng dẫn có tiêu đề + nút `Xem/Ẩn`, nội dung động dùng framer-motion (src/app/generate-image/page.tsx:190-263).
- Nội dung concise: mô tả chi tiết, phong cách, chất lượng ảnh, ví dụ prompt; trình bày theo card con để dễ quét.

## Token & Chi phí
- Hiển thị số dư `TokenDisplay`; badge thể hiện chi phí `TOKEN_CONFIG.COSTS.GENERATE_IMAGE.amount` ngay cạnh (src/app/generate-image/page.tsx:269-273).
- Khi thiếu token, mở `InsufficientTokensModal` với thông tin `required/current/operation` (src/app/generate-image/page.tsx:507-513).

## Preset cấu hình nhanh
- Categories: chọn nhiều (`CATEGORY_PRESETS`), nút toggle `variant` theo trạng thái (src/app/generate-image/page.tsx:276-297).
- Accessories: toggle hat/bag/jewelry/watch bằng nút có icon/emoji (src/app/generate-image/page.tsx:300-307).
- Style: chọn một trong `STYLE_PRESETS` (src/app/generate-image/page.tsx:309-322).
- Color: chọn nhiều trong `COLOR_PRESETS` (src/app/generate-image/page.tsx:325-343).
- Background: chọn một trong `BACKGROUND_PRESETS` với icon phù hợp (src/app/generate-image/page.tsx:345-361).
- `useMemo` hợp phần `composedPrompt` từ preset để tạo prompt tự động khi người dùng không nhập (src/app/generate-image/page.tsx:43-65).

## Prompt & CTA
- Prompt: `Textarea` 4 dòng, placeholder ví dụ, hiển thị lỗi cải tiến bên trái (src/app/generate-image/page.tsx:364-399).
- Cải tiến prompt: nút secondary, trạng thái loading, gọi `/api/generate-prompt` và cập nhật `prompt` (src/app/generate-image/page.tsx:381-399, 117-140).
- Submit: nút gradient lớn full-width, loading rõ ràng, disable khi `loading` (src/app/generate-image/page.tsx:402-419).
- Kiểm tra hợp lệ: yêu cầu prompt hiệu lực ≥10 ký tự hoặc dùng `composedPrompt` (src/app/generate-image/page.tsx:67-75).

## Phản hồi & Trạng thái
- Error: `Alert variant="destructive"` hiển thị thông báo lỗi (src/app/generate-image/page.tsx:421-427).
- Toast: hiển thị sau thành công “Đã lưu ảnh thành công” (src/app/generate-image/page.tsx:502-507).
- Empty state: thẻ dashed, mô tả sẵn sàng tạo ảnh khi chưa có kết quả (src/app/generate-image/page.tsx:486-500).

## Kết quả & Liên kết Try-On
- Thẻ kết quả: header với icon, nút “Tải xuống” gradient, ảnh hiển thị `object-contain` (src/app/generate-image/page.tsx:433-483).
- CTA tiếp nối: nút “Dùng ảnh này để thử đồ ảo” liên kết về trang Try-On kèm `garmentImage` và `category` (src/app/generate-image/page.tsx:475-479).

## Khả năng truy cập (a11y)
- Nút có văn bản rõ; icon chỉ minh họa; aria và alt đầy đủ (ảnh kết quả, button download/link).
- Focus ring theo token theme; vùng chạm lớn cho preset/nút; trạng thái `disabled` rõ.
- `aria-live` cho error/CTA khi cần; tránh `outline-none` nếu không có ring thay thế.

## Hiệu năng
- Ảnh: `next/image` với `fill` và `object-contain` tránh tràn; pattern background opacity thấp để không ảnh hưởng hiệu năng.
- Trạng thái: loading disable CTA; bắt lỗi mạng và thông báo thân thiện.
- Prompt: `useMemo` cho `composedPrompt` để tránh recompute không cần thiết.

## Dark Mode & Theme
- Hero/Guide dùng gradient với biến thể dark; thẻ form và kết quả có `dark:bg-gray-900/95`, viền phù hợp theme (src/app/generate-image/page.tsx:156-188, 190-263, 265-430, 433-483).
- Tránh hard-code màu; ưu tiên token `bg-card`, `text-foreground`, `muted-foreground`, `primary`.

## Vi mô tương tác
- Motion vào/ra nhẹ cho hero và hướng dẫn; nút submit có hover scale và shadow.
- Preset buttons đổi `variant` theo trạng thái; feedback tức thời khi toggle.

## Không nên
- Không cho submit khi prompt không hợp lệ; hiển thị lỗi cụ thể.
- Không hard-code màu đen/trắng cho ring/viền; dùng token theme.
- Không lạm dụng hiệu ứng nặng; giữ chuyển động vừa phải để đảm bảo hiệu năng.

## Tham chiếu mã nguồn
- Background/Container: `src/app/generate-image/page.tsx:144-149`
- Hero & badges: `src/app/generate-image/page.tsx:156-188`
- Guide expand/collapse: `src/app/generate-image/page.tsx:190-263`
- Token/Chi phí: `src/app/generate-image/page.tsx:269-273`
- Presets: `src/app/generate-image/page.tsx:276-361`
- Prompt & cải tiến: `src/app/generate-image/page.tsx:364-400`, `117-140`
- Submit CTA: `src/app/generate-image/page.tsx:402-419`
- Error/Toast: `src/app/generate-image/page.tsx:421-427`, `502-507`
- Kết quả & Try-On CTA: `src/app/generate-image/page.tsx:433-483`, `475-479`
- Empty state: `src/app/generate-image/page.tsx:486-500`
