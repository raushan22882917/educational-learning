'use client';

import { Card } from '@/components/ui/card';

interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  duration: string;
}

interface VideoPreviewProps {
  metadata: VideoMetadata;
}

export function VideoPreview({ metadata }: VideoPreviewProps) {
  return (
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-2 gap-6 p-6">
        {/* Video Thumbnail */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={metadata.thumbnail}
            alt={metadata.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <a
              href={`https://www.youtube.com/watch?v=${metadata.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-colors"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Video Info */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {metadata.title}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {metadata.channel}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {metadata.duration}
            </span>
          </div>
          {metadata.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
              {metadata.description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
