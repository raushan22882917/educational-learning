'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Activity {
  id: number;
  user: string;
  action: string;
  topic: string;
  time: string;
  avatar: string;
}

const activities: Activity[] = [
  { id: 1, user: 'Sarah K.', action: 'completed', topic: 'Quantum Mechanics', time: '2 min ago', avatar: 'SK' },
  { id: 2, user: 'Mike R.', action: 'started learning', topic: 'Machine Learning', time: '5 min ago', avatar: 'MR' },
  { id: 3, user: 'Emma L.', action: 'achieved 30-day streak', topic: 'Mathematics', time: '8 min ago', avatar: 'EL' },
  { id: 4, user: 'David C.', action: 'completed quiz', topic: 'Chemistry', time: '12 min ago', avatar: 'DC' },
  { id: 5, user: 'Lisa M.', action: 'started learning', topic: 'Physics', time: '15 min ago', avatar: 'LM' },
];

const avatarColors = [
  'from-blue-400 to-purple-400',
  'from-green-400 to-blue-400',
  'from-pink-400 to-purple-400',
  'from-orange-400 to-red-400',
  'from-yellow-400 to-orange-400',
];

export function LiveActivityFeed() {
  const [visibleActivities, setVisibleActivities] = useState<Activity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Show activities one by one
    if (currentIndex < activities.length) {
      const timer = setTimeout(() => {
        setVisibleActivities(prev => [...prev, activities[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  return (
    <div className="space-y-3">
      {visibleActivities.map((activity, index) => (
        <div
          key={activity.id}
          className="animate-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {activity.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-semibold">{activity.user}</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>{' '}
                    <span className="font-medium text-purple-600 dark:text-purple-400">{activity.topic}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
