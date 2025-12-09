# Hướng Dẫn Tích Hợp Thanh Toán (PayPal Sandbox)

## 📋 Tổng Quan

Hệ thống chuyển sang hỗ trợ thanh toán qua **PayPal Sandbox**. Stripe đã được gỡ bỏ hoàn toàn khỏi mã nguồn, webhook và schema.

### ✅ Phương Thức PayPal Hỗ Trợ

- Ví điện tử PayPal (thẻ quốc tế) với luồng `Orders v2 (CAPTURE)`

### 🚫 Phương Thức Stripe ĐÃ BỊ Vô Hiệu Hóa

- Cash App Pay
- Amazon Pay
- Cryptocurrency

---

## 🚀 Hướng Dẫn Cài Đặt

### Bước 1: Cài Đặt Dependencies

```bash
npm install @paypal/react-paypal-js @paypal/checkout-server-sdk
# hoặc dùng SDK mới:
npm install @paypal/paypal-server-sdk
```

### Bước 2: Cấu Hình Environment Variables

Sao chép file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Sau đó điền thông tin credentials:

```env
# PayPal Sandbox
PAYPAL_CLIENT_ID="<your_sandbox_client_id>"
PAYPAL_CLIENT_SECRET="<your_sandbox_client_secret>"
PAYPAL_MODE="sandbox"
NEXT_PUBLIC_PAYPAL_CLIENT_ID="<your_sandbox_client_id>"
```

### Bước 3: Đăng Ký Tài Khoản Developer

#### 🔵 PayPal (Sandbox)
1. Truy cập: https://developer.paypal.com/
2. Tạo ứng dụng Sandbox và lấy `Client ID/Secret`
3. Không cần webhook trong Sandbox; sản xuất có thể bật Webhooks nếu cần

Các cổng thanh toán khác đã bị loại bỏ.

---

## 💻 Cách Sử Dụng

### 1. Frontend - Trang Mua Token

Người dùng truy cập `/tokens`:
- Chọn tiền tệ (VND hoặc USD)
- Chọn gói token
- Chọn phương thức thanh toán (tự động lọc theo tiền tệ)
- Nhấn "Xác nhận thanh toán"

### 2. Flow Thanh Toán

#### Client-side (PayPal Buttons)

```
User → Chọn gói & phương thức
     → FE gọi /api/tokens/purchase để lấy orderId
     → Hiển thị PayPal Buttons
     → User approve
     → FE gọi /api/tokens/confirm-paypal để capture
     → Cộng token
```

### 3. API Endpoints

#### POST `/api/tokens/purchase`
Tạo PayPal Order và trả `orderId` (hoặc `paymentUrl` nếu dùng redirect).

#### POST `/api/tokens/confirm-paypal`
Capture PayPal Order, idempotent ghi nhận `TokenPurchase` theo `paypalOrderId` và tăng `tokenBalance`.

---

## 🔧 Cấu Trúc Code

```
src/
├── lib/payment/
│   ├── payment-manager.ts     # Quản lý tổng hợp
│   └── paypal.ts              # PayPal integration
├── app/api/tokens/
│   ├── purchase/route.ts      # API mua token (PayPal)
│   └── confirm-paypal/route.ts# Capture PayPal
├── app/tokens/
│   └── page.tsx               # UI trang mua token (PayPal Buttons)
└── config/
    └── tokens.ts              # Cấu hình gói & phương thức
```

---

## 🧪 Testing

### Test với Sandbox Credentials

#### PayPal Sandbox
- Đăng nhập bằng tài khoản buyer sandbox
- Approve giao dịch và xác nhận FE chuyển trang sang `/success`

Các mục test khác đã được loại bỏ.

---

## 🔐 Security Best Practices

✅ **Đã Implement:**
- Environment variables cho credentials
- Signature verification cho callbacks
- JWT authentication
- Atomic database transactions
- Payment logging
- IP address tracking

⚠️ **Cần Lưu Ý:**
- Không commit `.env` vào Git
- Sử dụng HTTPS trong production
- Cấu hình webhook endpoints đúng
- Enable webhook signature verification
- Monitor failed payments
- Set up payment reconciliation

---

## 📊 Monitoring & Logging

### Payment Events được log:

```typescript
enum PaymentEventType {
  PURCHASE_INITIATED,
  PURCHASE_COMPLETED,
  PURCHASE_FAILED,
  PAYMENT_VERIFIED,
  PAYMENT_DECLINED,
}
```

### Xem logs:
```sql
SELECT * FROM "CostTracking" 
WHERE operation LIKE 'PURCHASE%' 
ORDER BY timestamp DESC;
```

---

## 🚀 Production Deployment

### Checklist:

- [ ] Replace tất cả sandbox credentials với live credentials
- [ ] Update endpoint URLs sang production
- [ ] Cấu hình webhook URLs trên merchant portals
- [ ] Test với số tiền nhỏ trước
- [ ] Setup monitoring và alerts
- [ ] Enable payment reconciliation
- [ ] Backup database trước khi deploy
- [ ] Document emergency rollback procedure

### Webhook Configuration

- Sandbox: không bắt buộc
- Production: cấu hình PayPal Webhooks nếu cần đảm bảo hậu kỳ

---

## 🆘 Troubleshooting

### Payment Failed
1. Check credentials trong `.env`
2. Verify network connectivity
3. Check payment gateway status
4. Review logs trong `CostTracking` table

### Webhook Not Working
1. Verify webhook URL is publicly accessible
2. Check signature verification
3. Review webhook logs
4. Test with webhook testing tools

### Currency Issues
1. Ensure package currency matches payment method
2. Check exchange rate conversion
3. Verify amount format (USD cents vs VND)

---

## 📚 Documentation Links

- **PayPal Orders v2**: https://developer.paypal.com/docs/api/orders/v2/

---

## 🎯 Roadmap

- [x] Stripe Elements integration
- [x] Webhook bảo mật cho Stripe
- [ ] Subscription/recurring payments

---

**Created:** 2025-11-24  
**Version:** 1.0.0  
**Status:** ✅ Ready for Testing
