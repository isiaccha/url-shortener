import axios, { AxiosError } from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types/api'

// In development, use relative URLs to go through Vite proxy (same origin = cookies work)
// In production, use the full API URL
const isDevelopment = import.meta.env.DEV
const API_URL = isDevelopment 
  ? '' // Empty string = relative URLs, will use Vite proxy
  : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')

// Check if we're online
const isOnline = () => navigator.onLine

// Retry configuration
const MAX_RETRIES = 2
const RETRY_DELAY = 1000 // 1 second

// Retry helper function
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important: sends cookies for session-based auth
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Track if we're currently redirecting to avoid multiple redirects
let isRedirecting = false

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if offline
    if (!isOnline()) {
      return Promise.reject(new Error('You are currently offline. Please check your internet connection.'))
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number }) | undefined

    // Handle network errors (offline, timeout, etc.)
    if (!error.response) {
      if (!isOnline()) {
        return Promise.reject(new Error('You are currently offline. Please check your internet connection.'))
      }
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return Promise.reject(new Error('Request timed out. Please try again.'))
      }
      return Promise.reject(new Error('Network error. Please check your connection and try again.'))
    }

    // Handle 401 Unauthorized - redirect to login if not already redirecting
    if (error.response.status === 401) {
      // Don't redirect for /auth/me endpoint - this is expected when checking auth status
      const isAuthCheck = originalRequest?.url?.includes('/auth/me')
      
      if (isAuthCheck) {
        // Silently reject for auth check - this is expected behavior
        return Promise.reject(error)
      }
      
      // Don't redirect if we're already on login page or if we're already redirecting
      if (!isRedirecting && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/auth/callback')) {
        isRedirecting = true
        // Clear any stale auth state
        const currentPath = window.location.pathname
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
      }
      return Promise.reject(error)
    }

    // Handle 403 Forbidden
    if (error.response.status === 403) {
      return Promise.reject(new Error('You do not have permission to perform this action.'))
    }

    // Handle 404 Not Found
    if (error.response.status === 404) {
      return Promise.reject(new Error('The requested resource was not found.'))
    }

    // Handle 500+ server errors with retry logic
    if (error.response.status >= 500 && originalRequest && !originalRequest._retry) {
      const retryCount = originalRequest._retryCount || 0
      if (retryCount < MAX_RETRIES) {
        originalRequest._retry = true
        originalRequest._retryCount = retryCount + 1
        await sleep(RETRY_DELAY * (retryCount + 1)) // Exponential backoff
        return apiClient(originalRequest as InternalAxiosRequestConfig)
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.detail || error.message || 'An error occurred'
    return Promise.reject(new Error(errorMessage))
  }
)

export default apiClient

