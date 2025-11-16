'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklySummaryResponse } from '@/lib/api-client';

interface WeeklySummaryProps {
  summary: WeeklySummaryResponse;
}

export function WeeklySummary({ summary }: WeeklySummaryProps) {
  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📝</span>
          Your Weekly Learning Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-generated insights about your learning journey
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Summary */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {summary.summary}
          </p>
        </div>



        {/* Generated timestamp */}
        <div className="text-xs text-muted-foreground text-right pt-2 border-t">
          Generated on {new Date(summary.generated_at).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </CardContent>
    </Card>
  );
}