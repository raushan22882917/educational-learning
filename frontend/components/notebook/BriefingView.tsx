'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarkdownContent } from '@/components/chat/MarkdownContent';

interface BriefingViewProps {
  briefingDoc: string;
}

export function BriefingView({ briefingDoc }: BriefingViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(briefingDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([briefingDoc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'briefing-document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Briefing Document</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 40px auto;
                padding: 20px;
              }
              h1 { color: #1a202c; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
              h2 { color: #2d3748; margin-top: 30px; }
              h3 { color: #4a5568; }
              ul, ol { margin-left: 20px; }
              @media print {
                body { margin: 0; padding: 20px; }
              }
            </style>
          </head>
          <body>
            ${briefingDoc.replace(/\n/g, '<br>')}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📋 Executive Briefing
        </h2>
        <div className="flex gap-2">
          <Button onClick={handleCopy} variant="outline" size="sm">
            {copied ? '✓ Copied' : '📋 Copy'}
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm">
            💾 Download
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm">
            🖨️ Print
          </Button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
              Professional Briefing Document
            </h3>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              A concise, executive-style summary perfect for quick reviews, presentations, 
              or sharing with colleagues. Formatted for professional use.
            </p>
          </div>
        </div>
      </div>

      {/* Briefing Document Content */}
      <div className="prose dark:prose-invert max-w-none">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm">
          <MarkdownContent content={briefingDoc} />
        </div>
      </div>

      {/* Document Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
          <div className="text-2xl mb-2">📄</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Format
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Executive Summary
          </div>
        </div>
        
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
          <div className="text-2xl mb-2">⏱️</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Reading Time
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            ~{Math.ceil(briefingDoc.split(' ').length / 200)} min
          </div>
        </div>
        
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Purpose
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Quick Reference
          </div>
        </div>
      </div>

      {/* Usage Suggestions */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          💡 Best Uses
        </h4>
        <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
          <li>• Share with team members who need a quick overview</li>
          <li>• Use as a reference document for meetings or presentations</li>
          <li>• Include in reports or research documentation</li>
          <li>• Print for offline review or annotation</li>
          <li>• Archive for future reference and knowledge management</li>
        </ul>
      </div>
    </Card>
  );
}
