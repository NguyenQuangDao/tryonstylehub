// Cache service for performance optimization
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

export interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export class CacheService<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      storage: options.storage || 'memory',
    };
  }

  set(key: string, value: T, ttl?: number): void {
    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.options.ttl,
    };

    // Remove oldest items if cache is full
    if (this.cache.size >= this.options.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, item);

    // Store in browser storage if configured
    if (this.options.storage !== 'memory') {
      try {
        const storage = this.options.storage === 'localStorage' 
          ? localStorage 
          : sessionStorage;
        storage.setItem(`cache_${key}`, JSON.stringify(item));
      } catch (error) {
        console.warn('Failed to store cache item:', error);
      }
    }
  }

  get(key: string): T | null {
    let item = this.cache.get(key);

    // Try to load from browser storage if not in memory
    if (!item && this.options.storage !== 'memory') {
      try {
        const storage = this.options.storage === 'localStorage' 
          ? localStorage 
          : sessionStorage;
        const stored = storage.getItem(`cache_${key}`);
        if (stored) {
          item = JSON.parse(stored);
          this.cache.set(key, item);
        }
      } catch (error) {
        console.warn('Failed to load cache item:', error);
      }
    }

    if (!item) return null;

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);

    // Remove from browser storage
    if (this.options.storage !== 'memory') {
      try {
        const storage = this.options.storage === 'localStorage' 
          ? localStorage 
          : sessionStorage;
        storage.removeItem(`cache_${key}`);
      } catch (error) {
        console.warn('Failed to remove cache item:', error);
      }
    }
  }

  clear(): void {
    this.cache.clear();

    // Clear browser storage
    if (this.options.storage !== 'memory') {
      try {
        const storage = this.options.storage === 'localStorage' 
          ? localStorage 
          : sessionStorage;
        const keys = Object.keys(storage).filter(key => key.startsWith('cache_'));
        keys.forEach(key => storage.removeItem(key));
      } catch (error) {
        console.warn('Failed to clear cache:', error);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Clean expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.delete(key);
      }
    }
  }
}

// Global cache instances
export const apiCache = new CacheService({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 50,
  storage: 'memory',
});

export const imageCache = new CacheService({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 100,
  storage: 'localStorage',
});

export const userCache = new CacheService({
  ttl: 60 * 60 * 1000, // 1 hour
  maxSize: 20,
  storage: 'localStorage',
});

// Cache utilities
export const withCache = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  cacheKey: (...args: T) => string,
  cache: CacheService<R> = apiCache,
  ttl?: number
) => {
  return async (...args: T): Promise<R> => {
    const key = cacheKey(...args);
    const cached = cache.get(key);
    
    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    cache.set(key, result, ttl);
    return result;
  };
};

// Request deduplication
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async deduplicate<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const promise = request().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// Image preloading service
export class ImagePreloader {
  private preloadedImages = new Set<string>();

  async preload(src: string): Promise<void> {
    if (this.preloadedImages.has(src)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedImages.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  async preloadBatch(srcs: string[]): Promise<void> {
    await Promise.all(srcs.map(src => this.preload(src)));
  }

  isPreloaded(src: string): boolean {
    return this.preloadedImages.has(src);
  }

  clear(): void {
    this.preloadedImages.clear();
  }
}

export const imagePreloader = new ImagePreloader();

// Performance monitoring
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();

  startTiming(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      this.metrics.get(label)!.push(duration);
      
      // Keep only last 100 measurements
      const measurements = this.metrics.get(label)!;
      if (measurements.length > 100) {
        measurements.shift();
      }
    };
  }

  getMetrics(label: string): {
    average: number;
    min: number;
    max: number;
    count: number;
  } | null {
    const measurements = this.metrics.get(label);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const sum = measurements.reduce((a, b) => a + b, 0);
    const average = sum / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return {
      average,
      min,
      max,
      count: measurements.length,
    };
  }

  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [label, measurements] of this.metrics.entries()) {
      result[label] = this.getMetrics(label);
    }
    
    return result;
  }

  clear(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();
