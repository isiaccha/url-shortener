import { useState } from 'react'
import { useTheme } from '@/contexts'
import KPICardsRow from './dashboard/KPICardsRow'
import CountryMapCard from './dashboard/CountryMapCard'
import type { KPIData, CountryData, LinkTableRow } from '@/types/analytics'

// Mock data for preview
const mockKPIs: KPIData[] = [
  {
    title: 'Total Clicks',
    value: 1247,
    previousValue: 1108,
    delta: 12.5,
    trend: 'up',
    sparklineData: [
      { timestamp: '2024-01-01T00:00:00Z', value: 45 },
      { timestamp: '2024-01-02T00:00:00Z', value: 52 },
      { timestamp: '2024-01-03T00:00:00Z', value: 48 },
      { timestamp: '2024-01-04T00:00:00Z', value: 61 },
      { timestamp: '2024-01-05T00:00:00Z', value: 55 },
      { timestamp: '2024-01-06T00:00:00Z', value: 67 },
      { timestamp: '2024-01-07T00:00:00Z', value: 72 },
    ],
  },
  {
    title: 'Total Links',
    value: 23,
    previousValue: 21,
    delta: 9.5,
    trend: 'up',
    sparklineData: [
      { timestamp: '2024-01-01T00:00:00Z', value: 20 },
      { timestamp: '2024-01-02T00:00:00Z', value: 20 },
      { timestamp: '2024-01-03T00:00:00Z', value: 21 },
      { timestamp: '2024-01-04T00:00:00Z', value: 21 },
      { timestamp: '2024-01-05T00:00:00Z', value: 22 },
      { timestamp: '2024-01-06T00:00:00Z', value: 22 },
      { timestamp: '2024-01-07T00:00:00Z', value: 23 },
    ],
  },
  {
    title: 'Unique Visitors',
    value: 892,
    previousValue: 775,
    delta: 15.1,
    trend: 'up',
    sparklineData: [
      { timestamp: '2024-01-01T00:00:00Z', value: 32 },
      { timestamp: '2024-01-02T00:00:00Z', value: 38 },
      { timestamp: '2024-01-03T00:00:00Z', value: 35 },
      { timestamp: '2024-01-04T00:00:00Z', value: 42 },
      { timestamp: '2024-01-05T00:00:00Z', value: 40 },
      { timestamp: '2024-01-06T00:00:00Z', value: 48 },
      { timestamp: '2024-01-07T00:00:00Z', value: 51 },
    ],
  },
]

const mockCountries: CountryData[] = [
  { countryCode: 'US', countryName: 'United States', clicks: 450, uniqueVisitors: 320, percentage: 36.1 },
  { countryCode: 'GB', countryName: 'United Kingdom', clicks: 230, uniqueVisitors: 165, percentage: 18.4 },
  { countryCode: 'CA', countryName: 'Canada', clicks: 180, uniqueVisitors: 128, percentage: 14.4 },
  { countryCode: 'AU', countryName: 'Australia', clicks: 125, uniqueVisitors: 89, percentage: 10.0 },
  { countryCode: 'DE', countryName: 'Germany', clicks: 98, uniqueVisitors: 72, percentage: 7.9 },
  { countryCode: 'FR', countryName: 'France', clicks: 87, uniqueVisitors: 64, percentage: 7.0 },
  { countryCode: 'NL', countryName: 'Netherlands', clicks: 77, uniqueVisitors: 54, percentage: 6.2 },
]

const mockLinks: LinkTableRow[] = [
  {
    id: 1,
    shortUrl: 'https://linkshort.app/abc123',
    longUrl: 'https://example.com/very/long/url/path/to/article',
    status: 'active',
    clicks: 342,
    uniqueVisitors: 245,
    lastClicked: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    shortUrl: 'https://linkshort.app/def456',
    longUrl: 'https://another-example.com/product/page',
    status: 'active',
    clicks: 289,
    uniqueVisitors: 198,
    lastClicked: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    created: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    shortUrl: 'https://linkshort.app/ghi789',
    longUrl: 'https://blog.example.com/post/title',
    status: 'active',
    clicks: 156,
    uniqueVisitors: 112,
    lastClicked: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    created: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

interface DashboardPreviewProps {
  onSignUpClick?: () => void
}

export default function DashboardPreview({ onSignUpClick }: DashboardPreviewProps) {
  const { theme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const bgColor = theme === 'dark' ? '#111827' : '#ffffff'
  const textColor = theme === 'dark' ? '#f9fafb' : '#111827'
  const textSecondary = theme === 'dark' ? '#d1d5db' : '#6b7280'
  const borderColor = theme === 'dark' ? '#374151' : '#e5e7eb'
  const cardBg = theme === 'dark' ? '#1f2937' : '#ffffff'
  const overlayBg = theme === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)'

  const totalClicks = mockCountries.reduce((sum, c) => sum + c.clicks, 0)

  return (
    <div 
      style={{
        position: 'relative',
        background: bgColor,
        borderRadius: '16px',
        padding: '2rem',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Live Demo Badge */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.375rem 0.75rem',
        background: theme === 'dark' ? '#1f2937' : '#f3f4f6',
        border: `1px solid ${borderColor}`,
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: '#3b82f6',
        zIndex: 10,
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          background: '#10b981',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }} />
        Live Demo
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: textColor,
          marginBottom: '0.5rem',
        }}>
          See Your Analytics Dashboard
        </h2>
        <p style={{
          fontSize: '1rem',
          color: textSecondary,
          margin: 0,
        }}>
          Real-time insights into your link performance
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ marginBottom: '2rem' }}>
        <KPICardsRow kpis={mockKPIs} />
      </div>

      {/* World Map */}
      <div style={{ marginBottom: '2rem' }}>
        <CountryMapCard 
          countries={mockCountries} 
          totalClicks={totalClicks}
          topCount={3}
        />
      </div>

      {/* Links Table Preview */}
      <div style={{
        background: cardBg,
        borderRadius: '8px',
        padding: '1.5rem',
        border: `1px solid ${borderColor}`,
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: textColor,
          marginTop: 0,
          marginBottom: '1rem',
        }}>
          Your Links
        </h3>
        <div style={{
          overflowX: 'auto',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                <th style={{
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: textSecondary,
                  textTransform: 'uppercase',
                }}>
                  Short URL
                </th>
                <th style={{
                  textAlign: 'center',
                  padding: '0.75rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: textSecondary,
                  textTransform: 'uppercase',
                }}>
                  Clicks
                </th>
                <th style={{
                  textAlign: 'center',
                  padding: '0.75rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: textSecondary,
                  textTransform: 'uppercase',
                }}>
                  Visitors
                </th>
                <th style={{
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: textSecondary,
                  textTransform: 'uppercase',
                }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {mockLinks.map((link) => (
                <tr key={link.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                    <span style={{ color: '#3b82f6', fontFamily: 'monospace' }}>
                      {link.shortUrl}
                    </span>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: textColor,
                  }}>
                    {link.clicks.toLocaleString()}
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: textSecondary,
                  }}>
                    {link.uniqueVisitors.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: '#d1fae5',
                      color: '#065f46',
                    }}>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Overlay on Hover */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: overlayBg,
          backdropFilter: 'blur(8px)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: isHovered ? 'auto' : 'none',
          zIndex: 20,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: textColor,
            marginBottom: '0.5rem',
          }}>
            Unlock Your Dashboard
          </h3>
          <p style={{
            fontSize: '1rem',
            color: textSecondary,
            margin: 0,
            marginBottom: '1.5rem',
          }}>
            Sign up to start tracking your links with real-time analytics
          </p>
          {onSignUpClick && (
            <button
              onClick={onSignUpClick}
              style={{
                padding: '0.875rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#ffffff',
                background: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2563eb'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#3b82f6'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              Get Started Free
            </button>
          )}
        </div>
      </div>

      {/* CSS Animation for pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}

