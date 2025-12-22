import apiClient from './client'
import type { AuthMeResponse, LogoutResponse, User } from '@/types/api'

/**
 * Auth API endpoints
 */

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<AuthMeResponse>('/auth/me')
  return response.data.user
}

/**
 * Initiate Google OAuth login
 * This will redirect the browser to Google's OAuth page
 * Note: This is a redirect, not an API call, so we just return the URL
 */
export const initiateGoogleLogin = (): void => {
  // Use localhost to match frontend domain (for cookie sharing)
  // The backend should be accessible via localhost:8000
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  window.location.href = `${apiUrl}/auth/google/login`
}

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  await apiClient.post<LogoutResponse>('/auth/logout')
}

