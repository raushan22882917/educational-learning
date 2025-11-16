'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useProgressStore } from '@/stores/progress-store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { LazyRecommendationsSection } from '@/components/dashboard/LazyDashboardComponents';
import { AchievementsBadge } from '@/components/dashboard/AchievementsBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Topic } from '@/lib/api-client';
import { ErrorFallback } from '@/components/common/ErrorFallback';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    stats,
    achievements,
    recommendations,
    weeklySummary,
    isLoading,
    isLoadingRecommendations,
    isLoadingSummary,
    error,
    loadProgress,
    loadRecommendations,
    loadWeeklySummary,
  } = useProgressStore();

  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  useEffect(() => {
    if (user?.id) {
      // Load comprehensive dashboard stats
      loadDashboardStats();
      
      // Load critical data first
      loadProgress(user.id);
      
      // Defer non-critical data to improve perceived performance
      setTimeout(() => {
        loadRecommendations(user.id);
      }, 100);
      
      setTimeout(() => {
        loadWeeklySummary(user.id);
      }, 200);
    }
  }, [user?.id, loadProgress, loadRecommendations, loadWeeklySummary]);

  const loadDashboardStats = async () => {
    if (!user?.id) return;
    
    setIsLoadingDashboard(true);
    try {
      const { progressAPI } = await import('@/lib/api-client');
      const stats = await progressAPI.getDashboardStats(user.id);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const handleSelectTopic = (topic: Topic) => {
    // Navigate to learning session with the selected topic
    router.push(`/learn?topic=${encodeURIComponent(topic.title)}`);
  };

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
      <DashboardLayout>
        <ErrorFallback
          title="Dashboard Error"
          error={error}
          onRetry={() => {
            if (user?.id) {
              loadProgress(user.id);
              loadRecommendations(user.id);
              loadWeeklySummary(user.id);
            }
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Continue your learning journey
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => router.push('/quiz')} size="lg" variant="outline" className="flex-1 sm:flex-none">
            <span className="hidden sm:inline">Take Quiz</span>
            <span className="sm:hidden">Quiz</span>
          </Button>
          <Button onClick={() => router.push('/learn')} size="lg" className="flex-1 sm:flex-none">
            <span className="hidden sm:inline">Start Learning</span>
            <span className="sm:hidden">Learn</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Real Data from Database */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {isLoadingDashboard || isLoading ? (
          <>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : dashboardStats ? (
          <>
            <StatsCard
              title="Total Sessions"
              value={dashboardStats.total_sessions}
              icon="💬"
              description={`${dashboardStats.active_sessions} active, ${dashboardStats.completed_sessions} completed`}
            />
            <StatsCard
              title="Total Messages"
              value={dashboardStats.total_messages}
              icon="✉️"
              description="Messages exchanged"
            />
            <StatsCard
              title="Topics Completed"
              value={dashboardStats.topics_completed}
              icon="📚"
              description="Total topics learned"
            />
            <StatsCard
              title="Time Spent"
              value={`${dashboardStats.total_time_hours}h`}
              icon="⏱️"
              description={formatTime(dashboardStats.total_time_spent)}
            />
            <StatsCard
              title="Current Streak"
              value={`${dashboardStats.current_streak} days`}
              icon="🔥"
              description={`${dashboardStats.days_active} days active`}
            />
            <StatsCard
              title="Level"
              value={dashboardStats.level}
              icon="⭐"
              description="Your learning level"
            />
            <StatsCard
              title="Quizzes"
              value={`${dashboardStats.quizzes_passed}/${dashboardStats.total_quizzes}`}
              icon="📝"
              description={`${dashboardStats.average_quiz_score}% avg score`}
            />
            <StatsCard
              title="Achievements"
              value={dashboardStats.total_achievements}
              icon="🏆"
              description="Badges earned"
            />
          </>
        ) : (
          <>
            <StatsCard
              title="Topics Completed"
              value={stats?.topics_completed || 0}
              icon="📚"
              description="Total topics learned"
            />
            <StatsCard
              title="Time Spent"
              value={formatTime(stats?.total_time_spent || 0)}
              icon="⏱️"
              description="Total learning time"
            />
            <StatsCard
              title="Current Streak"
              value={`${stats?.current_streak || 0} days`}
              icon="🔥"
              description="Keep it going!"
            />
            <StatsCard
              title="Level"
              value={stats?.level || 1}
              icon="⭐"
              description="Your learning level"
            />
          </>
        )}
      </div>

      {/* Weekly Summary */}
      {weeklySummary && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span>
              Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">{weeklySummary.summary}</p>
            {weeklySummary.insights && weeklySummary.insights.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Key Insights:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {weeklySummary.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <LazyRecommendationsSection
        recommendations={recommendations}
        onSelectTopic={handleSelectTopic}
        isLoading={isLoadingRecommendations}
      />

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Recent Achievements</h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {achievements.slice(0, 8).map((achievement) => (
              <AchievementsBadge
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </div>
          {achievements.length > 8 && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => router.push('/progress')}
              >
                View All Achievements
              </Button>
            </div>
          )}
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
