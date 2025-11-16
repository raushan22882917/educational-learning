'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { getAccessToken, isTokenExpired, clearAccessToken } from '@/lib/auth-utils';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { getCurrentUser, setUser, isAuthenticated } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      
      // If no token, clear auth state and mark as initialized
      if (!token) {
        setUser(null);
        setIsInitialized(true);
        return;
      }
      
      // Check if token is expired
      if (isTokenExpired(token)) {
        clearAccessToken();
        setUser(null);
        setIsInitialized(true);
        
        // Redirect to login if on protected route
        const protectedRoutes = ['/dashboard', '/learn', '/quiz', '/progress'];
        if (protectedRoutes.some(route => pathname?.startsWith(route))) {
          router.push('/auth/login');
        }
        return;
      }
      
      // Token exists and is valid, fetch current user
      try {
        await getCurrentUser();
      } catch (error) {
        console.error('Failed to get current user:', error);
        clearAccessToken();
        setUser(null);
        
        // Redirect to login if on protected route
        const protectedRoutes = ['/dashboard', '/learn', '/quiz', '/progress'];
        if (protectedRoutes.some(route => pathname?.startsWith(route))) {
          router.push('/auth/login');
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
