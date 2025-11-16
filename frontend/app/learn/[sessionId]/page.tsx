'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSessionStore } from '@/stores/session-store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const {
    topic,
    messages,
    isLoading,
    sessionSummary,
    loadHistory,
    completeSession,
    clearSession,
  } = useSessionStore();

  const [isCompleting, setIsCompleting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    // Load session history if we don't have messages
    if (sessionId && messages.length === 0 && !isLoading) {
      loadHistory(sessionId).catch((error) => {
        console.error('Failed to load session history:', error);
        // Don't redirect - just show error state
        // User can use sidebar to navigate if needed
      });
    }
  }, [sessionId, messages.length, isLoading, loadHistory, router]);

  const handleCompleteSession = async () => {
    setIsCompleting(true);
    try {
      await completeSession();
      setShowSummary(true);
    } catch (error) {
      console.error('Failed to complete session:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleStartNewSession = () => {
    clearSession();
    router.push('/learn');
  };

  const handleSelectRecommendation = (recommendedTopic: string) => {
    clearSession();
    router.push(`/learn?topic=${encodeURIComponent(recommendedTopic)}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-600"
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
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading session...</p>
        </div>
      </div>
    );
  }

  if (showSummary && sessionSummary) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Session Complete! 🎉</CardTitle>
              <CardDescription>
                Great job learning about {topic}!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {sessionSummary.summary}
                </p>
              </div>

              {sessionSummary.next_topics && sessionSummary.next_topics.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recommended Next Topics</h3>
                  <div className="grid gap-3">
                    {sessionSummary.next_topics.map((nextTopic, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] active:scale-95"
                        onClick={() => handleSelectRecommendation(nextTopic)}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">📚</span>
                            <span className="font-medium">{nextTopic}</span>
                          </div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5 text-gray-400"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={() => router.push(`/quiz?topic=${encodeURIComponent(topic || '')}`)}
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Take Quiz on This Topic
                </Button>
                <div className="flex gap-3">
                  <Button
                    onClick={handleStartNewSession}
                    size="lg"
                    className="flex-1"
                  >
                    Start New Session
                  </Button>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    size="lg"
                    variant="outline"
                    className="flex-1"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="border-b bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold truncate">{topic || 'Learning Session'}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Interactive AI Tutor
              </p>
            </div>
          </div>
          <Button
            onClick={handleCompleteSession}
            disabled={isCompleting || messages.length === 0}
            variant="outline"
            size="sm"
          >
            {isCompleting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 mr-2"
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
                Completing...
              </>
            ) : (
              'Complete Session'
            )}
          </Button>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface sessionId={sessionId} className="h-full" />
        </div>
      </div>
    </DashboardLayout>
  );
}
