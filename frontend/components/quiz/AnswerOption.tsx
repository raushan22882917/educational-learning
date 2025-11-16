'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnswerOptionProps {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean;
  isRevealed: boolean;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  option,
  index,
  isSelected,
  isCorrect,
  isRevealed,
  onSelect,
  disabled = false,
}) => {
  const optionLabels = ['A', 'B', 'C', 'D', 'E'];

  const getCardStyles = () => {
    if (isRevealed) {
      if (isCorrect) {
        return 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-700';
      }
      if (isSelected && !isCorrect) {
        return 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-700';
      }
    }
    if (isSelected) {
      return 'bg-primary/10 border-primary';
    }
    return 'hover:bg-accent hover:border-accent-foreground/20';
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 hover:shadow-md',
        'active:scale-[0.98] touch-manipulation',
        getCardStyles(),
        disabled && 'cursor-not-allowed opacity-60'
      )}
      onClick={() => !disabled && onSelect(index)}
    >
      <CardContent className="p-3 sm:p-4 flex items-center gap-3 min-h-[60px]">
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
            isRevealed && isCorrect
              ? 'bg-green-500 text-white'
              : isRevealed && isSelected && !isCorrect
              ? 'bg-red-500 text-white'
              : isSelected
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {optionLabels[index]}
        </div>
        <div className="flex-1 text-sm sm:text-base">{option}</div>
        {isRevealed && isCorrect && (
          <div className="flex-shrink-0 text-green-600 dark:text-green-400 text-xl">✓</div>
        )}
        {isRevealed && isSelected && !isCorrect && (
          <div className="flex-shrink-0 text-red-600 dark:text-red-400 text-xl">✗</div>
        )}
      </CardContent>
    </Card>
  );
};
