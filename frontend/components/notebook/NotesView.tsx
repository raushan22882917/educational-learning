'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarkdownContent } from '@/components/chat/MarkdownContent';

interface WolframVisualization {
  query: string;
  description?: string;
  type?: string;
  result?: string;
  images?: string[];
  step_by_step?: string[];
}

interface NotesViewProps {
  notes: string;
  wolframData?: WolframVisualization[];
}

export function NotesView({ notes, wolframData }: NotesViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([notes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'youtube-notes.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            📝 Detailed Notes
          </h2>
          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="outline" size="sm">
              {copied ? '✓ Copied' : '📋 Copy'}
            </Button>
            <Button onClick={handleDownload} variant="outline" size="sm">
              💾 Download
            </Button>
          </div>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <MarkdownContent content={notes} />
        </div>
      </Card>

      {/* Wolfram Visualizations */}
      {wolframData && wolframData.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center">
              <span className="text-2xl">🔬</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Wolfram Alpha Visualizations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mathematical and scientific concepts from the video
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {wolframData.map((item, index) => (
              <div
                key={index}
                className="p-5 bg-white dark:bg-gray-800 rounded-lg border-2 border-orange-200 dark:border-orange-800 shadow-sm"
              >
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-orange-600 text-white text-sm font-semibold rounded-full">
                      {item.type || 'Visualization'} {index + 1}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    {item.query}
                  </h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      {item.description}
                    </p>
                  )}
                </div>

                {item.result && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Result:
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">{item.result}</p>
                  </div>
                )}

                {item.images && item.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Visualizations:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {item.images.map((imageUrl, imgIndex) => (
                        <div
                          key={imgIndex}
                          className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                        >
                          <img
                            src={imageUrl}
                            alt={`Visualization ${imgIndex + 1} for ${item.query}`}
                            className="w-full h-auto"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.step_by_step && item.step_by_step.length > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">
                      Step-by-Step Solution:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-800 dark:text-gray-200">
                      {item.step_by_step.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-sm">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>🔗</span>
                  <a
                    href={`https://www.wolframalpha.com/input?i=${encodeURIComponent(item.query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-orange-600 dark:hover:text-orange-400 underline"
                  >
                    View on Wolfram Alpha
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>💡 Tip:</strong> These visualizations are automatically generated from mathematical and scientific concepts found in the video. Click on any visualization to explore it further on Wolfram Alpha.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
