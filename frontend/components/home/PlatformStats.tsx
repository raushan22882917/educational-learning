'use client';

import { useEffect, useState } from 'react';

interface StatItemProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

function StatItem({ label, value, suffix = '', prefix = '', duration = 2000 }: StatItemProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</div>
    </div>
  );
}

export function PlatformStats() {
  return (
    <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
      <StatItem label="Active Learners" value={10247} suffix="+" />
      <StatItem label="Lessons Completed" value={52389} suffix="+" />
      <StatItem label="Satisfaction Rate" value={98} suffix="%" />
    </div>
  );
}
