import { useEffect, useState } from 'react';

export interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export type Breakpoint = keyof BreakpointConfig;

export interface UseBreakpointReturn {
  currentBreakpoint: Breakpoint | null;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2Xl: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

export const useBreakpoint = (breakpoints: BreakpointConfig = defaultBreakpoints): UseBreakpointReturn => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCurrentBreakpoint = (): Breakpoint | null => {
    const { width } = windowSize;
    
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    
    return null;
  };

  const currentBreakpoint = getCurrentBreakpoint();

  return {
    currentBreakpoint,
    isSm: windowSize.width >= breakpoints.sm,
    isMd: windowSize.width >= breakpoints.md,
    isLg: windowSize.width >= breakpoints.lg,
    isXl: windowSize.width >= breakpoints.xl,
    is2Xl: windowSize.width >= breakpoints['2xl'],
    isMobile: windowSize.width < breakpoints.md,
    isTablet: windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg,
    isDesktop: windowSize.width >= breakpoints.lg,
    width: windowSize.width,
    height: windowSize.height,
  };
};

export interface UseMediaQueryReturn {
  matches: boolean;
}

export const useMediaQuery = (query: string): UseMediaQueryReturn => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return { matches };
};

export interface UseResponsiveValueReturn<T> {
  value: T;
}

export const useResponsiveValue = <T>(
  values: Partial<Record<Breakpoint, T>>,
  defaultValue: T,
  breakpoints: BreakpointConfig = defaultBreakpoints
): UseResponsiveValueReturn<T> => {
  const { currentBreakpoint } = useBreakpoint(breakpoints);

  const getValue = (): T => {
    if (!currentBreakpoint) return defaultValue;

    // Find the appropriate value based on current breakpoint
    const breakpointOrder: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

    // Look for values from current breakpoint down to smallest
    for (let i = currentIndex; i >= 0; i--) {
      const breakpoint = breakpointOrder[i];
      if (values[breakpoint] !== undefined) {
        return values[breakpoint] as T;
      }
    }

    return defaultValue;
  };

  return { value: getValue() };
};

// Utility functions for responsive design
export const getResponsiveClass = (
  baseClass: string,
  responsiveClasses: Partial<Record<Breakpoint, string>>,
  currentBreakpoint: Breakpoint | null
): string => {
  if (!currentBreakpoint) return baseClass;

  const breakpointOrder: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

  // Find the most specific class for current breakpoint
  for (let i = currentIndex; i >= 0; i--) {
    const breakpoint = breakpointOrder[i];
    if (responsiveClasses[breakpoint]) {
      return `${baseClass} ${responsiveClasses[breakpoint]}`;
    }
  }

  return baseClass;
};

export const getResponsiveValue = <T>(
  values: Partial<Record<Breakpoint, T>>,
  defaultValue: T,
  currentBreakpoint: Breakpoint | null
): T => {
  if (!currentBreakpoint) return defaultValue;

  const breakpointOrder: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

  // Find the most specific value for current breakpoint
  for (let i = currentIndex; i >= 0; i--) {
    const breakpoint = breakpointOrder[i];
    if (values[breakpoint] !== undefined) {
      return values[breakpoint] as T;
    }
  }

  return defaultValue;
};
