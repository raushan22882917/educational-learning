/**
 * Web Vitals reporting component for performance monitoring.
 */

'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import { reportWebVitals } from '@/lib/performance';

export function WebVitals() {
  useReportWebVitals((metric) => {
    reportWebVitals(metric);
  });

  // Monitor memory usage in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const memory = (performance as any).memory;
        if (memory) {
          const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
          const limitMB = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);
          console.log(`[Memory] Used: ${usedMB}MB / Limit: ${limitMB}MB`);
        }
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, []);

  return null;
}
