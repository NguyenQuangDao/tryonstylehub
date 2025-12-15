# Quy tắc thiết kế Trang Gợi Ý AI

## Mục tiêu & Kiến trúc
- Gợi ý trang phục theo mô tả phong cách người dùng, tăng khám phá và chuyển đổi mềm (mua hoặc thử đồ ảo).
- UI client quản lý trạng thái, gọi `/api/recommend` với ngữ cảnh: wishlist, shops theo dõi, lịch sử tìm kiếm.
- Mobile-first, theo F-pattern: hero → hướng dẫn → phong cách phổ biến → lịch sử → form → kết quả.

## Bố cục tổng thể
- Container: `max-w-7xl mx-auto` với khoảng cách dọc hợp lý (src/app/recommend/page.tsx:106).
- Hero: thẻ `rounded-xl border bg-card p-8` với icon, tiêu đề và mô tả ngắn (src/app/recommend/page.tsx:108-116).
- Phân đoạn nội dung: mỗi khối trong card riêng (`Guide`, `Popular Styles`, `Search History`, `Form`, `Results`) tạo nhịp đọc rõ ràng.

## Hướng dẫn (Progressive Disclosure)
- Card hướng dẫn có header và nút “Xem/Ẩn”, phần nội dung expand/collapse bằng motion (src/app/recommend/page.tsx:118-150, 130-149).
- Nội dung gợi ý: mô tả phong cách, hoàn cảnh sử dụng, màu sắc yêu thích, ví dụ prompt — ngắn gọn, dễ quét (src/app/recommend/page.tsx:131-147).

## Phong cách phổ biến (Quick Start)
- Lưới nút gợi ý nhanh 2/3 cột, mỗi nút có emoji + nhãn; hover `hover:bg-muted` (src/app/recommend/page.tsx:152-171).
- Hành vi: click điền giá trị và trigger tìm kiếm nhanh (src/app/recommend/page.tsx:160-169, 100-103).

## Lịch sử tìm kiếm (Contextual Memory)
- Card gradient nhẹ theo theme, header với icon `Clock` và nút “Xem/Ẩn” (src/app/recommend/page.tsx:175-189).
- Nội dung: danh sách lịch sử hiển thị dạng nút nhỏ, hover gradient tinh tế, tối đa 5 mục (src/app/recommend/page.tsx:191-209).
- Lưu/đọc lịch sử từ `localStorage`, loại bỏ trùng, giới hạn độ dài (src/app/recommend/page.tsx:47-53, 89-93).

## Form Gợi Ý (Primary Input)
- Card: `Card` với `CardHeader` gồm icon + tiêu đề, `CardDescription` mô tả (src/app/recommend/page.tsx:212-219).
- Trường nhập: `Input` có `Label` và placeholder ví dụ (src/app/recommend/page.tsx:223-231).
- Nút phổ biến lặp lại dưới form để tăng khả năng khám phá (src/app/recommend/page.tsx:232-239).
- Tùy chọn ưu tiên: toggle “Ưu tiên sản phẩm yêu thích” và “Ưu tiên cửa hàng theo dõi” (src/app/recommend/page.tsx:241-247).
- CTA submit: nút với trạng thái loading, hiển thị lỗi ngắn gọn cạnh nút (src/app/recommend/page.tsx:249-267).
- Hợp lệ: yêu cầu tối thiểu 3 ký tự, báo lỗi rõ ràng (src/app/recommend/page.tsx:59-63).

## Kết quả (Outfit Recommendations)
- Header kết quả: icon `Star` + tiêu đề (src/app/recommend/page.tsx:278-285).
- Grid sản phẩm: card `rounded-xl border bg-card overflow-hidden` với ảnh `aspect-square object-cover` (src/app/recommend/page.tsx:287-303).
- Metadata: tên, loại (`type` chip), `styleTags` tối đa 3 tag (src/app/recommend/page.tsx:305-325).
- Hành động:
  - `Mua tại {shop.name}` mở `shop.url` trong tab mới, có icon `ExternalLink` (src/app/recommend/page.tsx:327-336).
  - `Thử ngay với AI` liên kết về Try-On với `garmentImage` và `category=auto` (src/app/recommend/page.tsx:337-343).
- Motion: fade/slide nhẹ theo index để tăng cảm giác sống động (src/app/recommend/page.tsx:289-295).

## Hành vi & Trạng thái
- Submit: set `loading`, xóa `outfit`, gọi API với ngữ cảnh wishlist/followedShops/lịch sử (src/app/recommend/page.tsx:64-80).
- Lỗi: hiển thị thông điệp gần CTA, tránh rải rác, đảm bảo dễ nhìn (src/app/recommend/page.tsx:262-267).
- Lịch sử: cập nhật và lưu sau mỗi tìm kiếm thành công, loại bỏ trùng và giới hạn 5 (src/app/recommend/page.tsx:89-93).

## Khả năng truy cập (a11y)
- `Label` gắn `htmlFor` với `Input`; button text rõ ràng, icon chỉ minh họa.
- Focus ring theo token theme; vùng chạm đủ lớn cho nút phổ biến/lịch sử.
- Liên kết mua mở tab mới với `rel="noopener noreferrer"`; text button mô tả hành động cụ thể.

## Hiệu năng
- Ảnh sản phẩm `next/image` `object-cover` trong khung cố định để ổn định layout.
- Tránh gọi API khi input chưa hợp lệ; chỉ submit khi đủ điều kiện.
- Quản lý lịch sử bằng `localStorage` nhẹ nhàng, không đồng bộ server.

## Dark Mode & Theme
- Sử dụng `bg-card`, `border`, `muted-foreground` theo theme; gradient history card có biến thể dark (src/app/recommend/page.tsx:175-209).
- Tránh hard-code màu; dùng token từ Tailwind theme.

## Vi mô tương tác
- Hover nhẹ trên nút/thumbnail; motion fade/slide khi hiển thị kết quả.
- Nút phổ biến và lịch sử phản hồi ngay; CTA loading rõ ràng.

## Không nên
- Không hiển thị quá nhiều CTA cạnh tranh trong card sản phẩm; giữ hai hành động chính (Mua, Thử AI).
- Không gửi yêu cầu nếu input quá ngắn; luôn báo lỗi cụ thể.
- Không hard-code màu đen/trắng; tuân thủ token theme.

## Tham chiếu mã nguồn
- Container & hero: `src/app/recommend/page.tsx:106-116`
- Guide toggle & nội dung: `src/app/recommend/page.tsx:118-150`, `131-147`
- Popular styles grid: `src/app/recommend/page.tsx:152-171`
- Search history card: `src/app/recommend/page.tsx:175-209`
- Form & CTA: `src/app/recommend/page.tsx:212-270`, `59-63`
- Results grid & card: `src/app/recommend/page.tsx:272-349`
