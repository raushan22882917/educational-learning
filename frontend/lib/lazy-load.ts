/**
 * Utility functions for lazy loading components and optimizing performance.
 */

import dynamic from 'next/dynamic';
import { ComponentType, ReactElement } from 'react';

/**
 * Create a lazy-loaded component with a loading fallback.
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    loading?: () => ReactElement;
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading,
    ssr: options?.ssr ?? true,
  });
}

/**
 * Preload a component for better perceived performance.
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  // Trigger the import but don't wait for it
  importFunc().catch(() => {
    // Silently fail - component will be loaded when actually needed
  });
}

/**
 * Debounce function for performance optimization.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if code is running on client side.
 */
export const isClient = typeof window !== 'undefined';

/**
 * Check if user prefers reduced motion.
 */
export function prefersReducedMotion(): boolean {
  if (!isClient) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get connection speed for adaptive loading.
 */
export function getConnectionSpeed(): 'slow' | 'medium' | 'fast' {
  if (!isClient) return 'fast';
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return 'fast';
  
  const effectiveType = connection.effectiveType;
  
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'slow';
  } else if (effectiveType === '3g') {
    return 'medium';
  }
  
  return 'fast';
}

/**
 * Intersection Observer hook for lazy loading on scroll.
 */
export function createIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (!isClient || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, options);
}
