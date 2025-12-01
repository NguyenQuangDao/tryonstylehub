# Hướng Dẫn Tích Hợp Phương Thức Thanh Toán

## 📋 Tổng Quan

Hệ thống đã được tích hợp **5 phương thức thanh toán** hỗ trợ cả thị trường quốc tế và Việt Nam:

### ✅ Phương Thức Thanh Toán

| Phương thức | Thị trường | Loại tiền | Trạng thái |
|------------|------------|-----------|------------|
| **Stripe** | Quốc tế | USD, VND | ✅ Sẵn sàng |
| **PayPal** | Quốc tế | USD | ✅ Sẵn sàng |
| **MoMo** | Việt Nam | VND | ✅ Sẵn sàng |
| **VNPay** | Việt Nam | VND | ✅ Sẵn sàng |
| **ZaloPay** | Việt Nam | VND | ✅ Sẵn sàng |

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

# PayPal
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
PAYPAL_API_BASE="https://api-m.sandbox.paypal.com"

# MoMo
MOMO_PARTNER_CODE="..."
MOMO_ACCESS_KEY="..."
MOMO_SECRET_KEY="..."
MOMO_ENDPOINT="https://test-payment.momo.vn/v2/gateway/api/create"

# VNPay
VNPAY_TMN_CODE="..."
VNPAY_HASH_SECRET="..."
VNPAY_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"

# ZaloPay
ZALOPAY_APP_ID="..."
ZALOPAY_KEY1="..."
ZALOPAY_KEY2="..."
ZALOPAY_ENDPOINT="https://sb-openapi.zalopay.vn/v2/create"
```

### Bước 3: Đăng Ký Tài Khoản Developer

#### 🔵 Stripe (Quốc tế)
1. Truy cập: https://dashboard.stripe.com/register
2. Tạo tài khoản và lấy API keys
3. Cấu hình webhook endpoint: `/api/tokens/payment-webhook?provider=stripe`

#### 🅿️ PayPal (Quốc tế)
1. Truy cập: https://developer.paypal.com/
2. Tạo app và lấy Client ID/Secret
3. Bật sandbox mode để test

#### 🟣 MoMo (Việt Nam)
1. Truy cập: https://developers.momo.vn/
2. Đăng ký merchant và tạo app
3. Lấy Partner Code, Access Key, Secret Key
4. Cấu hình IPN URL: `/api/tokens/payment-webhook?provider=momo`

#### 🔵 VNPay (Việt Nam)
1. Truy cập: https://sandbox.vnpayment.vn/
2. Đăng ký merchant test
3. Lấy TMN Code và Hash Secret
4. Cấu hình Return URL: `/api/tokens/payment-callback?provider=vnpay`

#### ⚡ ZaloPay (Việt Nam)
1. Truy cập: https://docs.zalopay.vn/
2. Đăng ký merchant
3. Lấy App ID, Key1, Key2
4. Cấu hình callback URL

---

## 💻 Cách Sử Dụng

### 1. Frontend - Trang Mua Token

Người dùng truy cập `/tokens`:
- Chọn tiền tệ (VND hoặc USD)
- Chọn gói token
- Chọn phương thức thanh toán (tự động lọc theo tiền tệ)
- Nhấn "Xác nhận thanh toán"

### 2. Flow Thanh Toán

#### A. Redirect-based (MoMo, VNPay, ZaloPay, PayPal)

```
User → Chọn gói & phương thức
     → API tạo payment URL
     → Redirect đến trang thanh toán
     → User thanh toán
     → Redirect về callback URL
     → Verify payment
     → Cộng token
```

#### B. Client-side (Stripe) - Coming Soon

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
Tạo giao dịch thanh toán

**Request:**
```json
{
  "packageId": "starter_vnd",
  "paymentMethodId": "momo"
}
```

**Response (Redirect):**
```json
{
  "success": true,
  "requiresRedirect": true,
  "paymentUrl": "https://payment.momo.vn/...",
  "transactionId": "TOKEN_123_1234567890"
}
```

#### GET `/api/tokens/payment-callback?provider=momo`
Xử lý redirect sau khi thanh toán

#### POST `/api/tokens/payment-webhook?provider=momo`
Xử lý webhook/IPN từ payment gateway

---

## 🔧 Cấu Trúc Code

```
src/
├── lib/payment/
│   ├── payment-manager.ts     # Quản lý tổng hợp
│   ├── stripe.ts              # Stripe integration
│   ├── paypal.ts              # PayPal integration
│   ├── momo.ts                # MoMo integration
│   ├── vnpay.ts               # VNPay integration
│   └── zalopay.ts             # ZaloPay integration
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

#### PayPal Sandbox
- Login: https://www.sandbox.paypal.com/
- Use sandbox buyer account

#### MoMo Test
- Use test Partner Code from MoMo developer portal
- Test app: MoMo sandbox app

#### VNPay Test
- Use test cards provided by VNPay
- Test merchant from sandbox portal

#### ZaloPay Test
- Use sandbox credentials
- Test with ZaloPay sandbox app

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

Cấu hình webhooks trên các merchant portals:

```
Stripe: https://yourdomain.com/api/tokens/payment-webhook?provider=stripe
MoMo: https://yourdomain.com/api/tokens/payment-webhook?provider=momo
VNPay: https://yourdomain.com/api/tokens/payment-callback?provider=vnpay
ZaloPay: https://yourdomain.com/api/tokens/payment-webhook?provider=zalopay
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
- **PayPal**: https://developer.paypal.com/docs
- **MoMo**: https://developers.momo.vn/v3/
- **VNPay**: https://sandbox.vnpayment.vn/apis/
- **ZaloPay**: https://docs.zalopay.vn/

---

## 🎯 Roadmap

- [x] Tích hợp 5 phương thức thanh toán
- [x] Hỗ trợ VND và USD
- [x] Payment callback & webhook handlers
- [x] Currency selector UI
- [ ] Stripe Elements integration (client-side)
- [ ] Payment history page
- [ ] Refund functionality
- [ ] Subscription/recurring payments
- [ ] Multi-currency auto-detection

---

**Created:** 2025-11-24  
**Version:** 1.0.0  
**Status:** ✅ Ready for Testing
