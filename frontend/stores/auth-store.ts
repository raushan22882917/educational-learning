import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, User, LoginRequest, RegisterRequest, getErrorMessage } from '@/lib/api-client';
import { toast } from './toast-store';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          
          // Store token in localStorage and cookies
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', response.access_token);
            // Set cookie for middleware access
            document.cookie = `access_token=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          }
          
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = getErrorMessage(error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          toast.error('Login Failed', errorMessage);
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(data);
          
          // Store token in localStorage and cookies
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', response.access_token);
            // Set cookie for middleware access
            document.cookie = `access_token=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          }
          
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = getErrorMessage(error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          toast.error('Registration Failed', errorMessage);
          throw error;
        }
      },

      logout: async () => {
        // Prevent duplicate logout calls
        if (get().isLoading) {
          console.log('Logout already in progress, skipping...');
          return;
        }
        
        set({ isLoading: true, error: null });
        try {
          await authAPI.logout();
          toast.success('Logged Out', 'You have been successfully logged out.');
        } catch (error: any) {
          // 403 is expected when token is already expired - not an error
          if (error.response?.status === 403) {
            console.log('Logout: Token already expired (403) - proceeding with local cleanup');
          } else {
            console.error('Logout API call failed:', error);
          }
        } finally {
          // Clear token from localStorage and cookies
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            // Clear cookie
            document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          
          // Redirect to login page after logout
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      },

      getCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await authAPI.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || error.message || 'Failed to get user';
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          
          // Clear token if user fetch fails
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            // Clear cookie
            document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
