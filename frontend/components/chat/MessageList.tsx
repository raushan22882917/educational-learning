/**
 * Smart message list component that switches between regular and virtual scrolling
 * based on message count for optimal performance.
 */

'use client';

import React, { lazy, Suspense } from 'react';
import { MessageBubble } from './MessageBubble';

// Lazy load virtual scrolling component only when needed
const VirtualMessageList = lazy(() => 
  import('./VirtualMessageList').then(mod => ({ default: mod.VirtualMessageList }))
);

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  wolframData?: any;
}

interface MessageListProps {
  messages: Message[];
  onRequestExplanation?: (concept: string) => void;
  className?: string;
}

const VIRTUAL_SCROLL_THRESHOLD = 50;

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onRequestExplanation,
  className = '',
}) => {
  // Use virtual scrolling for long message histories
  if (messages.length >= VIRTUAL_SCROLL_THRESHOLD) {
    return (
      <Suspense
        fallback={
          <div className={className}>
            {messages.slice(-10).map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onRequestExplanation={
                  message.role === 'assistant' && onRequestExplanation
                    ? onRequestExplanation
                    : undefined
                }
              />
            ))}
          </div>
        }
      >
        <VirtualMessageList
          messages={messages}
          onRequestExplanation={onRequestExplanation}
          className={className}
        />
      </Suspense>
    );
  }

  // Regular rendering for shorter conversations
  return (
    <div className={className}>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onRequestExplanation={
            message.role === 'assistant' && onRequestExplanation
              ? onRequestExplanation
              : undefined
          }
        />
      ))}
    </div>
  );
};
