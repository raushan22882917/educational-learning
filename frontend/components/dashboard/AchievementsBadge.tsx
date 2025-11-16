'use client';

import { Achievement } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface AchievementsBadgeProps {
  achievement: Achievement;
  className?: string;
}

export function AchievementsBadge({
  achievement,
  className,
}: AchievementsBadgeProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col items-center p-4 rounded-lg border bg-card hover:bg-accent transition-all duration-300 hover:scale-105 cursor-pointer',
        className
      )}
    >
      <div className="text-4xl mb-2 group-hover:animate-bounce">
        {achievement.icon}
      </div>
      <h4 className="text-sm font-semibold text-center">{achievement.title}</h4>
      <p className="text-xs text-muted-foreground text-center mt-1">
        {achievement.description}
      </p>
      <span className="text-xs text-muted-foreground mt-2">
        {new Date(achievement.earned_at).toLocaleDateString()}
      </span>
    </div>
  );
}
