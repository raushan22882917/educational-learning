'use client';

import React from 'react';
import { 
  MicrophoneIcon, 
  SpeakerWaveIcon, 
  ClipboardDocumentIcon,
  HandThumbUpIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export const ChatFeatureShowcase: React.FC = () => {
  const features = [
    {
      icon: MicrophoneIcon,
      title: 'Voice Input',
      description: 'Speak your questions naturally',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      icon: SpeakerWaveIcon,
      title: 'Text-to-Speech',
      description: 'Listen to AI responses',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: ClipboardDocumentIcon,
      title: 'Quick Copy',
      description: 'Copy messages instantly',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: HandThumbUpIcon,
      title: 'Feedback',
      description: 'Rate AI responses',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: SparklesIcon,
      title: 'Smart Suggestions',
      description: 'Quick action buttons',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Interactive',
      description: 'Everything in context',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
      {features.map((feature, index) => (
        <div
          key={index}
          className={cn(
            'p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700',
            'hover:scale-105 transition-all duration-200 cursor-pointer',
            'hover:shadow-lg',
            feature.bgColor
          )}
        >
          <feature.icon className={cn('w-8 h-8 mb-2', feature.color)} />
          <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
          <p className="text-xs text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
