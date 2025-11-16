'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PhotoIcon, PlayIcon } from '@heroicons/react/24/outline';

interface MultimediaElement {
  type: 'image' | 'video' | 'wolfram' | 'audio' | 'interactive';
  content: string;
  metadata?: {
    url?: string;
    search_query?: string;
    description?: string;
    wolfram_url?: string;
  };
}

interface EnhancedMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string | Date;
  multimedia?: MultimediaElement[];
}

interface EnhancedMessageBubbleProps {
  message: EnhancedMessage;
}

export const EnhancedMessageBubble: React.FC<EnhancedMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const hasMultimedia = message.multimedia && message.multimedia.length > 0;

  // Clean text from markdown formatting
  const cleanText = (text: string): string => {
    return text
      .replace(/\*\*/g, '') // Remove bold **
      .replace(/\*/g, '') // Remove italic *
      .replace(/#{1,6}\s/g, '') // Remove headers #
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links [text](url) but keep text
      .replace(/`([^`]+)`/g, '$1') // Remove code formatting `code`
      .replace(/^[-*+]\s/gm, '• ') // Convert list markers to bullets
      .replace(/\[IMAGE:.*?\]/gi, '') // Remove [IMAGE: ...] tags
      .replace(/\[VIDEO:.*?\]/gi, '') // Remove [VIDEO: ...] tags
      .replace(/\[WOLFRAM:.*?\]/gi, '') // Remove [WOLFRAM: ...] tags
      .replace(/\[AUDIO:.*?\]/gi, '') // Remove [AUDIO: ...] tags
      .replace(/\[INTERACTIVE:.*?\]/gi, '') // Remove [INTERACTIVE: ...] tags
      .trim();
  };

  // Format content with proper line breaks and structure
  const formatContent = (text: string): React.ReactNode[] => {
    const cleaned = cleanText(text);
    const lines = cleaned.split('\n');
    const formatted: React.ReactNode[] = [];
    
    lines.forEach((line, index) => {
      if (line.trim()) {
        // Check if it's a bullet point
        if (line.trim().startsWith('•')) {
          formatted.push(
            <div key={index} className="flex gap-2 my-1">
              <span className="text-blue-500">•</span>
              <span>{line.trim().substring(1).trim()}</span>
            </div>
          );
        } else {
          formatted.push(
            <p key={index} className="my-2">
              {line}
            </p>
          );
        }
      }
    });
    
    return formatted;
  };

  return (
    <div
      className={cn(
        'flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Split Layout for Assistant with Multimedia */}
      {!isUser && hasMultimedia ? (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Text Content */}
          <Card className="bg-card border-border shadow-md">
            <CardContent className="p-4">
              <div className="text-sm text-gray-900 dark:text-white leading-relaxed">
                {formatContent(message.content)}
              </div>
              <div className="text-xs text-muted-foreground mt-3">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>

          {/* Right: Multimedia */}
          <div className="space-y-3">
            {message.multimedia!.map((media, index) => (
              <Card key={index} className="bg-gray-50 dark:bg-gray-900 border-border">
                <CardContent className="p-4">
                  {media.type === 'image' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <PhotoIcon className="h-5 w-5 text-blue-500" />
                        <span>Visual Aid</span>
                      </div>
                      {media.metadata?.url ? (
                        <img
                          src={media.metadata.url}
                          alt={media.content}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
                          <PhotoIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {cleanText(media.content)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {media.type === 'video' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <PlayIcon className="h-5 w-5 text-red-500" />
                        <span>Video Resource</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {cleanText(media.content)}
                      </p>
                      {media.metadata?.search_query && (
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                            media.metadata.search_query
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          <PlayIcon className="h-4 w-4" />
                          Watch on YouTube
                        </a>
                      )}
                    </div>
                  )}

                  {media.type === 'wolfram' && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Wolfram Alpha Computation
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {cleanText(media.content)}
                      </p>
                      {media.metadata?.wolfram_url && (
                        <a
                          href={media.metadata.wolfram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                        >
                          Explore on Wolfram Alpha
                        </a>
                      )}
                    </div>
                  )}

                  {media.type === 'interactive' && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Interactive Activity
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {cleanText(media.content)}
                        </p>
                      </div>
                    </div>
                  )}

                  {media.type === 'audio' && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Audio Content
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {cleanText(media.content)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Regular Message Bubble */
        <Card
          className={cn(
            'max-w-[80%] shadow-md transition-all hover:shadow-lg',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border-border'
          )}
        >
          <CardContent className="p-4">
            <div className="text-sm leading-relaxed">
              {isUser ? (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              ) : (
                formatContent(message.content)
              )}
            </div>
            <div
              className={cn(
                'text-xs mt-2',
                isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}
            >
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedMessageBubble;
