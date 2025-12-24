import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProtectedRoute, Navbar } from '@/components'
import { useTheme } from '@/contexts'
import KPICardsRow from '@/components/dashboard/KPICardsRow'
import CountryMapCard from '@/components/dashboard/CountryMapCard'
import LinksTable from '@/components/dashboard/LinksTable'
import DateRangeSelector from '@/components/dashboard/DateRangeSelector'
import { getDashboardData, updateLinkStatus } from '@/api/links'
import type { DateRange, KPIData, CountryData, LinkTableRow } from '@/types/analytics'
import type { DashboardResponse } from '@/types/api'

// Transform backend API response to frontend types
const transformKPIs = (data: DashboardResponse): KPIData[] => {
  const { kpis, sparkline_data } = data
  
  const calcDelta = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100.0 : 0.0
    return ((current - previous) / previous) * 100.0
  }

  const calcTrend = (current: number, previous: number): 'up' | 'down' | 'neutral' => {
    if (current > previous) return 'up'
    if (current < previous) return 'down'
    return 'neutral'
  }

  return [
    {
      title: 'Total Clicks',
      value: kpis.total_clicks,
      previousValue: kpis.previous_period_clicks,
      delta: calcDelta(kpis.total_clicks, kpis.previous_period_clicks),
      sparklineData: sparkline_data.map(p => ({ timestamp: p.timestamp, value: p.value })),
      trend: calcTrend(kpis.total_clicks, kpis.previous_period_clicks),
    },
    {
      title: 'Total Links',
      value: kpis.total_links,
      previousValue: kpis.previous_period_links,
      delta: calcDelta(kpis.total_links, kpis.previous_period_links),
      sparklineData: sparkline_data.map(p => ({ timestamp: p.timestamp, value: p.value })),
      trend: calcTrend(kpis.total_links, kpis.previous_period_links),
    },
    {
      title: 'Unique Visitors',
      value: kpis.unique_visitors,
      previousValue: kpis.previous_period_unique_visitors,
      delta: calcDelta(kpis.unique_visitors, kpis.previous_period_unique_visitors),
      sparklineData: sparkline_data.map(p => ({ timestamp: p.timestamp, value: p.value })),
      trend: calcTrend(kpis.unique_visitors, kpis.previous_period_unique_visitors),
    },
  ]
}

const transformCountries = (data: DashboardResponse): CountryData[] => {
  return data.countries.map(c => ({
    countryCode: c.country_code,
    countryName: c.country_name,
    clicks: c.clicks,
    percentage: c.percentage,
    uniqueVisitors: c.unique_visitors,
  }))
}

const transformLinks = (data: DashboardResponse): LinkTableRow[] => {
  return data.links.map(l => ({
    id: l.id,
    shortUrl: l.short_url,
    longUrl: l.long_url,
    status: l.status === 'active' ? 'active' : 'inactive',
    clicks: l.clicks,
    uniqueVisitors: l.unique_visitors,
    lastClicked: l.last_clicked,
    created: l.created,
  }))
}

function DashboardContent() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
    preset: '7d',
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [kpis, setKpis] = useState<KPIData[]>([])
  const [countries, setCountries] = useState<CountryData[]>([])
  const [links, setLinks] = useState<LinkTableRow[]>([])

  const bgColor = theme === 'dark' ? '#111827' : '#f9fafb'
  const textColor = theme === 'dark' ? '#f9fafb' : '#111827'
  const textSecondary = theme === 'dark' ? '#d1d5db' : '#6b7280'

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const startDate = dateRange.start.toISOString()
        const endDate = dateRange.end.toISOString()
        const data = await getDashboardData(startDate, endDate)
        
        setKpis(transformKPIs(data))
        setCountries(transformCountries(data))
        setLinks(transformLinks(data))
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  // Filter out deleted links from display
  const visibleLinks = links.filter(link => !link.deleted)
  
  const totalClicks = countries.reduce((sum, c) => sum + c.clicks, 0)

  const handleLinkClick = (linkId: number) => {
    navigate(`/links/${linkId}/stats`)
  }

  const handleActivate = async (linkId: number) => {
    try {
      await updateLinkStatus(linkId, true)
      setLinks(prevLinks =>
        prevLinks.map(link =>
          link.id === linkId ? { ...link, status: 'active' as const } : link
        )
      )
    } catch (err) {
      console.error('Failed to activate link:', err)
      setError(err instanceof Error ? err.message : 'Failed to activate link')
    }
  }

  const handleDeactivate = async (linkId: number) => {
    try {
      await updateLinkStatus(linkId, false)
      setLinks(prevLinks =>
        prevLinks.map(link =>
          link.id === linkId ? { ...link, status: 'inactive' as const } : link
        )
      )
    } catch (err) {
      console.error('Failed to deactivate link:', err)
      setError(err instanceof Error ? err.message : 'Failed to deactivate link')
    }
  }

  const handleDelete = (linkId: number) => {
    // Soft delete - only mark as deleted, don't remove from array
    // This removes from user view but keeps in DB
    setLinks(prevLinks =>
      prevLinks.map(link =>
        link.id === linkId ? { ...link, deleted: true } : link
      )
    )
  }

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
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            color: textColor,
            marginBottom: '0.5rem',
          }}>
            Analytics Dashboard
          </h1>
          <p style={{ color: textSecondary, fontSize: '0.875rem' }}>
            Monitor your link performance and traffic insights
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            background: theme === 'dark' ? '#7f1d1d' : '#fee2e2',
            color: theme === 'dark' ? '#fca5a5' : '#991b1b',
            borderRadius: '6px',
            border: `1px solid ${theme === 'dark' ? '#991b1b' : '#fecaca'}`,
          }}>
            {error}
          </div>
        )}

        {/* Date Range Selector */}
        <DateRangeSelector value={dateRange} onChange={setDateRange} />

        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            color: textSecondary,
          }}>
            Loading dashboard data...
          </div>
        ) : (
          <>
            {/* KPI Cards Row */}
            <KPICardsRow kpis={kpis} />

            {/* Country Map Card */}
            <CountryMapCard countries={countries} totalClicks={totalClicks} topCount={3} />

            {/* Links Table */}
            <LinksTable 
              links={visibleLinks} 
              onRowClick={handleLinkClick}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              onDelete={handleDelete}
            />
          </>
        )}
      </div>
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

