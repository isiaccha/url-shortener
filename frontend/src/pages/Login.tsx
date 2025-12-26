import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useTheme } from '@/contexts'
import Navbar from '@/components/Navbar'

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated, loading } = useAuth()
  const { theme } = useTheme()

  // Redirect to home if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, loading, navigate])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme === 'dark' ? '#111827' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#111827',
      }}>
        <p>Loading...</p>
      </div>
    )
  }

  // Don't render login if already authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  const bgColor = theme === 'dark' ? '#111827' : '#ffffff'
  const textColor = theme === 'dark' ? '#f9fafb' : '#111827'
  const textSecondary = theme === 'dark' ? '#d1d5db' : '#6b7280'
  const cardBg = theme === 'dark' ? '#1f2937' : '#ffffff'
  const cardBorder = theme === 'dark' ? '#374151' : '#e5e7eb'

  return (
    <div style={{
      minHeight: '100vh',
      background: bgColor,
      color: textColor,
      transition: 'background-color 0.3s ease, color 0.3s ease',
    }}>
      <Navbar />

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 80px)',
      }}>
        <div style={{
          maxWidth: '450px',
          width: '100%',
          textAlign: 'center',
        }}>
          {/* Card Container */}
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '3rem 2.5rem',
            boxShadow: theme === 'dark' 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}>
            {/* Title */}
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              lineHeight: '1.2',
              marginBottom: '1rem',
              color: textColor,
            }}>
              Welcome back
            </h1>

            {/* Description */}
            <p style={{
              fontSize: '1rem',
              color: textSecondary,
              marginBottom: '2.5rem',
              lineHeight: '1.6',
            }}>
              Sign in to create and manage your shortened links with advanced analytics
            </p>
            
            {/* Google Sign In Button */}
            <button
              onClick={login}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '1rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: '#4285f4',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s, opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#357ae8'
                e.currentTarget.style.opacity = '0.95'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#4285f4'
                e.currentTarget.style.opacity = '1'
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 18 18"
              >
                <path
                  fill="#fff"
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                />
                <path
                  fill="#fff"
                  d="M9 18c2.43 0 4.467-.806 5.96-2.184l-2.908-2.258c-.806.54-1.837.86-3.052.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                />
                <path
                  fill="#fff"
                  d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
                />
                <path
                  fill="#fff"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

