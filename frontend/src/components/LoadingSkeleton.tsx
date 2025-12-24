import { useTheme } from '@/contexts'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
  className?: string
}

export function Skeleton({ width = '100%', height = '1rem', borderRadius = '4px', className }: SkeletonProps) {
  const { theme } = useTheme()
  const bgColor = theme === 'dark' ? '#374151' : '#e5e7eb'
  const highlightColor = theme === 'dark' ? '#4b5563' : '#f3f4f6'

  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: `linear-gradient(90deg, ${bgColor} 25%, ${highlightColor} 50%, ${bgColor} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}

export function CardSkeleton() {
  const { theme } = useTheme()
  const bgColor = theme === 'dark' ? '#1f2937' : '#ffffff'
  const borderColor = theme === 'dark' ? '#374151' : '#e5e7eb'

  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <Skeleton width="60%" height="1.25rem" />
      <Skeleton width="40%" height="2rem" />
      <Skeleton width="80%" height="0.875rem" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  const { theme } = useTheme()
  const bgColor = theme === 'dark' ? '#1f2937' : '#ffffff'
  const borderColor = theme === 'dark' ? '#374151' : '#e5e7eb'

  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '1rem', borderBottom: `1px solid ${borderColor}` }}>
        <Skeleton width="100%" height="1.5rem" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: '1rem',
            borderBottom: i < rows - 1 ? `1px solid ${borderColor}` : 'none',
            display: 'grid',
            gridTemplateColumns: '2fr 3fr 1fr 1fr 1fr 1fr 1fr',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          <Skeleton height="1rem" />
          <Skeleton height="1rem" />
          <Skeleton height="1rem" />
          <Skeleton height="1rem" />
          <Skeleton height="1rem" />
          <Skeleton height="1rem" />
          <Skeleton height="1rem" />
        </div>
      ))}
    </div>
  )
}

export function KPICardSkeleton() {
  const { theme } = useTheme()
  const bgColor = theme === 'dark' ? '#1f2937' : '#ffffff'

  return (
    <div
      style={{
        background: bgColor,
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        minHeight: '140px',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Skeleton width="40%" height="0.875rem" />
        <Skeleton width="60%" height="2rem" />
        <Skeleton width="70%" height="0.875rem" />
      </div>
      <div style={{ width: '100px', height: '60px' }}>
        <Skeleton width="100%" height="100%" borderRadius="4px" />
      </div>
    </div>
  )
}

