/**
 * Lazy-loaded UI components for better performance.
 * These components are loaded on-demand to reduce initial bundle size.
 */

import dynamic from 'next/dynamic';

// Lazy load card component
export const LazyCard = dynamic(() => import('./card').then(mod => ({ default: mod.Card })), {
  loading: () => <div className="animate-pulse bg-muted rounded-lg h-32" />,
  ssr: true,
});

export const LazyCardHeader = dynamic(() => import('./card').then(mod => ({ default: mod.CardHeader })), {
  ssr: true,
});

export const LazyCardTitle = dynamic(() => import('./card').then(mod => ({ default: mod.CardTitle })), {
  ssr: true,
});

export const LazyCardDescription = dynamic(() => import('./card').then(mod => ({ default: mod.CardDescription })), {
  ssr: true,
});

export const LazyCardContent = dynamic(() => import('./card').then(mod => ({ default: mod.CardContent })), {
  ssr: true,
});

export const LazyCardFooter = dynamic(() => import('./card').then(mod => ({ default: mod.CardFooter })), {
  ssr: true,
});

// Lazy load button component
export const LazyButton = dynamic(() => import('./button').then(mod => ({ default: mod.Button })), {
  loading: () => <div className="animate-pulse bg-muted rounded-md h-10 w-24" />,
  ssr: true,
});

// Lazy load input component
export const LazyInput = dynamic(() => import('./input').then(mod => ({ default: mod.Input })), {
  loading: () => <div className="animate-pulse bg-muted rounded-md h-10" />,
  ssr: true,
});
