import { useEffect } from 'react'
import { useTheme } from '@/contexts'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

export default function ToastComponent({ toast, onRemove }: ToastProps) {
  const { theme } = useTheme()

  useEffect(() => {
    const duration = toast.duration ?? 5000
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const bgColor = theme === 'dark' ? '#1f2937' : '#ffffff'
  const textColor = theme === 'dark' ? '#f9fafb' : '#111827'
  const borderColor = theme === 'dark' ? '#374151' : '#e5e7eb'

  const typeColors = {
    success: { bg: '#10b981', icon: '✓' },
    error: { bg: '#ef4444', icon: '✕' },
    info: { bg: '#3b82f6', icon: 'ℹ' },
    warning: { bg: '#f59e0b', icon: '⚠' },
  }

  const color = typeColors[toast.type]

  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '1rem 1.25rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        minWidth: '300px',
        maxWidth: '500px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: color.bg,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          flexShrink: 0,
        }}
      >
        {color.icon}
      </div>
      <div style={{ flex: 1, color: textColor, fontSize: '0.875rem' }}>
        {toast.message}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          cursor: 'pointer',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          lineHeight: 1,
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = textColor
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = theme === 'dark' ? '#9ca3af' : '#6b7280'
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

