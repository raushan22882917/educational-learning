'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import apiClient from '@/lib/api-client';
import { MarkdownContent } from '@/components/chat/MarkdownContent';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  wolfram_data?: {
    query: string;
    result?: string;
    images?: string[];
    step_by_step?: string[];
  };
  timestamp: Date;
}

interface VideoChatInterfaceProps {
  videoUrl: string;
  videoTitle: string;
}

export function VideoChatInterface({ videoUrl, videoTitle }: VideoChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiClient.post('/api/youtube/chat', {
        video_url: videoUrl,
        question: input,
      });

      if (response.data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.data.answer,
          wolfram_data: response.data.data.wolfram_data,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    'What are the main topics covered?',
    'Can you explain the key concepts?',
    'What are the practical applications?',
    'Summarize the most important points',
  ];

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-xl">💬</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Chat with Video Content
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-md">
              {videoTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🤖</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Ask me anything about this video!
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              I can help you understand the content, explain concepts, and answer questions.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="space-y-3">
                  <div className="prose dark:prose-invert prose-sm max-w-none">
                    <MarkdownContent content={message.content} />
                  </div>
                  
                  {message.wolfram_data && (
                    <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                          🔬 Wolfram Alpha
                        </span>
                      </div>
                      
                      {message.wolfram_data.result && (
                        <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                          {message.wolfram_data.result}
                        </p>
                      )}
                      
                      {message.wolfram_data.images && message.wolfram_data.images.length > 0 && (
                        <div className="space-y-2">
                          {message.wolfram_data.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="Wolfram visualization"
                              className="w-full rounded border"
                            />
                          ))}
                        </div>
                      )}
                      
                      {message.wolfram_data.step_by_step && message.wolfram_data.step_by_step.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-orange-900 dark:text-orange-100 mb-1">
                            Steps:
                          </p>
                          <ol className="text-xs space-y-1 list-decimal list-inside">
                            {message.wolfram_data.step_by_step.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
              
              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about the video..."
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            {loading ? '...' : 'Send'}
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          💡 Tip: Ask about concepts, request explanations, or solve problems from the video
        </p>
      </div>
    </Card>
  );
}
