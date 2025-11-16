'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useProgressStore } from '@/stores/progress-store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LazyProgressChart, LazyWeeklySummary } from '@/components/dashboard/LazyDashboardComponents';
import { AchievementsBadge } from '@/components/dashboard/AchievementsBadge';

export default function ProgressPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    stats,
    achievements,
    weeklySummary,
    isLoading,
    isLoadingSummary,
    error,
    loadProgress,
    loadWeeklySummary,
  } = useProgressStore();

  useEffect(() => {
    if (user?.id) {
      loadProgress(user.id);
      loadWeeklySummary(user.id);
    }
  }, [user?.id, loadProgress, loadWeeklySummary]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error loading progress: {error}</p>
            <Button
              onClick={() => user?.id && loadProgress(user.id)}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Learning Progress
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Track your journey and celebrate your achievements
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full sm:w-auto">
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Dashboard</span>
        </Button>
      </div>

      {/* Statistics Overview Cards */}
      {isLoading ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        stats && (
          <>
            {/* Quick Stats Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Sessions</p>
                      <p className="text-2xl sm:text-3xl font-bold">{stats.total_sessions}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.completed_sessions} completed
                      </p>
                    </div>
                    <div className="text-3xl sm:text-4xl">📚</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Learning Time</p>
                      <p className="text-2xl sm:text-3xl font-bold">{stats.total_time_hours.toFixed(1)}h</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg: {formatTime(stats.average_session_duration)}
                      </p>
                    </div>
                    <div className="text-3xl sm:text-4xl">⏱️</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Current Streak</p>
                      <p className="text-2xl sm:text-3xl font-bold">{stats.current_streak}</p>
                      <p className="text-xs text-muted-foreground mt-1">days in a row</p>
                    </div>
                    <div className="text-3xl sm:text-4xl">🔥</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Level</p>
                      <p className="text-2xl sm:text-3xl font-bold">{stats.level}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.achievement_count} achievements
                      </p>
                    </div>
                    <div className="text-3xl sm:text-4xl">⭐</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Progress Chart */}
            <LazyProgressChart
              topicsCompleted={stats.topics_completed}
              totalTimeSpent={stats.total_time_spent}
              currentStreak={stats.current_streak}
              level={stats.level}
            />

            {/* Recent Topics */}
            {stats.recent_topics && stats.recent_topics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>🎯</span>
                    Recent Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {stats.recent_topics.map((topic, index) => (
                      <div
                        key={index}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full text-sm font-medium animate-fade-in"
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animationFillMode: 'both',
                        }}
                      >
                        {topic}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )
      )}

      {/* Weekly Summary */}
      {isLoadingSummary ? (
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        weeklySummary && <LazyWeeklySummary summary={weeklySummary} />
      )}

      {/* Achievements History */}
      {achievements && achievements.length > 0 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <span>🏆</span>
                All Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={achievement.id}
                    className="animate-fade-in"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both',
                    }}
                  >
                    <AchievementsBadge achievement={achievement} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!achievements || achievements.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Start Your Learning Journey</h3>
            <p className="text-muted-foreground mb-6">
              Complete learning sessions to earn achievements and track your progress
            </p>
            <Button onClick={() => router.push('/learn')} size="lg">
              Start Learning
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  );
}
