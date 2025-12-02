# Hướng Dẫn Tích Hợp Thanh Toán (Stripe-Only)

## 📋 Tổng Quan

Hệ thống hiện chỉ hỗ trợ thanh toán qua **Stripe**. Tất cả phương thức thanh toán khác đã được loại bỏ khỏi hệ thống.

### ✅ Phương Thức Stripe Đang Hỗ Trợ

- `card` (Credit/Debit Card): Visa, MasterCard, American Express

### 🚫 Phương Thức Stripe ĐÃ BỊ Vô Hiệu Hóa

- Cash App Pay
- Amazon Pay
- Cryptocurrency

---

## 🚀 Hướng Dẫn Cài Đặt

### Bước 1: Cài Đặt Dependencies

Stripe đã được cài đặt. Các SDK khác không cần cài thêm vì sử dụng REST API.

```bash
# Đã cài đặt
npm install stripe @stripe/stripe-js
```

### Bước 2: Cấu Hình Environment Variables

Sao chép file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Sau đó điền thông tin credentials:

```env
# Stripe
STRIPE_SECRET_KEY="<your_stripe_secret_key>"
STRIPE_PUBLISHABLE_KEY="<your_stripe_publishable_key>"
STRIPE_WEBHOOK_SECRET="<your_stripe_webhook_secret>"

# Chỉ yêu cầu biến môi trường Stripe
```

### Bước 3: Đăng Ký Tài Khoản Developer

#### 🔵 Stripe (Quốc tế)
1. Truy cập: https://dashboard.stripe.com/register
2. Tạo tài khoản và lấy API keys
3. Cấu hình webhook endpoint: `/api/tokens/payment-webhook?provider=stripe`

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

#### Client-side (Stripe)

```
User → Chọn gói & phương thức
     → API tạo payment intent
     → Frontend hiển thị Stripe Elements
     → User nhập thẻ
     → Confirm payment
     → Cộng token
```

### 3. API Endpoints

#### POST `/api/tokens/purchase`
Tạo payment intent Stripe và trả `clientSecret`.

Stripe dùng webhook: `POST /api/tokens/payment-webhook?provider=stripe` và xác nhận client: `POST /api/tokens/confirm-stripe`.

---

## 🔧 Cấu Trúc Code

```
src/
├── lib/payment/
│   ├── payment-manager.ts     # Quản lý tổng hợp
│   ├── stripe.ts              # Stripe integration
│   └── (chỉ Stripe)
├── app/api/tokens/
│   ├── purchase/route.ts      # API mua token
│   ├── payment-callback/route.ts  # Callback handler
│   └── payment-webhook/route.ts   # Webhook handler
├── app/tokens/
│   └── page.tsx               # UI trang mua token
└── config/
    └── tokens.ts              # Cấu hình gói & phương thức
```

---

## 🧪 Testing

### Test với Sandbox Credentials

#### Stripe Test Cards
```
Visa: 4242 4242 4242 4242
MasterCard: 5555 5555 5555 4444
CVV: Any 3 digits
Date: Any future date
```

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

```
Stripe: https://yourdomain.com/api/tokens/payment-webhook?provider=stripe
```

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

- **Stripe**: https://stripe.com/docs

---

## 🎯 Roadmap

- [x] Stripe Elements integration
- [x] Webhook bảo mật cho Stripe
- [ ] Subscription/recurring payments

---

**Created:** 2025-11-24  
**Version:** 1.0.0  
**Status:** ✅ Ready for Testing
