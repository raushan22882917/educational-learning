'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FireIcon,
  SparklesIcon,
  TrophyIcon,
  RocketLaunchIcon,
  HeartIcon,
  StarIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  PlayIcon,
  PhotoIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid';

interface MultimediaElement {
  type: 'image' | 'video' | 'wolfram' | 'audio' | 'interactive';
  content: string;
  metadata?: {
    url?: string;
    search_query?: string;
    description?: string;
  };
}

interface Step {
  step_number: number;
  step_type: string;
  content: string;
  multimedia?: MultimediaElement[];
  requires_answer: boolean;
  question?: string;
}

interface FunStepLearningInterfaceProps {
  pathId: string;
  userId: string;
  onComplete?: () => void;
}

export default function FunStepLearningInterface({
  pathId,
  userId,
  onComplete,
}: FunStepLearningInterfaceProps) {
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStepNumber, setCurrentStepNumber] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Initialize with first step
    fetchCurrentStep();
  }, [pathId]);

  const fetchCurrentStep = async () => {
    try {
      const response = await fetch('/api/step-learning/current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path_id: pathId, user_id: userId }),
      });
      const data = await response.json();
      setCurrentStep(data.step);
      setProgress(data.progress_percentage);
      setTotalSteps(data.total_steps);
      setCurrentStepNumber(data.current_step);
    } catch (error) {
      console.error('Error fetching step:', error);
    }
  };

  const cleanText = (text: string): string => {
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^[-*+]\s/gm, '• ')
      .trim();
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;

    setLoading(true);
    setFeedback(null);
    setIsCorrect(null);

    try {
      const response = await fetch('/api/step-learning/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path_id: pathId,
          user_id: userId,
          answer: answer.trim(),
        }),
      });

      const data = await response.json();
      setFeedback(cleanText(data.feedback));
      setIsCorrect(!data.retry);

      if (!data.retry) {
        setStreak(streak + 1);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      setProgress(data.progress_percentage);
      setCurrentStepNumber(data.current_step);

      if (data.completed) {
        setTimeout(() => onComplete?.(), 2000);
      } else if (!data.retry) {
        setTimeout(() => {
          setCurrentStep(data.step);
          setFeedback(null);
          setIsCorrect(null);
          setAnswer('');
        }, 2000);
      } else {
        setAnswer('');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setFeedback('An error occurred. Please try again.');
      setIsCorrect(false);
    } finally {
      setLoading(false);
    }
  };

  const continueToNext = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/step-learning/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path_id: pathId,
          user_id: userId,
          answer: 'continue',
        }),
      });

      const data = await response.json();
      setProgress(data.progress_percentage);
      setCurrentStepNumber(data.current_step);

      if (data.completed) {
        onComplete?.();
      } else {
        setCurrentStep(data.step);
      }
    } catch (error) {
      console.error('Error continuing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentStep) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SparklesIcon className="h-16 w-16 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your learning adventure...</p>
        </div>
      </div>
    );
  }

  const hasMultimedia = currentStep.multimedia && currentStep.multimedia.length > 0;

  return (
    <div className="space-y-6 relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}

      {/* Fun Progress Bar with Icons */}
      <Card className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <RocketLaunchIcon className="h-6 w-6" />
            <span className="font-bold">Step {currentStepNumber} of {totalSteps}</span>
          </div>
          <div className="flex items-center gap-2">
            <FireIcon className="h-5 w-5" />
            <span className="font-bold">{streak} Streak</span>
          </div>
        </div>
        <div className="relative h-4 bg-white/20 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${progress}%` }}
          >
            {progress > 10 && <StarIcon className="h-3 w-3 text-white" />}
          </div>
        </div>
        <div className="text-right text-sm mt-1 font-semibold">
          {Math.round(progress)}% Complete
        </div>
      </Card>

      {/* Main Content - Fun Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Content with Fun Styling */}
        <Card className="p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
          <div className="space-y-4">
            {/* Step Type Badge with Icon */}
            <div className="flex items-center gap-2">
              {currentStep.step_type === 'question' && <LightBulbIcon className="h-6 w-6 text-yellow-500" />}
              {currentStep.step_type === 'explanation' && <SparklesIcon className="h-6 w-6 text-blue-500" />}
              {currentStep.step_type === 'practice' && <BoltIcon className="h-6 w-6 text-orange-500" />}
              {currentStep.step_type === 'verification' && <CheckCircleIcon className="h-6 w-6 text-green-500" />}
              <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-bold">
                {currentStep.step_type.charAt(0).toUpperCase() + currentStep.step_type.slice(1)}
              </span>
            </div>

            {/* Content with Fun Typography */}
            <div className="prose dark:prose-invert max-w-none">
              <div className="text-lg leading-relaxed whitespace-pre-line text-gray-900 dark:text-white">
                {cleanText(currentStep.content)}
              </div>
            </div>

            {/* Question Highlight */}
            {currentStep.question && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-500 rounded-lg shadow-md">
                <div className="flex items-start gap-3">
                  <LightBulbIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {cleanText(currentStep.question)}
                  </p>
                </div>
              </div>
            )}

            {/* Feedback with Fun Animations */}
            {feedback && (
              <div
                className={`p-4 rounded-lg border-2 animate-bounce-in ${
                  isCorrect
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-500'
                    : 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <>
                      <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0 animate-bounce" />
                      <div>
                        <p className="font-bold text-green-900 dark:text-green-100 text-lg mb-1">
                          Awesome! 🎉
                        </p>
                        <p className="text-green-800 dark:text-green-200 leading-relaxed">
                          {feedback}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <LightBulbIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-yellow-900 dark:text-yellow-100 text-lg mb-1">
                          Not quite! 💡
                        </p>
                        <p className="text-yellow-800 dark:text-yellow-200 leading-relaxed">
                          {feedback}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Answer Input or Continue Button */}
            {currentStep.requires_answer ? (
              <div className="space-y-3">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here... 💭"
                  className="w-full p-4 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:ring-4 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none text-lg"
                  rows={4}
                  disabled={loading}
                />
                <Button
                  onClick={submitAnswer}
                  disabled={loading || !answer.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 text-lg shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Checking...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <BoltIcon className="h-5 w-5" />
                      Submit Answer
                      <ArrowRightIcon className="h-5 w-5" />
                    </span>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={continueToNext}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 text-lg shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Loading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RocketLaunchIcon className="h-5 w-5" />
                    Continue Adventure
                    <ArrowRightIcon className="h-5 w-5" />
                  </span>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Right Side - Multimedia with Fun Cards */}
        <div className="space-y-4">
          {hasMultimedia ? (
            currentStep.multimedia!.map((media, index) => (
              <Card
                key={index}
                className="p-4 border-2 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-shadow"
              >
                {media.type === 'image' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
                      <PhotoIcon className="h-6 w-6" />
                      <span>Visual Learning</span>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                      {media.metadata?.url ? (
                        <img
                          src={media.metadata.url}
                          alt={media.content}
                          className="max-w-full h-auto rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="text-center">
                          <PhotoIcon className="h-16 w-16 mx-auto mb-3 text-purple-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {cleanText(media.content)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {media.type === 'video' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
                      <PlayIcon className="h-6 w-6" />
                      <span>Video Resource</span>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {cleanText(media.content)}
                      </p>
                      {media.metadata?.search_query && (
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                            media.metadata.search_query
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold shadow-md"
                        >
                          <PlayIcon className="h-5 w-5" />
                          Watch Now
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {media.type === 'interactive' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
                      <BoltIcon className="h-6 w-6" />
                      <span>Try This!</span>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {cleanText(media.content)}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <HeartIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Focus on the content - you've got this!</p>
              </div>
            </Card>
          )}

          {/* Motivational Card */}
          <Card className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
            <div className="flex items-center gap-3">
              <TrophyIcon className="h-8 w-8" />
              <div>
                <p className="font-bold">Keep Going!</p>
                <p className="text-sm opacity-90">You're doing amazing! 🌟</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
