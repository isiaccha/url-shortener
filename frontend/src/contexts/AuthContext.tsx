import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { getCurrentUser, initiateGoogleLogin, logout as apiLogout } from '@/api'
import type { User } from '@/types/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: () => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true) // Start with true to check auth on mount

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (err: any) {
      // 401 is expected if not logged in, so we silently handle it
      if (err.response?.status !== 401) {
        console.error('Error checking auth status:', err)
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    initiateGoogleLogin()
  }

  const logout = async () => {
    try {
      await apiLogout()
      setUser(null)
    } catch (err) {
      console.error('Error logging out:', err)
      // Clear user state even if API call fails
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

