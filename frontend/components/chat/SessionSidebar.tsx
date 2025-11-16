'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { sessionAPI, UserSessionSummary, getErrorMessage } from '@/lib/api-client';
import { toast } from '@/stores/toast-store';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  ClockIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface SessionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionSidebar({ isOpen, onClose }: SessionSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<UserSessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await sessionAPI.getUserSessions();
      setSessions(response.sessions);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      toast.error('Failed to load sessions', errorMsg);
      console.error('Failed to fetch sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      fetchSessions();
    }
  }, [user, isOpen]);

  const handleNewSession = () => {
    // Navigate to new session page
    window.location.href = '/learn';
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 z-40 h-screen transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700
          shadow-2xl
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chat Sessions
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* New Session Button */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={handleNewSession}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              New Chat Session
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto px-2 py-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <ArrowPathIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3 animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading sessions...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="text-red-500 dark:text-red-400 mb-3">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Failed to load sessions
                </p>
                <button
                  onClick={fetchSessions}
                  className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No chat sessions yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Start a new session to begin learning
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => {
                  const isActive = pathname.includes(session.id);
                  const sessionDate = new Date(session.created_at);
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - sessionDate.getTime());
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                  
                  let timeAgo = '';
                  if (diffDays > 0) {
                    timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                  } else if (diffHours > 0) {
                    timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                  } else {
                    timeAgo = 'Just now';
                  }
                  
                  return (
                    <Link
                      key={session.id}
                      href={`/learn/${session.id}`}
                      onClick={onClose}
                      className={`
                        block px-3 py-3 rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-start gap-2">
                        <ChatBubbleLeftRightIcon
                          className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              isActive
                                ? 'text-blue-900 dark:text-blue-100'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {session.topic || 'Untitled Session'}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <ClockIcon className="h-3 w-3 text-gray-400" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {timeAgo}
                            </p>
                          </div>
                          {session.message_count > 0 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {session.message_count} message{session.message_count !== 1 ? 's' : ''}
                            </p>
                          )}
                          {session.status === 'completed' && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
