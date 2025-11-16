'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NotesView } from '@/components/notebook/NotesView';
import { SplitNotesView } from '@/components/notebook/SplitNotesView';
import { SummaryView } from '@/components/notebook/SummaryView';
import { FlashcardsView } from '@/components/notebook/FlashcardsView';
import { KeyPointsView } from '@/components/notebook/KeyPointsView';
import { QuizView } from '@/components/notebook/QuizView';
import { StudyGuideView } from '@/components/notebook/StudyGuideView';
import { InsightsView } from '@/components/notebook/InsightsView';
import { ConnectionsView } from '@/components/notebook/ConnectionsView';
import { TimelineView } from '@/components/notebook/TimelineView';
import { AudioOverviewView } from '@/components/notebook/AudioOverviewView';
import { BriefingView } from '@/components/notebook/BriefingView';
import { VideoChatInterface } from '@/components/notebook/VideoChatInterface';

interface NotebookContentProps {
  data: {
    notes: string;
    notes_wolfram?: Array<{
      query: string;
      description?: string;
      type?: string;
      result?: string;
      images?: string[];
      step_by_step?: string[];
    }>;
    summary: string;
    flashcards: Array<{ front: string; back: string }>;
    key_points: string[];
    quiz: Array<{
      question: string;
      options: string[];
      correct_answer: number;
      explanation: string;
    }>;
    has_transcript: boolean;
    // NotebookLM features
    study_guide?: any;
    insights?: Array<{ type: string; title: string; insight: string }>;
    connections?: Array<{ topic: string; connection: string; relevance: string }>;
    timeline?: Array<{ timestamp: string; title: string; description: string; importance: string }>;
    audio_overview?: string;
    briefing_doc?: string;
  };
  videoUrl: string;
  videoTitle: string;
}

type TabType = 'notes' | 'summary' | 'flashcards' | 'keypoints' | 'quiz' | 'studyguide' | 'insights' | 'connections' | 'timeline' | 'audio' | 'briefing' | 'chat';

export function NotebookContent({ data, videoUrl, videoTitle }: NotebookContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('notes');

  const tabs = [
    { id: 'chat' as TabType, label: 'Chat', icon: '💬', count: null, featured: true },
    { id: 'notes' as TabType, label: 'Notes', icon: '📝', count: null },
    { id: 'summary' as TabType, label: 'Summary', icon: '📄', count: null },
    { id: 'studyguide' as TabType, label: 'Study Guide', icon: '📚', count: null },
    { id: 'insights' as TabType, label: 'Insights', icon: '💡', count: data.insights?.length || 0 },
    { id: 'connections' as TabType, label: 'Connections', icon: '🔗', count: data.connections?.length || 0 },
    { id: 'timeline' as TabType, label: 'Timeline', icon: '⏱️', count: data.timeline?.length || 0 },
    { id: 'flashcards' as TabType, label: 'Flashcards', icon: '🎴', count: data.flashcards.length },
    { id: 'keypoints' as TabType, label: 'Key Points', icon: '🎯', count: data.key_points.length },
    { id: 'quiz' as TabType, label: 'Quiz', icon: '❓', count: data.quiz.length },
    { id: 'audio' as TabType, label: 'Audio Overview', icon: '🎙️', count: null },
    { id: 'briefing' as TabType, label: 'Briefing', icon: '📋', count: null },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <Card className="p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
                  {tab.count}
                </span>
              )}
            </Button>
          ))}
        </div>
      </Card>

      {/* Transcript Warning */}
      {!data.has_transcript && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                No Transcript Available
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This video doesn't have captions/transcript available. The content is generated based on the video title and description only.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Content */}
      <div>
        {activeTab === 'chat' && (
          <VideoChatInterface videoUrl={videoUrl} videoTitle={videoTitle} />
        )}
        {activeTab === 'notes' && (
          <SplitNotesView 
            notes={data.notes} 
            wolframData={data.notes_wolfram}
            videoUrl={videoUrl}
            videoTitle={videoTitle}
          />
        )}
        {activeTab === 'summary' && <SummaryView summary={data.summary} />}
        {activeTab === 'studyguide' && data.study_guide && (
          <StudyGuideView studyGuide={data.study_guide} />
        )}
        {activeTab === 'insights' && data.insights && (
          <InsightsView insights={data.insights} />
        )}
        {activeTab === 'connections' && data.connections && (
          <ConnectionsView connections={data.connections} />
        )}
        {activeTab === 'timeline' && data.timeline && (
          <TimelineView timeline={data.timeline} />
        )}
        {activeTab === 'flashcards' && <FlashcardsView flashcards={data.flashcards} />}
        {activeTab === 'keypoints' && <KeyPointsView keyPoints={data.key_points} />}
        {activeTab === 'quiz' && <QuizView questions={data.quiz} />}
        {activeTab === 'audio' && data.audio_overview && (
          <AudioOverviewView audioOverview={data.audio_overview} />
        )}
        {activeTab === 'briefing' && data.briefing_doc && (
          <BriefingView briefingDoc={data.briefing_doc} />
        )}
      </div>
    </div>
  );
}
