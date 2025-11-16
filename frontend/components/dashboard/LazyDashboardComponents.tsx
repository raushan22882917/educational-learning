/**
 * Lazy-loaded dashboard components for better initial page load performance.
 */

import dynamic from 'next/dynamic';

// Lazy load progress chart (heavy component with chart library)
export const LazyProgressChart = dynamic(
  () => import('../progress/ProgressChart').then(mod => ({ default: mod.ProgressChart })),
  {
    loading: () => (
      <div className="w-full h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading chart...</div>
      </div>
    ),
    ssr: false, // Charts don't need SSR
  }
);

// Lazy load weekly summary (can be heavy with AI-generated content)
export const LazyWeeklySummary = dynamic(
  () => import('../progress/WeeklySummary').then(mod => ({ default: mod.WeeklySummary })),
  {
    loading: () => (
      <div className="w-full h-48 bg-muted animate-pulse rounded-lg" />
    ),
  }
);

// Lazy load recommendations section
export const LazyRecommendationsSection = dynamic(
  () => import('./RecommendationsSection').then(mod => ({ default: mod.RecommendationsSection })),
  {
    loading: () => (
      <div className="w-full space-y-3">
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
      </div>
    ),
  }
);

// Stats card can be loaded immediately as it's lightweight
export { StatsCard } from './StatsCard';
