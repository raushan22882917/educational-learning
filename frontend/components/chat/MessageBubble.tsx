'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Message, WolframResult } from '@/lib/api-client';
import { InlineMath, BlockMath } from 'react-katex';
import { PhotoIcon, PlayIcon, SpeakerWaveIcon, StopIcon } from '@heroicons/react/24/outline';
import { MarkdownContent } from './MarkdownContent';
import { WolframModal } from './WolframModal';
import 'katex/dist/katex.min.css';

interface MessageBubbleProps {
  message: Message;
  onRequestExplanation?: (concept: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onRequestExplanation 
}) => {
  const isUser = message.role === 'user';
  const [selectedText, setSelectedText] = React.useState('');
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [showWolframModal, setShowWolframModal] = React.useState(false);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  // Text-to-speech functionality
  const handleSpeak = () => {
    if (isSpeaking) {
      // Stop speaking
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Start speaking
    const text = message.content.replace(/\$\$[\s\S]+?\$\$|\$[^\$]+?\$/g, ''); // Remove LaTeX
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  // Function to render content with LaTeX support
  const renderContent = (content: string) => {
    // Split content by LaTeX delimiters
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Match both inline ($...$) and block ($$...$$) LaTeX
    const latexRegex = /\$\$([\s\S]+?)\$\$|\$([^\$]+?)\$/g;
    let match;

    while ((match = latexRegex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      // Add LaTeX rendering
      if (match[1]) {
        // Block math ($$...$$)
        parts.push(
          <div key={match.index} className="my-2">
            <BlockMath math={match[1]} />
          </div>
        );
      } else if (match[2]) {
        // Inline math ($...$)
        parts.push(<InlineMath key={match.index} math={match[2]} />);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  // Render Wolfram computational results
  const renderWolframData = (wolframData: WolframResult) => {
    return (
      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
          Computational Result
        </div>
        
        {wolframData.result && (
          <div className="mb-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Result:</div>
            <div className="text-sm text-gray-900 dark:text-gray-100">
              <MarkdownContent content={wolframData.result} />
            </div>
          </div>
        )}

        {wolframData.step_by_step && wolframData.step_by_step.length > 0 && (
          <div className="mb-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Step-by-step:</div>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-900 dark:text-gray-100">
              {wolframData.step_by_step.map((step, index) => (
                <li key={index}>
                  <MarkdownContent content={step} />
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Display all images from Wolfram */}
        {wolframData.images && wolframData.images.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Visualizations:</div>
            <div className="grid grid-cols-1 gap-2">
              {wolframData.images.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Wolfram visualization ${index + 1}`}
                  className="max-w-full h-auto rounded border border-gray-300 dark:border-gray-600 bg-white"
                  onError={(e) => {
                    console.error('Failed to load Wolfram image:', imageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Fallback for old visual_url format */}
        {wolframData.visual_url && (!wolframData.images || wolframData.images.length === 0) && (
          <div className="mt-2">
            <img
              src={wolframData.visual_url}
              alt="Wolfram visualization"
              className="max-w-full h-auto rounded border border-gray-300 dark:border-gray-600"
            />
          </div>
        )}

        {/* View Full Details Button */}
        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
          <button
            onClick={() => setShowWolframModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            View Full Computational Details
          </button>
        </div>
      </div>
    );
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 0) {
      setSelectedText(text);
    }
  };

  const handleExplainClick = () => {
    if (onRequestExplanation) {
      const textToExplain = selectedText || message.content.substring(0, 100);
      onRequestExplanation(textToExplain);
      setSelectedText('');
    }
  };

  return (
    <div
      className={cn(
        'flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <Card
        className={cn(
          'max-w-[80%] shadow-md transition-all hover:shadow-lg',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border-border'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <div 
              className="flex-1 text-sm whitespace-pre-wrap break-words"
              onMouseUp={handleTextSelection}
            >
              <MarkdownContent content={message.content} />
            </div>
            
            {/* Audio button for AI messages */}
            {!isUser && (
              <button
                onClick={handleSpeak}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isSpeaking ? "Stop speaking" : "Read aloud"}
              >
                {isSpeaking ? (
                  <StopIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                ) : (
                  <SpeakerWaveIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            )}
          </div>
          
          {message.wolfram_data && renderWolframData(message.wolfram_data)}
          
          {/* Render multimedia elements */}
          {message.multimedia && message.multimedia.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.multimedia.map((media, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                  {media.type === 'image' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <PhotoIcon className="h-4 w-4" />
                        <span>Image</span>
                      </div>
                      {media.metadata?.url ? (
                        <img
                          src={media.metadata.url}
                          alt={media.content}
                          className="w-full rounded border border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 text-center">
                          <PhotoIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-xs text-gray-600 dark:text-gray-400">{media.content}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {media.type === 'video' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400">
                        <PlayIcon className="h-4 w-4" />
                        <span>Video Resource</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{media.content}</p>
                      
                      {/* Embedded YouTube Player */}
                      {media.metadata?.video_id ? (
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            className="absolute top-0 left-0 w-full h-full rounded-lg border border-gray-300 dark:border-gray-600"
                            src={`https://www.youtube.com/embed/${media.metadata.video_id}`}
                            title={media.content}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : media.metadata?.search_query ? (
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(media.metadata.search_query)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          <PlayIcon className="h-4 w-4" />
                          Search on YouTube
                        </a>
                      ) : (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Video suggestion: {media.content}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {media.type === 'wolfram' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        <span>Wolfram Alpha Computation</span>
                      </div>
                      
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                        <p className="text-sm text-gray-800 dark:text-gray-200 font-mono mb-2">
                          {media.content}
                        </p>
                        
                        {/* Debug: Log media data */}
                        {console.log('Wolfram media data:', media)}
                        
                        {/* Wolfram Alpha Preview Card - Always show, use content as fallback */}
                        <div className="mt-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-800/30 dark:to-red-800/30 rounded-lg p-4 border-2 border-orange-300 dark:border-orange-700">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                Computational Result
                              </h4>
                              <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                                Query: <span className="font-mono">{media.metadata?.query || media.content}</span>
                              </p>
                              <a
                                href={media.metadata?.wolfram_url || `https://www.wolframalpha.com/input?i=${encodeURIComponent(media.metadata?.query || media.content)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View on WolframAlpha
                              </a>
                            </div>
                          </div>
                        </div>
                        
                        {/* Old conditional preview - keeping for reference */}
                        {media.metadata?.query && false && (
                          <div className="mt-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-800/30 dark:to-red-800/30 rounded-lg p-4 border-2 border-orange-300 dark:border-orange-700">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                  Computational Result
                                </h4>
                                <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                                  Query: <span className="font-mono">{media.metadata?.query || media.content}</span>
                                </p>
                                <a
                                  href={`https://www.wolframalpha.com/input?i=${encodeURIComponent(media.metadata?.query || media.content)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-xs px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  View on WolframAlpha
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3 flex gap-2">
                          {media.metadata?.wolfram_url && media.metadata.wolfram_url !== `https://www.wolframalpha.com/input?i=${encodeURIComponent(media.metadata?.query || '')}` && (
                            <a
                              href={media.metadata.wolfram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-xs px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Alternative Link
                            </a>
                          )}
                          <button
                            onClick={() => {
                              const query = media.metadata?.query || media.content;
                              navigator.clipboard.writeText(query);
                            }}
                            className="inline-flex items-center gap-2 text-xs px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Query
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {media.type === 'interactive' && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Interactive Activity
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300">{media.content}</p>
                    </div>
                  )}
                  
                  {media.type === 'audio' && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Audio
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300">{media.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <div
              className={cn(
                'text-xs opacity-70',
                isUser ? 'text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
            
            {!isUser && onRequestExplanation && (
              <button
                onClick={handleExplainClick}
                className={cn(
                  'text-xs px-2 py-1 rounded transition-colors',
                  'hover:bg-primary/10 text-primary flex items-center gap-1'
                )}
                title={selectedText ? `Explain: "${selectedText.substring(0, 30)}..."` : 'Explain this message'}
              >
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
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
                Explain
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wolfram Modal */}
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
