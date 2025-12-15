# Quy tắc thiết kế Trang Blog (Danh sách bài viết)

## Mục tiêu & Kiến trúc
- Tập trung vào khám phá nội dung (ý tưởng, cảm hứng) và khả năng chuyển đổi mềm qua tương tác lưu, mở bài chi tiết.
- Sử dụng `Next.js` client component cho hành vi động (`useState`, `useEffect`) và gọi API `/api/blog/posts` với tham số `q`, `limit`.
- Bố cục mobile-first, tối ưu đọc lướt theo F-pattern: từ thanh tìm kiếm sticky → lưới bài viết → trạng thái tải.

## Thanh tìm kiếm Sticky (Prominent Search)
- Vị trí: đầu trang, `sticky top-0 z-10` để luôn sẵn sàng; có `backdrop-blur` và viền `border-b` để phân lớp rõ ràng (`src/app/blog/page.tsx:30-36`).
- Trình bày: input `rounded-full` toàn chiều rộng, placeholder mô tả “Tìm ý tưởng” tăng discoverability (`src/app/blog/page.tsx:32`).
- Hành động chính: nút “Tìm” nổi bật, tương phản cao và hiệu ứng hover; liên kết “Tạo bài viết” theo progressive disclosure cho người sáng tạo (`src/app/blog/page.tsx:33-35`).
- Truy cập: đảm bảo `outline`/`focus:ring` nhất quán với theme, tránh hard-code màu (ưu tiên token `ring`, `primary`).

## Lưới bài viết Masonry (Content Discovery)
- Sử dụng `columns` để tạo masonry: 1 cột trên mobile, tăng dần lên 2/3/4 ở breakpoint `sm`, `lg`, `xl` (`src/app/blog/page.tsx:37`).
- Cân bằng cột bằng `[column-fill:_balance]` để tối ưu phân phối chiều cao.
- Mỗi item là `Link` khối (`block break-inside-avoid`) nhằm tránh vỡ layout và tạo vùng chạm lớn (`src/app/blog/page.tsx:43`).

## Thẻ bài viết (Card Item)
- Khung thẻ: `group relative overflow-hidden rounded-2xl` tạo cảm giác hiện đại; nền theo theme, có `shadow` và `hover:shadow-lg` để signal khả năng tương tác (`src/app/blog/page.tsx:44`).
- Media cover: ưu tiên ảnh cover; nếu không có, fallback sang phần tử đầu tiên; với video dùng `muted playsInline preload="metadata"` để thân thiện mobile (`src/app/blog/page.tsx:45-53,49`).
- Tối ưu ảnh: dùng `SafeImage` với `sizes` tương ứng viewport để giảm tải, `object-cover` và hiệu ứng nhẹ `group-hover:scale-[1.02]` (`src/app/blog/page.tsx:46,51`).
- Overlay hành động: khi hover hiển thị chip “Lưu” ở góc, `bg-black/80 text-white text-xs rounded-full` giúp gợi ý tính năng mà không gây nhiễu (`src/app/blog/page.tsx:54-56`).
- Nội dung: tiêu đề `font-medium truncate` đảm bảo không vỡ layout; metadata gồm avatar tác giả, tên, và số lượt thích/lưu (`src/app/blog/page.tsx:58-66`).

## Hành vi & Trạng thái
- Khởi tạo dữ liệu: gọi `fetchPosts()` khi mount (`useEffect`) (`src/app/blog/page.tsx:26`).
- Tìm kiếm: nút “Tìm” gọi `fetchPosts(q)`, giới hạn `limit=40` để cân bằng tải/khám phá (`src/app/blog/page.tsx:15-24,33`).
- Loading: hiển thị “Đang tải...” trung tâm khi `loading=true` để người dùng nắm trạng thái (`src/app/blog/page.tsx:72-73`).
- Empty state: khi `posts.length===0`, hiển thị thông điệp gợi ý thử từ khóa khác (quy tắc, cần bổ sung nếu chưa có).

## Khả năng truy cập (a11y)
- Input có placeholder mô tả; bổ sung `aria-label="Tìm ý tưởng"` nếu không có `Label` rõ ràng.
- Avatar có `alt` là tên tác giả; ảnh cover có `alt` là tiêu đề bài để hỗ trợ screen reader (`src/app/blog/page.tsx:46,51,61`).
- Vùng chạm đủ lớn (`Link` bao toàn thẻ); focus states hiển thị rõ ràng theo token `--ring`.

## Hiệu năng & Ổn định
- Ảnh: sử dụng `sizes` để trình duyệt chọn kích thước phù hợp, tránh tải dư thừa.
- Video: `preload="metadata"` giảm băng thông; `playsInline` cho iOS; `muted` cho phép autoplay inline nếu cần.
- Layout: `break-inside-avoid` ngăn item Masonry vỡ hàng; `columns` linh hoạt, không phụ thuộc JS.
- Gọi API: debounce trên input (quy tắc), chỉ fetch khi nhấn “Tìm” để tránh spam mạng.

## Dark Mode & Theme
- Tránh hard-code màu nền/trong suốt; dùng lớp theme `bg-card`, `text-foreground`, `muted-foreground` khi mở rộng.
- Card nền `bg-white` được hệ thống `globals.css` override an toàn trong dark mode, nhưng quy tắc vẫn ưu tiên token theme để nhất quán.

## Micro-interactions
- Hiệu ứng hover scale ảnh tinh tế (`group-hover:scale-[1.02]`) tăng cảm giác sống động.
- Chip “Lưu” chỉ xuất hiện khi hover để giảm nhiễu, áp dụng opacity cao đảm bảo đọc được trên media đa dạng.

## Không nên
- Không hard-code màu đen/trắng cho `focus:ring`; sử dụng token từ theme.
- Không đặt nhiều nút hành động cạnh tranh trong thẻ; giữ overlay tối giản.
- Không tải toàn bộ media nặng (video) ngay từ đầu; ưu tiên ảnh cover và metadata.

## Tham chiếu mã nguồn
- Thanh tìm kiếm sticky: `src/app/blog/page.tsx:30-36`
- Input, nút Tìm, link Tạo bài viết: `src/app/blog/page.tsx:32-35`
- Lưới Masonry và item: `src/app/blog/page.tsx:37-43`
- Thẻ & media: `src/app/blog/page.tsx:44-53`
- Overlay hành động: `src/app/blog/page.tsx:54-56`
- Nội dung, metadata: `src/app/blog/page.tsx:57-66`
- Trạng thái tải: `src/app/blog/page.tsx:72-73`
