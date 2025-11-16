'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardsViewProps {
  flashcards: Flashcard[];
}

export function FlashcardsView({ flashcards }: FlashcardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (flashcards.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-600 dark:text-gray-400">
          No flashcards available
        </p>
      </Card>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Card {currentIndex + 1} of {flashcards.length}
      </div>

      {/* Flashcard */}
      <Card
        className="p-8 min-h-[300px] flex items-center justify-center cursor-pointer transition-all hover:shadow-lg"
        onClick={handleFlip}
      >
        <div className="text-center space-y-4">
          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {isFlipped ? 'ANSWER' : 'QUESTION'}
          </div>
          <div className="text-xl font-medium text-gray-900 dark:text-white">
            {isFlipped ? currentCard.back : currentCard.front}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Click to flip
          </div>
        </div>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={flashcards.length <= 1}
        >
          ← Previous
        </Button>
        <Button onClick={handleFlip} variant="default">
          🔄 Flip Card
        </Button>
        <Button
          onClick={handleNext}
          variant="outline"
          disabled={flashcards.length <= 1}
        >
          Next →
        </Button>
      </div>

      {/* All Cards List */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          All Flashcards
        </h3>
        <div className="space-y-3">
          {flashcards.map((card, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                index === currentIndex
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => {
                setCurrentIndex(index);
                setIsFlipped(false);
              }}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {index + 1}. {card.front}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
