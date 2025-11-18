# Try-On UI Refactor Overview

## Mục tiêu
- Tối giản giao diện, đảm bảo nhất quán UI/UX, tăng tốc độ tải và tương tác mượt.
- Chuẩn hóa dùng Tailwind CSS 3.4 với Shadcn UI/Radix UI cho toàn bộ phần thử đồ ảo.

## Thành phần đã thay đổi

1. OptimizedHomePage (`src/components/home/OptimizedHomePage.tsx`)
   - Đơn giản hóa Hero: bỏ gradient/徽章, giữ tiêu đề và mô tả ngắn.
   - Card tối giản: dùng `Card`, `CardHeader`, `CardContent` với border/shadow nhẹ.
   - Nút dùng `Button` của Shadcn; thêm `aria-live` cho trạng thái xử lý và `role="alert"` cho lỗi.
   - Tối ưu preview: bo góc vừa (`rounded-lg`), nền `bg-muted/20`, giảm viền.
   - Thêm accessibility cho ảnh ví dụ: `role="button"`, `aria-label`.
   - Giữ nguyên logic submit, hiển thị kết quả và chế độ so sánh.

2. VirtualModelSelector (`src/components/forms/VirtualModelSelector.tsx`)
   - Chuyển các nút thuần sang `Button` của Shadcn (`ghost`, `outline`, `secondary`, `destructive`).
   - Bổ sung `aria-label` cho hành động đóng/chỉnh sửa/xóa/tạo mới.
   - Giữ overlay/luồng gọi API, không thay đổi logic nghiệp vụ.

## Hướng dẫn sử dụng
- Thành phần upload ảnh vẫn dùng `FileInput` hiện có trong `src/components/ui/file-input.tsx`.
- Các nút hành động phải dùng `Button` của Shadcn để thống nhất trạng thái/variant.
- Card/Label/Select/Input dùng các primitives trong `src/components/ui`.

## Responsive & Hiệu năng
- Lưới ảnh dùng cấu hình `grid-cols` thích ứng: 1–3 cột tùy viewport.
- Giảm hiệu ứng motion (duration ngắn), loại bỏ backdrop-blur nặng.
- Sử dụng `next/image` để tối ưu tải ảnh; thêm bo góc/nền nhẹ thay vì đổ bóng lớn.

## Accessibility (WCAG 2.1 AA)
- Thêm mô tả `alt` cho ảnh, `aria-label` cho phần tử tương tác, `role="alert"` cho thông báo lỗi.
- Điều khiển bằng bàn phím: ảnh kết quả trong gallery có `tabIndex` và xử lý phím `Enter`/space.

## Kiểm thử đề xuất
- Cross-browser: Chrome/Firefox/Safari.
- Lighthouse: kiểm tra Performance (>85), Accessibility (>90), Best Practices/Security.
- Responsive: mobile/tablet/desktop; kiểm tra lưới, khoảng cách, nhãn.

## Lưu ý tích hợp
- Không thay đổi API/logic nghiệp vụ. Tất cả thay đổi chỉ ở tầng UI.
- Nếu thêm component mới, ưu tiên từ `src/components/ui` (Shadcn) hoặc Radix.