'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Question {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface QuizViewProps {
  questions: Question[];
}

export function QuizView({ questions }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  if (questions.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-600 dark:text-gray-400">
          No quiz questions available
        </p>
      </Card>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelect = (index: number) => {
    if (answeredQuestions.has(currentIndex)) return;
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    if (index === currentQuestion.correct_answer) {
      setScore(score + 1);
    }
    
    setAnsweredQuestions(new Set([...answeredQuestions, currentIndex]));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => prev - 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnsweredQuestions(new Set());
  };

  const isQuizComplete = answeredQuestions.size === questions.length;
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          Score: {score}/{questions.length}
        </span>
      </div>

      {/* Question Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correct_answer;
            const showResult = showExplanation;

            let buttonClass = 'w-full text-left p-4 rounded-lg border-2 transition-all ';
            
            if (showResult) {
              if (isCorrect) {
                buttonClass += 'border-green-500 bg-green-50 dark:bg-green-900/20';
              } else if (isSelected) {
                buttonClass += 'border-red-500 bg-red-50 dark:bg-red-900/20';
              } else {
                buttonClass += 'border-gray-200 dark:border-gray-700';
              }
            } else {
              buttonClass += isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={answeredQuestions.has(currentIndex)}
                className={buttonClass}
              >
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showResult && isCorrect && <span className="text-green-600">✓</span>}
                  {showResult && isSelected && !isCorrect && <span className="text-red-600">✗</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Explanation
            </h4>
            <p className="text-blue-800 dark:text-blue-200">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={currentIndex === 0}
        >
          ← Previous
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!answeredQuestions.has(currentIndex)}
          >
            Next →
          </Button>
        ) : (
          <Button onClick={handleReset} variant="default">
            🔄 Restart Quiz
          </Button>
        )}
      </div>

      {/* Final Score */}
      {isQuizComplete && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quiz Complete! 🎉
            </h3>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {percentage}%
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              You scored {score} out of {questions.length} questions correctly
            </p>
            <Button onClick={handleReset} variant="default" className="mt-4">
              Try Again
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
