'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Question } from '@/lib/api-client';
import { AnswerOption } from './AnswerOption';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  isRevealed: boolean;
  className?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  isRevealed,
  className,
}) => {
  return (
    <Card
      className={cn(
        'animate-in fade-in slide-in-from-bottom-4 duration-500',
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {isRevealed ? 'Answered' : 'Active'}
          </span>
        </div>
        <CardTitle className="text-lg leading-relaxed">
          {question.question || question.text}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {question.options.map((option, index) => (
          <AnswerOption
            key={index}
            option={option}
            index={index}
            isSelected={selectedAnswer === index}
            isCorrect={isRevealed ? index === question.correct_answer : undefined}
            isRevealed={isRevealed}
            onSelect={onAnswerSelect}
            disabled={isRevealed}
          />
        ))}
        
        {isRevealed && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
              Explanation
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {question.explanation}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
