import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components'
import KPICardsRow from '@/components/dashboard/KPICardsRow'
import CountryMapCard from '@/components/dashboard/CountryMapCard'
import LinksTable from '@/components/dashboard/LinksTable'
import DateRangeSelector from '@/components/dashboard/DateRangeSelector'
import type { DateRange, KPIData, CountryData, LinkTableRow } from '@/types/analytics'

// Mock data generator
const generateMockSparkline = (points: number = 24): Array<{ timestamp: string; value: number }> => {
  const now = new Date()
  const data: Array<{ timestamp: string; value: number }> = []
  const baseValue = Math.random() * 100 + 50

  for (let i = points - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setHours(date.getHours() - i)
    data.push({
      timestamp: date.toISOString(),
      value: Math.max(0, baseValue + (Math.random() - 0.5) * 40),
    })
  }
  return data
}

const generateMockKPIs = (): KPIData[] => {
  const totalClicks = Math.floor(Math.random() * 50000) + 10000
  const totalLinks = Math.floor(Math.random() * 200) + 50
  const uniqueVisitors = Math.floor(totalClicks * 0.7)

  return [
    {
      title: 'Total Clicks',
      value: totalClicks,
      previousValue: Math.floor(totalClicks * 0.85),
      delta: 15.2,
      sparklineData: generateMockSparkline(24),
      trend: 'up',
    },
    {
      title: 'Total Links',
      value: totalLinks,
      previousValue: Math.floor(totalLinks * 0.9),
      delta: 10.5,
      sparklineData: generateMockSparkline(24),
      trend: 'up',
    },
    {
      title: 'Unique Visitors',
      value: uniqueVisitors,
      previousValue: Math.floor(uniqueVisitors * 0.88),
      delta: 12.3,
      sparklineData: generateMockSparkline(24),
      trend: 'up',
    },
  ]
}

const generateMockCountries = (): CountryData[] => {
  const countries: CountryData[] = [
    { countryCode: 'US', countryName: 'United States', clicks: 15234, percentage: 32.5 },
    { countryCode: 'GB', countryName: 'United Kingdom', clicks: 8234, percentage: 17.6 },
    { countryCode: 'CA', countryName: 'Canada', clicks: 5432, percentage: 11.6 },
    { countryCode: 'AU', countryName: 'Australia', clicks: 4321, percentage: 9.2 },
    { countryCode: 'DE', countryName: 'Germany', clicks: 3210, percentage: 6.9 },
    { countryCode: 'FR', countryName: 'France', clicks: 2890, percentage: 6.2 },
    { countryCode: 'IT', countryName: 'Italy', clicks: 2100, percentage: 4.5 },
    { countryCode: 'ES', countryName: 'Spain', clicks: 1890, percentage: 4.0 },
    { countryCode: 'NL', countryName: 'Netherlands', clicks: 1650, percentage: 3.5 },
    { countryCode: 'BR', countryName: 'Brazil', clicks: 1450, percentage: 3.1 },
  ]

  const total = countries.reduce((sum, c) => sum + c.clicks, 0)
  return countries.map(c => ({
    ...c,
    percentage: (c.clicks / total) * 100,
    uniqueVisitors: Math.floor(c.clicks * 0.75),
  }))
}

const generateMockLinks = (): LinkTableRow[] => {
  const links: LinkTableRow[] = []
  const domains = ['example.com', 'test.com', 'demo.org', 'sample.net', 'website.io']
  const paths = ['/page1', '/page2', '/article', '/blog/post', '/product', '/about', '/contact']

  for (let i = 0; i < 15; i++) {
    const domain = domains[Math.floor(Math.random() * domains.length)]
    const path = paths[Math.floor(Math.random() * paths.length)]
    const clicks = Math.floor(Math.random() * 5000)
    const created = new Date()
    created.setDate(created.getDate() - Math.floor(Math.random() * 90))
    
    const lastClicked = clicks > 0 
      ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      : null

    links.push({
      id: i + 1,
      shortUrl: `https://short.ly/abc${i + 1}`,
      longUrl: `https://${domain}${path}`,
      status: Math.random() > 0.2 ? 'active' : 'inactive',
      clicks,
      uniqueVisitors: Math.floor(clicks * 0.7),
      lastClicked: lastClicked?.toISOString() || null,
      created: created.toISOString(),
    })
  }

  return links
}

function DashboardContent() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
    preset: '7d',
  })

  // Mock data
  const kpis = generateMockKPIs()
  const countries = generateMockCountries()
  const links = generateMockLinks()
  const totalClicks = countries.reduce((sum, c) => sum + c.clicks, 0)

  const handleLinkClick = (linkId: number) => {
    navigate(`/links/${linkId}/stats`)
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem 1rem',
      minHeight: '100vh',
      background: '#f9fafb',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '0.5rem',
        }}>
          Analytics Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Monitor your link performance and traffic insights
        </p>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector value={dateRange} onChange={setDateRange} />

      {/* KPI Cards Row */}
      <KPICardsRow kpis={kpis} />

      {/* Country Map Card */}
      <CountryMapCard countries={countries} totalClicks={totalClicks} topCount={5} />

      {/* Links Table */}
      <LinksTable links={links} onRowClick={handleLinkClick} />
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

