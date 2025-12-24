import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useTheme } from '@/contexts'

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, loading, user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
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
        background: theme === 'dark' ? '#111827' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#111827',
      }}>
        <p>Loading...</p>
      </div>
    )
  }

  const bgColor = theme === 'dark' ? '#111827' : '#ffffff'
  const textColor = theme === 'dark' ? '#f9fafb' : '#111827'
  const textSecondary = theme === 'dark' ? '#d1d5db' : '#6b7280'
  const borderColor = theme === 'dark' ? '#374151' : '#e5e7eb'
  const bgSecondary = theme === 'dark' ? '#1f2937' : '#f3f4f6'
  const buttonBg = theme === 'dark' ? '#f9fafb' : '#111827'
  const buttonText = theme === 'dark' ? '#111827' : '#ffffff'
  const inputBg = theme === 'dark' ? '#1f2937' : '#ffffff'
  const inputBorder = theme === 'dark' ? '#4b5563' : '#e5e7eb'
  const cardBg = theme === 'dark' ? '#1f2937' : '#ffffff'
  const cardBorder = theme === 'dark' ? '#374151' : '#e5e7eb'

  return (
    <div style={{
      minHeight: '100vh',
      background: bgColor,
      color: textColor,
      transition: 'background-color 0.3s ease, color 0.3s ease',
    }}>
      {/* Header/Navigation */}
      <header style={{
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${borderColor}`,
        background: bgColor,
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: textColor,
        }}>
          <span>🔗</span>
          <span>LinkShort</span>
        </div>
        
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
            }}
            style={{
              color: textSecondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = textColor}
            onMouseLeave={(e) => e.currentTarget.style.color = textSecondary}
          >
            Features
          </a>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
            }}
            style={{
              color: textSecondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = textColor}
            onMouseLeave={(e) => e.currentTarget.style.color = textSecondary}
          >
            About
          </a>
          <a
            href="#faq"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })
            }}
            style={{
              color: textSecondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = textColor}
            onMouseLeave={(e) => e.currentTarget.style.color = textSecondary}
          >
            FAQ
          </a>
        </nav>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              padding: '0.5rem',
              background: 'transparent',
              border: `1px solid ${borderColor}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
            }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {!isAuthenticated ? (
            <>
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/login')
                }}
                style={{
                  color: textColor,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = textSecondary}
                onMouseLeave={(e) => e.currentTarget.style.color = textColor}
              >
                Log in
              </a>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: buttonBg,
                  border: 'none',
                  color: buttonText,
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Get Started
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: 'transparent',
                  border: `1px solid ${borderColor}`,
                  color: textColor,
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = bgSecondary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: buttonBg,
                  border: 'none',
                  color: buttonText,
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 2rem',
        textAlign: 'center',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.375rem 0.75rem',
          background: bgSecondary,
          border: `1px solid ${borderColor}`,
          borderRadius: '9999px',
          marginBottom: '2rem',
          fontSize: '0.875rem',
        }}>
          <span style={{ color: '#3b82f6', fontWeight: '600' }}>New</span>
          <span style={{ color: textSecondary }}>Advanced analytics now available</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          lineHeight: '1.1',
          marginBottom: '1.5rem',
          color: textColor,
        }}>
          Shorten links.<br />
          <span style={{ color: '#3b82f6' }}>Track performance.</span>
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '1.25rem',
          color: textSecondary,
          marginBottom: '3rem',
          maxWidth: '600px',
          margin: '0 auto 3rem auto',
        }}>
          Create powerful short links with advanced analytics to understand your audience and optimize your content strategy.
        </p>

        {/* URL Input Form */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          maxWidth: '700px',
          margin: '0 auto 1rem auto',
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
              background: inputBg,
              color: textColor,
              border: error ? '2px solid #ef4444' : `2px solid ${inputBorder}`,
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s, background-color 0.3s, color 0.3s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? '#ef4444' : inputBorder
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: buttonText,
              background: buttonBg,
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.opacity = '0.9'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.opacity = '1'
              }
            }}
          >
            Shorten
          </button>
        </form>

        {error && (
          <p style={{
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
          maxWidth: '900px',
          margin: '4rem auto 0 auto',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              fontSize: '2.5rem',
              lineHeight: 1,
            }}>
              📊
            </div>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: textColor,
              margin: 0,
            }}>
              Detailed Analytics
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              margin: 0,
            }}>
              Track clicks, understand your audience with detailed user agent data, device types, and geographic information.
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              fontSize: '2.5rem',
              lineHeight: 1,
            }}>
              🛡️
            </div>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: textColor,
              margin: 0,
            }}>
              Secure & Reliable
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              margin: 0,
            }}>
              Enterprise-grade security with 99.9% uptime SLA. Your links are safe and always available.
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              fontSize: '2.5rem',
              lineHeight: 1,
            }}>
              🔗
            </div>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: textColor,
              margin: 0,
            }}>
              Custom Links
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              margin: 0,
            }}>
              Create branded short links with custom domains to strengthen your brand identity.
            </p>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '6rem 2rem',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: textColor,
          marginBottom: '1rem',
        }}>
          Everything you need to manage your links
        </h2>
        <p style={{
          fontSize: '1.125rem',
          color: textSecondary,
          marginBottom: '4rem',
          maxWidth: '700px',
          margin: '0 auto 4rem auto',
        }}>
          Powerful features to help you create, track, and optimize your shortened links.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          maxWidth: '1000px',
          margin: '0 auto',
        }}>
          {/* Advanced Analytics */}
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'left',
          }}>
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
            }}>
              📊
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: textColor,
              margin: 0,
              marginBottom: '0.75rem',
            }}>
              Advanced Analytics
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              margin: 0,
              lineHeight: '1.6',
            }}>
              Track clicks, understand your audience with detailed user agent data, device types, and geographic information.
            </p>
          </div>

          {/* Lightning Fast */}
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'left',
          }}>
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
            }}>
              ⚡
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: textColor,
              margin: 0,
              marginBottom: '0.75rem',
            }}>
              Lightning Fast
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              margin: 0,
              lineHeight: '1.6',
            }}>
              Our global CDN ensures your shortened links redirect users in milliseconds, anywhere in the world.
            </p>
          </div>

          {/* Custom Links */}
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'left',
          }}>
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
            }}>
              🔗
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: textColor,
              margin: 0,
              marginBottom: '0.75rem',
            }}>
              Custom Links
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              margin: 0,
              lineHeight: '1.6',
            }}>
              Create branded short links with custom domains to strengthen your brand identity.
            </p>
          </div>

          {/* Secure & Reliable */}
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'left',
          }}>
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
            }}>
              🛡️
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: textColor,
              margin: 0,
              marginBottom: '0.75rem',
            }}>
              Secure & Reliable
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              margin: 0,
              lineHeight: '1.6',
            }}>
              Enterprise-grade security with 99.9% uptime SLA. Your links are safe and always available.
            </p>
          </div>

          {/* Global Reach */}
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'left',
          }}>
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
            }}>
              🌍
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: textColor,
              margin: 0,
              marginBottom: '0.75rem',
            }}>
              Global Reach
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              margin: 0,
              lineHeight: '1.6',
            }}>
              Reach audiences worldwide with geographically optimized redirects and multilingual support.
            </p>
          </div>

          {/* Team Collaboration */}
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'left',
          }}>
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
            }}>
              👥
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: textColor,
              margin: 0,
              marginBottom: '0.75rem',
            }}>
              Team Collaboration
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              margin: 0,
              lineHeight: '1.6',
            }}>
              Work together with your team to manage, organize, and analyze your links in one place.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '6rem 2rem',
        textAlign: 'center',
        scrollMarginTop: '80px',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: textColor,
          marginBottom: '1rem',
        }}>
          About LinkShort
        </h2>
        <p style={{
          fontSize: '1.125rem',
          color: textSecondary,
          marginBottom: '2rem',
          maxWidth: '700px',
          margin: '0 auto 2rem auto',
          lineHeight: '1.8',
        }}>
          LinkShort is a powerful URL shortening service designed to help you create, manage, and track your links with ease. Whether you're sharing content on social media, sending links via email, or tracking campaign performance, LinkShort provides the tools you need to optimize your link strategy.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          maxWidth: '900px',
          margin: '0 auto',
          textAlign: 'left',
        }}>
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: textColor,
              marginBottom: '0.75rem',
            }}>
              Our Mission
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              lineHeight: '1.6',
              margin: 0,
            }}>
              To provide a simple, reliable, and powerful link shortening service that helps individuals and businesses track and optimize their online presence.
            </p>
          </div>
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: textColor,
              marginBottom: '0.75rem',
            }}>
              Why Choose Us
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              lineHeight: '1.6',
              margin: 0,
            }}>
              We combine enterprise-grade reliability with intuitive analytics, giving you the insights you need to make data-driven decisions about your content and campaigns.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '6rem 2rem',
        scrollMarginTop: '80px',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: textColor,
          marginBottom: '1rem',
          textAlign: 'center',
        }}>
          Frequently Asked Questions
        </h2>
        <p style={{
          fontSize: '1.125rem',
          color: textSecondary,
          marginBottom: '3rem',
          textAlign: 'center',
          maxWidth: '700px',
          margin: '0 auto 3rem auto',
        }}>
          Everything you need to know about LinkShort
        </p>

        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '1.5rem',
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: textColor,
              margin: 0,
              marginBottom: '0.75rem',
            }}>
              How do I shorten a link?
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              margin: 0,
              lineHeight: '1.6',
            }}>
              Simply paste your long URL into the input field on our homepage and click "Shorten". You'll need to sign in to create and manage your links.
            </p>
          </div>

          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '1.5rem',
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: textColor,
              margin: 0,
              marginBottom: '0.75rem',
            }}>
              What analytics do you provide?
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              margin: 0,
              lineHeight: '1.6',
            }}>
              We provide detailed analytics including click counts, unique visitors, geographic data, device types, and referral sources. All data is available in real-time through your dashboard.
            </p>
          </div>

          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '1.5rem',
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: textColor,
              margin: 0,
              marginBottom: '0.75rem',
            }}>
              Can I customize my short links?
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              margin: 0,
              lineHeight: '1.6',
            }}>
              Yes! You can create custom slugs for your links to make them more memorable and branded. Custom links help strengthen your brand identity.
            </p>
          </div>

          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '1.5rem',
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: textColor,
              margin: 0,
              marginBottom: '0.75rem',
            }}>
              Is LinkShort free to use?
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              margin: 0,
              lineHeight: '1.6',
            }}>
              Yes, LinkShort offers a free tier with all essential features. Sign up to start shortening links and tracking analytics today.
            </p>
          </div>

          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '1.5rem',
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: textColor,
              margin: 0,
              marginBottom: '0.75rem',
            }}>
              How do I manage my links?
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: textSecondary,
              margin: 0,
              lineHeight: '1.6',
            }}>
              Once you're signed in, visit your dashboard to view all your links, see analytics, activate or deactivate links, and manage your link collection.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
