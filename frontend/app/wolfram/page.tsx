'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function WolframViewerPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [iframeError, setIframeError] = useState(false);
  
  const wolframUrl = `https://www.wolframalpha.com/input?i=${encodeURIComponent(query)}`;

  useEffect(() => {
    // Check if iframe loads successfully
    const timer = setTimeout(() => {
      // If iframe doesn't load in 3 seconds, show error
      setIframeError(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/learn"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Chat</span>
            </Link>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Wolfram Alpha
              </h1>
            </div>
          </div>
          
          <a
            href={wolframUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Open in New Tab
          </a>
        </div>
      </div>

      {/* Query Display */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-700 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-gray-600 dark:text-gray-400">Query:</p>
          <p className="text-lg font-mono text-gray-900 dark:text-white">{query}</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative h-[calc(100vh-140px)]">
        {!iframeError ? (
          <>
            {/* Attempt to load iframe */}
            <iframe
              src={wolframUrl}
              className="w-full h-full border-0"
              title="Wolfram Alpha"
              sandbox="allow-scripts allow-same-origin allow-forms"
              onError={() => setIframeError(true)}
            />
            
            {/* Loading overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading Wolfram Alpha...</p>
              </div>
            </div>
          </>
        ) : (
          /* Error message - iframe blocked */
          <div className="flex items-center justify-center h-full p-8">
            <div className="max-w-2xl text-center">
              <div className="mb-6">
                <svg className="w-16 h-16 text-orange-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Cannot Embed WolframAlpha
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  WolframAlpha prevents embedding their website in iframes for security reasons.
                  However, you can still access the full computational results!
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href={wolframUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-semibold shadow-lg hover:shadow-xl"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open WolframAlpha in New Tab
                </a>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    💡 <strong>Tip:</strong> All computational results, graphs, and step-by-step solutions are already shown in the chat!
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    You only need to open WolframAlpha if you want additional interactive features.
                  </p>
                </div>

                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  Back to Chat
                </Link>
              </div>

              {/* URL for reference */}
              <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Direct Link:</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all flex-1">
                    {wolframUrl}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(wolframUrl);
                      alert('Link copied!');
                    }}
                    className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Copy link"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
