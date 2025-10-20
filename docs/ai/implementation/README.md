---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide - AIStyleHub

## Development Setup

### Prerequisites
- **Node.js:** v18 or higher
- **npm:** v9 or higher
- **Git:** Latest version
- **Code Editor:** VS Code recommended
- **OpenAI API Key:** With billing enabled and credits

### Initial Setup Steps

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/aistylehub.git
cd aistylehub
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create `.env.local` file in project root:
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# OpenAI API
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Optional: For production
# DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

4. **Initialize database:**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. **Start development server:**
```bash
npm run dev
```

6. **Open browser:**
Navigate to `http://localhost:3000`

### Verify Setup
- Homepage loads correctly
- Database contains mock data (check with `npx prisma studio`)
- Environment variables are set (check with health endpoint)
- OpenAI API key is valid (test with try-on feature)

## Code Structure

### Directory Organization

```
tryonstylehub/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Mock data seeder
├── public/
│   ├── uploads/               # Generated images (gitignored)
│   ├── garments/              # Sample clothing images
│   └── models/                # Sample model images
├── src/
│   ├── app/
│   │   ├── api/               # API route handlers
│   │   │   ├── tryon/
│   │   │   │   └── route.ts
│   │   │   ├── generate-image/
│   │   │   │   └── route.ts
│   │   │   ├── recommend/
│   │   │   │   └── route.ts
│   │   │   ├── products/
│   │   │   │   └── route.ts
│   │   │   └── health/
│   │   │       └── route.ts
│   │   ├── components/        # React components
│   │   │   ├── ui/            # Reusable UI components
│   │   │   ├── TryOn.tsx
│   │   │   ├── ImageEditor.tsx
│   │   │   ├── StyleRecommender.tsx
│   │   │   └── ProductCard.tsx
│   │   ├── dashboard/         # Dashboard page
│   │   ├── generate-image/    # Image generation page
│   │   ├── recommend/         # Recommendations page
│   │   ├── products/          # Products catalog page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── lib/
│   │   ├── openai.ts          # OpenAI API integration
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── cache.ts           # Caching utilities
│   │   ├── cost-optimizer.ts  # Cost tracking
│   │   └── utils/             # Utility functions
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── middleware.ts          # Next.js middleware
├── .env.local                 # Environment variables (gitignored)
├── .gitignore
├── next.config.ts             # Next.js configuration
├── package.json
├── tsconfig.json              # TypeScript configuration
└── tailwind.config.js         # Tailwind CSS configuration
```

### Module Organization

**API Routes (`src/app/api/`):**
- Each feature has its own route folder
- `route.ts` exports POST, GET, or other HTTP method handlers
- Keep business logic in separate lib functions
- Handle validation, rate limiting, caching at route level

**Components (`src/app/components/`):**
- UI components in `ui/` subfolder (Button, Card, Input, etc.)
- Feature components at root level (TryOn, ImageEditor, etc.)
- Use TypeScript interfaces for all props
- Keep components focused and single-responsibility

**Libraries (`src/lib/`):**
- Core business logic separate from routes
- Reusable functions that can be tested independently
- Singleton pattern for clients (Prisma, OpenAI)
- Utilities organized by concern (image, cache, validation)

### Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g., `TryOn.tsx`)
- Utilities: `kebab-case.ts` (e.g., `cost-optimizer.ts`)
- API routes: `route.ts` (Next.js convention)
- Types: `index.ts` or feature-specific (e.g., `product.types.ts`)

**Variables:**
- `camelCase` for variables and functions
- `PascalCase` for React components and types
- `UPPER_SNAKE_CASE` for constants
- Descriptive names (e.g., `generatedPrompt`, not `gp`)

**Functions:**
- Verbs for actions: `generateImage()`, `fetchProducts()`
- Boolean functions: `isValid()`, `hasPermission()`
- Event handlers: `handleSubmit()`, `onImageUpload()`
- Async functions: Always use `async/await`, not callbacks

## Implementation Notes

### Core Features

#### 1. Virtual Try-On (`/api/tryon`)

**Flow:**
1. Client uploads person image + clothing image (base64)
2. Server validates inputs (size, format)
3. Check cache for existing result
4. If miss, call GPT-4 Vision to analyze images
5. GPT-4 Vision generates detailed prompt
6. Call DALL-E 3 with prompt to generate try-on image
7. Download result from OpenAI
8. Save to `/public/uploads/`
9. Cache result for 1 hour
10. Return local URL to client

**Key Implementation Details:**
```typescript
// src/lib/openai.ts
export async function analyzeImagesForTryOn(
  personImageBase64: string,
  clothingImageBase64: string,
  userPrompt?: string
): Promise<string> {
  const messages = [
    {
      role: "system",
      content: "You are a fashion AI assistant. Generate a detailed prompt for DALL-E..."
    },
    {
      role: "user",
      content: [
        { type: "text", text: userPrompt || "Create try-on prompt..." },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${personImageBase64}` }},
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${clothingImageBase64}` }}
      ]
    }
  ];
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 500
  });
  
  return response.choices[0].message.content;
}
```

**Optimization Tips:**
- Use 'standard' quality for development ($0.04 vs $0.08)
- Cache aggressively (SHA-256 hash of images + prompt)
- Compress images before sending to OpenAI
- Set reasonable timeouts (60s max)

#### 2. Image Editing (`/api/generate-image`)

**Two Modes:**

**Mode A: Edit with Mask (DALL-E 2)**
- User provides: image + mask + prompt
- Mask defines transparent area to edit
- DALL-E 2 fills masked area based on prompt
- Useful for: changing specific parts (color, pattern)

**Mode B: Generate New (DALL-E 3)**
- User provides: image + prompt (no mask)
- DALL-E 3 generates new image based on prompt
- Useful for: style transfer, background changes

**Implementation:**
```typescript
// src/lib/openai.ts
export async function editImageWithMask(
  imageBuffer: Buffer,
  maskBuffer: Buffer,
  prompt: string,
  size: "1024x1024"
): Promise<string> {
  const imageFile = new File([imageBuffer], "image.png");
  const maskFile = new File([maskBuffer], "mask.png");
  
  const response = await openai.images.edit({
    model: "dall-e-2",
    image: imageFile,
    mask: maskFile,
    prompt,
    size,
    n: 1
  });
  
  return response.data[0].url;
}
```

#### 3. AI Recommendations (`/api/recommend`)

**Flow:**
1. Client sends style description (text)
2. Server fetches all products from database
3. Prepare product catalog (id, name, type, styleTags, price, shop)
4. Call GPT-4o with system prompt + style + catalog
5. GPT-4o returns JSON with recommended product IDs
6. Parse response and validate IDs exist
7. Create Outfit record in database
8. Return outfit with full product details

**Key Implementation:**
```typescript
// src/lib/openai.ts
export async function getRecommendedProductIds(
  style: string,
  products: CatalogProduct[],
  maxItems = 5
) {
  const systemPrompt = `You are a fashion stylist. Recommend cohesive outfits. 
    Return JSON: { "productIds": [1, 2, 3] }`;
  
  const userPrompt = `Style: ${style}\nCatalog: ${JSON.stringify(products)}`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });
  
  const parsed = JSON.parse(response.choices[0].message.content);
  return parsed.productIds;
}
```

**Optimization Tips:**
- Use GPT-4o-mini instead of GPT-4o ($0.15 vs $5 per 1M tokens)
- Limit catalog size (pagination or filtering)
- Cache recommendations by style description
- Validate all returned IDs exist in database

### Patterns & Best Practices

#### Singleton Pattern (OpenAI Client)
```typescript
// src/lib/openai.ts
const openaiSingleton = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey });
};

const globalForOpenAI = globalThis as unknown as { openai?: OpenAI };
export const openai = globalForOpenAI.openai ?? openaiSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForOpenAI.openai = openai;
}
```

**Why:** Prevents creating multiple OpenAI instances, improves performance

#### Request Validation with Zod
```typescript
// src/app/api/tryon/route.ts
import { z } from "zod";

const tryOnSchema = z.object({
  personImage: z.string().min(100),
  clothingImage: z.string().min(100),
  prompt: z.string().optional(),
  quality: z.enum(['standard', 'hd']).default('standard')
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = tryOnSchema.safeParse(body);
  
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  
  const { personImage, clothingImage, prompt, quality } = parsed.data;
  // ... continue processing
}
```

**Why:** Type-safe validation, clear error messages, prevents invalid data

#### Error Handling Wrapper
```typescript
// src/lib/utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);
  
  if (error instanceof AppError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof Error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
  
  return Response.json(
    { error: "An unexpected error occurred" },
    { status: 500 }
  );
}
```

**Usage:**
```typescript
try {
  // ... API logic
} catch (error) {
  return handleApiError(error);
}
```

#### Caching Strategy
```typescript
// src/lib/cache.ts
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs
  });
}

export function clearCache(): void {
  cache.clear();
}
```

**Usage:**
```typescript
const cacheKey = `tryon:${hash}`;
const cached = getCache<TryOnResponse>(cacheKey);

if (cached) {
  return Response.json({ ...cached, cached: true });
}

// ... generate result
setCache(cacheKey, result, 3600000); // 1 hour
```

## Integration Points

### OpenAI API Integration

**Configuration:**
```typescript
// Environment: .env.local
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Client Setup:**
```typescript
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
```

**Rate Limits:**
- GPT-4 Vision: 500 requests/day (Tier 1)
- DALL-E 3: 50 images/minute (Tier 1)
- DALL-E 2: 50 images/minute (Tier 1)

**Error Handling:**
```typescript
try {
  const response = await openai.chat.completions.create({...});
} catch (error) {
  if (error.status === 429) {
    throw new AppError("Rate limit exceeded. Please try again later.", 429);
  }
  if (error.status === 400) {
    throw new AppError("Invalid request to OpenAI", 400);
  }
  throw new AppError("OpenAI API error", 503);
}
```

### Database Integration (Prisma)

**Client:**
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Queries:**
```typescript
// Fetch all products
const products = await prisma.product.findMany({
  include: { shop: true }
});

// Create outfit
const outfit = await prisma.outfit.create({
  data: {
    style: "casual beach",
    products: { 
      connect: [{ id: 1 }, { id: 2 }, { id: 3 }] 
    }
  },
  include: { 
    products: { include: { shop: true } } 
  }
});
```

**Migrations:**
```bash
# Create migration
npx prisma migrate dev --name add_user_table

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

### File Storage

**Location:** `/public/uploads/`

**Save Images:**
```typescript
// src/lib/utils/image.ts
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export async function persistImage(
  buffer: Buffer,
  mimeType: string,
  prefix = ""
): Promise<string> {
  const extension = mimeType.includes("jpeg") ? "jpg" : "png";
  const fileName = `${prefix}-${randomUUID()}.${extension}`;
  
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  
  const filePath = path.join(uploadsDir, fileName);
  await fs.writeFile(filePath, buffer);
  
  return `/uploads/${fileName}`;
}
```

**Cleanup:** Add cron job or manual cleanup for old files

## Error Handling

### Strategy

1. **Validation Errors (400):** Input validation failures
2. **Rate Limit Errors (429):** Too many requests
3. **Server Errors (500):** Unexpected failures
4. **Service Unavailable (503):** OpenAI API down

### Implementation

**API Route Error Handling:**
```typescript
export async function POST(req: Request) {
  try {
    // Validate input
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    
    // Process request
    const result = await processRequest(parsed.data);
    
    return Response.json(result);
  } catch (error) {
    console.error("[API Error]:", error);
    
    if (error instanceof AppError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Frontend Error Handling:**
```typescript
try {
  const response = await fetch('/api/tryon', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  
  const result = await response.json();
  // ... handle success
} catch (error) {
  console.error('Try-on failed:', error);
  toast.error(error.message || 'An error occurred');
}
```

### Logging

**Format:**
```typescript
console.log('[TryOn] Processing request...');
console.error('[TryOn] Error:', error);
console.info('[TryOn] Cache hit:', cacheKey);
```

**Production:** Consider using structured logging (Pino, Winston) or error tracking (Sentry)

## Performance Considerations

### Optimization Strategies

1. **Image Optimization:**
   - Compress images before uploading
   - Use Next.js Image component for display
   - Lazy load images

2. **Caching:**
   - Cache API responses (1 hour TTL)
   - Cache database queries (Prisma caching)
   - Client-side caching with localStorage

3. **Code Splitting:**
   - Use dynamic imports for heavy components
   - Split routes into separate chunks

4. **Database Optimization:**
   - Index frequently queried fields
   - Use `select` to fetch only needed fields
   - Implement pagination for large datasets

### Caching Implementation

**Server-Side:**
```typescript
const cacheKey = `${feature}:${hashInput(data)}`;
const cached = getCache(cacheKey);

if (cached) {
  return Response.json({ ...cached, cached: true });
}

const result = await generateResult(data);
setCache(cacheKey, result, 3600000); // 1 hour
```

**Client-Side:**
```typescript
const CACHE_KEY = 'product-catalog';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedProducts() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_TTL) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
  
  return data;
}
```

### Query Optimization

**Use `select` for specific fields:**
```typescript
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    imageUrl: true,
    price: true
  }
});
```

**Add indexes:**
```prisma
model Product {
  // ...
  @@index([type])
  @@index([shopId])
}
```

## Security Notes

### API Key Security

**✅ DO:**
- Store API keys in environment variables
- Never commit `.env.local` to Git
- Use server-side API routes (not client-side)
- Rotate keys periodically

**❌ DON'T:**
- Expose keys in client-side code
- Log keys in console
- Store keys in database
- Share keys in chat/email

### Input Validation

**Always validate:**
```typescript
// File size
if (buffer.length > 5 * 1024 * 1024) {
  throw new AppError("File too large (max 5MB)", 400);
}

// File type
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(mimeType)) {
  throw new AppError("Invalid file type", 400);
}

// Input length
if (prompt.length > 1000) {
  throw new AppError("Prompt too long (max 1000 chars)", 400);
}
```

### Rate Limiting

**Implementation:**
```typescript
// src/lib/utils/rate-limit.ts
export function withRateLimit(
  handler: (req: Request) => Promise<Response>,
  config: { maxRequests: number; interval: number }
) {
  return async (req: Request) => {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const { allowed, remaining } = checkRateLimit(ip, config);
    
    if (!allowed) {
      return Response.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }
    
    return handler(req);
  };
}
```

### Content Security

**OpenAI Moderation:**
- OpenAI has built-in NSFW content filtering
- Images that violate policy are rejected automatically
- Additional moderation can be added if needed

**CORS Configuration:**
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, GET, OPTIONS' }
        ]
      }
    ];
  }
};
```

## Related Documents
- [Requirements](../requirements/README.md)
- [Design & Architecture](../design/README.md)
- [Testing Strategy](../testing/README.md)
- [Deployment Guide](../deployment/README.md)
