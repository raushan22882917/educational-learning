/**
 * Lazy-loaded quiz components for better performance.
 */

import dynamic from 'next/dynamic';

// Lazy load quiz interface (heavy interactive component)
export const LazyQuizInterface = dynamic(
  () => import('./QuizInterface').then(mod => ({ default: mod.QuizInterface })),
  {
    loading: () => (
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <div className="h-12 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
        <div className="h-12 bg-muted animate-pulse rounded-lg" />
      </div>
    ),
  }
);

// Lazy load question card
export const LazyQuestionCard = dynamic(
  () => import('./QuestionCard').then(mod => ({ default: mod.QuestionCard })),
  {
    loading: () => (
      <div className="w-full h-48 bg-muted animate-pulse rounded-lg" />
    ),
  }
);

// Answer options are lightweight, can be loaded immediately
export { AnswerOption } from './AnswerOption';
