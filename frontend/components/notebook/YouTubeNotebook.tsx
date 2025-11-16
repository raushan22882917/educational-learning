'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import apiClient from '@/lib/api-client';
import { VideoPreview } from '@/components/notebook/VideoPreview';
import { NotebookContent } from '@/components/notebook/NotebookContent';
import { LoadingSpinner } from '@/components/notebook/LoadingSpinner';

interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  duration: string;
}

interface NotebookData {
  video_metadata: VideoMetadata;
  has_transcript: boolean;
  notes: string;
  notes_wolfram?: Array<{
    query: string;
    description?: string;
    type?: string;
    result?: string;
    images?: string[];
    step_by_step?: string[];
  }>;
  summary: string;
  flashcards: Array<{ front: string; back: string }>;
  key_points: string[];
  quiz: Array<{
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
  }>;
  // NotebookLM features
  study_guide?: any;
  insights?: Array<{ type: string; title: string; insight: string }>;
  connections?: Array<{ topic: string; connection: string; relevance: string }>;
  timeline?: Array<{ timestamp: string; title: string; description: string; importance: string }>;
  audio_overview?: string;
  briefing_doc?: string;
}

export function YouTubeNotebook() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notebookData, setNotebookData] = useState<NotebookData | null>(null);

  const handleProcess = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/youtube/complete-notebook', {
        url: videoUrl,
        include_transcript: true,
      });

      if (response.data.success) {
        setNotebookData(response.data.data);
      } else {
        setError('Failed to process video');
      }
    } catch (err: any) {
      console.error('Error processing video:', err);
      setError(err.response?.data?.detail || 'Failed to process video');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVideoUrl('');
    setNotebookData(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              YouTube Video URL
            </label>
            <div className="flex gap-3">
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={loading || !!notebookData}
                className="flex-1"
              />
              {notebookData ? (
                <Button onClick={handleReset} variant="outline">
                  New Video
                </Button>
              ) : (
                <Button onClick={handleProcess} disabled={loading}>
                  {loading ? 'Processing...' : 'Generate Notebook'}
                </Button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Results */}
      {notebookData && (
        <div className="space-y-6">
          <VideoPreview metadata={notebookData.video_metadata} />
          <NotebookContent 
            data={notebookData} 
            videoUrl={videoUrl}
            videoTitle={notebookData.video_metadata.title}
          />
        </div>
      )}
    </div>
  );
}
