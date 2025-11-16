'use client';

import { Card } from '@/components/ui/card';

interface Insight {
  type: string;
  title: string;
  insight: string;
}

interface InsightsViewProps {
  insights: Insight[];
}

const insightIcons: Record<string, string> = {
  pattern: '🔍',
  surprise: '⚡',
  implication: '🎯',
  analysis: '📊',
  perspective: '👁️',
};

const insightColors: Record<string, string> = {
  pattern: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  surprise: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  implication: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  analysis: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  perspective: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
};

export function InsightsView({ insights }: InsightsViewProps) {
  if (insights.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-600 dark:text-gray-400">
          No insights available
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        💡 AI-Powered Insights
      </h2>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-5 rounded-lg border-2 ${insightColors[insight.type] || insightColors.analysis}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">
                {insightIcons[insight.type] || '💡'}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {insight.title}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                    {insight.type}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {insight.insight}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
