'use client';

import { Card } from '@/components/ui/card';
import { MarkdownContent } from '@/components/chat/MarkdownContent';

interface SummaryViewProps {
  summary: string;
}

export function SummaryView({ summary }: SummaryViewProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        📄 Summary
      </h2>
      
      <div className="prose dark:prose-invert max-w-none">
        <MarkdownContent content={summary} />
      </div>
    </Card>
  );
}
