import { create } from 'zustand';
import {
  sessionAPI,
  Message,
  StartSessionRequest,
  SendMessageRequest,
  CompleteSessionResponse,
  getErrorMessage,
} from '@/lib/api-client';
import { toast } from './toast-store';

interface SessionState {
  sessionId: string | null;
  topic: string | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sessionSummary: CompleteSessionResponse | null;
  
  // Actions
  startSession: (data: StartSessionRequest) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  loadHistory: (sessionId: string) => Promise<void>;
  completeSession: () => Promise<void>;
  clearSession: () => void;
  clearError: () => void;
  addMessage: (message: Message) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: null,
  topic: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  sessionSummary: null,

  startSession: async (data: StartSessionRequest) => {
    set({ isLoading: true, error: null, messages: [], sessionSummary: null });
    try {
      const response = await sessionAPI.startSession(data);
      
      // Add initial message from AI
      const initialMessage: Message = {
        id: 'initial',
        role: 'assistant',
        content: response.initial_message,
        timestamp: new Date().toISOString(),
      };
      
      set({
        sessionId: response.session_id,
        topic: data.topic,
        messages: [initialMessage],
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      set({
        sessionId: null,
        topic: null,
        messages: [],
        isLoading: false,
        error: errorMessage,
      });
      toast.error('Session Failed', errorMessage);
      throw error;
    }
  },

  sendMessage: async (message: string) => {
    const { sessionId, messages } = get();
    
    if (!sessionId) {
      set({ error: 'No active session' });
      return;
    }

    // Add user message optimistically
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    set({
      messages: [...messages, userMessage],
      isSending: true,
      error: null,
    });

    try {
      const response = await sessionAPI.sendMessage(sessionId, { message });
      
      // Add AI response
      const aiMessage: Message = {
        id: response.message_id,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        wolfram_data: response.wolfram_data,
        multimedia: response.multimedia || [],
      };
      
      set({
        messages: [...get().messages, aiMessage],
        isSending: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      
      console.error('Send message error:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Remove the optimistic user message on error
      set({
        messages: messages,
        isSending: false,
        error: errorMessage,
      });
      
      toast.error('Message Failed', errorMessage);
      // Don't throw error - just show it
      // throw error;
    }
  },

  loadHistory: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await sessionAPI.getHistory(sessionId);
      set({
        sessionId,
        topic: response.topic || null,
        messages: response.messages,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load history';
      set({
        messages: [],
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  completeSession: async () => {
    const { sessionId } = get();
    
    if (!sessionId) {
      set({ error: 'No active session' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await sessionAPI.completeSession(sessionId);
      set({
        sessionSummary: response,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to complete session';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  clearSession: () => {
    set({
      sessionId: null,
      topic: null,
      messages: [],
      isLoading: false,
      isSending: false,
      error: null,
      sessionSummary: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
}));
