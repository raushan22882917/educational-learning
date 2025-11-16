/**
 * Performance monitoring and optimization utilities.
 */

/**
 * Measure and log component render time.
 */
export function measureRenderTime(componentName: string, callback: () => void) {
  if (typeof window === 'undefined' || !window.performance) {
    callback();
    return;
  }

  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  
  const renderTime = endTime - startTime;
  
  // Log slow renders (> 16ms for 60fps)
  if (renderTime > 16) {
    console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
  }
}

/**
 * Report Web Vitals for monitoring.
 */
export function reportWebVitals(metric: any) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric);
  }
  
  // In production, you could send to analytics service
  // Example: sendToAnalytics(metric);
}

/**
 * Prefetch data for better perceived performance.
 */
export async function prefetchData<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string
): Promise<T | null> {
  try {
    const data = await fetchFn();
    
    // Store in sessionStorage for quick access
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    console.error('[Prefetch Error]', error);
    return null;
  }
}

/**
 * Get prefetched data from cache.
 */
export function getCachedData<T>(cacheKey: string): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = sessionStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

/**
 * Clear prefetch cache.
 */
export function clearPrefetchCache(cacheKey?: string) {
  if (typeof window === 'undefined') return;
  
  if (cacheKey) {
    sessionStorage.removeItem(cacheKey);
  } else {
    sessionStorage.clear();
  }
}

/**
 * Check if device has good performance capabilities.
 */
export function hasGoodPerformance(): boolean {
  if (typeof window === 'undefined') return true;
  
  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) {
    return false;
  }
  
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) {
    return false;
  }
  
  return true;
}

/**
 * Adaptive loading based on device capabilities.
 */
export function shouldLoadHeavyFeatures(): boolean {
  if (typeof window === 'undefined') return true;
  
  // Check connection
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return false;
    }
    
    // Check if user has data saver enabled
    if (connection.saveData) {
      return false;
    }
  }
  
  // Check device performance
  return hasGoodPerformance();
}

/**
 * Request idle callback wrapper with fallback.
 */
export function requestIdleCallback(callback: () => void, timeout = 2000) {
  if (typeof window === 'undefined') {
    callback();
    return;
  }
  
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    // Fallback to setTimeout
    setTimeout(callback, 1);
  }
}

/**
 * Batch multiple state updates for better performance.
 */
export function batchUpdates(callback: () => void) {
  // React 18+ automatically batches updates
  // This is a placeholder for potential future optimizations
  callback();
}

/**
 * Memory usage monitoring (if available).
 */
export function getMemoryUsage(): { used: number; total: number } | null {
  if (typeof window === 'undefined') return null;
  
  const memory = (performance as any).memory;
  if (!memory) return null;
  
  return {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
  };
}

/**
 * Log memory usage for debugging.
 */
export function logMemoryUsage(label: string) {
  const usage = getMemoryUsage();
  if (usage) {
    const usedMB = (usage.used / 1024 / 1024).toFixed(2);
    const totalMB = (usage.total / 1024 / 1024).toFixed(2);
    console.log(`[Memory] ${label}: ${usedMB}MB / ${totalMB}MB`);
  }
}
