# Hệ Thống Token và Thanh Toán

## Tổng Quan

Hệ thống token và thanh toán đã được triển khai đầy đủ với các tính năng sau:

### ✅ Các Tính Năng Chính

1. **Token Miễn Phí Khi Đăng Ký**
   - Tự động cấp 10 token miễn phí khi người dùng đăng ký mới
   - Số lượng token có thể tùy chỉnh trong file `src/config/tokens.ts`
   - Áp dụng cho cả đăng ký bằng Google OAuth và credentials

2. **Thông Báo Hết Token**
   - Modal cảnh báo khi không đủ token
   - Thông báo cảnh báo khi số dư thấp (≤ 5 token)
   - Hiển thị số dư token trong navigation bar

3. **Quy Trình Thanh Toán**
   - Trang mua token với giao diện đẹp mắt
   - Lựa chọn gói token với giá và số lượng khác nhau
   - Hiển thị gói đề xuất và % tiết kiệm
   - Tích hợp các phương thức thanh toán

4. **Bảo Mật**
   - Mã hóa thông tin thanh toán
   - Xác thực JWT cho mọi giao dịch
   - Logging đầy đủ các hoạt động
   - Atomic transactions trong database

5. **Tích Hợp Hệ Thống**
   - Token manager để quản lý số dư
   - Token middleware để kiểm tra và trừ token
   - Logging system cho audit trail
   - Hooks cho React components

---

## Cấu Trúc Thư Mục

```
src/
├── config/
│   └── tokens.ts                    # Cấu hình token (gói, giá, costs)
├── lib/
│   ├── token-manager.ts             # Quản lý token (check, deduct, refund)
│   ├── payment-logger.ts            # Logging cho payment và token events
│   └── token-middleware.ts          # Middleware cho API routes
├── components/
│   └── tokens/
│       └── TokenComponents.tsx      # UI components (modal, warning, badge)
├── app/
│   ├── tokens/
│   │   └── page.tsx                 # Trang mua token
│   └── api/
│       └── tokens/
│           ├── packages/route.ts    # API lấy danh sách gói
│           ├── payment-methods/route.ts # API lấy phương thức thanh toán
│           ├── purchase/route.ts    # API mua token
│           └── balance/route.ts     # API lấy số dư
```

---

## Cấu Hình

### 1. Token Configuration (`src/config/tokens.ts`)

```typescript
export const TOKEN_CONFIG = {
  // Số token miễn phí khi đăng ký - CÓ THỂ TÙY CHỈNH
  FREE_TOKENS_ON_SIGNUP: 10,

  // Chi phí token cho các operation
  COSTS: {
    TRY_ON: 1,
    AI_RECOMMENDATION: 1,
    GENERATE_IMAGE: 2,
    CUSTOM_MODEL: 3,
  },

  // Các gói token - CÓ THỂ TÙY CHỈNH
  PACKAGES: [
    { id: 'starter', name: 'Gói Khởi Đầu', tokens: 20, price: 4.99, ... },
    { id: 'basic', name: 'Gói Cơ Bản', tokens: 50, price: 9.99, ... },
    // ...
  ],

  // Threshold cho cảnh báo
  LOW_BALANCE_THRESHOLD: 5,
}
```

### 2. Database Schema

```prisma
model User {
  tokenBalance Int @default(10)  // Sử dụng FREE_TOKENS_ON_SIGNUP
  // ...
}

model TokenPurchase {
  id              Int      @id @default(autoincrement())
  userId          Int
  stripePaymentId String   @unique
  amount          Float
  tokens          Int
  status          String   @default("completed")
  createdAt       DateTime @default(now())
}
```

---

## Sử Dụng

### 1. Frontend - Hiển Thị Token Balance

```tsx
import { TokenDisplay, LowBalanceWarning } from '@/components/tokens/TokenComponents'

// Trong component
<TokenDisplay balance={userBalance} showWarning={true} />
<LowBalanceWarning balance={userBalance} />
```

### 2. Frontend - Modal Khi Hết Token

```tsx
import { InsufficientTokensModal } from '@/components/tokens/TokenComponents'
import { TOKEN_CONFIG } from '@/config/tokens'

const [showModal, setShowModal] = useState(false)

// Khi API trả về lỗi insufficient tokens
<InsufficientTokensModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  required={TOKEN_CONFIG.COSTS.AI_RECOMMENDATION}
  current={currentBalance}
  operation="sử dụng AI Recommendation"
/>
```

### 3. Backend - Kiểm Tra và Trừ Token

```typescript
import { requireTokens, chargeTokens, createInsufficientTokensResponse } from '@/lib/token-middleware'
import { TOKEN_CONFIG } from '@/config/tokens'

export async function POST(req: NextRequest) {
  // Bước 1: Kiểm tra token
  const tokenCheck = await requireTokens(req, {
    operation: 'AI Recommendation',
    tokensRequired: TOKEN_CONFIG.COSTS.AI_RECOMMENDATION,
  })

  if (!tokenCheck.success) {
    if (tokenCheck.insufficientTokens) {
      return createInsufficientTokensResponse(
        TOKEN_CONFIG.COSTS.AI_RECOMMENDATION,
        tokenCheck.currentBalance || 0,
        'sử dụng AI Recommendation'
      )
    }
    return NextResponse.json({ error: tokenCheck.error }, { status: 401 })
  }

  try {
    // Bước 2: Thực hiện operation
    const result = await performAIRecommendation(...)

    // Bước 3: Trừ token SAU KHI operation thành công
    await chargeTokens(
      tokenCheck.userId!,
      'AI Recommendation',
      TOKEN_CONFIG.COSTS.AI_RECOMMENDATION,
      { resultId: result.id }
    )

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    // Lỗi = KHÔNG trừ token
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

---

## API Endpoints

### GET `/api/tokens/packages`
Lấy danh sách gói token

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "starter",
      "name": "Gói Khởi Đầu",
      "tokens": 20,
      "price": 4.99,
      "currency": "USD",
      "featured": true,
      "description": "Hoàn hảo để bắt đầu trải nghiệm",
      "savings": 0
    }
  ]
}
```

### GET `/api/tokens/balance`
Lấy số dư token hiện tại

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 50,
    "totalPurchased": 70,
    "totalUsed": 20,
    "recentPurchases": [...]
  }
}
```

### POST `/api/tokens/purchase`
Mua token

**Request:**
```json
{
  "packageId": "starter",
  "paymentMethodId": "pm_card_visa"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_1234567890",
    "tokensAdded": 20,
    "newBalance": 70,
    "purchase": {
      "id": 123,
      "createdAt": "2025-11-24T16:40:50.000Z",
      "amount": 4.99
    }
  }
}
```

**Response (Insufficient Funds - 402):**
```json
{
  "error": "Payment failed: Insufficient funds"
}
```

### GET `/api/tokens/payment-methods`
Lấy danh sách phương thức thanh toán

---

## Logging và Security

### 1. Payment Events Logging

Tất cả các sự kiện token/payment được ghi log vào database:

```typescript
enum PaymentEventType {
  PURCHASE_INITIATED,
  PURCHASE_COMPLETED,
  PURCHASE_FAILED,
  TOKEN_DEDUCTED,
  TOKEN_REFUNDED,
  INSUFFICIENT_BALANCE,
  PAYMENT_VERIFIED,
  PAYMENT_DECLINED,
}
```

### 2. Security Features

- ✅ JWT authentication cho tất cả token operations
- ✅ Atomic database transactions
- ✅ IP address và user agent logging
- ✅ Detailed audit trail trong CostTracking table
- ✅ Type-safe với TypeScript
- ✅ Input validation

---

## Tích Hợp Stripe (TODO)

Hiện tại sử dụng mock payment. Để tích hợp Stripe thật:

1. Cài đặt Stripe SDK:
   ```bash
   npm install stripe @stripe/stripe-js
   ```

2. Thêm environment variables:
   ```env
   STRIPE_SECRET_KEY=<your_stripe_secret_key>
   STRIPE_PUBLISHABLE_KEY=<your_stripe_publishable_key>
   STRIPE_WEBHOOK_SECRET=<your_stripe_webhook_secret>
   ```

3. Cập nhật `processPayment` function trong `/api/tokens/purchase/route.ts`

---

## Testing Checklist

- [x] Đăng ký mới tự động nhận 10 token
- [x] Google OAuth login nhận token
- [x] Hiển thị số dư token trong UI
- [x] Trang mua token hoạt động
- [x] Modal thông báo hết token
- [x] Warning khi số dư thấp
- [x] Logging các giao dịch
- [x] Transaction safety
- [ ] Stripe integration (chưa triển khai)
- [ ] Webhook handling (chưa triển khai)

---

## Ví Dụ Tích Hợp

Xem file `/src/app/api/recommend/route.ts` để xem ví dụ tích hợp đầy đủ với token checking và deduction.

---

## Thay Đổi Cấu Hình

### Thay đổi số token miễn phí

Edit `src/config/tokens.ts`:
```typescript
FREE_TOKENS_ON_SIGNUP: 20, // Thay vì 10
```

### Thêm/sửa gói token

Edit `src/config/tokens.ts`:
```typescript
PACKAGES: [
  { id: 'custom', name: 'Gói Đặc Biệt', tokens: 100, price: 14.99, ... },
  // ...
]
```

### Thay đổi chi phí operation

Edit `src/config/tokens.ts`:
```typescript
COSTS: {
  TRY_ON: 2, // Thay vì 1
  // ...
}
```

---

## Support

Nếu có vấn đề, kiểm tra:
1. Database migrations đã chạy chưa
2. Environment variables đã set chưa
3. Logs trong console/terminal
4. CostTracking table trong database

---

**Created:** 2025-11-24  
**Version:** 1.0.0  
**Status:** ✅ Production Ready (except Stripe integration)
