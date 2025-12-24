import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProtectedRoute, Navbar } from '@/components'
import { useTheme } from '@/contexts'
import { getLinkStats } from '@/api/links'
import type { LinkStatsResponse, ClickEventItem } from '@/types/api'
import { parseISO, formatDistanceToNow } from 'date-fns'

function LinkStatsContent() {
  const { linkId } = useParams<{ linkId: string }>()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<LinkStatsResponse | null>(null)

  const bgColor = theme === 'dark' ? '#111827' : '#f9fafb'
  const textColor = theme === 'dark' ? '#f9fafb' : '#111827'
  const textSecondary = theme === 'dark' ? '#d1d5db' : '#6b7280'
  const borderColor = theme === 'dark' ? '#374151' : '#e5e7eb'
  const cardBg = theme === 'dark' ? '#1f2937' : '#ffffff'
  const buttonBg = theme === 'dark' ? '#3b82f6' : '#2563eb'
  const buttonText = '#ffffff'

  useEffect(() => {
    const fetchStats = async () => {
      if (!linkId) {
        setError('Invalid link ID')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const data = await getLinkStats(parseInt(linkId, 10))
        setStats(data)
      } catch (err) {
        console.error('Failed to fetch link stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to load link statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [linkId])

  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return 'Invalid date'
    }
  }

  const formatFullDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      return date.toLocaleString()
    } catch {
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: bgColor,
        color: textColor,
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}>
        <Navbar />
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2rem 1rem',
          textAlign: 'center',
          color: textSecondary,
        }}>
          Loading link statistics...
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div style={{
        minHeight: '100vh',
        background: bgColor,
        color: textColor,
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}>
        <Navbar />
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2rem 1rem',
        }}>
          <div style={{
            background: theme === 'dark' ? '#7f1d1d' : '#fee2e2',
            color: theme === 'dark' ? '#fca5a5' : '#991b1b',
            padding: '1rem',
            borderRadius: '6px',
            border: `1px solid ${theme === 'dark' ? '#991b1b' : '#fecaca'}`,
            marginBottom: '1rem',
          }}>
            {error || 'Link not found'}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '0.75rem 1.5rem',
              background: buttonBg,
              color: buttonText,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { link, clicks_last_24h, recent_clicks } = stats

  return (
    <div style={{
      minHeight: '100vh',
      background: bgColor,
      color: textColor,
      transition: 'background-color 0.3s ease, color 0.3s ease',
    }}>
      <Navbar />
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1rem',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: `1px solid ${borderColor}`,
              color: textColor,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme === 'dark' ? '#374151' : '#f9fafb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: textColor,
            marginBottom: '0.5rem',
          }}>
            Link Analytics
          </h1>
          <p style={{ color: textSecondary, fontSize: '0.875rem' }}>
            Detailed statistics and click history for this link
          </p>
        </div>

        {/* Link Info Card */}
        <div style={{
          background: cardBg,
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${borderColor}`,
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: textColor,
            marginTop: 0,
            marginBottom: '1rem',
          }}>
            Link Information
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: textSecondary, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Short URL
              </div>
              <a
                href={link.short_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                {link.short_url}
              </a>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: textSecondary, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Long URL
              </div>
              <div style={{ fontSize: '0.875rem', color: textColor, wordBreak: 'break-all' }}>
                {link.target_url}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: textSecondary, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Status
                </div>
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  background: link.is_active ? '#d1fae5' : '#fee2e2',
                  color: link.is_active ? '#065f46' : '#991b1b',
                }}>
                  {link.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: textSecondary, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Clicks
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: textColor }}>
                  {link.click_count.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: textSecondary, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Clicks (Last 24h)
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: textColor }}>
                  {clicks_last_24h.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: textSecondary, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Created
                </div>
                <div style={{ fontSize: '0.875rem', color: textColor }}>
                  {formatDate(link.created_at)}
                </div>
              </div>
              {link.last_clicked_at && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: textSecondary, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Last Clicked
                  </div>
                  <div style={{ fontSize: '0.875rem', color: textColor }}>
                    {formatDate(link.last_clicked_at)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Clicks Table */}
        <div style={{
          background: cardBg,
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${borderColor}`,
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: textColor,
            marginTop: 0,
            marginBottom: '1rem',
          }}>
            Recent Clicks ({recent_clicks.length})
          </h2>
          {recent_clicks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: textSecondary }}>
              No clicks recorded yet
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '600', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Time
                    </th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '600', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Country
                    </th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '600', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Device
                    </th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '600', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Browser
                    </th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '600', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      OS
                    </th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '600', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Referrer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent_clicks.map((click: ClickEventItem) => (
                    <tr
                      key={click.id}
                      style={{
                        borderBottom: `1px solid ${borderColor}`,
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f9fafb'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: textColor }}>
                        <div>{formatDate(click.clicked_at)}</div>
                        <div style={{ fontSize: '0.75rem', color: textSecondary }}>
                          {formatFullDate(click.clicked_at)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: textColor }}>
                        {click.country || '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: textColor }}>
                        {click.device_category || '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: textColor }}>
                        {click.browser_name ? `${click.browser_name}${click.browser_version ? ` ${click.browser_version}` : ''}` : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: textColor }}>
                        {click.os_name ? `${click.os_name}${click.os_version ? ` ${click.os_version}` : ''}` : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: textColor }}>
                        {click.referrer_host || 'Direct'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LinkStats() {
  return (
    <ProtectedRoute>
      <LinkStatsContent />
    </ProtectedRoute>
  )
}

