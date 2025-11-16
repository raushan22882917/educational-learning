'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProgressChartProps {
  topicsCompleted: number;
  totalTimeSpent: number;
  currentStreak: number;
  level: number;
}

export function ProgressChart({
  topicsCompleted,
  totalTimeSpent,
  currentStreak,
  level,
}: ProgressChartProps) {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate progress percentages for visual representation
  const topicsProgress = Math.min((topicsCompleted / 50) * 100, 100); // Max 50 topics for 100%
  const timeProgress = Math.min((totalTimeSpent / 36000) * 100, 100); // Max 10 hours for 100%
  const streakProgress = Math.min((currentStreak / 30) * 100, 100); // Max 30 days for 100%
  const levelProgress = ((level % 10) / 10) * 100; // Progress within current level tier

  const stats = [
    {
      label: 'Topics Completed',
      value: topicsCompleted,
      progress: topicsProgress,
      color: 'from-blue-500 to-blue-600',
      icon: '📚',
      description: `${topicsCompleted} topics mastered`,
    },
    {
      label: 'Time Spent Learning',
      value: formatTime(totalTimeSpent),
      progress: timeProgress,
      color: 'from-purple-500 to-purple-600',
      icon: '⏱️',
      description: 'Total learning time',
    },
    {
      label: 'Current Streak',
      value: `${currentStreak} days`,
      progress: streakProgress,
      color: 'from-orange-500 to-orange-600',
      icon: '🔥',
      description: 'Keep the momentum going!',
    },
    {
      label: 'Learning Level',
      value: level,
      progress: levelProgress,
      color: 'from-green-500 to-green-600',
      icon: '⭐',
      description: `Level ${level} - ${Math.floor(levelProgress)}% to next level`,
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📊</span>
          Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="space-y-2 animate-fade-in"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <h4 className="text-sm font-semibold">{stat.label}</h4>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="relative h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-1000 ease-out',
                  stat.color
                )}
                style={{
                  width: `${stat.progress}%`,
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
            </div>
            
            <div className="text-xs text-right text-muted-foreground">
              {Math.round(stat.progress)}% progress
            </div>
          </div>
        ))}

        {/* Note: Learning Trend visualization will be added when daily activity data is available */}
      </CardContent>
    </Card>
  );
}
