# 🧪 Testing & QA Implementation Guide

## Overview
This guide covers how to run the comprehensive test suites and understand the testing infrastructure.

---

## 📦 Installation

First, ensure all testing dependencies are installed:

```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest-mock-extended jsdom
```

---

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test src/__tests__/api/auth/login.test.ts
```

---

## 📂 Test Structure

```
src/__tests__/
├── setup.ts                    # Global test setup
├── mocks/
│   ├── prisma.ts              # Prisma mock
│   ├── s3.ts                  # AWS S3 mock
│   └── fashn.ts               # FASHN AI mock
├── fixtures/
│   └── mockData.ts            # Test data fixtures
└── api/
    ├── auth/
    │   ├── register.test.ts   # User registration tests
    │   └── login.test.ts      # User login tests
    ├── seller/
    │   └── products.test.ts   # Product management tests
    └── tryon.test.ts          # Virtual Try-On tests
```

---

## 🎯 Test Coverage Goals

### Current Coverage Areas

#### 1. **Authentication APIs** ✅
- ✅ User Registration (`/api/auth/register`)
  - Valid registration
  - Email validation
  - Password validation
  - Duplicate email handling
  - Database connection errors
  - JWT token creation failures

- ✅ User Login (`/api/auth/login`)
  - Valid credentials
  - Invalid credentials
  - Missing fields
  - Cookie handling
  - Shop association for sellers

#### 2. **Product Management APIs** ✅
- ✅ Get Seller Products (`GET /api/seller/products`)
  - Pagination
  - Authorization checks
  - Role-based access
  - Empty shop handling

- ✅ Create Product (`POST /api/seller/products`)
  - File upload with S3 mocking
  - Category creation
  - Validation errors
  - S3 rollback on failure
  - Image processing

#### 3. **Virtual Try-On APIs** ✅
- ✅ Submit Try-On Job (`POST /api/tryon`)
  - Person image upload
  - Virtual model usage
  - FASHN API integration
  - Error handling (timeout, API errors)
  - Rate limiting
  - Authentication errors

### Missing Coverage (TODO)
- ❌ Shop Management APIs
- ❌ Token Purchase APIs
- ❌ Order Management APIs
- ❌ Review APIs
- ❌ Admin APIs

---

## 🔧 Mock Architecture

### 1. **Prisma Mock**
```typescript
import { prismaMock } from '@/__tests__/mocks/prisma';

// In your test:
prismaMock.user.findUnique.mockResolvedValue(mockUser);
```

### 2. **S3 Mock**
```typescript
import { mockUploadToS3, resetS3Mocks } from '@/__tests__/mocks/s3';

beforeEach(() => {
  resetS3Mocks();
});

// Mock successful upload
mockUploadToS3.mockResolvedValue('https://s3.amazonaws.com/file.jpg');
```

### 3. **FASHN Mock**
```typescript
import { mockFashnRun, mockFashnStatus } from '@/__tests__/mocks/fashn';

// Mock successful prediction
mockFashnRun.mockResolvedValue({ id: 'pred_123' });
mockFashnStatus.mockResolvedValue({
  status: 'completed',
  output: ['image1.jpg'],
});
```

---

## ✍️ Writing New Tests

### Test Template
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/your-endpoint/route';
import { prismaMock } from '@/__tests__/mocks/prisma';

describe('GET /api/your-endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something successfully', async () => {
    // Arrange: Set up mocks
    prismaMock.model.findMany.mockResolvedValue([]);

    // Act: Make request
    const request = new Request('http://localhost:3000/api/your-endpoint');
    const response = await GET(request);
    const data = await response.json();

    // Assert: Check response
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should handle errors', async () => {
    // Arrange: Mock error
    prismaMock.model.findMany.mockRejectedValue(new Error('DB Error'));

    // Act
    const request = new Request('http://localhost:3000/api/your-endpoint');
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
```

---

## 📊 Understanding Test Results

### Successful Test Output
```
✓ src/__tests__/api/auth/login.test.ts (10 tests) 234ms
  ✓ POST /api/auth/login (10 tests) 234ms
    ✓ should successfully login with valid credentials
    ✓ should set httpOnly cookie on successful login
    ✓ should return 400 if email or password is missing
    ...
```

### Failed Test Output
```
❌ src/__tests__/api/auth/login.test.ts > POST /api/auth/login > should login
  AssertionError: expected 500 to equal 200
  
  Expected: 200
  Received: 500
```

### Coverage Report
```
File                                | % Stmts | % Branch | % Funcs | % Lines
------------------------------------|---------|----------|---------|--------
src/app/api/auth/login/route.ts    |   95.00 |    85.71 |  100.00 |   95.00
src/app/api/auth/register/route.ts |   92.31 |    80.00 |  100.00 |   92.31
```

---

## 🐛 Debugging Tests

### Enable Verbose Logging
```bash
npm test -- --reporter=verbose
```

### Debug Single Test
```typescript
it.only('should debug this test', async () => {
  console.log('Debug info here');
  // test code
});
```

### Use VSCode Debugger
1. Set breakpoint in test file
2. Run test with debugger attached
3. Use VSCode's Debug Console

---

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

---

## 📝 Best Practices

### 1. **Always Mock External Services**
- Never make real database calls in tests
- Never make real S3 uploads
- Never call external APIs

### 2. **Test Both Success and Failure Cases**
```typescript
it('should succeed when valid', async () => { /* ... */ });
it('should fail when invalid', async () => { /* ... */ });
```

### 3. **Use Descriptive Test Names**
```typescript
// ❌ Bad
it('test 1', () => {});

// ✅ Good
it('should return 401 when user is not authenticated', () => {});
```

### 4. **Clean Up After Tests**
```typescript
beforeEach(() => {
  vi.clearAllMocks();
  resetS3Mocks();
});
```

### 5. **Test Edge Cases**
- Empty inputs
- Null values
- Large numbers
- Special characters
- Timeout scenarios

---

## 🎓 Next Steps

1. **Run the existing tests**: `npm test`
2. **Review test coverage**: `npm run test:coverage`
3. **Add missing tests** for:
   - Shop Management
   - Token Purchase
   - Order APIs
   - Review APIs
4. **Set up CI/CD** to run tests automatically
5. **Maintain 80%+ coverage** as the codebase grows

---

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

**Note**: The default test data uses passwords like 'password123'. These are bcrypt-hashed in fixtures. For real usage, always use strong passwords.
