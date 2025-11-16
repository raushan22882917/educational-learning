'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  PlayIcon,
  PhotoIcon,
  ArrowRightIcon,
  FireIcon,
  SparklesIcon,
  TrophyIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import confetti from 'canvas-confetti';

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

interface StepLearningInterfaceProps {
  pathId: string;
  userId: string;
  onComplete?: () => void;
}

export default function StepLearningInterface({
  pathId,
  userId,
  onComplete,
}: StepLearningInterfaceProps) {
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStepNumber, setCurrentStepNumber] = useState(0);

  const cleanText = (text: string): string => {
    // Remove markdown formatting
    return text
      .replace(/\*\*/g, '') // Remove bold
      .replace(/\*/g, '') // Remove italic
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links but keep text
      .replace(/`([^`]+)`/g, '$1') // Remove code formatting
      .replace(/^[-*+]\s/gm, '• ') // Convert list markers to bullets
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

      // Show feedback
      setFeedback(cleanText(data.feedback));
      setIsCorrect(!data.retry);

      // Update progress
      setProgress(data.progress_percentage);
      setCurrentStepNumber(data.current_step);

      if (data.completed) {
        // Learning path completed
        setTimeout(() => {
          onComplete?.();
        }, 2000);
      } else if (!data.retry) {
        // Correct answer - move to next step after showing feedback
        setTimeout(() => {
          setCurrentStep(data.step);
          setFeedback(null);
          setIsCorrect(null);
          setAnswer('');
        }, 2000);
      } else {
        // Wrong answer - clear input for retry
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasMultimedia = currentStep.multimedia && currentStep.multimedia.length > 0;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Step {currentStepNumber} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content Area - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Text Content */}
        <Card className="p-6">
          <div className="space-y-4">
            {/* Step Type Badge */}
            <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
              {currentStep.step_type.charAt(0).toUpperCase() + currentStep.step_type.slice(1)}
            </div>

            {/* Content */}
            <div className="prose dark:prose-invert max-w-none">
              <div className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-line">
                {cleanText(currentStep.content)}
              </div>
            </div>

            {/* Question if exists */}
            {currentStep.question && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
                <p className="text-blue-900 dark:text-blue-100 font-medium">
                  {cleanText(currentStep.question)}
                </p>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div
                className={`mt-4 p-4 rounded-lg border-l-4 ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <LightBulbIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  )}
                  <p
                    className={`${
                      isCorrect
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-yellow-900 dark:text-yellow-100'
                    } leading-relaxed`}
                  >
                    {feedback}
                  </p>
                </div>
              </div>
            )}

            {/* Answer Input or Continue Button */}
            {currentStep.requires_answer ? (
              <div className="mt-6 space-y-3">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                  rows={4}
                  disabled={loading}
                />
                <Button
                  onClick={submitAnswer}
                  disabled={loading || !answer.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Checking...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Submit Answer
                      <ArrowRightIcon className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            ) : (
              <div className="mt-6">
                <Button onClick={continueToNext} disabled={loading} className="w-full">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Loading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Continue
                      <ArrowRightIcon className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Right Side - Multimedia */}
        <div className="space-y-4">
          {hasMultimedia ? (
            currentStep.multimedia!.map((media, index) => (
              <Card key={index} className="p-4">
                {media.type === 'image' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <PhotoIcon className="h-5 w-5" />
                      <span className="font-medium">Visual Aid</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                      {media.metadata?.url ? (
                        <img
                          src={media.metadata.url}
                          alt={media.content}
                          className="max-w-full h-auto rounded"
                        />
                      ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <PhotoIcon className="h-12 w-12 mx-auto mb-2" />
                          <p className="text-sm">{cleanText(media.content)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {media.type === 'video' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <PlayIcon className="h-5 w-5" />
                      <span className="font-medium">Video Resource</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
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
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <PlayIcon className="h-4 w-4" />
                          Watch on YouTube
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {media.type === 'wolfram' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Wolfram Alpha</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {cleanText(media.content)}
                      </p>
                      {media.metadata?.url && (
                        <a
                          href={media.metadata.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Explore on Wolfram Alpha
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {media.type === 'interactive' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Interactive Activity</span>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {cleanText(media.content)}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card className="p-6">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">No multimedia for this step</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
