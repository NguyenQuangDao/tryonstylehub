# 🔧 Fix Infinite API Call Loop

## Vấn đề (Problem)

Khi chạy `npm run dev`, có hiện tượng **gọi API liên tục** (infinite loop):

```bash
GET /login?redirect=%2Fproducts 200 in 9ms
GET /login?redirect=%2F 200 in 10ms
GET /login?redirect=%2Fproducts 200 in 10ms
GET /login?redirect=%2F 200 in 10ms
... (lặp đi lặp lại vô hạn)
```

## Nguyên nhân (Root Cause)

### 1. **Auth Context - Vòng lặp pathname**
**File**: `src/lib/auth-context.tsx`

**Vấn đề cũ**:
```typescript
useEffect(() => {
  if (pathname === '/register' || pathname === '/login') {
    setLoading(false);
    return;
  }
  fetchUser();
}, [pathname]); // ❌ Chạy lại mỗi khi pathname thay đổi
```

**Tại sao gây vòng lặp**:
- Middleware redirect → pathname thay đổi
- pathname thay đổi → useEffect chạy lại
- useEffect gọi fetchUser() → có thể trigger redirect
- Lặp lại vô hạn...

**Đã sửa**:
```typescript
useEffect(() => {
  const isAuthPage = pathname === '/register' || pathname === '/login';
  if (isAuthPage) {
    setLoading(false);
    return;
  }
  
  fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ✅ CHỈ chạy 1 lần khi component mount
```

### 2. **Login Page - Vòng lặp redirect**
**File**: `src/app/login/page.tsx`

**Vấn đề cũ**:
```typescript
const redirectUrl = searchParams?.get('redirect') || '/';

useEffect(() => {
  if (!loading && user) {
    const timer = setTimeout(() => {
      router.push(redirectUrl);
    }, 100);
    return () => clearTimeout(timer);
  }
}, [user, loading, router, redirectUrl]); // ❌ redirectUrl thay đổi liên tục
```

**Tại sao gây vòng lặp**:
- Middleware redirect với `?redirect=/products`
- redirectUrl thay đổi → useEffect chạy lại
- useEffect redirect → middleware redirect lại
- Lặp lại vô hạn...

**Đã sửa**:
```typescript
useEffect(() => {
  if (!loading && user) {
    router.push(redirectUrl);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user, loading]); // ✅ CHỈ phụ thuộc vào user và loading
```

## Các file đã sửa

### 1. `src/lib/auth-context.tsx`
```diff
- useEffect(() => {
-   if (pathname === '/register' || pathname === '/login') {
-     setLoading(false);
-     return;
-   }
-   fetchUser();
- }, [pathname]);

+ useEffect(() => {
+   const isAuthPage = pathname === '/register' || pathname === '/login';
+   if (isAuthPage) {
+     setLoading(false);
+     return;
+   }
+   
+   fetchUser();
+   // eslint-disable-next-line react-hooks/exhaustive-deps
+ }, []); // Only run once on mount
```

### 2. `src/app/login/page.tsx`
```diff
- useEffect(() => {
-   if (!loading && user) {
-     const timer = setTimeout(() => {
-       router.push(redirectUrl)
-     }, 100)
-     return () => clearTimeout(timer)
-   }
- }, [user, loading, router, redirectUrl])

+ useEffect(() => {
+   if (!loading && user) {
+     router.push(redirectUrl);
+   }
+   // eslint-disable-next-line react-hooks/exhaustive-deps
+ }, [user, loading]); // Only depend on authentication state
```

## Kết quả (Result)

### Trước khi sửa ❌
```bash
GET /login?redirect=%2Fproducts 200 in 9ms
GET /login?redirect=%2F 200 in 10ms
GET /login?redirect=%2Fproducts 200 in 10ms
GET /login?redirect=%2F 200 in 10ms
... (hàng trăm request)
```

### Sau khi sửa ✅
```bash
GET /api/auth/me 200 in 2265ms  # Chỉ gọi 1 lần khi mount
GET /dashboard/seller 200 in 39ms
GET /api/seller/products?page=1&limit=10 200 in 2280ms
# Không còn loop!
```

## Kiểm tra (Testing)

1. **Khởi động lại server**:
```bash
# Dừng server hiện tại (Ctrl+C)
npm run dev
```

2. **Kiểm tra log**:
- ✅ Không còn thấy hàng loạt request giống nhau
- ✅ Mỗi trang chỉ load 1 lần
- ✅ `/api/auth/me` chỉ gọi 1 lần khi app khởi động

3. **Kiểm tra chức năng**:
- ✅ Login vẫn hoạt động bình thường
- ✅ Redirect sau login vẫn hoạt động
- ✅ Protected pages vẫn chuyển hướng đến login nếu chưa đăng nhập

## Bài học (Lessons Learned)

### ❌ Tránh những điều này:

1. **Dependency quá nhiều trong useEffect**:
```typescript
// ❌ BAD - pathname thay đổi liên tục
useEffect(() => { ... }, [pathname]);

// ✅ GOOD - Chỉ chạy 1 lần
useEffect(() => { ... }, []);
```

2. **URL params trong dependencies**:
```typescript
// ❌ BAD - URL params có thể thay đổi nhiều lần
const redirectUrl = searchParams?.get('redirect') || '/';
useEffect(() => { ... }, [redirectUrl]);

// ✅ GOOD - Đọc trong effect, không để trong dependency
useEffect(() => {
  const url = searchParams?.get('redirect') || '/';
  // use url here
}, []);
```

3. **Nested redirects**:
```typescript
// ❌ BAD - Có thể gây redirect loop
middleware redirect → page redirect → middleware redirect...

// ✅ GOOD - Chỉ redirect 1 nơi hoặc có điều kiện rõ ràng
```

## Tối ưu thêm (Further Optimization)

Nếu vẫn gặp vấn đề, có thể:

1. **Thêm flag để tránh double fetch**:
```typescript
const hasFetchedRef = useRef(false);

useEffect(() => {
  if (hasFetchedRef.current) return;
  hasFetchedRef.current = true;
  
  fetchUser();
}, []);
```

2. **Debounce redirects**:
```typescript
import { useDebounce } from '@/hooks/useDebounce';

const debouncedRedirect = useDebounce(() => {
  router.push(redirectUrl);
}, 300);
```

3. **Add loading states**:
```typescript
const [isRedirecting, setIsRedirecting] = useState(false);

if (isRedirecting) {
  return <div>Redirecting...</div>;
}
```

## Tóm tắt (Summary)

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-------------|-----------|
| Infinite API calls | pathname dependency | Chỉ fetch 1 lần on mount |
| Redirect loop | redirectUrl dependency | Chỉ phụ thuộc auth state |
| Request spam | useEffect chạy lại nhiều lần | Empty dependency array |

**Status**: ✅ **FIXED** - Không còn vòng lặp API

---

Ngày: 2025-12-03  
File: FIX_INFINITE_LOOP.md
