import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { checkAuth, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasHandledCallback = useRef(false)

  useEffect(() => {
    // Prevent running multiple times (e.g., in React StrictMode)
    if (hasHandledCallback.current) return
    hasHandledCallback.current = true

    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const success = urlParams.get('success')

      if (success === 'true') {
        // OAuth callback successful, verify user session using context
        try {
          await checkAuth()
          setLoading(false)
        } catch (err: any) {
          const errorMsg = err.response?.data?.detail || err.message || 'Failed to verify login'
          setError(errorMsg)
          setLoading(false)
        }
      } else {
        // No success parameter, might be an error
        setError('Authentication failed or cancelled')
        setLoading(false)
      }
    }

    handleCallback()
  }, [checkAuth])

  // Redirect when auth is successful (user is set and not loading)
  useEffect(() => {
    if (!loading && !error && user) {
      const redirectTimeout = setTimeout(() => {
        navigate('/', { replace: true })
      }, 1500)
      
      return () => clearTimeout(redirectTimeout)
    }
    
    // Fallback: if checkAuth succeeded but user not set yet, redirect anyway after a delay
    if (!loading && !error && !user) {
      const redirectTimeout = setTimeout(() => {
        navigate('/', { replace: true })
      }, 2000)
      
      return () => clearTimeout(redirectTimeout)
    }
  }, [loading, error, user, navigate])

  // Show loading state
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Completing login...</h2>
        <p>Please wait while we verify your authentication.</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Authentication Error</h2>
        <p style={{ color: '#c62828' }}>{error}</p>
        <button 
          onClick={() => navigate('/', { replace: true })}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
        >
          Go to Home
        </button>
      </div>
    )
  }

  // Show success state (user should be set after checkAuth succeeds)
  if (user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>✅ Login Successful!</h2>
        <p>Welcome, {user.email}!</p>
        <p>Redirecting to home page...</p>
      </div>
    )
  }

  // Fallback: processing state
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Processing authentication...</p>
    </div>
  )
}

