# Quy tắc thiết kế Trang Chi Tiết Blog

## Mục tiêu & Kiến trúc
- Tối ưu đọc nội dung dài, xem media (ảnh/video) và tương tác xã hội (like, lưu, chia sẻ), kết hợp gợi ý liên quan để tăng thời gian phiên.
- Client component (`useState`, `useEffect`) lấy dữ liệu chi tiết, bình luận và liên quan; API: `/api/blog/posts/:id`, `/comments`, `/like`, `/save`.
- Bố cục hai cột responsive: nội dung chính + sidebar gợi ý; sidebar sticky trên desktop.

## Bố cục tổng thể
- Container responsive: `max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8` đảm bảo biên an toàn (src/app/blog/[id]/page.tsx:72).
- Lưới: `grid grid-cols-1 lg:grid-cols-[minmax(0,1fr),360px] gap-6` để chuyển từ 1 cột sang 2 cột ở desktop (src/app/blog/[id]/page.tsx:72).
- Sidebar: `lg:sticky lg:top-16 h-fit` giữ gợi ý trong vùng nhìn khi cuộn (src/app/blog/[id]/page.tsx:153).

## Khu vực Media (Hero Content)
- Khung thẻ media: `relative rounded-2xl overflow-hidden bg-card shadow` tạo nền trung tính và chiều sâu (src/app/blog/[id]/page.tsx:74).
- CTA lưu nổi ở góc: `absolute inset-x-0 top-0 flex justify-end p-3` với nút `rounded-full` tương phản cao (src/app/blog/[id]/page.tsx:75-77).
- Ảnh:
  - Ưu tiên danh sách ảnh (`images`), hiển thị ảnh đầu làm cover, giữ các đường viền bằng `border-b` khi có nhiều block (src/app/blog/[id]/page.tsx:88-100).
  - Sử dụng `SafeImage` với `sizes` theo viewport và `object-contain` để tôn trọng tỷ lệ, tránh crop gây mất thông tin (src/app/blog/[id]/page.tsx:90-98).
  - Giới hạn chiều cao: `max-h-[50vh] sm:max-h-[60vh] lg:max-h-[600px]` tránh tràn màn hình (src/app/blog/[id]/page.tsx:97-98).
- Video:
  - Hiển thị theo danh sách `videos` với `controls` để người dùng chủ động; mỗi block có `border-b` để phân tách (src/app/blog/[id]/page.tsx:101-105).
  - Khuyến nghị `preload="metadata"` nếu cần tối ưu băng thông.

## Khung Nội dung (Meta, Tiêu đề, Bài viết)
- Thẻ nội dung: `rounded-2xl bg-card shadow p-3 sm:p-4 lg:p-6 overflow-hidden blog-content` hỗ trợ layout media trong bài (src/app/blog/[id]/page.tsx:110).
- Meta tác giả: avatar tròn (`rounded-full`), tên và chỉ số like/lưu trong `text-muted-foreground` (src/app/blog/[id]/page.tsx:111-118).
- Hành động nhanh: `❤` like và chia sẻ hệ thống (`navigator.share` nếu có) nằm cùng hàng, nút viền trung tính (src/app/blog/[id]/page.tsx:119-122).
- Tiêu đề: `h1` nổi bật `text-2xl font-semibold` ngay sau meta (src/app/blog/[id]/page.tsx:124).
- Nội dung: `text-sm text-muted-foreground whitespace-pre-wrap` giữ định dạng dòng (src/app/blog/[id]/page.tsx:125).

## Bình luận (Community Interaction)
- Tiêu đề khu vực và form nhập nhanh: input `rounded-full` + nút gửi đối lập màu để rõ hành động (src/app/blog/[id]/page.tsx:128-132).
- Danh sách bình luận: thẻ `rounded-xl border p-3 bg-card` với avatar người bình luận, tên, nội dung; hỗ trợ media đính kèm dạng lưới nhỏ (src/app/blog/[id]/page.tsx:133-147).
- Hành vi gửi: kiểm tra `trim()`, dùng `FormData` và reset trường sau thành công; re-fetch để đồng bộ (src/app/blog/[id]/page.tsx:47-67).

## Sidebar Gợi Ý (Related Content)
- Tiêu đề ngắn gọn "Gợi ý cho bạn" (src/app/blog/[id]/page.tsx:154).
- Lưới masonry nhẹ bằng `columns` và `break-inside-avoid`; card nhóm `group overflow-hidden rounded-2xl shadow` (src/app/blog/[id]/page.tsx:155-167).
- Metadata rút gọn: tiêu đề `truncate`, chỉ số like/lưu `text-muted-foreground` (src/app/blog/[id]/page.tsx:163-165).
- Trạng thái tải: hiển thị "Đang tải..." ở sidebar khi còn đang đồng bộ (src/app/blog/[id]/page.tsx:171-172).

## Hành vi & Trạng thái
- Tải dữ liệu: chạy khi mount/`id` đổi; lấy `post`, `related`, `comments` theo tuần tự, set `loading` phù hợp (src/app/blog/[id]/page.tsx:20-33).
- Like/Lưu: gọi API toggle, cập nhật lạc quan chỉ số bằng `Math.max(0, ...)` tránh âm (src/app/blog/[id]/page.tsx:35-45).
- Submit bình luận: sau thành công, reset input và đồng bộ lại `post`, `related`, `comments` (src/app/blog/[id]/page.tsx:47-67).
- Empty state: khi `post` không tồn tại, hiển thị thông điệp trung tính trong container hẹp (src/app/blog/[id]/page.tsx:69-70).

## Khả năng truy cập (a11y)
- Alt: ảnh cover `alt={post.title}`, avatar `alt={post.author.name}`; ảnh liên quan có alt rỗng nếu purely decorative (src/app/blog/[id]/page.tsx:93-94,113,161).
- Nút: thêm `aria-label` mô tả cho nút like ("Thích bài viết"), lưu ("Lưu bài viết"), chia sẻ ("Chia sẻ bài viết") để hỗ trợ screen reader.
- Focus: đảm bảo `focus:ring` theo token theme; sử dụng `outline-none` cẩn thận, chỉ khi có ring thay thế.
- Tương phản: dùng `bg-card`, `text-foreground`, `muted-foreground` để duy trì tương phản trong cả light/dark.

## Hiệu năng
- Ảnh: `SafeImage` với `sizes` phù hợp viewport; `object-contain` và giới hạn chiều cao giúp giảm reflow.
- Video: khuyến nghị `preload="metadata"` và lazy intersection nếu danh sách dài.
- API: tránh gọi lặp khi `id` không đổi; cân nhắc debounce khi cần tính năng live.
- Layout: masonry dùng CSS columns, tránh JS heavy; `break-inside-avoid` giữ ổn định.

## Dark Mode & Theme
- Tránh hard-code màu (`bg-white`, `bg-black`); ưu tiên token `bg-card`, `text-foreground`, `primary`, `muted-foreground`.
- Chip/nút tương phản: dùng token `primary` hoặc `secondary` để phù hợp dark mode override.

## Micro-interactions
- Nút like/lưu/chia sẻ có hover nhẹ; trạng thái sau nhấn phản hồi ngay (số tăng/giảm) trước khi server trả về.
- Thẻ liên quan hover `shadow-lg` để signal khả năng mở xem chi tiết.

## Không nên
- Không hiển thị quá nhiều CTA cạnh tranh trên hero; giữ nút lưu ở vị trí quy ước.
- Không để nội dung dài bị đè bởi media; giới hạn chiều cao cover và tách khối bằng viền.
- Không hard-code focus ring màu; dùng token để nhất quán.

## Tham chiếu mã nguồn
- Container & lưới: `src/app/blog/[id]/page.tsx:72-73`
- Media card & nút lưu: `src/app/blog/[id]/page.tsx:74-77`
- Ảnh cover (`SafeImage`): `src/app/blog/[id]/page.tsx:88-100`
- Video list: `src/app/blog/[id]/page.tsx:101-105`
- Meta/tiêu đề/nội dung: `src/app/blog/[id]/page.tsx:111-126`
- Like/Share actions: `src/app/blog/[id]/page.tsx:119-122`, `35-45`
- Bình luận (form + list): `src/app/blog/[id]/page.tsx:127-151`, `47-67`
- Sidebar gợi ý: `src/app/blog/[id]/page.tsx:153-172`
- Empty state: `src/app/blog/[id]/page.tsx:69-70`
