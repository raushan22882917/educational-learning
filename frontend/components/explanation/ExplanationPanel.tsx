'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Represents a single explanation format with optional Wolfram computational data.
 */
export interface ExplanationFormat {
  style: 'comprehensive' | 'analogy' | 'example' | 'steps' | 'simple';
  content: string;
  wolfram_data?: {
    computational_answer?: string;
    step_by_step?: string[];
    images?: string[];
  };
}

/**
 * Props for the ExplanationPanel component.
 * 
 * @example
 * ```tsx
 * <ExplanationPanel
 *   concept="Pythagorean theorem"
 *   explanations={[
 *     { style: 'comprehensive', content: '...' },
 *     { style: 'analogy', content: '...' }
 *   ]}
 *   onRequestAlternative={() => fetchAlternativeExplanations()}
 *   isLoading={false}
 * />
 * ```
 */
interface ExplanationPanelProps {
  concept: string;
  explanations: ExplanationFormat[];
  onRequestAlternative?: () => void;
  isLoading?: boolean;
  className?: string;
}

const formatStyleLabel = (style: string): string => {
  const labels: Record<string, string> = {
    comprehensive: 'Comprehensive',
    analogy: 'Using Analogies',
    example: 'With Examples',
    steps: 'Step-by-Step',
    simple: 'Simple Explanation',
  };
  return labels[style] || style;
};

const formatStyleIcon = (style: string): string => {
  const icons: Record<string, string> = {
    comprehensive: '📚',
    analogy: '🔄',
    example: '💡',
    steps: '📝',
    simple: '✨',
  };
  return icons[style] || '📖';
};

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  concept,
  explanations,
  onRequestAlternative,
  isLoading = false,
  className,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<number>(0);

  if (explanations.length === 0 && !isLoading) {
    return null;
  }

  const currentExplanation = explanations[selectedFormat];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Explaining: {concept}
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose a format that works best for you
          </p>
        </div>
        {onRequestAlternative && !isLoading && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestAlternative}
            className="shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mr-2"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            Try Another Way
          </Button>
        )}
      </div>

      {/* Format selector tabs */}
      {explanations.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {explanations.map((explanation, index) => (
            <button
              key={index}
              onClick={() => setSelectedFormat(index)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap',
                'border border-border hover:border-primary/50',
                selectedFormat === index
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="mr-2">{formatStyleIcon(explanation.style)}</span>
              {formatStyleLabel(explanation.style)}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <Card className="p-6 animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </Card>
      )}

      {/* Explanation content */}
      {!isLoading && currentExplanation && (
        <Card
          className={cn(
            'p-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-300',
            'border-2 border-primary/20'
          )}
        >
          {/* Gemini explanation */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {currentExplanation.content}
            </div>
          </div>

          {/* Wolfram computational data */}
          {currentExplanation.wolfram_data && (
            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M12 2v20M2 12h20" />
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
                Computational Results (Wolfram Alpha)
              </div>

              {/* Computational answer */}
              {currentExplanation.wolfram_data.computational_answer && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Answer:
                  </div>
                  <div className="text-base font-mono text-foreground">
                    {currentExplanation.wolfram_data.computational_answer}
                  </div>
                </div>
              )}

              {/* Step-by-step solution */}
              {currentExplanation.wolfram_data.step_by_step &&
                currentExplanation.wolfram_data.step_by_step.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Step-by-Step Solution:
                    </div>
                    <ol className="space-y-2">
                      {currentExplanation.wolfram_data.step_by_step.map((step, idx) => (
                        <li
                          key={idx}
                          className="flex gap-3 text-sm text-foreground"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                            {idx + 1}
                          </span>
                          <span className="flex-1 pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

              {/* Visual representations */}
              {currentExplanation.wolfram_data.images &&
                currentExplanation.wolfram_data.images.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Visual Representation:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentExplanation.wolfram_data.images.map((imageUrl, idx) => (
                        <div
                          key={idx}
                          className="bg-muted/50 rounded-lg p-2 overflow-hidden"
                        >
                          <img
                            src={imageUrl}
                            alt={`Visualization ${idx + 1}`}
                            className="w-full h-auto rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </Card>
      )}

      {/* Format indicator */}
      {!isLoading && explanations.length > 0 && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3 h-3"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          {explanations.length > 1
            ? `Showing ${selectedFormat + 1} of ${explanations.length} explanation formats`
            : 'Showing explanation'}
        </div>
      )}
    </div>
  );
};
