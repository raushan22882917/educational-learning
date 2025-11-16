'use client';

import React from 'react';
import { 
  SparklesIcon, 
  AcademicCapIcon, 
  LightBulbIcon,
  RocketLaunchIcon,
  BeakerIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

interface WelcomeScreenProps {
  onQuickStart: (message: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onQuickStart }) => {
  const quickStarts = [
    {
      icon: CalculatorIcon,
      title: 'Math Problem',
      message: 'Help me solve: What is the derivative of x²?',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BeakerIcon,
      title: 'Science Concept',
      message: 'Explain photosynthesis with examples',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: LightBulbIcon,
      title: 'Learn Something New',
      message: 'Teach me about quantum computing',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: AcademicCapIcon,
      title: 'Study Help',
      message: 'Create a quiz on World War 2',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="text-center mb-8 max-w-2xl">
        <div className="relative inline-block mb-4">
          <SparklesIcon className="w-16 h-16 text-primary animate-pulse" />
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-ping" />
        </div>
        
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome to AI Learning
        </h1>
        
        <p className="text-lg text-muted-foreground mb-2">
          Your intelligent learning companion powered by Gemini 2.0
        </p>
        
        <p className="text-sm text-muted-foreground">
          Ask questions, explore concepts, and learn interactively
        </p>
      </div>

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mb-8">
        {quickStarts.map((item, index) => (
          <button
            key={index}
            onClick={() => onQuickStart(item.message)}
            className="group relative p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl bg-card text-left overflow-hidden"
          >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.message}
              </p>
              
              <div className="mt-3 flex items-center gap-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Try it now</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Features */}
      <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Voice Input</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span>Text-to-Speech</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          <span>Wolfram Alpha</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span>Visual Learning</span>
        </div>
      </div>

      {/* Tip */}
      <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20 max-w-md">
        <div className="flex items-start gap-3">
          <RocketLaunchIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">Pro Tip</p>
            <p className="text-muted-foreground">
              Use voice input for hands-free learning, or click the quick start cards above to begin!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
