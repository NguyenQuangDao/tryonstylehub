# 2.6. Các dịch vụ tích hợp bên thứ ba (Third-party Services)

Để tối ưu hóa nguồn lực và tập trung vào các tính năng cốt lõi, hệ thống tích hợp các dịch vụ SaaS (Software as a Service) hàng đầu cho các tác vụ chuyên biệt: Thanh toán, Lưu trữ và Trí tuệ nhân tạo.

## 2.6.1. Stripe: Cổng Thanh toán Trực tuyến

### 2.6.1.1. Khái niệm và Bảo mật PCI Compliance
Stripe là nền tảng xử lý thanh toán trực tuyến toàn cầu, cung cấp API mạnh mẽ cho các nhà phát triển. Hệ thống sử dụng thư viện `stripe` (Node.js SDK) để tương tác với Stripe API.

Việc tự xây dựng hệ thống xử lý thẻ tín dụng đòi hỏi tuân thủ chuẩn bảo mật PCI-DSS cực kỳ khắt khe. Stripe giải quyết vấn đề này bằng cách cung cấp giải pháp Tokenization. Thông tin thẻ nhạy cảm được gửi trực tiếp từ Client đến Stripe; hệ thống của chúng ta chỉ nhận về `PaymentIntent` ID và `ClientSecret`.

**Cấu hình:**
- **Environment Variables:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- **Library:** `stripe` (v14+).

### 2.6.1.2. Webhooks và Tính Lũy đẳng (Idempotency)
Quy trình thanh toán là bất đồng bộ. Hệ thống sử dụng Webhook để cập nhật trạng thái đơn hàng một cách tin cậy.

**Cơ chế Webhook (`src/app/api/tokens/payment-webhook/route.ts`):**
1.  **Xác thực Chữ ký (Signature Verification):**
    Hệ thống xác thực header `stripe-signature` bằng `stripe.webhooks.constructEvent(rawBody, sig, secret)`. Điều này đảm bảo request thực sự đến từ Stripe và không bị giả mạo.

2.  **Xử lý sự kiện `payment_intent.succeeded`:**
    Khi thanh toán thành công, Stripe gửi sự kiện này kèm theo `metadata` chứa `userId` và `packageId`.

3.  **Tính Lũy đẳng (Idempotency):**
    Để tránh cộng tiền hai lần do Stripe gửi trùng lặp sự kiện (retry mechanism), hệ thống kiểm tra sự tồn tại của giao dịch trong cơ sở dữ liệu trước khi xử lý:
    ```typescript
    const existingPurchase = await getTokenPurchaseClient(prisma).findFirst({
        where: { stripePaymentId: paymentIntentId },
    })
    if (existingPurchase) return; // Bỏ qua nếu đã xử lý
    ```

4.  **Transaction Atomicity:**
    Sử dụng `prisma.$transaction` để đảm bảo việc tạo bản ghi mua hàng (Purchase) và cộng Token vào tài khoản User diễn ra đồng thời. Nếu một trong hai thất bại, toàn bộ giao dịch sẽ được rollback.

### 2.6.1.3. Quy trình Thanh toán
1.  **Khởi tạo (`createStripePayment`):** Backend tạo `PaymentIntent` với số tiền và currency (hỗ trợ xử lý Zero-decimal currencies như VND).
2.  **Xác nhận Client-side:** Frontend sử dụng `stripe.confirmPayment` với `clientSecret`.
3.  **Xử lý Hậu kỳ:** Webhook nhận tín hiệu thành công và cộng Token cho người dùng.

## 2.6.2. AWS S3: Hạ tầng Lưu trữ Đối tượng

### 2.6.2.1. Khái niệm Object Storage
Hệ thống sử dụng Amazon S3 để lưu trữ hình ảnh sản phẩm và ảnh thử đồ (Try-On results). Thư viện `@aws-sdk/client-s3` được sử dụng để tương tác với AWS.

### 2.6.2.2. Presigned URLs và Upload Trực tiếp
Để giảm tải cho Web Server và tận dụng băng thông của AWS, hệ thống áp dụng mô hình Upload trực tiếp từ Client (Direct Upload) thông qua Presigned URLs.

**Quy trình (`src/app/api/upload/presigned-url/route.ts`):**
1.  **Client Request:** Frontend gửi yêu cầu upload kèm `fileName` và `fileType`.
2.  **Backend Generation:**
    - Tạo `PutObjectCommand` với `Bucket`, `Key` và `ContentType`.
    - Sử dụng `getSignedUrl` từ `@aws-sdk/s3-request-presigner` để tạo URL tạm thời (có hiệu lực trong 1 giờ).
    ```typescript
    const command = new PutObjectCommand({ Bucket, Key, ContentType });
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    ```
3.  **Client Upload:** Frontend dùng `uploadUrl` để gửi file trực tiếp lên S3 bằng method `PUT`.

**Cấu trúc Key (File Naming):**
File được lưu với cấu trúc: `folder/timestamp-random-filename.ext` để tránh trùng lặp tên file.

### 2.6.2.3. Fallback Mechanism
Trong môi trường phát triển (Local) hoặc khi chưa cấu hình AWS, hệ thống có cơ chế fallback (`uploadToS3` trong `src/lib/s3.ts`) để lưu file vào thư mục `public/uploads` của server, đảm bảo việc phát triển không bị gián đoạn.

## 2.6.3. AI Virtual Try-On API: Công nghệ Thử đồ ảo

### 2.6.3.1. Tích hợp Fashn.ai
Hệ thống sử dụng API của **Fashn.ai** (model `tryon-v1.6`) để thực hiện tính năng thử đồ ảo. Đây là giải pháp thay thế hiệu quả cho việc tự vận hành model Diffusion tốn kém tài nguyên GPU.

**Thư viện:** `fashn` (Node.js SDK).

### 2.6.3.2. Quy trình Xử lý (`src/app/api/tryon/route.ts`)

1.  **Input Processing:**
    - Nhận ảnh người (Model Image) và ảnh quần áo (Garment Image).
    - Chuyển đổi ảnh sang định dạng Base64 hoặc URL.
    - Xác định tham số: `category` (tops, bottoms, one-pieces), `mode` (balanced), `nsfw_filter`.

2.  **Token Deduction:**
    - Kiểm tra số dư Token của người dùng.
    - Trừ Token tạm thời hoặc kiểm tra đủ điều kiện trước khi gọi API.

3.  **API Call & Polling:**
    - Gửi request `client.predictions.run()` để bắt đầu quá trình xử lý.
    - Do quá trình sinh ảnh mất thời gian (vài giây đến vài chục giây), hệ thống sử dụng cơ chế **Polling**:
      - Liên tục gọi `client.predictions.status(predId)` mỗi 2 giây.
      - Timeout sau 3 phút (180s).

4.  **Lưu trữ Kết quả:**
    - Khi trạng thái là `completed`, hệ thống tải ảnh kết quả từ Fashn.ai về.
    - Sử dụng `sharp` để tối ưu hóa kích thước và định dạng ảnh.
    - Upload ảnh kết quả lên AWS S3 (hoặc Local Storage).
    - Cập nhật Gallery của người dùng trong Database.

5.  **Hoàn tất:** Trừ Token chính thức và trả về URL ảnh kết quả cho Frontend.

### 2.6.3.3. Ưu điểm
- **Chất lượng cao:** Sử dụng model IDM-VTON tiên tiến được tinh chỉnh bởi Fashn.ai.
- **Tốc độ tích hợp:** Không cần setup Docker hay GPU server phức tạp.
- **Scalability:** Dễ dàng mở rộng số lượng request mà không lo nghẽn hạ tầng AI cục bộ.
