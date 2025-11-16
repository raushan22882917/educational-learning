'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Message, WolframResult } from '@/lib/api-client';
import { 
  SpeakerWaveIcon, 
  StopIcon, 
  ClipboardDocumentIcon,
  CheckIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';
import { MarkdownContent } from './MarkdownContent';
import { WolframModal } from './WolframModal';

interface InteractiveMessageBubbleProps {
  message: Message;
  onRequestExplanation?: (concept: string) => void;
}

export const InteractiveMessageBubble: React.FC<InteractiveMessageBubbleProps> = ({ 
  message, 
  onRequestExplanation 
}) => {
  const isUser = message.role === 'user';
  const [selectedText, setSelectedText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showWolframModal, setShowWolframModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Text-to-speech
  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = message.content.replace(/\$\$[\s\S]+?\$\$|\$[^\$]+?\$/g, '');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Feedback
  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    // TODO: Send feedback to backend
  };

  // Render Wolfram data inline
  const renderWolframData = (wolframData: WolframResult) => {
    return (
      <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Computational Result
          </div>
        </div>
        
        {wolframData.result && (
          <div className="mb-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Result:</div>
            <div className="text-sm text-gray-900 dark:text-gray-100">
              <MarkdownContent content={wolframData.result} />
            </div>
          </div>
        )}

        {wolframData.images && wolframData.images.length > 0 && (
          <div className="space-y-2">
            {wolframData.images.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`Visualization ${index + 1}`}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => setShowWolframModal(true)}
              />
            ))}
          </div>
        )}

        <button
          onClick={() => setShowWolframModal(true)}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium text-sm shadow-sm hover:shadow-md"
        >
          <ArrowsPointingOutIcon className="w-4 h-4" />
          View Full Details
        </button>
      </div>
    );
  };

  // Render multimedia
  const renderMultimedia = () => {
    if (!message.multimedia || message.multimedia.length === 0) return null;

    return (
      <div className="mt-3 space-y-3">
        {message.multimedia.map((media, index) => (
          <div 
            key={index} 
            className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md transition-all"
          >
            {media.type === 'image' && media.metadata?.url && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>Generated Image</span>
                </div>
                <img
                  src={media.metadata.url}
                  alt={media.content}
                  className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => window.open(media.metadata.url, '_blank')}
                />
              </div>
            )}
            
            {media.type === 'video' && media.metadata?.video_id && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
                  <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <span>Video Resource</span>
                </div>
                <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${media.metadata?.video_id || ''}`}
                    title={media.content}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex w-full mb-4 group',
        isUser ? 'justify-end' : 'justify-start'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn('max-w-[85%] relative', isUser ? 'items-end' : 'items-start')}>
        {/* Action buttons */}
        {!isUser && showActions && (
          <div className="absolute -left-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleSpeak}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
              title={isSpeaking ? "Stop" : "Read aloud"}
            >
              {isSpeaking ? (
                <StopIcon className="w-4 h-4 text-red-600" />
              ) : (
                <SpeakerWaveIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
              title="Copy"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4 text-green-600" />
              ) : (
                <ClipboardDocumentIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        )}

        <Card
          className={cn(
            'shadow-md transition-all duration-200 hover:shadow-xl',
            isUser
              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground'
              : 'bg-card border-2 border-border hover:border-primary/30'
          )}
        >
          <CardContent className="p-4">
            <div className="text-sm whitespace-pre-wrap break-words">
              <MarkdownContent content={message.content} />
            </div>
            
            {message.wolfram_data && renderWolframData(message.wolfram_data)}
            {renderMultimedia()}
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
              <div className="text-xs opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
              
              {!isUser && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFeedback('up')}
                    className={cn(
                      'p-1.5 rounded-lg transition-all',
                      feedback === 'up' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <HandThumbUpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleFeedback('down')}
                    className={cn(
                      'p-1.5 rounded-lg transition-all',
                      feedback === 'down' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600' 
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <HandThumbDownIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {message.wolfram_data && (
        <WolframModal
          isOpen={showWolframModal}
          onClose={() => setShowWolframModal(false)}
          wolframData={message.wolfram_data}
          query={message.wolfram_data.query}
        />
      )}
    </div>
  );
};
