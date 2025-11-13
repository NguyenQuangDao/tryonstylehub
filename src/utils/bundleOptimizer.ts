// Bundle optimization utilities
export const bundleOptimizer = {
  // Dynamic imports for code splitting
  async loadComponent<T>(importFn: () => Promise<{ default: T }>): Promise<T> {
    try {
      const mod = await importFn();
      return mod.default;
    } catch (error) {
      console.error('Failed to load component:', error);
      throw error;
    }
  },

  // Preload critical components
  preloadComponents(components: Array<() => Promise<unknown>>): void {
    components.forEach(component => {
      component().catch(error => {
        console.warn('Failed to preload component:', error);
      });
    });
  },

  // Lazy load routes
  async loadRoute(routeName: string): Promise<unknown> {
    const routeMap: Record<string, () => Promise<unknown>> = {
      'dashboard': () => import('@/app/dashboard/page'),
      'products': () => import('@/app/products/page'),
      'profile': () => import('@/app/profile/page'),
      'recommend': () => import('@/app/recommend/page'),
      'generate-image': () => import('@/app/generate-image/page'),
    };

    const loader = routeMap[routeName];
    if (!loader) {
      throw new Error(`Route ${routeName} not found`);
    }

    return this.loadComponent<unknown>(loader as () => Promise<{ default: unknown }>);
  },

  // Optimize images
  optimizeImageUrl(url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  } = {}): string {
    const { width, height, quality = 75, format = 'webp' } = options;
    
    // If it's an external URL, return as is
    if (url.startsWith('http')) {
      return url;
    }

    // For local images, add optimization parameters
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality) params.set('q', quality.toString());
    if (format) params.set('f', format);

    return params.toString() ? `${url}?${params.toString()}` : url;
  },

  // Resource hints
  addResourceHints(resources: Array<{
    href: string;
    as: 'script' | 'style' | 'image' | 'font' | 'fetch';
    crossorigin?: boolean;
    preload?: boolean;
    prefetch?: boolean;
  }>): void {
    if (typeof document === 'undefined') return;
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.href = resource.href;
      link.as = resource.as;
      if (resource.crossorigin) {
        link.crossOrigin = 'anonymous';
      }
      if (resource.preload) {
        link.rel = 'preload';
      } else if (resource.prefetch) {
        link.rel = 'prefetch';
      }
      document.head.appendChild(link);
    });
  },

  // Critical CSS extraction
  extractCriticalCSS(): string {
    const criticalSelectors = [
      '.modern-card',
      '.modern-button',
      '.hero-section',
      '.modern-gradient-text',
      '.glass-effect',
      '.modern-image-container',
    ];
    if (typeof document === 'undefined') return '';
    const styles: string[] = [];
    const styleSheets = Array.from(document.styleSheets);
    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from((sheet as CSSStyleSheet).cssRules || []);
        rules.forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            const selector = (rule as CSSStyleRule).selectorText;
            if (criticalSelectors.some(critical => selector.includes(critical))) {
              styles.push(rule.cssText);
            }
          }
        });
      } catch (error) {
        console.warn('Cannot access stylesheet:', error);
      }
    });
    return styles.join('\n');
  },

  // Service Worker registration
  async registerServiceWorker(): Promise<void> {
    if (typeof navigator === 'undefined') return;
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  },

  // Web Vitals monitoring
  measureWebVitals(): { LCP: number; FID: number; CLS: number } {
    if (typeof window === 'undefined') return { LCP: 0, FID: 0, CLS: 0 };
    const vitals: { LCP: number; FID: number; CLS: number } = { LCP: 0, FID: 0, CLS: 0 };
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEntry[];
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = lastEntry?.startTime || 0;
        console.log('LCP:', vitals.LCP);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEventTiming[];
        entries.forEach(entry => {
          vitals.FID = entry.processingStart - entry.startTime;
          console.log('FID:', vitals.FID);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEntry[];
        entries.forEach(entry => {
          if (entry.entryType === 'layout-shift') {
            const layoutShiftEntry = entry as PerformanceEntry & {
              hadRecentInput: boolean;
              value: number;
            };
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
              vitals.CLS = clsValue;
              console.log('CLS:', vitals.CLS);
            }
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
    return vitals;
  },

  // Bundle analysis
  analyzeBundle(): void {
    if (process.env.NODE_ENV === 'development') {
      if (typeof navigator === 'undefined' || typeof performance === 'undefined') {
        return;
      }
      console.log('Bundle analysis:', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        connection: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown',
        memory: ((performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory) ? {
          used: (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory!.usedJSHeapSize,
          total: (performance as Performance & { memory?: { totalJSHeapSize: number } }).memory!.totalJSHeapSize,
          limit: (performance as Performance & { memory?: { jsHeapSizeLimit: number } }).memory!.jsHeapSizeLimit,
        } : 'not available',
      });
    }
  },

  // Performance budget
  checkPerformanceBudget(): boolean {
    const budget = {
      maxJSBundleSize: 500 * 1024, // 500KB
      maxCSSBundleSize: 100 * 1024, // 100KB
      maxImageSize: 1 * 1024 * 1024, // 1MB
      maxLoadTime: 3000, // 3 seconds
    };
    if (typeof performance === 'undefined') return true;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;

    if (loadTime > budget.maxLoadTime) {
      console.warn(`Load time ${loadTime}ms exceeds budget ${budget.maxLoadTime}ms`);
      return false;
    }

    return true;
  },
};

// Tree shaking optimization
export const treeShakingOptimizer = {
  // Remove unused exports
  removeUnusedExports<T extends Record<string, unknown>>(module: T, usedExports: string[]): Partial<T> {
    const filteredModule: Partial<T> = { ...module };
    Object.keys(filteredModule as Record<string, unknown>).forEach(key => {
      if (!usedExports.includes(key)) {
        delete (filteredModule as Record<string, unknown>)[key];
      }
    });
    return filteredModule;
  },

  // Dead code elimination
  eliminateDeadCode(code: string): string {
    // Simple dead code elimination
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  },
};

// Memory optimization
export const memoryOptimizer = {
  // Cleanup unused objects
  cleanup(): void {
    if (typeof window !== 'undefined' && 'gc' in window) {
      const w = window as unknown as { gc?: () => void };
      if (w.gc) {
        w.gc();
      }
    }
  },

  // Monitor memory usage
  getMemoryUsage(): {
    used: number;
    total: number;
    limit: number;
  } | null {
    if (typeof performance !== 'undefined' && (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory) {
      const perfWithMemory = performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } };
      const memory = perfWithMemory.memory!;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  },

  // Optimize large objects
  optimizeObject<T>(obj: T): T {
    // Deep clone to remove circular references
    return JSON.parse(JSON.stringify(obj));
  },
};
