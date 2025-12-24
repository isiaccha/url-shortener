import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useTheme } from '@/contexts'
import Navbar from '@/components/Navbar'
import { createLink } from '@/api/links'
import type { LinkResponse } from '@/types/api'

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, loading, user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createdLink, setCreatedLink] = useState<LinkResponse | null>(null)

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
    setCreatedLink(null)

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

    // Create the shortened link
    setIsCreating(true)
    try {
      const link = await createLink({ target_url: urlToShorten })
      setCreatedLink(link)
      setUrl('') // Clear the input
    } catch (err) {
      console.error('Failed to create link:', err)
      setError(err instanceof Error ? err.message : 'Failed to create shortened link. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopy = async () => {
    if (!createdLink?.short_url) return
    
    try {
      await navigator.clipboard.writeText(createdLink.short_url)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
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
      <Navbar />

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
            disabled={loading || isCreating}
            style={{
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: buttonText,
              background: buttonBg,
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || isCreating) ? 'not-allowed' : 'pointer',
              opacity: (loading || isCreating) ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading && !isCreating) {
                e.currentTarget.style.opacity = '0.9'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !isCreating) {
                e.currentTarget.style.opacity = '1'
              }
            }}
          >
            {isCreating ? 'Shortening...' : 'Shorten'}
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

        {/* Success: Show created link */}
        {createdLink && (
          <div style={{
            maxWidth: '700px',
            margin: '0 auto 2rem auto',
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: textColor,
                margin: 0,
              }}>
                Link shortened successfully!
              </h3>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}>
              <input
                type="text"
                value={createdLink.short_url}
                readOnly
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  fontSize: '1rem',
                  background: inputBg,
                  color: textColor,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: '8px',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  padding: '0.875rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: buttonText,
                  background: buttonBg,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                Copy
              </button>
              <button
                onClick={() => navigate(`/links/${createdLink.id}/stats`)}
                style={{
                  padding: '0.875rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: textColor,
                  background: 'transparent',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = bgSecondary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                View Stats
              </button>
            </div>
            
            <div style={{
              fontSize: '0.875rem',
              color: textSecondary,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span>Original URL:</span>
              <a
                href={createdLink.target_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#3b82f6',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '500px',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none'
                }}
              >
                {createdLink.target_url}
              </a>
            </div>
          </div>
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
