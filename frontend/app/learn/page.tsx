'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useSessionStore } from '@/stores/session-store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LearnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { startSession, isLoading, error, clearError } = useSessionStore();
  const [topic, setTopic] = useState('');

  // Pre-fill topic from query params if provided
  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      setTopic(topicParam);
    }
  }, [searchParams]);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      return;
    }

    if (!user?.id) {
      router.push('/auth/login');
      return;
    }

    try {
      clearError();
      await startSession({
        topic: topic.trim(),
        user_id: user.id,
      });
      
      // Navigate to the session page
      const sessionId = useSessionStore.getState().sessionId;
      if (sessionId) {
        router.push(`/learn/${sessionId}`);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const suggestedTopics = [
    { title: 'Calculus Fundamentals', icon: '📐', gradient: 'from-blue-500 to-cyan-500', description: 'Master derivatives and integrals' },
    { title: 'Quantum Physics', icon: '⚛️', gradient: 'from-purple-500 to-pink-500', description: 'Explore the quantum realm' },
    { title: 'Machine Learning Basics', icon: '🤖', gradient: 'from-green-500 to-emerald-500', description: 'Build intelligent systems' },
    { title: 'World History', icon: '🌍', gradient: 'from-orange-500 to-red-500', description: 'Journey through time' },
    { title: 'Creative Writing', icon: '✍️', gradient: 'from-indigo-500 to-purple-500', description: 'Craft compelling stories' },
    { title: 'Chemistry Reactions', icon: '🧪', gradient: 'from-yellow-500 to-orange-500', description: 'Discover molecular magic' },
  ];

  const handleSuggestedTopic = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-4">
            <span className="text-2xl">🎓</span>
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Learning
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            What Will You Master Today?
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Dive into any subject with your personal AI tutor. Interactive, adaptive, and designed just for you.
          </p>
        </div>

        {/* Main Input Card */}
        <Card className="mb-8 sm:mb-12 shadow-xl border-2 hover:shadow-2xl transition-shadow duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Start Your Learning Journey
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Type any topic you're curious about - from quantum mechanics to creative writing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStartSession} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <Input
                  type="text"
                  placeholder="e.g., Linear Algebra, Ancient Rome, Python Programming..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isLoading}
                  className="text-base sm:text-lg pl-12 pr-4 py-6 border-2 focus:border-blue-500 transition-colors"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isLoading || !topic.trim()}
                className="w-full py-6 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Preparing Your Session...
                  </>
                ) : (
                  <>
                    <span>Start Learning</span>
                    <svg
                      className="ml-2 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Suggested Topics Section */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <span className="text-2xl">✨</span>
              Popular Topics
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">Click to explore</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {suggestedTopics.map((item, index) => (
              <Card
                key={index}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 active:scale-95 border-2 hover:border-transparent overflow-hidden relative"
                onClick={() => handleSuggestedTopic(item.title)}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <CardContent className="p-5 sm:p-6 relative">
                  <div className="flex items-start gap-4">
                    <div className={`text-4xl sm:text-5xl p-3 rounded-xl bg-gradient-to-br ${item.gradient} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-semibold text-lg mb-2">Adaptive Learning</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI adjusts to your pace and learning style
            </p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-semibold text-lg mb-2">Interactive Chat</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ask questions anytime, get instant answers
            </p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor your growth with detailed analytics
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
