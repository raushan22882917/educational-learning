'use client';

import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PaperAirplaneIcon, MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type your message...',
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice input
  const toggleVoiceInput = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          setMessage(transcript);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
      }
    }
  };

  // Quick suggestions
  const suggestions = [
    'Explain this concept',
    'Show me an example',
    'What are the steps?',
    'Can you visualize this?'
  ];

  return (
    <div className="border-t bg-gradient-to-b from-background to-muted/20">
      {/* Quick Suggestions */}
      {message.length === 0 && !isFocused && (
        <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setMessage(suggestion)}
              className="flex-shrink-0 px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-all hover:scale-105 active:scale-95"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 sm:p-4">
        <div
          className={cn(
            'flex gap-2 items-end p-2 rounded-2xl border-2 transition-all duration-200',
            isFocused
              ? 'border-primary shadow-lg shadow-primary/20 bg-background'
              : 'border-border bg-muted/30',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'flex-1 resize-none bg-transparent border-none outline-none',
              'text-base placeholder:text-muted-foreground',
              'min-h-[44px] max-h-[150px] py-2 px-2',
              disabled && 'cursor-not-allowed'
            )}
          />

          {/* Voice Input Button */}
          <button
            onClick={toggleVoiceInput}
            disabled={disabled}
            className={cn(
              'flex-shrink-0 p-2.5 rounded-xl transition-all',
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            title={isRecording ? 'Stop recording' : 'Voice input'}
          >
            {isRecording ? (
              <StopIcon className="w-5 h-5" />
            ) : (
              <MicrophoneIcon className="w-5 h-5" />
            )}
          </button>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className={cn(
              'flex-shrink-0 rounded-xl min-h-[44px] min-w-[44px] px-4',
              'transition-all duration-200',
              message.trim() && !disabled
                ? 'bg-primary hover:bg-primary/90 scale-100'
                : 'scale-95 opacity-50'
            )}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            <span className="ml-2 hidden sm:inline">Send</span>
          </Button>
        </div>

        {/* Character count for long messages */}
        {message.length > 200 && (
          <div className="text-xs text-muted-foreground mt-2 text-right">
            {message.length} characters
          </div>
        )}
      </div>
    </div>
  );
};
