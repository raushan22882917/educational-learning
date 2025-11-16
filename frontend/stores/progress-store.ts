import { create } from 'zustand';
import {
  progressAPI,
  recommendationsAPI,
  LearningStats,
  Achievement,
  Topic,
  WeeklySummaryResponse,
  getErrorMessage,
} from '@/lib/api-client';
import { toast } from './toast-store';

interface ProgressState {
  stats: LearningStats | null;
  achievements: Achievement[];
  recommendations: Topic[];
  weeklySummary: WeeklySummaryResponse | null;
  isLoading: boolean;
  isLoadingRecommendations: boolean;
  isLoadingSummary: boolean;
  error: string | null;
  
  // Actions
  loadProgress: (userId: string) => Promise<void>;
  loadRecommendations: (userId: string) => Promise<void>;
  loadWeeklySummary: (userId: string) => Promise<void>;
  submitRecommendationFeedback: (userId: string, topicId: string, rating: number) => Promise<void>;
  clearProgress: () => void;
  clearError: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  stats: null,
  achievements: [],
  recommendations: [],
  weeklySummary: null,
  isLoading: false,
  isLoadingRecommendations: false,
  isLoadingSummary: false,
  error: null,

  loadProgress: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await progressAPI.getProgress(userId);
      set({
        stats: response,
        achievements: response.achievements,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      set({
        stats: null,
        achievements: [],
        isLoading: false,
        error: errorMessage,
      });
      console.error('Failed to load progress:', error);
      // Don't throw - just log and set error state
    }
  },

  loadRecommendations: async (userId: string) => {
    set({ isLoadingRecommendations: true, error: null });
    try {
      const response = await recommendationsAPI.getRecommendations(userId);
      set({
        recommendations: response.recommendations,
        isLoadingRecommendations: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      set({
        recommendations: [],
        isLoadingRecommendations: false,
        error: errorMessage,
      });
      console.error('Failed to load recommendations:', error);
      // Don't throw - just log and set error state
    }
  },

  loadWeeklySummary: async (userId: string) => {
    set({ isLoadingSummary: true, error: null });
    try {
      const response = await progressAPI.getWeeklySummary(userId);
      set({
        weeklySummary: response,
        isLoadingSummary: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      set({
        weeklySummary: null,
        isLoadingSummary: false,
        error: errorMessage,
      });
      console.error('Failed to load weekly summary:', error);
      // Don't throw - just log and set error state
    }
  },

  submitRecommendationFeedback: async (userId: string, topicId: string, rating: number) => {
    try {
      await recommendationsAPI.submitFeedback(userId, { topic_id: topicId, rating });
      
      // Optionally reload recommendations after feedback
      // await get().loadRecommendations(userId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to submit feedback';
      set({ error: errorMessage });
      console.error('Failed to submit feedback:', error);
      // Don't throw - just log and set error state
    }
  },

  clearProgress: () => {
    set({
      stats: null,
      achievements: [],
      recommendations: [],
      weeklySummary: null,
      isLoading: false,
      isLoadingRecommendations: false,
      isLoadingSummary: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
