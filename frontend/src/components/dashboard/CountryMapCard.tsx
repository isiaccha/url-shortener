import type { CountryData } from '@/types/analytics'

interface CountryMapCardProps {
  countries: CountryData[]
  totalClicks: number
  loading?: boolean
  topCount?: number // Number of top countries to show (default: 5)
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

export default function CountryMapCard({ countries, totalClicks, loading = false, topCount = 5 }: CountryMapCardProps) {
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

      {/* Map and countries side by side */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: '1.5rem',
        alignItems: 'start',
      }}>
        {/* Map placeholder */}
        <div style={{
          width: '100%',
          height: '250px',
          background: '#f3f4f6',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #d1d5db',
        }}>
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
            <div style={{ fontSize: '0.875rem' }}>World Map Visualization</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              Map library integration pending
            </div>
          </div>
        </div>

        {/* Top countries list */}
        <div>
          <h4 style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: '#6b7280',
            marginBottom: '1rem'
          }}>
            Top Countries
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {countries.slice(0, topCount).map((country, index) => (
              <div 
                key={country.countryCode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 0',
                }}
              >
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
                  width: '60px', 
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

