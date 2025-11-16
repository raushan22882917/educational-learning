'use client';

import { Card } from '@/components/ui/card';

interface TimelineItem {
  timestamp: string;
  title: string;
  description: string;
  importance: string;
}

interface TimelineViewProps {
  timeline: TimelineItem[];
}

export function TimelineView({ timeline }: TimelineViewProps) {
  if (timeline.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-600 dark:text-gray-400">
          No timeline available
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        ⏱️ Content Timeline
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Key moments and topics covered in chronological order
      </p>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>

        <div className="space-y-6">
          {timeline.map((item, index) => (
            <div key={index} className="relative pl-16">
              {/* Timeline dot */}
              <div className="absolute left-3 top-2 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-white dark:border-gray-900 shadow-lg flex items-center justify-center">
                <span className="text-xs text-white font-bold">{index + 1}</span>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {item.timestamp}
                  </span>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {item.description}
                </p>
                
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-500">
                  <span className="text-yellow-600 dark:text-yellow-400 font-semibold text-sm">
                    💡 Why it matters:
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.importance}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
