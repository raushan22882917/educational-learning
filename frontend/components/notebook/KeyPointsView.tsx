'use client';

import { Card } from '@/components/ui/card';

interface KeyPointsViewProps {
  keyPoints: string[];
}

export function KeyPointsView({ keyPoints }: KeyPointsViewProps) {
  if (keyPoints.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-600 dark:text-gray-400">
          No key points available
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        🎯 Key Takeaways
      </h2>
      
      <div className="space-y-4">
        {keyPoints.map((point, index) => (
          <div
            key={index}
            className="flex gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white">{point}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
