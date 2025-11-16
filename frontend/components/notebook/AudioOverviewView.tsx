'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarkdownContent } from '@/components/chat/MarkdownContent';

interface AudioOverviewViewProps {
  audioOverview: string;
}

export function AudioOverviewView({ audioOverview }: AudioOverviewViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(audioOverview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([audioOverview], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audio-overview-script.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simulate play/pause (in real implementation, this would use text-to-speech)
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual text-to-speech functionality
    if (!isPlaying) {
      alert('Text-to-speech feature coming soon! For now, you can read the script below or copy it to use with your preferred TTS tool.');
      setIsPlaying(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          🎙️ Audio Overview
        </h2>
        <div className="flex gap-2">
          <Button onClick={handlePlayPause} variant="default" size="sm">
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </Button>
          <Button onClick={handleCopy} variant="outline" size="sm">
            {copied ? '✓ Copied' : '📋 Copy'}
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm">
            💾 Download
          </Button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              NotebookLM-Style Audio Overview
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              This is a conversational script designed to be read aloud or used with text-to-speech. 
              It provides an engaging 2-3 minute overview of the video content.
            </p>
          </div>
        </div>
      </div>

      {/* Audio Player Visualization (Placeholder) */}
      {isPlaying && (
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-purple-600 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 40 + 10}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Playing audio overview...
            </span>
          </div>
        </div>
      )}

      {/* Script Content */}
      <div className="prose dark:prose-invert max-w-none">
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📝 Script
          </h3>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {audioOverview}
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
          💡 How to Use
        </h4>
        <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
          <li>• Copy the script and use it with your favorite text-to-speech tool</li>
          <li>• Read it aloud to review the content while multitasking</li>
          <li>• Share it with study partners for group discussions</li>
          <li>• Use it as a podcast-style summary for on-the-go learning</li>
        </ul>
      </div>
    </Card>
  );
}
