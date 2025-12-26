import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProtectedRoute, Navbar, CardSkeleton, TableSkeleton } from '@/components'
import { useTheme, useToast } from '@/contexts'
import { getLinkStats } from '@/api/links'
import CountryMapCard from '@/components/dashboard/CountryMapCard'
import type { LinkStatsResponse, ClickEventItem } from '@/types/api'
import type { CountryData } from '@/types/analytics'
import { parseISO, formatDistanceToNow } from 'date-fns'

function LinkStatsContent() {
  const { linkId } = useParams<{ linkId: string }>()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<LinkStatsResponse | null>(null)
  const [sortBy, setSortBy] = useState<'time' | 'country' | 'device' | 'browser' | 'os' | 'referrer' | null>('time')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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
        const errorMessage = err instanceof Error ? err.message : 'Failed to load link statistics'
        setError(errorMessage)
        showError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [linkId])

  const formatDate = (dateString: string): string => {
    try {
      // Check if date string has timezone info
      const hasTimezone = dateString.includes('Z') || 
                          dateString.includes('+') || 
                          (dateString.match(/[-+]\d{2}:\d{2}$/) !== null)
      
      let date: Date
      
      if (hasTimezone) {
        // Has timezone info, use parseISO
        date = parseISO(dateString)
      } else {
        // No timezone info - assume UTC and append 'Z'
        date = parseISO(dateString.endsWith('Z') ? dateString : dateString + 'Z')
      }
      
      // Verify the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      
      // formatDistanceToNow will compare correctly as long as the date is parsed correctly
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (err) {
      return 'Invalid date'
    }
  }

  const formatFullDate = (dateString: string): string => {
    try {
      // Check if date string has timezone info
      const hasTimezone = dateString.includes('Z') || 
                          dateString.includes('+') || 
                          (dateString.match(/[-+]\d{2}:\d{2}$/) !== null)
      
      let date: Date
      
      if (hasTimezone) {
        // Has timezone info, use parseISO
        date = parseISO(dateString)
      } else {
        // No timezone info - assume UTC and append 'Z'
        date = parseISO(dateString.endsWith('Z') ? dateString : dateString + 'Z')
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      return date.toLocaleString()
    } catch {
      return 'Invalid date'
    }
  }

  const handleSort = (field: 'time' | 'country' | 'device' | 'browser' | 'os' | 'referrer') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // Sort recent clicks
  const sortedClicks = useMemo(() => {
    if (!stats?.recent_clicks || !sortBy) return stats?.recent_clicks || []
    
    return [...stats.recent_clicks].sort((a, b) => {
      let aValue: string | null
      let bValue: string | null

      switch (sortBy) {
        case 'time':
          aValue = a.clicked_at
          bValue = b.clicked_at
          break
        case 'country':
          aValue = a.country || ''
          bValue = b.country || ''
          break
        case 'device':
          aValue = a.device_category || ''
          bValue = b.device_category || ''
          break
        case 'browser':
          aValue = a.browser_name || ''
          bValue = b.browser_name || ''
          break
        case 'os':
          aValue = a.os_name || ''
          bValue = b.os_name || ''
          break
        case 'referrer':
          aValue = a.referrer_host || 'Direct'
          bValue = b.referrer_host || 'Direct'
          break
        default:
          return 0
      }

      // For time, compare as dates
      if (sortBy === 'time') {
        const aDate = parseISO(aValue)
        const bDate = parseISO(bValue)
        const comparison = aDate.getTime() - bDate.getTime()
        return sortOrder === 'asc' ? comparison : -comparison
      }

      // For strings, compare alphabetically
      const comparison = aValue.localeCompare(bValue)
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [stats?.recent_clicks, sortBy, sortOrder])

  // Simple country name mapping (subset)
  const getCountryName = (code: string): string => {
    const names: Record<string, string> = {
      'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada', 'AU': 'Australia',
      'DE': 'Germany', 'FR': 'France', 'IT': 'Italy', 'ES': 'Spain', 'NL': 'Netherlands',
      'BR': 'Brazil', 'IN': 'India', 'CN': 'China', 'JP': 'Japan', 'KR': 'South Korea',
      'MX': 'Mexico', 'AR': 'Argentina', 'ZA': 'South Africa', 'NG': 'Nigeria',
      'EG': 'Egypt', 'TR': 'Turkey', 'RU': 'Russia', 'PL': 'Poland', 'SE': 'Sweden',
      'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland', 'IE': 'Ireland', 'PT': 'Portugal',
      'GR': 'Greece', 'BE': 'Belgium', 'CH': 'Switzerland', 'AT': 'Austria', 'NZ': 'New Zealand',
    }
    return names[code] || code
  }

  // Aggregate analytics from recent clicks
  const aggregateAnalytics = (clicks: ClickEventItem[]) => {
    const referrers = new Map<string, number>()
    const countries = new Map<string, number>()
    const devices = new Map<string, number>()

    clicks.forEach(click => {
      // Referrers
      const referrer = click.referrer_host || 'Direct'
      referrers.set(referrer, (referrers.get(referrer) || 0) + 1)

      // Countries
      if (click.country) {
        countries.set(click.country, (countries.get(click.country) || 0) + 1)
      }

      // Devices
      if (click.device_category) {
        devices.set(click.device_category, (devices.get(click.device_category) || 0) + 1)
      }
    })

    // Convert to sorted arrays
    const topReferrers = Array.from(referrers.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, percentage: (count / clicks.length) * 100 }))

    // Countries for map (need to transform to CountryData format)
    const totalCountryClicks = Array.from(countries.values()).reduce((sum, count) => sum + count, 0)
    const countryData: CountryData[] = Array.from(countries.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([code, count]) => ({
        countryCode: code,
        countryName: getCountryName(code),
        clicks: count,
        percentage: totalCountryClicks > 0 ? (count / totalCountryClicks) * 100 : 0,
      }))

    const deviceBreakdown = Array.from(devices.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, percentage: (count / clicks.length) * 100 }))

    return { topReferrers, countryData, deviceBreakdown }
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
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}>
          <CardSkeleton />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <CardSkeleton />
          <TableSkeleton rows={5} />
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

  const { link, clicks_last_24h, unique_visitors, recent_clicks } = stats

  // Aggregate analytics from recent clicks
  const analytics = aggregateAnalytics(recent_clicks)

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

        {/* Analytics Cards - Top 3 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {/* Top Referrers Card */}
          <div style={{
            background: cardBg,
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: `1px solid ${borderColor}`,
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: textColor,
              marginTop: 0,
              marginBottom: '1rem',
            }}>
              Top Referrers
            </h3>
            {analytics.topReferrers.length === 0 ? (
              <div style={{ color: textSecondary, fontSize: '0.875rem' }}>No referrer data</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analytics.topReferrers.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', color: textColor, fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: textSecondary }}>
                        {item.count} click{item.count !== 1 ? 's' : ''} ({item.percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <div style={{
                      width: '60px',
                      height: '6px',
                      background: theme === 'dark' ? '#374151' : '#e5e7eb',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      marginLeft: '1rem',
                    }}>
                      <div style={{
                        width: `${item.percentage}%`,
                        height: '100%',
                        background: '#3b82f6',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Device Breakdown Card */}
          <div style={{
            background: cardBg,
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: `1px solid ${borderColor}`,
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: textColor,
              marginTop: 0,
              marginBottom: '1rem',
            }}>
              Device Breakdown
            </h3>
            {analytics.deviceBreakdown.length === 0 ? (
              <div style={{ color: textSecondary, fontSize: '0.875rem' }}>No device data</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analytics.deviceBreakdown.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', color: textColor, fontWeight: '500', textTransform: 'capitalize' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: textSecondary }}>
                        {item.count} click{item.count !== 1 ? 's' : ''} ({item.percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <div style={{
                      width: '60px',
                      height: '6px',
                      background: theme === 'dark' ? '#374151' : '#e5e7eb',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      marginLeft: '1rem',
                    }}>
                      <div style={{
                        width: `${item.percentage}%`,
                        height: '100%',
                        background: '#3b82f6',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unique Visitors Card */}
          <div style={{
            background: cardBg,
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: `1px solid ${borderColor}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: textColor,
              marginTop: 0,
              marginBottom: '0.5rem',
            }}>
              Unique Visitors
            </h3>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: textColor,
              lineHeight: 1,
              marginBottom: '0.5rem',
            }}>
              {unique_visitors.toLocaleString()}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: textSecondary,
            }}>
              Distinct visitors for this link
            </div>
          </div>
        </div>

        {/* Country Map */}
        <div style={{ marginBottom: '2rem' }}>
          <CountryMapCard
            countries={analytics.countryData}
            totalClicks={link.click_count}
            loading={false}
            topCount={3}
          />
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
                    <th 
                      style={{ 
                        textAlign: 'left', 
                        padding: '0.75rem 1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: '600', 
                        color: textSecondary, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                      onClick={() => handleSort('time')}
                    >
                      Time {sortBy === 'time' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      style={{ 
                        textAlign: 'left', 
                        padding: '0.75rem 1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: '600', 
                        color: textSecondary, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                      onClick={() => handleSort('country')}
                    >
                      Country {sortBy === 'country' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      style={{ 
                        textAlign: 'left', 
                        padding: '0.75rem 1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: '600', 
                        color: textSecondary, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                      onClick={() => handleSort('device')}
                    >
                      Device {sortBy === 'device' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      style={{ 
                        textAlign: 'left', 
                        padding: '0.75rem 1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: '600', 
                        color: textSecondary, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                      onClick={() => handleSort('browser')}
                    >
                      Browser {sortBy === 'browser' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      style={{ 
                        textAlign: 'left', 
                        padding: '0.75rem 1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: '600', 
                        color: textSecondary, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                      onClick={() => handleSort('os')}
                    >
                      OS {sortBy === 'os' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      style={{ 
                        textAlign: 'left', 
                        padding: '0.75rem 1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: '600', 
                        color: textSecondary, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                      onClick={() => handleSort('referrer')}
                    >
                      Referrer {sortBy === 'referrer' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedClicks.map((click: ClickEventItem) => (
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

