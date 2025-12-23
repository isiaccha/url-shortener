import type { KPIData } from '@/types/analytics'
import KPICard from './KPICard'

interface KPICardsRowProps {
  kpis: KPIData[]
}

export default function KPICardsRow({ kpis }: KPICardsRowProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1.5rem',
    }}>
      {kpis.map((kpi, index) => (
        <KPICard key={index} data={kpi} />
      ))}
    </div>
  )
}

