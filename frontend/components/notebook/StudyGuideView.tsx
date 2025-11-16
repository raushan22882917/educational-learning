'use client';

import { Card } from '@/components/ui/card';
import { MarkdownContent } from '@/components/chat/MarkdownContent';

interface StudyGuideViewProps {
  studyGuide: {
    overview: string;
    prerequisites: string[];
    main_concepts: Array<{ concept: string; explanation: string }>;
    terminology: Array<{ term: string; definition: string }>;
    examples: string[];
    misconceptions: string[];
    practice_questions: string[];
    further_learning: string[];
  };
}

export function StudyGuideView({ studyGuide }: StudyGuideViewProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          📚 Comprehensive Study Guide
        </h2>
        
        {/* Overview */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Overview
          </h3>
          <p className="text-gray-700 dark:text-gray-300">{studyGuide.overview}</p>
        </section>

        {/* Prerequisites */}
        {studyGuide.prerequisites.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Prerequisites
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              {studyGuide.prerequisites.map((prereq, index) => (
                <li key={index}>{prereq}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Main Concepts */}
        {studyGuide.main_concepts.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Main Concepts
            </h3>
            <div className="space-y-4">
              {studyGuide.main_concepts.map((concept, index) => (
                <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    {concept.concept}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">{concept.explanation}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Terminology */}
        {studyGuide.terminology.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Key Terminology
            </h3>
            <div className="grid gap-3">
              {studyGuide.terminology.map((term, index) => (
                <div key={index} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <dt className="font-semibold text-purple-900 dark:text-purple-100">
                    {term.term}
                  </dt>
                  <dd className="text-gray-700 dark:text-gray-300 mt-1">{term.definition}</dd>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Examples */}
        {studyGuide.examples.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Examples & Applications
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              {studyGuide.examples.map((example, index) => (
                <li key={index}>{example}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Misconceptions */}
        {studyGuide.misconceptions.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Common Misconceptions
            </h3>
            <div className="space-y-2">
              {studyGuide.misconceptions.map((misconception, index) => (
                <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-gray-700 dark:text-gray-300">{misconception}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Practice Questions */}
        {studyGuide.practice_questions.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Practice Questions
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              {studyGuide.practice_questions.map((question, index) => (
                <li key={index}>{question}</li>
              ))}
            </ol>
          </section>
        )}

        {/* Further Learning */}
        {studyGuide.further_learning.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Further Learning
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              {studyGuide.further_learning.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          </section>
        )}
      </Card>
    </div>
  );
}
