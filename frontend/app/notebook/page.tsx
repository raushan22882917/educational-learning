'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { YouTubeNotebook } from '@/components/notebook/YouTubeNotebook';

export default function NotebookPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            YouTube Learning Notebook
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Extract notes, summaries, flashcards, and more from YouTube videos
          </p>
        </div>
        
        <YouTubeNotebook />
      </div>
    </DashboardLayout>
  );
}
