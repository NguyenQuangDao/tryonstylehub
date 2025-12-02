# Thiết lập Sandbox Stripe và Webhook

## Điều kiện tiên quyết
- Đã cấu hình các biến môi trường trong `.env`:
  - `STRIPE_SECRET_KEY` (key bí mật test bắt đầu bằng `sk_test_...`)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (key public test bắt đầu bằng `pk_test_...`)
  - `STRIPE_WEBHOOK_SECRET` (sẽ lấy từ Stripe CLI ở bước dưới)
- Đã cài đặt và chạy dự án: `npm install` rồi `npm run dev`.

## Cài Stripe CLI (để nhận webhook ở môi trường local)
- macOS (khuyến nghị): `brew install stripe/stripe-cli/stripe`
- Hoặc tham khảo: https://stripe.com/docs/stripe-cli

## Khởi chạy webhook forward tới ứng dụng
1. Chạy ứng dụng dev: `npm run dev` (mặc định tại `http://localhost:3000`).
2. Mở terminal khác và chạy:
   - `stripe listen --forward-to http://localhost:3000/api/tokens/payment-webhook?provider=stripe`
3. Stripe CLI sẽ in ra `Signing secret` (ví dụ `whsec_...`). Sao chép giá trị này và cập nhật `.env` cho biến `STRIPE_WEBHOOK_SECRET`.
4. Khởi động lại server nếu cần để nạp biến môi trường.

## Test Apple Pay / Google Pay trên localhost (theo hướng dẫn video)
- Nhiều ví điện tử yêu cầu domain HTTPS hợp lệ. Bạn có thể dùng `lcl.host` để cấp một domain HTTPS trỏ về localhost.
- Bước thực hiện:
  1. Truy cập `https://lcl.host` và cài đặt theo hướng dẫn.
  2. Chạy dự án thông qua domain HTTPS do `lcl.host` cung cấp (ví dụ `https://<subdomain>.lcl.host`).
  3. Duy trì Stripe CLI `listen` để webhook vẫn forward về API của bạn.
- Khi dùng Payment Element với `automatic_payment_methods.enabled = true`, Apple Pay/Google Pay sẽ xuất hiện nếu điều kiện thiết bị và domain đạt yêu cầu.

## Kiểm tra khóa Stripe
- Gọi endpoint: `GET http://localhost:3000/api/health/stripe`
- Kết quả `{"status":"ok"}` cho biết `STRIPE_SECRET_KEY` hợp lệ trong test mode.

## Quy trình thanh toán test (UI Tokens)
1. Truy cập trang `http://localhost:3000/tokens`.
2. Chọn gói Token và phương thức thanh toán `Stripe`.
3. Ấn "Xác nhận thanh toán" để hệ thống tạo `Payment Intent` và trả `clientSecret`.
4. Form thẻ sẽ xuất hiện, dùng thẻ test: `4242 4242 4242 4242`, ngày bất kỳ tương lai, CVC bất kỳ.
5. Sau khi `confirmPayment` thành công:
   - API `POST /api/tokens/confirm-stripe` ghi nhận giao dịch và cộng token.
   - Webhook `POST /api/tokens/payment-webhook?provider=stripe` sẽ nhận sự kiện `payment_intent.succeeded` (qua Stripe CLI) và thực hiện idempotent ghi nhận (nếu chưa ghi).

## Trang thành công
- Có sẵn trang `http://localhost:3000/success` để hiển thị kết quả thanh toán đã hoàn tất.

## Thiết kế webhook (đã có sẵn)
- Đường dẫn: `src/app/api/tokens/payment-webhook/route.ts`
- Xác thực chữ ký bằng header `stripe-signature` + `STRIPE_WEBHOOK_SECRET`.
- Đọc `metadata` từ `Payment Intent`: `userId`, `packageId` để ghi `tokenPurchase` và cộng token cho user.
- Kiểm tra idempotency: bỏ qua nếu `stripePaymentId` đã xử lý.
- Trả về HTTP 200 khi xử lý thành công.

## Lưu ý bảo mật
- Không commit khóa/thông tin nhạy cảm lên repository công khai.
- Chỉ dùng test keys (`sk_test_...`, `pk_test_...`) trong môi trường dev.
- Trong production, cấu hình webhook trên Stripe Dashboard với URL public và ký tự riêng.

## Sự cố thường gặp
- Thiếu `STRIPE_WEBHOOK_SECRET`: kiểm tra lại Stripe CLI `listen` và cập nhật `.env` đúng.
- Không thấy form thẻ: đảm bảo `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` có giá trị và ở client.
- Webhook không bắn: xác minh Stripe CLI đang chạy và forward đúng URL.
