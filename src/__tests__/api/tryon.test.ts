import Fashn from 'fashn';
import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
const mockRun = vi.fn();
const mockStatus = vi.fn();

vi.mock('fashn', () => {
  return {
    default: class FashnMock {
      predictions = {
        run: mockRun,
        status: mockStatus
      };
      
      static APIError = class APIError extends Error {
        status: number;
        cause: any;
        constructor(status: number, message: string, cause?: any) {
          super(message);
          this.status = status;
          this.cause = cause;
          this.name = 'APIError';
        }
      }
    }
  };
});

vi.mock('../../lib/prisma', () => ({
  prisma: {
    virtualModel: {
      findUnique: vi.fn(),
    }
  }
}))

vi.mock('../../lib/s3', () => ({
  getPresignedUrl: vi.fn(),
  uploadToS3: vi.fn(),
  generateS3Key: vi.fn(),
  getJSON: vi.fn(),
  putJSON: vi.fn(),
}))

vi.mock('../../lib/auth', () => ({
  verifyToken: vi.fn()
}))

vi.mock('../../lib/token-middleware', () => ({
  requireTokens: vi.fn(),
  createInsufficientTokensResponse: vi.fn(),
  chargeTokens: vi.fn(),
}))

vi.mock('../../config/tokens', () => ({
  TOKEN_CONFIG: {
    COSTS: {
      TRY_ON_HIGH: { amount: 10 },
      TRY_ON_STANDARD: { amount: 5 },
    }
  }
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'test-token' })
  })
}))

// Mock fetch for image downloading
global.fetch = vi.fn()

// IMPORTANT: Import POST after mocks because Next.js API routes might read env vars at import time
// But in this specific route file, process.env.FASHN_API_KEY is read at top level
// So we need to ensure process.env is set BEFORE importing the route
process.env.FASHN_API_KEY = 'test-api-key';

import { POST } from '../../app/api/tryon/route';

describe('POST /api/tryon', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup environment variables
    process.env.FASHN_API_KEY = 'test-api-key';
  })

  afterEach(() => {
    vi.resetAllMocks();
  })

  it('should return 400 if required images are missing', async () => {
    const formData = new FormData();
    // Empty form data
    const req = new NextRequest('http://localhost:3000/api/tryon', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    
    // Debug output if it fails again
    if (res.status !== 400) {
      const data = await res.json();
      console.log('Test 1 failed with status', res.status, 'Body:', data);
    }

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  })

  it('should return 401 if user has insufficient tokens', async () => {
    const formData = new FormData();
    formData.append('personImage', new File([''], 'person.jpg', { type: 'image/jpeg' }));
    formData.append('garmentImage', new File([''], 'garment.jpg', { type: 'image/jpeg' }));
    
    const req = new NextRequest('http://localhost:3000/api/tryon', {
      method: 'POST',
      body: formData,
    });

    const { requireTokens, createInsufficientTokensResponse } = await import('../../lib/token-middleware');
    vi.mocked(requireTokens).mockResolvedValue({
      success: false,
      insufficientTokens: true,
      currentBalance: 0,
      error: 'Insufficient tokens'
    });
    
    // Fix linter error by providing full object structure if needed, or using as any if type mismatch is complex
    vi.mocked(createInsufficientTokensResponse).mockReturnValue(
      NextResponse.json({ 
        error: 'Insufficient tokens',
        insufficientTokens: true,
        details: { required: 10, current: 0, deficit: 10, operation: 'test', message: 'test' }
      }, { status: 402 }) as any
    );

    const res = await POST(req);
    expect(res.status).toBe(402);
  })

  it('should handle Fashn API errors gracefully', async () => {
    const formData = new FormData();
    formData.append('personImage', new File([''], 'person.jpg', { type: 'image/jpeg' }));
    formData.append('garmentImage', new File([''], 'garment.jpg', { type: 'image/jpeg' }));
    
    const req = new NextRequest('http://localhost:3000/api/tryon', {
      method: 'POST',
      body: formData,
    });

    // Mock token success
    const { requireTokens } = await import('../../lib/token-middleware');
    vi.mocked(requireTokens).mockResolvedValue({ success: true, userId: 'user-123' });

    // Mock Fashn error
    mockRun.mockRejectedValue(new (Fashn as any).APIError(429, 'Rate limit exceeded'));

    const res = await POST(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain('Rate limit exceeded');
  })

  it('should process successful try-on request', async () => {
    const formData = new FormData();
    formData.append('personImage', new File(['test'], 'person.jpg', { type: 'image/jpeg' }));
    formData.append('garmentImage', new File(['test'], 'garment.jpg', { type: 'image/jpeg' }));
    
    const req = new NextRequest('http://localhost:3000/api/tryon', {
      method: 'POST',
      body: formData,
    });

    // Mock token success
    const { requireTokens } = await import('../../lib/token-middleware');
    vi.mocked(requireTokens).mockResolvedValue({ success: true, userId: 'user-123' });

    // Mock Fashn success
    mockRun.mockResolvedValue({ id: 'pred-123' });
    mockStatus.mockResolvedValue({ 
      status: 'completed', 
      output: ['https://result.com/image.jpg'] 
    });

    // Mock fetch for image result
    (global.fetch as any).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(Buffer.from('fake-image')),
      headers: { get: () => 'image/jpeg' }
    });

    const res = await POST(req);
    
    // Debug if fails
    if (res.status !== 200) {
      const data = await res.json();
      console.log('Test 4 failed with status', res.status, 'Body:', data);
    }

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.images).toHaveLength(1);
    expect(data.images[0]).toBe('https://result.com/image.jpg');
  })
})
