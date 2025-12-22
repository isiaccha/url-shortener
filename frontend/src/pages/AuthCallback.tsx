import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { checkAuth, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const success = urlParams.get('success')

      if (success === 'true') {
        // OAuth callback successful, verify user session using context
        try {
          await checkAuth()
          console.log('✅ Login successful')
          
          // Redirect to home after a short delay
          setTimeout(() => {
            navigate('/')
          }, 2000)
        } catch (err: any) {
          const errorMsg = err.response?.data?.detail || err.message || 'Failed to verify login'
          setError(errorMsg)
          console.error('❌ Failed to verify login:', err)
        } finally {
          setLoading(false)
        }
      } else {
        // No success parameter, might be an error
        setError('Authentication failed or cancelled')
        setLoading(false)
      }
    }

    handleCallback()
  }, [navigate, checkAuth])

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Completing login...</h2>
        <p>Please wait while we verify your authentication.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Authentication Error</h2>
        <p style={{ color: '#c62828' }}>{error}</p>
        <button 
          onClick={() => navigate('/')}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
        >
          Go to Home
        </button>
      </div>
    )
  }

  if (user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>✅ Login Successful!</h2>
        <p>Welcome, {user.email}!</p>
        <p>Redirecting to home page...</p>
      </div>
    )
  }

  return null
}

