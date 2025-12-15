# Quy tắc thiết kế Trang Mua Token (Refill Balance)

## Mục tiêu & Kiến trúc
- Tối ưu chuyển đổi: chọn gói nhanh, chọn phương thức thanh toán rõ ràng, xác nhận dễ dàng.
- Hiển thị số dư hiện tại để tạo ngữ cảnh và khuyến khích mua thêm.
- Client component quản lý trạng thái (`useState`, `useEffect`) và gọi API: `/api/tokens/packages`, `/payment-methods`, `/balance`, `/purchase`, `/confirm-stripe`.

## Bố cục tổng thể
- Khung trang: `min-h-screen py-8` với container `mx-auto max-w-7xl px-4` đảm bảo biên an toàn (src/app/tokens/page.tsx:243-245).
- Header: tiêu đề chính + mô tả phụ ở bên trái, hộp số dư ở bên phải với icon `Coins` (src/app/tokens/page.tsx:246-253).
- Phần nội dung: lưới gói token (4 cột desktop), phần phương thức thanh toán, tổng tiền và CTA xác nhận (src/app/tokens/page.tsx:268-355).

## Trạng thái tải & phản hồi
- Loading toàn trang: spinner trung tâm với `border-primary` và `text-muted-foreground` (src/app/tokens/page.tsx:231-239).
- Lỗi: khối `text-destructive-foreground bg-destructive/10 border-destructive` dễ nhận biết (src/app/tokens/page.tsx:256-260).
- Thành công: khối xanh `text-green-700 bg-green-100` xác nhận cộng credit (src/app/tokens/page.tsx:261-265).

## Gói Token (Package Cards)
- Lưới: `grid grid-cols-1 md:grid-cols-4 gap-4` để tối ưu lựa chọn và so sánh (src/app/tokens/page.tsx:268).
- Thẻ gói: `border rounded-xl bg-card p-5 cursor-pointer transition-all` với trạng thái chọn `border-primary bg-primary/5` (src/app/tokens/page.tsx:272-276).
- Nhãn nổi bật: `Badge` “Popular” đặt `absolute top-3 right-3`, kích thước nhỏ (src/app/tokens/page.tsx:277-279).
- Trình bày giá trị: số token lớn (`text-2xl font-bold`) + nhãn “Credits” nhỏ, giá theo `currency` và giá gạch nếu có `savings` (src/app/tokens/page.tsx:280-293).
- Lợi ích: liệt kê 3 điểm mấu chốt bằng icon `Check` với `text-xs text-muted-foreground` (src/app/tokens/page.tsx:295-299).
- CTA trong thẻ: nút `Button` đầy chiều rộng, biến đổi `variant` theo trạng thái chọn (src/app/tokens/page.tsx:300-304).

## Tiền tệ & Phương thức thanh toán
- Currency: bộ nhớ 2 danh sách (`allPackages`, `allPaymentMethods`) để lọc theo `selectedCurrency` (src/app/tokens/page.tsx:36-41,132-149).
- Phương thức: hiển thị dưới dạng `RadioGroup` lưới 3 cột; mỗi nhãn là một thẻ `border rounded-md` với icon thích hợp (PayPal/Crypto/Card) (src/app/tokens/page.tsx:313-331).
- Ưu tiên sắp xếp: `crypto` → `paypal` → `others` theo điểm `score` (src/app/tokens/page.tsx:151-159).
- Giá tổng: hiển thị ở panel phải, chuyển đổi theo currency với format địa phương (src/app/tokens/page.tsx:344-349).

## CTA & Quy trình thanh toán
- CTA “Confirm Payment”: `Button h-9 px-6` luôn hiển thị tổng và vô hiệu hóa khi thiếu chọn/đang xử lý (src/app/tokens/page.tsx:351-354).
- POST `/purchase`: phân nhánh theo `requiresRedirect` (mở `paymentUrl`) hoặc `requiresClientConfirmation` (Stripe Elements) (src/app/tokens/page.tsx:171-214).
- Stripe:
  - Lấy `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` từ môi trường; xử lý lỗi khi thiếu (src/app/tokens/page.tsx:192-199).
  - Khởi tạo `Stripe` và `Elements` với `clientSecret`; mount `payment` element lên `#stripe-payment-element` (src/app/tokens/page.tsx:200-213,54-63).
  - Xác nhận `confirmPayment` không chuyển hướng nếu không cần (`redirect: 'if_required'`), xử lý lỗi/hoàn tất, POST `/confirm-stripe` để ghi nhận giao dịch (src/app/tokens/page.tsx:365-399).

## Vi mô tương tác (Micro-interactions)
- Hover thẻ gói: `hover:bg-muted` khi chưa chọn; chuyển `border-primary` + `bg-primary/5` khi chọn để tạo phản hồi tức thì.
- Badge “Popular”: kích thước nhỏ, góc bo tròn, vị trí cố định tạo dấu nhấn không áp đảo.
- Panel Alert Crypto: cung cấp thông tin hướng dẫn rõ ràng, biểu tượng `Bitcoin` nổi bật (src/app/tokens/page.tsx:332-341).

## Khả năng truy cập (a11y)
- RadioGroup: nhãn `label` chứa `RadioGroupItem` dạng `sr-only` để vẫn có thể focus và đọc được (src/app/tokens/page.tsx:323-327).
- Nút và thẻ có vùng chạm đủ lớn; trạng thái `disabled` rõ ràng khi đang xử lý; thêm `aria-live` cho khối lỗi/thành công (quy tắc khuyến nghị).
- Icon có vai trò minh họa, văn bản là chính; đảm bảo tương phản màu theo theme.

## Hiệu năng & Ổn định
- Dữ liệu: fetch theo chuỗi, set `loading` đúng thời điểm; bắt lỗi và hiển thị thông báo; log lỗi (src/app/tokens/page.tsx:80-130,124-129).
- Stripe element mount/unmount an toàn trong `useEffect` để tránh đè mount nhiều lần (src/app/tokens/page.tsx:54-74).
- Định dạng số: `toLocaleString('vi-VN')` cho VND, `toFixed(2)` cho USD; tránh tính toán tại render nhiều lần.

## Dark Mode & Theme
- Dùng `bg-card`, `border-border`, `text-muted-foreground`, `primary` thay vì hard-code màu; badge và panel alert theo variant thích hợp.
- Spinner loading dùng `border-primary` để đồng bộ với hệ màu.

## Không nên
- Không hard-code màu đen/trắng cho nút/viền; luôn dùng token theme.
- Không ép người dùng chọn nhiều hành động; tối giản CTA “Confirm Payment”, còn lại là chọn gói và phương thức.
- Không để lỗi/processing che mất CTA; hiển thị rõ và giữ bố cục ổn định.

## Hành vi an toàn & bảo mật
- Không lưu thông tin thẻ trên client; Stripe Elements xử lý nhạy cảm, server ghi nhận bằng `paymentIntentId` (src/app/tokens/page.tsx:365-399).
- Kiểm tra biến môi trường Stripe trước khi khởi tạo; hiển thị thông báo rõ ràng nếu thiếu (src/app/tokens/page.tsx:192-199).

## Tham chiếu mã nguồn
- Container & Header: `src/app/tokens/page.tsx:243-253`
- Loading & Alerts: `src/app/tokens/page.tsx:231-239`, `256-265`
- Gói token grid/cards: `src/app/tokens/page.tsx:268-307`
- Phương thức thanh toán & sắp xếp: `src/app/tokens/page.tsx:313-331`, `151-159`
- Tổng & CTA: `src/app/tokens/page.tsx:344-354`
- Luồng `/purchase`: `src/app/tokens/page.tsx:171-214`
- Stripe mount/unmount: `src/app/tokens/page.tsx:54-74`
- Xác nhận Stripe & ghi nhận: `src/app/tokens/page.tsx:356-401`
