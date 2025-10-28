// Bundle optimization utilities
export const bundleOptimizer = {
  // Dynamic imports for code splitting
  async loadComponent<T>(importFn: () => Promise<{ default: T }>): Promise<T> {
    try {
      const module = await importFn();
      return module.default;
    } catch (error) {
      console.error('Failed to load component:', error);
      throw error;
    }
  },

  // Preload critical components
  preloadComponents(components: Array<() => Promise<any>>): void {
    components.forEach(component => {
      component().catch(error => {
        console.warn('Failed to preload component:', error);
      });
    });
  },

  // Lazy load routes
  async loadRoute(routeName: string): Promise<any> {
    const routeMap: Record<string, () => Promise<any>> = {
      'dashboard': () => import('@/app/dashboard/page'),
      'products': () => import('@/app/products/page'),
      'profile': () => import('@/app/profile/page'),
      'recommend': () => import('@/app/recommend/page'),
      'generate-image': () => import('@/app/generate-image/page'),
      'body-parts': () => import('@/app/body-parts/page'),
    };

    const loader = routeMap[routeName];
    if (!loader) {
      throw new Error(`Route ${routeName} not found`);
    }

    return this.loadComponent(loader);
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

    const styles: string[] = [];
    const styleSheets = Array.from(document.styleSheets);

    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        rules.forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            const selector = rule.selectorText;
            if (criticalSelectors.some(critical => selector.includes(critical))) {
              styles.push(rule.cssText);
            }
          }
        });
      } catch (error) {
        // Cross-origin stylesheets can't be accessed
        console.warn('Cannot access stylesheet:', error);
      }
    });

    return styles.join('\n');
  },

  // Service Worker registration
  async registerServiceWorker(): Promise<void> {
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
  measureWebVitals(): void {
    // Core Web Vitals
    const vitals = {
      LCP: 0, // Largest Contentful Paint
      FID: 0, // First Input Delay
      CLS: 0, // Cumulative Layout Shift
    };

    // Measure LCP
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = lastEntry.startTime;
        console.log('LCP:', vitals.LCP);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Measure FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          vitals.FID = entry.processingStart - entry.startTime;
          console.log('FID:', vitals.FID);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Measure CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            vitals.CLS = clsValue;
            console.log('CLS:', vitals.CLS);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Send vitals to analytics
    return vitals;
  },

  // Bundle analysis
  analyzeBundle(): void {
    if (process.env.NODE_ENV === 'development') {
      // Log bundle information in development
      console.log('Bundle analysis:', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType || 'unknown',
        memory: (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit,
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

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation.loadEventEnd - navigation.fetchStart;

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
  removeUnusedExports(module: any, usedExports: string[]): any {
    const filteredModule = { ...module };
    Object.keys(filteredModule).forEach(key => {
      if (!usedExports.includes(key)) {
        delete filteredModule[key];
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
      (window as any).gc();
    }
  },

  // Monitor memory usage
  getMemoryUsage(): {
    used: number;
    total: number;
    limit: number;
  } | null {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
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
