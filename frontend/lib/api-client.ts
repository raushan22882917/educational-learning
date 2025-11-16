import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Type definitions
export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  last_active: string;
  preferences?: Record<string, any>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface MultimediaElement {
  type: 'image' | 'video' | 'wolfram' | 'audio' | 'interactive';
  content: string;
  metadata?: {
    url?: string;
    search_query?: string;
    description?: string;
    wolfram_url?: string;
    [key: string]: any;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  wolfram_data?: WolframResult;
  multimedia?: MultimediaElement[];
}

export interface WolframResult {
  query: string;
  result?: string;
  step_by_step?: string[];
  visual_url?: string;
  images?: string[];
  pods?: any[];
}

export interface StartSessionRequest {
  topic: string;
  user_id: string;
}

export interface StartSessionResponse {
  session_id: string;
  initial_message: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  response: string;
  message_id: string;
  wolfram_data?: WolframResult;
  multimedia?: MultimediaElement[];
  source?: string;
  timestamp?: string;
}

export interface SessionHistoryResponse {
  session_id: string;
  topic: string;
  messages: Message[];
  message_count: number;
}

export interface CompleteSessionResponse {
  summary: string;
  next_topics: string[];
}

export interface UserSessionSummary {
  id: string;
  topic: string;
  created_at: string;
  completed_at?: string;
  message_count: number;
  status: string;
}

export interface UserSessionsResponse {
  sessions: UserSessionSummary[];
  total: number;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty?: string;
}

export interface RecommendationsResponse {
  recommendations: Topic[];
}

export interface FeedbackRequest {
  topic_id: string;
  rating: number;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  earned_at: string;
  icon: string;
}

export interface LearningStats {
  user_id: string;
  level: number;
  topics_completed: number;
  total_time_spent: number;
  total_time_hours: number;
  current_streak: number;
  last_activity: string;
  total_sessions: number;
  completed_sessions: number;
  average_session_duration: number;
  recent_topics: string[];
  achievements: Achievement[];
  achievement_count: number;
}

export interface ProgressResponse {
  user_id: string;
  level: number;
  topics_completed: number;
  total_time_spent: number;
  total_time_hours: number;
  current_streak: number;
  last_activity: string;
  total_sessions: number;
  completed_sessions: number;
  average_session_duration: number;
  recent_topics: string[];
  achievements: Achievement[];
  achievement_count: number;
}

export interface WeeklySummaryResponse {
  user_id: string;
  summary: string;
  generated_at: string;
  insights?: string[];
}

export interface DashboardStatsResponse {
  user_id: string;
  // Session stats
  total_sessions: number;
  active_sessions: number;
  completed_sessions: number;
  total_messages: number;
  // Progress stats
  level: number;
  topics_completed: number;
  total_time_spent: number;
  total_time_hours: number;
  current_streak: number;
  // Achievement stats
  total_achievements: number;
  recent_achievements: Achievement[];
  // Quiz stats
  total_quizzes: number;
  quizzes_passed: number;
  average_quiz_score: number;
  // Activity stats
  last_activity: string;
  days_active: number;
  average_session_duration: number;
}

export interface Question {
  question_id: number;
  question: string;
  options: string[];
  correct_answer?: number; // Only available after submission
  explanation?: string; // Only available after submission
  // Aliases for backward compatibility
  id?: string;
  text?: string;
}

export interface GenerateQuizRequest {
  topic: string;
  difficulty: string;
  count?: number; // Number of questions (3-10), defaults to 5
}

export interface GenerateQuizResponse {
  quiz_id: string;
  topic: string;
  difficulty: string;
  questions: Question[];
}

export interface Answer {
  question_id: string;
  selected_answer: number;
}

export interface SubmitQuizRequest {
  quiz_id: string;
  answers: Answer[];
}

export interface Feedback {
  question_id: string;
  correct: boolean;
  explanation: string;
}

export interface SubmitQuizResponse {
  score: number;
  feedback: Feedback[];
}

export interface APIError {
  error: string;
  detail?: string;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and retries
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<APIError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        processQueue(error, null);
        isRefreshing = false;
        window.location.href = '/auth/login';
      }
    }

    // Handle network errors with retry logic (max 3 retries)
    if (!error.response && originalRequest && !originalRequest._retry) {
      const retryCount = (originalRequest as any).__retryCount || 0;
      if (retryCount < 3) {
        (originalRequest as any).__retryCount = retryCount + 1;
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to extract user-friendly error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<APIError>;
    
    // Check for custom error response from backend
    if (axiosError.response?.data) {
      const data = axiosError.response.data;
      if (data.detail) {
        return data.detail;
      }
      if (data.error) {
        return data.error;
      }
    }
    
    // Handle specific status codes
    if (axiosError.response?.status === 401) {
      return 'Authentication required. Please log in.';
    }
    if (axiosError.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (axiosError.response?.status === 404) {
      return 'The requested resource was not found.';
    }
    if (axiosError.response?.status === 429) {
      return 'Too many requests. Please try again later.';
    }
    if (axiosError.response?.status === 503) {
      return 'Service temporarily unavailable. Please try again in a moment.';
    }
    if (axiosError.response?.status >= 500) {
      return 'A server error occurred. Please try again later.';
    }
    
    // Network errors
    if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// API functions

// Authentication API
export const authAPI = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  },
};

export interface ExplanationFormat {
  style: 'comprehensive' | 'analogy' | 'example' | 'steps' | 'simple';
  content: string;
  wolfram_data?: WolframResult;
}

export interface ExplainConceptRequest {
  concept: string;
  styles?: string[];
}

export interface ExplainConceptResponse {
  concept: string;
  explanations: ExplanationFormat[];
  timestamp: string;
}

// Session API
export const sessionAPI = {
  getUserSessions: async (): Promise<UserSessionsResponse> => {
    const response = await apiClient.get<UserSessionsResponse>('/api/sessions/user/sessions');
    return response.data;
  },

  startSession: async (data: StartSessionRequest): Promise<StartSessionResponse> => {
    const response = await apiClient.post<StartSessionResponse>('/api/sessions/start', data);
    return response.data;
  },

  sendMessage: async (sessionId: string, data: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await apiClient.post<SendMessageResponse>(
      `/api/sessions/${sessionId}/message`,
      data
    );
    return response.data;
  },

  getHistory: async (sessionId: string): Promise<SessionHistoryResponse> => {
    const response = await apiClient.get<SessionHistoryResponse>(`/api/sessions/${sessionId}/history`);
    return response.data;
  },

  completeSession: async (sessionId: string): Promise<CompleteSessionResponse> => {
    const response = await apiClient.post<CompleteSessionResponse>(
      `/api/sessions/${sessionId}/complete`
    );
    return response.data;
  },

  explainConcept: async (sessionId: string, data: ExplainConceptRequest): Promise<ExplainConceptResponse> => {
    const response = await apiClient.post<ExplainConceptResponse>(
      `/api/sessions/${sessionId}/explain`,
      data
    );
    return response.data;
  },
};

// Recommendations API
export const recommendationsAPI = {
  getRecommendations: async (userId: string): Promise<RecommendationsResponse> => {
    const response = await apiClient.get<RecommendationsResponse>(`/api/recommendations/${userId}`);
    return response.data;
  },

  submitFeedback: async (userId: string, data: FeedbackRequest): Promise<void> => {
    await apiClient.post(`/api/recommendations/${userId}/feedback`, data);
  },
};

// Progress API
export const progressAPI = {
  getProgress: async (userId: string): Promise<ProgressResponse> => {
    const response = await apiClient.get<ProgressResponse>(`/api/progress/${userId}`);
    return response.data;
  },

  getWeeklySummary: async (userId: string): Promise<WeeklySummaryResponse> => {
    const response = await apiClient.get<WeeklySummaryResponse>(`/api/progress/${userId}/weekly-summary`);
    return response.data;
  },

  getDashboardStats: async (userId: string): Promise<DashboardStatsResponse> => {
    const response = await apiClient.get<DashboardStatsResponse>(`/api/progress/${userId}/dashboard`);
    return response.data;
  },
};

// Quiz API
export const quizAPI = {
  generateQuiz: async (data: GenerateQuizRequest): Promise<GenerateQuizResponse> => {
    const response = await apiClient.post<GenerateQuizResponse>('/api/quiz/generate', data);
    return response.data;
  },

  submitQuiz: async (data: SubmitQuizRequest): Promise<SubmitQuizResponse> => {
    const response = await apiClient.post<SubmitQuizResponse>('/api/quiz/submit', data);
    return response.data;
  },
};

export default apiClient;
