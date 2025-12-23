import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import type { CountryData } from '@/types/analytics'

interface WorldMapProps {
  countries: CountryData[]
  totalClicks?: number // Optional, not currently used but may be useful for future features
}

// World map topology (using a CDN URL for simplicity)
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// Calculate color intensity based on percentage - more vibrant colors
const getFillColor = (percentage: number): string => {
  if (percentage === 0) return '#f3f4f6' // Very light gray for no data
  if (percentage < 1) return '#bfdbfe' // Light blue - visible even for tiny percentages
  if (percentage < 3) return '#93c5fd' // Medium-light blue
  if (percentage < 5) return '#60a5fa' // Medium blue
  if (percentage < 10) return '#3b82f6' // Blue
  if (percentage < 20) return '#2563eb' // Darker blue
  if (percentage < 30) return '#1e40af' // Very dark blue
  return '#1e3a8a' // Darkest blue
}

// Get stroke color and width for countries with data
const getStrokeStyle = (percentage: number): { color: string; width: number } => {
  if (percentage === 0) return { color: '#e5e7eb', width: 0.5 }
  if (percentage < 2) return { color: '#3b82f6', width: 1 }
  if (percentage < 5) return { color: '#2563eb', width: 1.5 }
  return { color: '#1e40af', width: 2 }
}

// Country name mappings (map topology names to our country names)
// The topology file uses various name formats, so we map them to our standardized names
const COUNTRY_NAME_MAP: Record<string, string> = {
  // United States variations
  'United States of America': 'United States',
  'United States': 'United States',
  'USA': 'United States',
  'U.S.A.': 'United States',
  // United Kingdom variations
  'United Kingdom': 'United Kingdom',
  'UK': 'United Kingdom',
  'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
  // Other countries (add more as needed)
  'Canada': 'Canada',
  'Australia': 'Australia',
  'Germany': 'Germany',
  'France': 'France',
  'Italy': 'Italy',
  'Spain': 'Spain',
  'Netherlands': 'Netherlands',
  'Brazil': 'Brazil',
}

export function WorldMap({ countries, totalClicks: _totalClicks }: WorldMapProps) {
  // Create maps for matching by code and name
  const countryDataMapByCode = new Map<string, CountryData>()
  const countryDataMapByName = new Map<string, CountryData>()
  
  countries.forEach(country => {
    // Store with uppercase code for matching
    countryDataMapByCode.set(country.countryCode.toUpperCase(), country)
    // Store by name (normalized) - this is what we'll use since topology has 'name'
    if (country.countryName) {
      const normalizedName = country.countryName.toUpperCase()
      countryDataMapByName.set(normalizedName, country)
      // Also store common variations
      if (COUNTRY_NAME_MAP[country.countryName]) {
        countryDataMapByName.set(COUNTRY_NAME_MAP[country.countryName].toUpperCase(), country)
      }
    }
  })

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ComposableMap
        projectionConfig={{
          scale: 200,
          center: [0, 20],
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) => {
            if (!geographies || geographies.length === 0) {
              return <text x="50%" y="50%" textAnchor="middle" fill="#666">Loading map data...</text>
            }
            
            return geographies.map((geo) => {
              const props = geo.properties || {}
              
              // The topology file uses 'name' property, not ISO codes
              const topologyName = props.name?.toString() || ''
              
              // Try to find country data by name (primary method since topology has 'name')
              let countryData: CountryData | undefined
              
              // Try exact match first (case-insensitive)
              if (topologyName) {
                const normalizedName = topologyName.toUpperCase()
                countryData = countryDataMapByName.get(normalizedName)
                
                // Try mapped name variations
                if (!countryData && COUNTRY_NAME_MAP[topologyName]) {
                  countryData = countryDataMapByName.get(COUNTRY_NAME_MAP[topologyName].toUpperCase())
                }
              }
              
              // Fallback: try matching by any ISO code properties if they exist
              const countryCode = (
                props.ISO_A2 || 
                props.ISO_A2_EH || 
                props.ISO_A3 ||
                props.ISO ||
                props.ISO2 ||
                ''
              )?.toString().toUpperCase() || ''
              
              if (!countryData && countryCode) {
                countryData = countryDataMapByCode.get(countryCode)
              }
              
              const percentage = countryData?.percentage || 0
              const fillColor = getFillColor(percentage)
              const strokeStyle = getStrokeStyle(percentage)

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fillColor}
                  stroke={strokeStyle.color}
                  strokeWidth={strokeStyle.width}
                  style={{
                    default: {
                      fill: fillColor,
                      stroke: strokeStyle.color,
                      strokeWidth: strokeStyle.width,
                      outline: 'none',
                    },
                    hover: {
                      fill: percentage > 0 ? '#1e3a8a' : '#d1d5db',
                      stroke: percentage > 0 ? '#1e40af' : '#9ca3af',
                      strokeWidth: percentage > 0 ? 2.5 : 0.5,
                      outline: 'none',
                      cursor: 'pointer',
                    },
                    pressed: {
                      fill: fillColor,
                      outline: 'none',
                    },
                  }}
                />
              )
            })
          }}
        </Geographies>
      </ComposableMap>

      {/* Legend - positioned bottom left to avoid overlap with top countries list on right */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ marginBottom: '0.25rem', fontWeight: '500', color: '#374151' }}>
          Clicks
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#e5e7eb', borderRadius: '2px' }} />
            <span style={{ color: '#6b7280' }}>None</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#dbeafe', borderRadius: '2px' }} />
            <span style={{ color: '#6b7280' }}>&lt;5%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }} />
            <span style={{ color: '#6b7280' }}>&gt;20%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

