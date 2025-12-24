import type { KPIData } from '@/types/analytics'
import { Sparkline } from '../charts/Sparkline'
import { useTheme } from '@/contexts'

interface KPICardProps {
  data: KPIData
}

export default function KPICard({ data }: KPICardProps) {
  const { theme } = useTheme()
  const { title, value, previousValue, delta, sparklineData, trend } = data

  const bgColor = theme === 'dark' ? '#1f2937' : '#ffffff'
  const textColor = theme === 'dark' ? '#f9fafb' : '#111827'
  const textSecondary = theme === 'dark' ? '#d1d5db' : '#6b7280'

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const deltaColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : textSecondary
  const deltaIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'

  return (
    <div style={{
      background: bgColor,
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      minHeight: '140px',
      transition: 'background-color 0.3s ease',
    }}>
      {/* Left side: Title, metric, and delta */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Title */}
        <div style={{ fontSize: '0.875rem', color: textSecondary, fontWeight: '500' }}>
          {title}
        </div>

        {/* Main metric */}
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: textColor, lineHeight: 1 }}>
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
          <span style={{ color: textSecondary }}>vs previous period</span>
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

