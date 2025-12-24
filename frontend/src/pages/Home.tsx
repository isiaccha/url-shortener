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
        background: '#ffffff',
      }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
    }}>
      {/* Header/Navigation */}
      <header style={{
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#111827',
        }}>
          <span>🔗</span>
          <span>LinkShort</span>
        </div>
        
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }}>
          <a
            href="#features"
            style={{
              color: '#374151',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
          >
            Features
          </a>
          {isAuthenticated && (
            <a
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault()
                navigate('/dashboard')
              }}
              style={{
                color: '#374151',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
            >
              Dashboard
            </a>
          )}
        </nav>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#111827',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: '#111827',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#111827'}
              >
                Get Started
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '0.5rem 1.5rem',
                background: '#111827',
                border: 'none',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#111827'}
            >
              Dashboard
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.375rem 0.75rem',
          background: '#f3f4f6',
          borderRadius: '9999px',
          marginBottom: '2rem',
          fontSize: '0.875rem',
        }}>
          <span style={{ color: '#3b82f6', fontWeight: '600' }}>New</span>
          <span style={{ color: '#6b7280' }}>Advanced analytics now available</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          lineHeight: '1.1',
          marginBottom: '1.5rem',
          color: '#111827',
        }}>
          Shorten links.<br />
          <span style={{ color: '#3b82f6' }}>Track performance.</span>
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '1.25rem',
          color: '#6b7280',
          marginBottom: '3rem',
          maxWidth: '600px',
        }}>
          Create powerful short links with advanced analytics to understand your audience and optimize your content strategy.
        </p>

        {/* URL Input Form */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '3rem',
          maxWidth: '700px',
        }}>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError(null)
            }}
            placeholder="Enter your long URL here..."
            style={{
              flex: 1,
              padding: '1rem 1.5rem',
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
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              background: '#111827',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#374151'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#111827'
              }
            }}
          >
            Shorten
          </button>
        </form>

        {error && (
          <p style={{
            marginTop: '-2rem',
            marginBottom: '2rem',
            fontSize: '0.875rem',
            color: '#ef4444',
          }}>
            {error}
          </p>
        )}

        {/* Feature Highlights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          marginTop: '4rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}>
            <div style={{
              fontSize: '2rem',
              lineHeight: 1,
            }}>
              📊
            </div>
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#111827',
                margin: 0,
                marginBottom: '0.5rem',
              }}>
                Detailed Analytics
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0,
              }}>
                Track clicks, understand your audience with detailed user agent data, device types, and geographic information.
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}>
            <div style={{
              fontSize: '2rem',
              lineHeight: 1,
            }}>
              🛡️
            </div>
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#111827',
                margin: 0,
                marginBottom: '0.5rem',
              }}>
                Secure & Reliable
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0,
              }}>
                Enterprise-grade security with 99.9% uptime SLA. Your links are safe and always available.
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}>
            <div style={{
              fontSize: '2rem',
              lineHeight: 1,
            }}>
              🔗
            </div>
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#111827',
                margin: 0,
                marginBottom: '0.5rem',
              }}>
                Custom Links
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0,
              }}>
                Create branded short links with custom domains to strengthen your brand identity.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
