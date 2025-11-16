'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';

interface Formula {
  name: string;
  formula: string;
  description: string;
  category?: string;
}

interface FormulaSheetProps {
  notes: string;
  videoTitle: string;
  onVisualizeFormula?: (formula: Formula) => void;
}

export function FormulaSheet({ notes, videoTitle, onVisualizeFormula }: FormulaSheetProps) {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [visualizingIndex, setVisualizingIndex] = useState<number | null>(null);

  const extractFormulas = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/youtube/extract-formulas', {
        notes: notes,
        video_title: videoTitle,
      });

      if (response.data.success) {
        setFormulas(response.data.data.formulas);
      } else {
        setError('Failed to extract formulas');
      }
    } catch (error: any) {
      console.error('Error extracting formulas:', error);
      setError(error.response?.data?.detail || 'Failed to extract formulas');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
  };

  const handleCopyAll = () => {
    const allFormulas = formulas
      .map((f) => `${f.name}: ${f.formula}\n${f.description}\n`)
      .join('\n');
    navigator.clipboard.writeText(allFormulas);
  };

  const handleVisualizeFormula = (formula: Formula, index: number) => {
    setVisualizingIndex(index);
    if (onVisualizeFormula) {
      onVisualizeFormula(formula);
    }
    // Reset after animation
    setTimeout(() => setVisualizingIndex(null), 1000);
  };

  if (!isExpanded) {
    return (
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <Button
          onClick={() => setIsExpanded(true)}
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">📐</span>
            <span className="font-semibold">Formula Sheet</span>
            {formulas.length > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-purple-600 text-white">
                {formulas.length}
              </span>
            )}
          </div>
          <span>▼</span>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-xl">📐</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Formula Sheet
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              All formulas from this content
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {formulas.length > 0 && (
            <Button onClick={handleCopyAll} variant="outline" size="sm">
              📋 Copy All
            </Button>
          )}
          <Button
            onClick={() => setIsExpanded(false)}
            variant="ghost"
            size="sm"
          >
            ▲
          </Button>
        </div>
      </div>

      {formulas.length === 0 && !loading && !error && (
        <div className="text-center py-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Extract all formulas and equations from the notes
          </p>
          <Button onClick={extractFormulas} variant="default" size="sm">
            <span className="mr-2">✨</span>
            Extract Formulas
          </Button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-2">⚙️</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Extracting formulas with AI...
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={extractFormulas} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      )}

      {formulas.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {formulas.map((formula, index) => (
            <div
              key={index}
              className={`p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 hover:shadow-md transition-all ${
                visualizingIndex === index ? 'ring-2 ring-orange-500 scale-[1.02]' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {formula.category && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                        {formula.category}
                      </span>
                    )}
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {formula.name}
                    </h4>
                  </div>
                  <div className="font-mono text-lg text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-3 py-2 rounded my-2">
                    {formula.formula}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formula.description}
                  </p>
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <Button
                    onClick={() => handleVisualizeFormula(formula, index)}
                    variant="default"
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    title="Visualize with Wolfram"
                  >
                    🔬
                  </Button>
                  <Button
                    onClick={() => handleCopyFormula(formula.formula)}
                    variant="ghost"
                    size="sm"
                    title="Copy formula"
                  >
                    📋
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formulas.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>💡 Tip:</strong> Click on any formula to copy it. Use these for quick reference while studying!
          </p>
        </div>
      )}
    </Card>
  );
}
