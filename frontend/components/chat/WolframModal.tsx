'use client';

import React from 'react';
import { XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { WolframResult } from '@/lib/api-client';
import { MarkdownContent } from './MarkdownContent';

interface WolframModalProps {
  isOpen: boolean;
  onClose: () => void;
  wolframData: WolframResult;
  query: string;
}

export const WolframModal: React.FC<WolframModalProps> = ({
  isOpen,
  onClose,
  wolframData,
  query,
}) => {
  if (!isOpen) return null;

  const wolframUrl = `https://www.wolframalpha.com/input?i=${encodeURIComponent(query)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Wolfram Alpha Computation
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {query}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6">
          {/* Result */}
          {wolframData.result && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Result
              </h3>
              <div className="text-base text-gray-900 dark:text-gray-100">
                <MarkdownContent content={wolframData.result} />
              </div>
            </div>
          )}

          {/* Step by Step */}
          {wolframData.step_by_step && wolframData.step_by_step.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3">
                Step-by-Step Solution
              </h3>
              <ol className="space-y-3">
                {wolframData.step_by_step.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                      <MarkdownContent content={step} />
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Visualizations */}
          {wolframData.images && wolframData.images.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-3">
                Visualizations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wolframData.images.map((imageUrl, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                    <img
                      src={imageUrl}
                      alt={`Wolfram visualization ${index + 1}`}
                      className="w-full h-auto rounded"
                      onError={(e) => {
                        console.error('Failed to load Wolfram image:', imageUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wolfram Alpha Link Section */}
          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg p-6 border-2 border-orange-300 dark:border-orange-700">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                View this computation on WolframAlpha for interactive features and more details
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`/wolfram?q=${encodeURIComponent(query)}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-semibold shadow-lg hover:shadow-xl"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View on WolframAlpha
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(wolframUrl);
                    alert('Link copied to clipboard!');
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-semibold shadow-lg hover:shadow-xl"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </button>
              </div>
            </div>
            
            {/* Show URL for reference */}
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-orange-200 dark:border-orange-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Direct Link:</p>
              <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                {wolframUrl}
              </p>
            </div>
          </div>

          {/* Pods (if available) */}
          {wolframData.pods && wolframData.pods.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Additional Information
              </h3>
              {wolframData.pods.map((pod: any, index: number) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {pod.title}
                  </h4>
                  {pod.text && pod.text.length > 0 && (
                    <div className="space-y-1">
                      {pod.text.map((text: string, textIndex: number) => (
                        <p key={textIndex} className="text-sm text-gray-700 dark:text-gray-300">
                          {text}
                        </p>
                      ))}
                    </div>
                  )}
                  {pod.images && pod.images.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {pod.images.map((img: string, imgIndex: number) => (
                        <img
                          key={imgIndex}
                          src={img}
                          alt={`${pod.title} ${imgIndex + 1}`}
                          className="w-full h-auto rounded border border-gray-300 dark:border-gray-600"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by Wolfram Alpha Computational Intelligence
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
