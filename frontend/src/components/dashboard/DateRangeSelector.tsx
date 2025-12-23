import type { DateRange, DateRangePreset } from '@/types/analytics'

interface DateRangeSelectorProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '12mo', label: '12mo' },
  { value: 'custom', label: 'Custom' },
]

export default function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const handlePresetClick = (preset: DateRangePreset) => {
    const now = new Date()
    let start = new Date()

    switch (preset) {
      case '24h':
        start.setHours(now.getHours() - 24)
        break
      case '7d':
        start.setDate(now.getDate() - 7)
        break
      case '30d':
        start.setDate(now.getDate() - 30)
        break
      case '12mo':
        start.setMonth(now.getMonth() - 12)
        break
      case 'custom':
        // For custom, keep current dates but mark as custom
        onChange({ ...value, preset: 'custom' })
        return
    }

    onChange({
      start,
      end: now,
      preset,
    })
  }

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginBottom: '1.5rem',
    }}>
      <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
        Date Range:
      </span>
      {PRESETS.map((preset) => (
        <button
          key={preset.value}
          onClick={() => handlePresetClick(preset.value)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            borderRadius: '6px',
            border: '1px solid',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: value.preset === preset.value ? '#3b82f6' : 'white',
            color: value.preset === preset.value ? 'white' : '#374151',
            borderColor: value.preset === preset.value ? '#3b82f6' : '#d1d5db',
          }}
          onMouseEnter={(e) => {
            if (value.preset !== preset.value) {
              e.currentTarget.style.borderColor = '#9ca3af'
              e.currentTarget.style.background = '#f9fafb'
            }
          }}
          onMouseLeave={(e) => {
            if (value.preset !== preset.value) {
              e.currentTarget.style.borderColor = '#d1d5db'
              e.currentTarget.style.background = 'white'
            }
          }}
        >
          {preset.label}
        </button>
      ))}
      {value.preset === 'custom' && (
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>
          Custom range selected
        </div>
      )}
    </div>
  )
}

