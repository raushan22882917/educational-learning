'use client';

import { Card } from '@/components/ui/card';

export function LoadingSpinner() {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Processing Video...
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Extracting content and generating your notebook
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            <span className="animate-pulse">📝 Notes</span>
            <span className="animate-pulse delay-100">📄 Summary</span>
            <span className="animate-pulse delay-200">🎴 Flashcards</span>
            <span className="animate-pulse delay-300">🎯 Key Points</span>
            <span className="animate-pulse delay-400">❓ Quiz</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
