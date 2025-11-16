'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StepLearningInterface from '@/components/learning/StepLearningInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AcademicCapIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function StepLearnPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [pathId, setPathId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const startLearning = async () => {
    if (!topic.trim() || !user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/step-learning/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          difficulty,
          user_id: user.id,
        }),
      });

      const data = await response.json();
      setPathId(data.path_id);
    } catch (error) {
      console.error('Error starting learning:', error);
      alert('Failed to start learning. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    setShowCompletion(true);
  };

  const startNewTopic = () => {
    setPathId(null);
    setTopic('');
    setShowCompletion(false);
  };

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            Step-by-Step Learning
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Learn any topic through guided, interactive steps
          </p>
        </div>

        {/* Completion Celebration */}
        {showCompletion && (
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6 text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                Congratulations! 🎉
              </h2>
              <p className="text-green-800 dark:text-green-200 mb-4">
                You've completed the learning path for "{topic}"!
              </p>
              <Button onClick={startNewTopic} className="bg-green-600 hover:bg-green-700">
                Learn Another Topic
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Start Learning Form */}
        {!pathId && !showCompletion && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-blue-600" />
                Start Your Learning Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What do you want to learn?
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis, Quantum Physics, Python Basics..."
                  className="text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && startLearning()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        difficulty === level
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      <div className="font-medium capitalize">{level}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={startLearning}
                disabled={loading || !topic.trim()}
                className="w-full text-lg py-6"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Your Learning Path...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5" />
                    Start Learning
                  </span>
                )}
              </Button>

              {/* Example Topics */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Popular topics:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Photosynthesis',
                    'Calculus Basics',
                    'Machine Learning',
                    'World War II',
                    'Spanish Grammar',
                  ].map((exampleTopic) => (
                    <button
                      key={exampleTopic}
                      onClick={() => setTopic(exampleTopic)}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      {exampleTopic}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Interface */}
        {pathId && !showCompletion && user && (
          <StepLearningInterface
            pathId={pathId}
            userId={user.id}
            onComplete={handleComplete}
          />
        )}

        {/* How It Works */}
        {!pathId && !showCompletion && (
          <Card>
            <CardHeader>
              <CardTitle>How Step-by-Step Learning Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Choose a Topic</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter any topic you want to learn about
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Answer Questions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Progress through steps by answering questions
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Master the Topic</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete all steps and verify your understanding
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
