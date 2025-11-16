'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarkdownContent } from '@/components/chat/MarkdownContent';
import { VideoChatInterface } from './VideoChatInterface';
import { FormulaSheet } from './FormulaSheet';
import apiClient from '@/lib/api-client';

interface WolframVisualization {
  query: string;
  description?: string;
  type?: string;
  result?: string;
  images?: string[];
  step_by_step?: string[];
}

interface SplitNotesViewProps {
  notes: string;
  wolframData?: WolframVisualization[];
  videoUrl: string;
  videoTitle: string;
}

export function SplitNotesView({ notes, wolframData, videoUrl, videoTitle }: SplitNotesViewProps) {
  const [copied, setCopied] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<'wolfram' | 'chat'>('chat');
  const [wolframVisualizations, setWolframVisualizations] = useState<WolframVisualization[]>(wolframData || []);
  const [loadingWolfram, setLoadingWolfram] = useState(false);
  const [wolframError, setWolframError] = useState<string | null>(null);

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

  const handleGenerateWolfram = async () => {
    setLoadingWolfram(true);
    setWolframError(null);
    setRightPanelMode('wolfram');

    try {
      // Call backend to analyze notes with Gemini and generate Wolfram visualizations
      const response = await apiClient.post('/api/youtube/analyze-wolfram', {
        notes: notes,
        video_title: videoTitle,
      });

      if (response.data.success) {
        const visualizations = response.data.data.wolfram_visualizations;
        
        if (visualizations && visualizations.length > 0) {
          setWolframVisualizations(visualizations);
        } else {
          setWolframError('No mathematical concepts found in the notes. Try asking mathematical questions in the chat!');
        }
      } else {
        setWolframError('Failed to generate Wolfram visualizations');
      }
    } catch (error: any) {
      console.error('Error generating Wolfram:', error);
      setWolframError(error.response?.data?.detail || 'Failed to generate Wolfram visualizations');
    } finally {
      setLoadingWolfram(false);
    }
  };

  const handleVisualizeFormula = async (formula: { name: string; formula: string; description: string; category?: string }) => {
    setLoadingWolfram(true);
    setWolframError(null);
    setRightPanelMode('wolfram');

    try {
      // Query Wolfram for this specific formula
      const response = await apiClient.post('/api/youtube/visualize-formula', {
        formula: formula.formula,
        name: formula.name,
        description: formula.description,
      });

      if (response.data.success) {
        const visualization = response.data.data.visualization;
        
        if (visualization) {
          // Add to existing visualizations or replace
          setWolframVisualizations([visualization]);
        } else {
          setWolframError('Could not generate visualization for this formula');
        }
      } else {
        setWolframError('Failed to visualize formula');
      }
    } catch (error: any) {
      console.error('Error visualizing formula:', error);
      setWolframError(error.response?.data?.detail || 'Failed to visualize formula');
    } finally {
      setLoadingWolfram(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Formula Sheet + Notes */}
      <div className="space-y-6">
        {/* Formula Sheet */}
        <FormulaSheet 
          notes={notes} 
          videoTitle={videoTitle}
          onVisualizeFormula={handleVisualizeFormula}
        />
        
        {/* Detailed Notes */}
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
      </div>

      {/* Right Side - Wolfram or Chat (Sticky) */}
      <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)]">
        <div className="flex flex-col h-full">
          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-4">
            <Button
              onClick={handleGenerateWolfram}
              variant={rightPanelMode === 'wolfram' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              disabled={loadingWolfram}
            >
              <span className="mr-2">🔬</span>
              {loadingWolfram ? 'Loading...' : `Wolfram${wolframVisualizations.length > 0 ? ` (${wolframVisualizations.length})` : ''}`}
            </Button>
            <Button
              onClick={() => setRightPanelMode('chat')}
              variant={rightPanelMode === 'chat' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
            >
              <span className="mr-2">💬</span>
              Chat
            </Button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {rightPanelMode === 'wolfram' ? (
              /* Wolfram Visualizations */
              <div className="h-full overflow-y-auto">
                {wolframError ? (
                  <Card className="p-6">
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">⚠️</div>
                      <p className="text-gray-600 dark:text-gray-400">{wolframError}</p>
                      <Button
                        onClick={() => setRightPanelMode('chat')}
                        variant="outline"
                        size="sm"
                        className="mt-4"
                      >
                        Go to Chat
                      </Button>
                    </div>
                  </Card>
                ) : wolframVisualizations.length === 0 ? (
                  <Card className="p-6">
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🔬</div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        No Visualizations Yet
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Click the Wolfram button to generate mathematical visualizations
                      </p>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center">
                        <span className="text-2xl">🔬</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Wolfram Visualizations
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Mathematical & scientific concepts
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {wolframVisualizations.map((item, index) => (
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
                            <div className="space-y-4">
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
                              Step-by-Step:
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
                            Explore on Wolfram Alpha
                          </a>
                        </div>
                      </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              /* Chat Interface */
              <div className="h-full">
                <VideoChatInterface videoUrl={videoUrl} videoTitle={videoTitle} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
