import type { KPIData } from '@/types/analytics'
import { Sparkline } from '../charts/Sparkline'

interface KPICardProps {
  data: KPIData
}

export default function KPICard({ data }: KPICardProps) {
  const { title, value, previousValue, delta, sparklineData, trend } = data

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const deltaColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280'
  const deltaIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      minHeight: '140px',
    }}>
      {/* Left side: Title, metric, and delta */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Title */}
        <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
          {title}
        </div>

        {/* Main metric */}
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', lineHeight: 1 }}>
          {formatNumber(value)}
        </div>

        {/* Delta */}
        <div style={{ 
          fontSize: '0.875rem', 
          color: deltaColor,
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}>
          <span>{deltaIcon}</span>
          <span>{Math.abs(delta).toFixed(1)}%</span>
          <span style={{ color: '#6b7280' }}>vs previous period</span>
        </div>
      </div>

      {/* Right side: Sparkline */}
      <div style={{ 
        width: '100px', 
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}>
        <Sparkline data={sparklineData} />
      </div>
    </div>
  )
}

