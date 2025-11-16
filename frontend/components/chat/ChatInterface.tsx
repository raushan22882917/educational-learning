'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSessionStore } from '@/stores/session-store';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { InteractiveMessageBubble } from './InteractiveMessageBubble';
import { ExplanationPanel, ExplanationFormat } from '@/components/explanation/ExplanationPanel';
import SessionSidebar from './SessionSidebar';
import { WelcomeScreen } from './WelcomeScreen';
import { sessionAPI, getErrorMessage } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { toast } from '@/stores/toast-store';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface ChatInterfaceProps {
  sessionId?: string;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessionId,
  className,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isSending,
    error,
    sendMessage,
    clearError,
  } = useSessionStore();

  // Session sidebar state
  const [showSessionSidebar, setShowSessionSidebar] = useState(false);

  // Explanation state
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationConcept, setExplanationConcept] = useState('');
  const [explanations, setExplanations] = useState<ExplanationFormat[]>([]);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Message Failed', getErrorMessage(error));
    }
  };

  const handleRequestExplanation = async (concept: string) => {
    if (!sessionId || !concept.trim()) return;

    setExplanationConcept(concept);
    setShowExplanation(true);
    setIsLoadingExplanation(true);
    setExplanationError(null);

    try {
      const response = await sessionAPI.explainConcept(sessionId, {
        concept: concept.trim(),
        styles: ['comprehensive', 'analogy', 'example'],
      });

      setExplanations(response.explanations);
    } catch (error: any) {
      console.error('Failed to get explanation:', error);
      const errorMsg = getErrorMessage(error);
      setExplanationError(errorMsg);
      toast.error('Explanation Failed', errorMsg);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleRequestAlternative = async () => {
    if (!sessionId || !explanationConcept) return;

    setIsLoadingExplanation(true);
    setExplanationError(null);

    try {
      const response = await sessionAPI.explainConcept(sessionId, {
        concept: explanationConcept,
        styles: ['steps', 'simple', 'example'],
      });

      setExplanations(response.explanations);
    } catch (error: any) {
      console.error('Failed to get alternative explanation:', error);
      const errorMsg = getErrorMessage(error);
      setExplanationError(errorMsg);
      toast.error('Alternative Explanation Failed', errorMsg);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-background relative', className)}>
      {/* Session Sidebar Toggle Button */}
      <button
        onClick={() => setShowSessionSidebar(!showSessionSidebar)}
        className="fixed top-4 right-4 z-20 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
        title="Toggle session list"
      >
        <Bars3Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Session Sidebar */}
      <SessionSidebar
        isOpen={showSessionSidebar}
        onClose={() => setShowSessionSidebar(false)}
      />

      {/* Error banner */}
      {error && (
        <div className="bg-destructive/10 border-b border-destructive/20 p-3 flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-destructive"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-sm text-destructive font-medium">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-destructive hover:text-destructive/80 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2"
      >
        {messages.length === 0 && !isSending && !showExplanation && (
          <WelcomeScreen onQuickStart={handleSendMessage} />
        )}

        {/* Smart message list with automatic virtual scrolling for long conversations */}
        <MessageList
          messages={messages}
          onRequestExplanation={
            sessionId
              ? (concept) => handleRequestExplanation(concept)
              : undefined
          }
        />

        {isSending && <TypingIndicator />}

        {/* Explanation panel */}
        {showExplanation && (
          <div className="mt-4">
            {explanationError ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
                {explanationError}
              </div>
            ) : (
              <ExplanationPanel
                concept={explanationConcept}
                explanations={explanations}
                onRequestAlternative={handleRequestAlternative}
                isLoading={isLoadingExplanation}
              />
            )}
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isSending}
        placeholder="Ask a question or explore a topic..."
      />
    </div>
  );
};
