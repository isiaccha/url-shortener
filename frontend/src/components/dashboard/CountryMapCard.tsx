import type { CountryData } from '@/types/analytics'
import { WorldMap } from '../charts/WorldMap'

interface CountryMapCardProps {
  countries: CountryData[]
  totalClicks: number
  loading?: boolean
  topCount?: number // Number of top countries to show (default: 3)
}

// Country code to name mapping (subset for common countries)
const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  BR: 'Brazil',
  IN: 'India',
  CN: 'China',
  JP: 'Japan',
  KR: 'South Korea',
  MX: 'Mexico',
  AR: 'Argentina',
  ZA: 'South Africa',
  NG: 'Nigeria',
  EG: 'Egypt',
  TR: 'Turkey',
  RU: 'Russia',
}

export default function CountryMapCard({ countries, totalClicks, loading = false, topCount = 3 }: CountryMapCardProps) {
  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: '#6b7280' }}>Loading country data...</p>
      </div>
    )
  }

  if (!countries || countries.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>No country data available</p>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Clicks will appear here once you have traffic</p>
      </div>
    )
  }

  const topCountries = countries.slice(0, topCount)

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      marginBottom: '1.5rem',
    }}>
      <h3 style={{ 
        fontSize: '1.125rem', 
        fontWeight: '600', 
        color: '#111827',
        marginTop: 0,
        marginBottom: '1.5rem'
      }}>
        Clicks by Country
      </h3>

      {/* Map container with overlay */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '500px', // Increased height to fill more space
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        background: '#f9fafb',
      }}>
        {/* World Map - fills entire container */}
        <WorldMap countries={countries} totalClicks={totalClicks} />

        {/* Top countries list - overlayed on top right */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: '6px',
          padding: '0.5rem 0.75rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          minWidth: '240px',
          maxWidth: '280px',
        }}>
          <h4 style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: '#111827',
            marginTop: 0,
            marginBottom: '0.75rem'
          }}>
            Top 3
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topCountries.map((country, index) => (
              <div 
                key={country.countryCode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                {/* Rank */}
                <div style={{
                  width: '20px',
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  fontWeight: '500',
                  textAlign: 'center',
                  flexShrink: 0,
                }}>
                  {index + 1}
                </div>

                {/* Country flag placeholder */}
                <div style={{
                  width: '28px',
                  height: '20px',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  color: '#6b7280',
                  flexShrink: 0,
                }}>
                  {country.countryCode}
                </div>

                {/* Country name and stats */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#111827',
                    fontWeight: '500',
                    marginBottom: '0.25rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {COUNTRY_NAMES[country.countryCode] || country.countryName || country.countryCode}
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <span>{country.clicks.toLocaleString()}</span>
                    <span>•</span>
                    <span>{country.percentage.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Percentage bar */}
                <div style={{ 
                  width: '50px', 
                  height: '6px', 
                  background: '#e5e7eb',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  <div style={{
                    width: `${country.percentage}%`,
                    height: '100%',
                    background: '#3b82f6',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

