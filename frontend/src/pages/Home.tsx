import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts'

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, loading, user } = useAuth()
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const validateUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate URL
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    // Add protocol if missing
    let urlToShorten = url.trim()
    if (!urlToShorten.startsWith('http://') && !urlToShorten.startsWith('https://')) {
      urlToShorten = `https://${urlToShorten}`
    }

    if (!validateUrl(urlToShorten)) {
      setError('Please enter a valid URL')
      return
    }

    // Check authentication
    if (!isAuthenticated) {
      // Redirect to login, then come back to shorten
      navigate('/login')
      return
    }

    // For now, just redirect to dashboard
    // TODO: Actually shorten the link and show the result
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb',
      }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        padding: '2rem 1rem',
        textAlign: 'center',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#111827',
          margin: 0,
          marginBottom: '0.5rem',
        }}>
          URL Shortener
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#6b7280',
          margin: 0,
        }}>
          Shorten your links and track their performance
        </p>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '600px',
        }}>
          <form onSubmit={handleSubmit} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}>
            <label htmlFor="url-input" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem',
            }}>
              Enter URL to shorten
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                id="url-input"
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError(null)
                }}
                placeholder="https://example.com"
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error ? '#ef4444' : '#e5e7eb'
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'white',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = '#2563eb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = '#3b82f6'
                  }
                }}
              >
                Shorten
              </button>
            </div>
            {error && (
              <p style={{
                marginTop: '0.5rem',
                fontSize: '0.875rem',
                color: '#ef4444',
              }}>
                {error}
              </p>
            )}
            {isAuthenticated && user && (
              <p style={{
                marginTop: '1rem',
                fontSize: '0.875rem',
                color: '#6b7280',
                textAlign: 'center',
              }}>
                Signed in as {user.email}
              </p>
            )}
          </form>

          {/* Additional Info */}
          <div style={{
            marginTop: '2rem',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.875rem',
          }}>
            {!isAuthenticated && (
              <p>
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/login')
                  }}
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontWeight: '500',
                  }}
                >
                  Sign in
                </a>
                {' '}to track your links and view analytics
              </p>
            )}
            {isAuthenticated && (
              <p>
                <a
                  href="/dashboard"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/dashboard')
                  }}
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontWeight: '500',
                  }}
                >
                  View Dashboard
                </a>
                {' '}to see all your links and analytics
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

