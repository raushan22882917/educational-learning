'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SparklesIcon } from '@heroicons/react/24/solid';

export const TypingIndicator: React.FC = () => {
  const [dots, setDots] = useState(1);
  const [message, setMessage] = useState('Thinking');

  const messages = [
    'Thinking',
    'Processing',
    'Analyzing',
    'Generating response',
    'Almost there'
  ];

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev % 3) + 1);
    }, 500);

    const messageInterval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 2000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="flex w-full mb-4 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card className="max-w-[80%] bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <SparklesIcon className="w-5 h-5 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-primary">
                {message}
              </span>
              <span className="text-sm font-medium text-primary">
                {'.'.repeat(dots)}
              </span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-primary/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary/50 to-primary w-3/5 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
