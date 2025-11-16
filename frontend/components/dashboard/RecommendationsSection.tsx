'use client';

import { Topic } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RecommendationsSectionProps {
  recommendations: Topic[];
  onSelectTopic: (topic: Topic) => void;
  isLoading?: boolean;
  className?: string;
}

export function RecommendationsSection({
  recommendations,
  onSelectTopic,
  isLoading = false,
  className,
}: RecommendationsSectionProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <h2 className="text-2xl font-bold">Recommended Topics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <h2 className="text-2xl font-bold">Recommended Topics</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Complete a learning session to get personalized recommendations!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-2xl font-bold">Recommended Topics</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((topic) => (
          <Card
            key={topic.id}
            className="hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <CardHeader>
              <CardTitle className="text-lg">{topic.title}</CardTitle>
              {topic.difficulty && (
                <CardDescription>
                  <span
                    className={cn(
                      'inline-block px-2 py-1 rounded text-xs font-medium',
                      topic.difficulty === 'beginner' &&
                        'bg-green-100 text-green-800',
                      topic.difficulty === 'intermediate' &&
                        'bg-yellow-100 text-yellow-800',
                      topic.difficulty === 'advanced' &&
                        'bg-red-100 text-red-800'
                    )}
                  >
                    {topic.difficulty}
                  </span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {topic.description}
              </p>
              <Button
                onClick={() => onSelectTopic(topic)}
                className="w-full"
                variant="default"
              >
                Start Learning
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
