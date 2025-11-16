'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  // Remove multimedia tags - they're rendered separately
  const cleanContent = content
    .replace(/\[IMAGE:[\s\S]*?\]/g, '')
    .replace(/\[VIDEO:[\s\S]*?\]/g, '')
    .replace(/\[WOLFRAM:[\s\S]*?\]/g, '')
    .replace(/\[AUDIO:[\s\S]*?\]/g, '')
    .replace(/\[INTERACTIVE:[\s\S]*?\]/g, '')
    .trim();

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Render LaTeX in paragraphs
        p: ({ children, ...props }) => {
          const text = String(children);
          
          // Check if contains LaTeX
          if (text.includes('$')) {
            const parts: React.ReactNode[] = [];
            let lastIndex = 0;
            const latexRegex = /\$\$([\s\S]+?)\$\$|\$([^\$]+?)\$/g;
            let match;

            while ((match = latexRegex.exec(text)) !== null) {
              if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
              }

              if (match[1]) {
                parts.push(
                  <span key={match.index} className="block my-2">
                    <BlockMath math={match[1]} />
                  </span>
                );
              } else if (match[2]) {
                parts.push(<InlineMath key={match.index} math={match[2]} />);
              }

              lastIndex = match.index + match[0].length;
            }

            if (lastIndex < text.length) {
              parts.push(text.substring(lastIndex));
            }

            return <p {...props}>{parts}</p>;
          }

          return <p {...props}>{children}</p>;
        },
        // Style code blocks
        code: ({ inline, children, ...props }: any) => {
          return inline ? (
            <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono" {...props}>
              {children}
            </code>
          ) : (
            <code className="block p-3 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono overflow-x-auto" {...props}>
              {children}
            </code>
          );
        },
        // Style lists
        ul: ({ children, ...props }) => (
          <ul className="list-disc list-inside space-y-1 my-2" {...props}>{children}</ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="list-decimal list-inside space-y-1 my-2" {...props}>{children}</ol>
        ),
        // Style headings
        h1: ({ children, ...props }) => (
          <h1 className="text-xl font-bold mt-4 mb-2" {...props}>{children}</h1>
        ),
        h2: ({ children, ...props }) => (
          <h2 className="text-lg font-bold mt-3 mb-2" {...props}>{children}</h2>
        ),
        h3: ({ children, ...props }) => (
          <h3 className="text-base font-bold mt-2 mb-1" {...props}>{children}</h3>
        ),
        // Style links
        a: ({ children, ...props }) => (
          <a className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
            {children}
          </a>
        ),
        // Style bold text
        strong: ({ children, ...props }) => (
          <strong className="font-bold text-gray-900 dark:text-gray-100" {...props}>{children}</strong>
        ),
        // Style italic text
        em: ({ children, ...props }) => (
          <em className="italic text-gray-800 dark:text-gray-200" {...props}>{children}</em>
        ),
        // Style blockquotes
        blockquote: ({ children, ...props }) => (
          <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2" {...props}>
            {children}
          </blockquote>
        ),
        // Style tables
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto my-2">
            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props}>
              {children}
            </table>
          </div>
        ),
        th: ({ children, ...props }) => (
          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-100 dark:bg-gray-800 font-semibold" {...props}>
            {children}
          </th>
        ),
        td: ({ children, ...props }) => (
          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2" {...props}>
            {children}
          </td>
        ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
};
