import axios, { AxiosError } from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types/api'

// In development, use relative URLs to go through Vite proxy (same origin = cookies work)
// In production, use the full API URL
const isDevelopment = import.meta.env.DEV
const API_URL = isDevelopment 
  ? '' // Empty string = relative URLs, will use Vite proxy
  : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important: sends cookies for session-based auth
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (can add auth tokens here if needed later)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add any request modifications here
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
  (error: AxiosError<ApiError>) => {
    // Handle 401 Unauthorized - don't log to console as it's expected when checking auth status
    if (error.response?.status === 401) {
      // We'll handle this in the AuthContext later
      // For now, just reject the promise silently (components will handle it)
      return Promise.reject(error)
    }

    // Handle other errors
    const errorMessage = error.response?.data?.detail || error.message || 'An error occurred'
    console.error('API Error:', errorMessage)

    return Promise.reject(error)
  }
)

export default apiClient

