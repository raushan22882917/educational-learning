/**
 * Virtual scrolling component for chat messages.
 * Renders only visible messages to improve performance with long message histories.
 */

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  wolframData?: any;
}

interface VirtualMessageListProps {
  messages: Message[];
  onRequestExplanation?: (concept: string) => void;
  className?: string;
}

const ITEM_HEIGHT = 120; // Estimated average message height
const OVERSCAN = 3; // Number of items to render outside viewport

export const VirtualMessageList: React.FC<VirtualMessageListProps> = ({
  messages,
  onRequestExplanation,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    messages.length,
    Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
  );

  const visibleMessages = messages.slice(startIndex, endIndex);
  const totalHeight = messages.length * ITEM_HEIGHT;
  const offsetY = startIndex * ITEM_HEIGHT;

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setScrollTop(scrollTop);
    
    // Check if user is near bottom (within 100px)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  }, []);

  // Update container height on resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length, shouldAutoScroll]);

  // Scroll to bottom on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto ${className}`}
      style={{ height: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleMessages.map((message) => (
            <div
              key={message.id}
              style={{ minHeight: ITEM_HEIGHT }}
              className="mb-2"
            >
              <MessageBubble
                message={message}
                onRequestExplanation={
                  message.role === 'assistant' && onRequestExplanation
                    ? onRequestExplanation
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
