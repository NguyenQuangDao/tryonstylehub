# PayPal Sandbox Integration

## Tài khoản & Ứng dụng
- Đăng ký tại `https://developer.paypal.com` và tạo Sandbox App.
- Lấy `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` và đặt `PAYPAL_MODE=sandbox`.
- FE dùng `NEXT_PUBLIC_PAYPAL_CLIENT_ID` để load SDK.

## Biến môi trường
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_MODE=sandbox`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`

## Luồng thanh toán
- Server tạo `order` qua API `POST /api/tokens/purchase` (provider: paypal).
- FE render `PayPalButtons` và dùng `createOrder` gọi server để nhận `orderId`.
- Sau khi người dùng chấp nhận, FE gọi `POST /api/tokens/confirm-paypal` để capture và ghi nhận.
- Idempotency: khoá theo `paypalOrderId`.

## API
- Tạo đơn: `POST /api/tokens/purchase { packageId, paymentMethodId: 'paypal' }` → `{ orderId }`.
- Xác nhận (capture): `POST /api/tokens/confirm-paypal { orderId, packageId }` → ghi `TokenPurchase` và tăng `tokenBalance`.
- Hoàn tiền (tuỳ chọn): server `refundPaypalCapture(captureId, amount?)`.

## Kiểm thử QA
- Case thành công: chọn gói → PayPal → Approve → Balance tăng, điều hướng `/success`.
- Case thất bại: huỷ tại PayPal hoặc lỗi network → hiển thị lỗi, không ghi nhận.
- Refund (nếu bật): kiểm tra trả về `status` và số dư không đổi.
- Bảo mật: không log secrets; kiểm tra chỉ thay đổi với user đã đăng nhập.

## Lưu ý
- Sandbox giữ nguyên cấu hình keys/credentials, không dùng Live.
- Không cần webhook cho Sandbox; sản xuất có thể bật PayPal Webhooks nếu muốn đảm bảo hậu kỳ.

