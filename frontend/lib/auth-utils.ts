/**
 * Utility functions for authentication and token management
 */

/**
 * Get the access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('access_token');
}

/**
 * Set the access token in both localStorage and cookies
 */
export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Store in localStorage
  localStorage.setItem('access_token', token);
  
  // Store in cookie for middleware access (7 days expiry)
  const maxAge = 60 * 60 * 24 * 7; // 7 days in seconds
  document.cookie = `access_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Clear the access token from both localStorage and cookies
 */
export function clearAccessToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Clear from localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  
  // Clear cookie
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/**
 * Check if user is authenticated by checking for token
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Parse JWT token to get expiration time
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch (error) {
    console.error('Failed to parse token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return true;
  }
  return Date.now() >= expiration;
}

/**
 * Check if token needs refresh (expires in less than 5 minutes)
 */
export function shouldRefreshToken(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return false;
  }
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() >= expiration - fiveMinutes;
}
