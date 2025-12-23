import type { SparklinePoint } from '@/types/analytics'

interface SparklineProps {
  data: SparklinePoint[]
  color?: string
}

export function Sparkline({ data, color = '#3b82f6' }: SparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        color: '#9ca3af',
        fontSize: '0.75rem'
      }}>
        No data
      </div>
    )
  }

  // Calculate dimensions
  const width = 100
  const height = 40
  const padding = 2

  // Find min/max for scaling
  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1 // Avoid division by zero

  // Generate path
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2)
    const y = height - padding - ((point.value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

