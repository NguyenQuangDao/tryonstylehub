# 🚀 Quick Start - Token System

## Sử dụng ngay trong 3 bước

### 1️⃣ Hiển thị số dư token

```tsx
import { TokenDisplay } from '@/components/tokens/TokenComponents'

export function MyComponent() {
  const [balance, setBalance] = useState(10)
  
  return <TokenDisplay balance={balance} showWarning={true} />
}
```

### 2️⃣ Thêm vào API route

```typescript
// src/app/api/my-feature/route.ts
import { requireTokens, chargeTokens } from '@/lib/token-middleware'
import { TOKEN_CONFIG } from '@/config/tokens'

export async function POST(req: NextRequest) {
  // Check tokens
  const check = await requireTokens(req, {
    operation: 'My Feature',
    tokensRequired: TOKEN_CONFIG.COSTS.TRY_ON,
  })
  
  if (!check.success) {
    return NextResponse.json({ error: check.error }, { status: 401 })
  }

  // Do your work
  const result = await myFeature()
  
  // Charge tokens
  await chargeTokens(check.userId!, 'My Feature', TOKEN_CONFIG.COSTS.TRY_ON)
  
  return NextResponse.json({ success: true, data: result })
}
```

### 3️⃣ Handle frontend errors

```tsx
const handleSubmit = async () => {
  const res = await fetch('/api/my-feature', { method: 'POST' })
  const data = await res.json()
  
  if (res.status === 402) {
    // Show insufficient tokens modal
    setShowInsufficientTokensModal(true)
    return
  }
  
  // Success!
  setResult(data)
}

return (
  <>
    {/* Your UI */}
    <InsufficientTokensModal
      isOpen={showInsufficientTokensModal}
      onClose={() => setShowInsufficientTokensModal(false)}
      required={1}
      current={balance}
      operation="sử dụng tính năng này"
    />
  </>
)
```

## 🎯 Thế thôi!

Xem thêm: `docs/TOKEN_SYSTEM.md` hoặc `TOKEN_PAYMENT_IMPLEMENTATION.md`
