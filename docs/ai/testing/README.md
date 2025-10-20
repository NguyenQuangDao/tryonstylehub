---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy - AIStyleHub

## Test Coverage Goals

### Target Coverage
- **Unit Tests:** 100% of new/changed utility functions and helpers
- **Integration Tests:** All API endpoints and critical paths
- **End-to-End Tests:** Key user journeys (try-on, recommend, edit)
- **Manual Tests:** UI/UX, accessibility, browser compatibility

### Coverage Tracking
```bash
# Run tests with coverage report
npm run test -- --coverage

# View coverage in browser
open coverage/index.html
```

### Current Coverage Status
| Module | Coverage | Status |
|--------|----------|--------|
| `/src/lib/openai.ts` | 85% | 🟡 Needs improvement |
| `/src/lib/cache.ts` | 100% | ✅ Complete |
| `/src/lib/utils/image.ts` | 100% | ✅ Complete |
| `/src/lib/utils/rate-limit.ts` | 95% | ✅ Complete |
| `/src/app/api/tryon/route.ts` | 75% | 🟡 Needs improvement |
| `/src/app/api/recommend/route.ts` | 80% | 🟡 Needs improvement |
| `/src/app/components/TryOn.tsx` | 70% | 🟡 Needs improvement |

## Unit Tests

### lib/cache.ts
**Purpose:** Test caching functionality

- [x] **Test:** Cache stores and retrieves data correctly
  ```typescript
  test('should store and retrieve cached data', () => {
    setCache('test-key', { data: 'value' }, 1000);
    const result = getCache('test-key');
    expect(result).toEqual({ data: 'value' });
  });
  ```

- [x] **Test:** Cache expires after TTL
  ```typescript
  test('should return null for expired cache', async () => {
    setCache('test-key', { data: 'value' }, 100);
    await new Promise(resolve => setTimeout(resolve, 150));
    const result = getCache('test-key');
    expect(result).toBeNull();
  });
  ```

- [x] **Test:** Cache returns null for non-existent keys
  ```typescript
  test('should return null for non-existent key', () => {
    const result = getCache('non-existent');
    expect(result).toBeNull();
  });
  ```

- [x] **Test:** clearCache removes all entries
  ```typescript
  test('should clear all cache entries', () => {
    setCache('key1', 'value1', 1000);
    setCache('key2', 'value2', 1000);
    clearCache();
    expect(getCache('key1')).toBeNull();
    expect(getCache('key2')).toBeNull();
  });
  ```

### lib/utils/image.ts
**Purpose:** Test image processing utilities

- [x] **Test:** extractBase64 handles data URLs correctly
  ```typescript
  test('should extract base64 from data URL', () => {
    const dataUrl = 'data:image/png;base64,abc123';
    const result = extractBase64(dataUrl);
    expect(result.mimeType).toBe('image/png');
    expect(result.base64).toBe('abc123');
  });
  ```

- [x] **Test:** extractBase64 handles plain base64 strings
  ```typescript
  test('should handle plain base64 string', () => {
    const base64 = 'abc123';
    const result = extractBase64(base64);
    expect(result.mimeType).toBe('image/png');
    expect(result.base64).toBe('abc123');
  });
  ```

- [x] **Test:** ensureSizeLimit throws on oversized images
  ```typescript
  test('should throw error for oversized image', () => {
    const largeBase64 = 'a'.repeat(6 * 1024 * 1024); // 6MB
    expect(() => ensureSizeLimit(largeBase64)).toThrow('vượt quá giới hạn');
  });
  ```

- [x] **Test:** ensureSizeLimit accepts valid sizes
  ```typescript
  test('should accept image within size limit', () => {
    const smallBase64 = 'a'.repeat(1024); // 1KB
    expect(() => ensureSizeLimit(smallBase64)).not.toThrow();
  });
  ```

- [ ] **Test:** persistImage saves file correctly
  ```typescript
  test('should save image to uploads directory', async () => {
    const buffer = Buffer.from('fake-image-data');
    const url = await persistImage(buffer, 'image/png', 'test');
    expect(url).toMatch(/^\/uploads\/test-[a-f0-9-]+\.png$/);
    // Cleanup: delete test file
  });
  ```

### lib/utils/rate-limit.ts
**Purpose:** Test rate limiting logic

- [x] **Test:** Allows requests within limit
  ```typescript
  test('should allow requests within rate limit', () => {
    const req = createMockRequest('192.168.1.1');
    const result = checkRateLimit(req, { maxRequests: 5, interval: 60000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });
  ```

- [x] **Test:** Blocks requests exceeding limit
  ```typescript
  test('should block requests exceeding rate limit', () => {
    const req = createMockRequest('192.168.1.1');
    const config = { maxRequests: 2, interval: 60000 };
    
    checkRateLimit(req, config); // 1st request
    checkRateLimit(req, config); // 2nd request
    const result = checkRateLimit(req, config); // 3rd request
    
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
  ```

- [x] **Test:** Resets limit after interval expires
  ```typescript
  test('should reset limit after interval', async () => {
    const req = createMockRequest('192.168.1.1');
    const config = { maxRequests: 2, interval: 100 };
    
    checkRateLimit(req, config); // 1st
    checkRateLimit(req, config); // 2nd (at limit)
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const result = checkRateLimit(req, config);
    expect(result.allowed).toBe(true);
  });
  ```

### lib/openai.ts
**Purpose:** Test OpenAI API wrapper functions

- [ ] **Test:** analyzeImagesForTryOn returns valid prompt
  ```typescript
  test('should generate try-on prompt from images', async () => {
    const personBase64 = 'fake-person-image';
    const clothingBase64 = 'fake-clothing-image';
    
    const prompt = await analyzeImagesForTryOn(personBase64, clothingBase64);
    
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(10);
  });
  ```
  **Note:** Mock OpenAI API in tests

- [ ] **Test:** generateImageWithDALLE returns image URL
  ```typescript
  test('should generate image with DALL-E', async () => {
    const prompt = 'A person wearing a red shirt';
    const result = await generateImageWithDALLE(prompt);
    
    expect(result.url).toMatch(/^https:\/\//);
    expect(result.revisedPrompt).toBeDefined();
  });
  ```
  **Note:** Mock OpenAI API in tests

## Integration Tests

### POST /api/tryon
**Purpose:** Test virtual try-on endpoint

- [ ] **Test:** Successfully generates try-on image with valid inputs
  ```typescript
  test('POST /api/tryon - success case', async () => {
    const response = await fetch('/api/tryon', {
      method: 'POST',
      body: JSON.stringify({
        personImage: validPersonImageBase64,
        clothingImage: validClothingImageBase64,
        quality: 'standard'
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.imageUrl).toMatch(/^\/uploads\//);
    expect(data.generatedPrompt).toBeDefined();
  });
  ```

- [ ] **Test:** Returns 400 for invalid inputs
  ```typescript
  test('POST /api/tryon - invalid input', async () => {
    const response = await fetch('/api/tryon', {
      method: 'POST',
      body: JSON.stringify({
        personImage: 'invalid',
        clothingImage: 'invalid'
      })
    });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });
  ```

- [ ] **Test:** Returns 429 when rate limit exceeded
  ```typescript
  test('POST /api/tryon - rate limit', async () => {
    // Make 6 requests quickly (limit is 5/min)
    const requests = Array(6).fill(null).map(() =>
      fetch('/api/tryon', {
        method: 'POST',
        body: JSON.stringify(validTryOnData)
      })
    );
    
    const responses = await Promise.all(requests);
    const lastResponse = responses[responses.length - 1];
    
    expect(lastResponse.status).toBe(429);
  });
  ```

- [x] **Test:** Returns cached result for duplicate requests
  ```typescript
  test('POST /api/tryon - cache hit', async () => {
    const data = {
      personImage: validPersonImageBase64,
      clothingImage: validClothingImageBase64
    };
    
    // First request
    const response1 = await fetch('/api/tryon', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const result1 = await response1.json();
    
    // Second request (should hit cache)
    const response2 = await fetch('/api/tryon', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const result2 = await response2.json();
    
    expect(result2.cached).toBe(true);
    expect(result2.imageUrl).toBe(result1.imageUrl);
  });
  ```

### POST /api/generate-image
**Purpose:** Test image editing endpoint

- [ ] **Test:** Edit mode with mask works correctly
  ```typescript
  test('POST /api/generate-image - edit mode', async () => {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      body: JSON.stringify({
        image: validImageBase64,
        mask: validMaskBase64,
        prompt: 'Change shirt to blue',
        mode: 'edit'
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.imageUrl).toBeDefined();
    expect(data.mode).toBe('edit');
  });
  ```

- [ ] **Test:** Generate mode without mask works correctly
  ```typescript
  test('POST /api/generate-image - generate mode', async () => {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      body: JSON.stringify({
        image: validImageBase64,
        prompt: 'Tropical beach background',
        mode: 'generate',
        quality: 'hd'
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.imageUrl).toBeDefined();
    expect(data.mode).toBe('generate');
  });
  ```

### POST /api/recommend
**Purpose:** Test outfit recommendation endpoint

- [ ] **Test:** Returns valid outfit recommendations
  ```typescript
  test('POST /api/recommend - success', async () => {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      body: JSON.stringify({
        style: 'casual summer beach'
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.outfit).toBeDefined();
    expect(data.outfit.products.length).toBeGreaterThan(0);
    expect(data.outfit.products[0].shop).toBeDefined();
  });
  ```

- [ ] **Test:** Handles empty product catalog gracefully
  ```typescript
  test('POST /api/recommend - empty catalog', async () => {
    // Clear database or use isolated test DB
    await prisma.product.deleteMany();
    
    const response = await fetch('/api/recommend', {
      method: 'POST',
      body: JSON.stringify({
        style: 'formal business'
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.outfit.products.length).toBe(0);
  });
  ```

### GET /api/products
**Purpose:** Test product catalog endpoint

- [x] **Test:** Returns all products without filters
  ```typescript
  test('GET /api/products - no filters', async () => {
    const response = await fetch('/api/products');
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.total).toBeGreaterThan(0);
  });
  ```

- [ ] **Test:** Filters by product type
  ```typescript
  test('GET /api/products - filter by type', async () => {
    const response = await fetch('/api/products?type=top');
    
    const data = await response.json();
    expect(data.products.every(p => p.type === 'top')).toBe(true);
  });
  ```

## End-to-End Tests

### User Flow 1: Virtual Try-On
**Scenario:** User uploads images and generates try-on result

- [ ] **Step 1:** Navigate to try-on page
- [ ] **Step 2:** Upload person photo
- [ ] **Step 3:** Verify preview displays
- [ ] **Step 4:** Upload clothing image
- [ ] **Step 5:** Verify preview displays
- [ ] **Step 6:** Click "Try On" button
- [ ] **Step 7:** Wait for loading spinner (15-30s)
- [ ] **Step 8:** Verify result image displays
- [ ] **Step 9:** Verify generated prompt shows
- [ ] **Step 10:** Verify can download result

### User Flow 2: Style Recommendations
**Scenario:** User gets outfit recommendations

- [ ] **Step 1:** Navigate to recommend page
- [ ] **Step 2:** Enter style description
- [ ] **Step 3:** Click "Get Recommendations"
- [ ] **Step 4:** Wait for results (2-5s)
- [ ] **Step 5:** Verify products display in grid
- [ ] **Step 6:** Verify each product has image, name, price
- [ ] **Step 7:** Click shop link
- [ ] **Step 8:** Verify opens seller website in new tab

### User Flow 3: Image Editing
**Scenario:** User edits image with AI

- [ ] **Step 1:** Navigate to image editor page
- [ ] **Step 2:** Upload image to edit
- [ ] **Step 3:** Enter edit prompt
- [ ] **Step 4:** Select edit mode
- [ ] **Step 5:** Click "Generate"
- [ ] **Step 6:** Wait for result (5-20s)
- [ ] **Step 7:** Verify edited image displays
- [ ] **Step 8:** Verify can make additional edits

## Test Data

### Mock Images
**Location:** `/public/test-data/`

- `person-1.jpg` - Male model, front view, neutral background
- `person-2.jpg` - Female model, front view, neutral background
- `clothing-shirt-1.png` - Red t-shirt, transparent background
- `clothing-dress-1.png` - Summer dress, white background
- `mask-shirt.png` - Mask for shirt area

### Mock Products
**Seed data in:** `prisma/seed.ts`

- 20 tops (t-shirts, blouses, sweaters)
- 15 bottoms (jeans, skirts, shorts)
- 10 dresses
- 10 shoes
- 10 accessories

### Test Style Descriptions
```typescript
const testStyles = [
  'casual summer beach',
  'formal business meeting',
  'streetwear urban cool',
  'elegant evening party',
  'athletic gym workout'
];
```

## Test Reporting & Coverage

### Running Tests
```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm run test src/lib/cache.test.ts

# E2E tests (if using Playwright)
npm run test:e2e
```

### Coverage Thresholds
**Target in `vitest.config.ts`:**
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
});
```

### Coverage Gaps
**Files below 100% and rationale:**

1. `/src/lib/openai.ts` (85%)
   - **Gap:** Error handling paths for rare OpenAI errors
   - **Rationale:** Difficult to test without mocking all OpenAI responses
   - **Plan:** Add mocks in Phase 2

2. `/src/app/api/tryon/route.ts` (75%)
   - **Gap:** Timeout and network failure scenarios
   - **Rationale:** Requires complex async mocking
   - **Plan:** Manual testing during integration phase

## Manual Testing

### UI/UX Testing Checklist

#### General
- [ ] All buttons have hover states
- [ ] Loading spinners show during async operations
- [ ] Error messages are clear and actionable
- [ ] Success feedback is visible
- [ ] Navigation works correctly
- [ ] Footer links work

#### Try-On Page
- [ ] File upload button works
- [ ] Image preview displays correctly
- [ ] Drag-and-drop upload works
- [ ] Clear/remove image works
- [ ] Submit button disabled until both images uploaded
- [ ] Loading state shows progress
- [ ] Result image displays full size
- [ ] Generated prompt is readable
- [ ] Download button works

#### Recommend Page
- [ ] Textarea accepts input
- [ ] Character count shows (if implemented)
- [ ] Submit button enabled when text entered
- [ ] Loading state shows
- [ ] Product grid layout is responsive
- [ ] Product cards show all info (image, name, price, shop)
- [ ] Shop links open in new tab

#### Products Page
- [ ] Grid displays all products
- [ ] Filters work correctly
- [ ] Pagination works (if implemented)
- [ ] Images load lazily
- [ ] Product details are readable

### Browser Compatibility

#### Desktop
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

#### Mobile
- [ ] iOS Safari
- [ ] Chrome Android
- [ ] Samsung Internet

#### Tablet
- [ ] iPad Safari
- [ ] Android Chrome

### Accessibility Testing

- [ ] Keyboard navigation works for all interactive elements
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Screen reader announces page changes
- [ ] Images have alt text
- [ ] Form labels are associated correctly
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] ARIA labels for dynamic content
- [ ] Loading states announced to screen readers

### Performance Testing

#### Load Testing
- [ ] 10 concurrent users - Response time < 30s
- [ ] 50 concurrent users - Response time < 45s
- [ ] 100 concurrent users - Rate limiting active

#### Stress Testing
- [ ] Large images (4-5MB) - Processes successfully
- [ ] Many products (100+) - Page loads < 3s
- [ ] Rapid requests - Rate limiter works

#### Performance Benchmarks
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1

## Bug Tracking

### Issue Categories
1. **Critical:** Blocks core functionality
2. **High:** Significant impact on user experience
3. **Medium:** Affects some features or workflows
4. **Low:** Minor visual or text issues

### Regression Testing
**When to run:**
- Before each deployment
- After bug fixes
- After dependency updates

**Test cases:**
- All core features (try-on, recommend, edit)
- Previous bug scenarios
- Edge cases and error handling

## Related Documents
- [Requirements](../requirements/README.md)
- [Design & Architecture](../design/README.md)
- [Implementation Guide](../implementation/README.md)
- [Deployment Guide](../deployment/README.md)
