import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts'

interface UrlInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  showValidation?: boolean
  onValidationChange?: (isValid: boolean) => void
}

type ValidationState = 'idle' | 'valid' | 'invalid' | 'checking'

export default function UrlInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Enter your long URL here...',
  disabled = false,
  autoFocus = false,
  showValidation = true,
  onValidationChange,
}: UrlInputProps) {
  const { theme } = useTheme()
  const [validationState, setValidationState] = useState<ValidationState>('idle')
  const [validationMessage, setValidationMessage] = useState<string>('')

  const bgColor = theme === 'dark' ? '#1f2937' : '#ffffff'
  const textColor = theme === 'dark' ? '#f9fafb' : '#111827'
  const borderColor = theme === 'dark' ? '#4b5563' : '#e5e7eb'
  const validBorderColor = '#10b981'
  const invalidBorderColor = '#ef4444'
  const focusBorderColor = '#3b82f6'

  const validateUrl = (urlString: string): { valid: boolean; message: string } => {
    if (!urlString.trim()) {
      return { valid: false, message: '' }
    }

    const trimmed = urlString.trim()
    const hasProtocol = trimmed.startsWith('http://') || trimmed.startsWith('https://')
    
    // Try to validate as a complete URL
    let urlToValidate = trimmed
    if (!hasProtocol) {
      urlToValidate = `https://${trimmed}`
    }

    try {
      const url = new URL(urlToValidate)
      
      // Check if protocol is valid
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return { valid: false, message: 'URL must use http:// or https://' }
      }
      
      // Check if hostname is valid (must have at least a TLD)
      const hostname = url.hostname
      if (!hostname || hostname.length === 0) {
        return { valid: false, message: 'Please enter a valid URL (e.g., example.com)' }
      }
      
      // Check if hostname has a valid TLD (at least 2 characters after the last dot)
      const parts = hostname.split('.')
      if (parts.length < 2 || parts[parts.length - 1].length < 2) {
        return { valid: false, message: 'Please enter a valid URL (e.g., example.com)' }
      }
      
      // Valid URL
      if (hasProtocol) {
        return { valid: true, message: 'Valid URL' }
      } else {
        return { valid: true, message: 'Will be shortened as https://...' }
      }
    } catch {
      return { valid: false, message: 'Please enter a valid URL (e.g., example.com)' }
    }
  }

  useEffect(() => {
    if (!showValidation || !value.trim()) {
      setValidationState('idle')
      setValidationMessage('')
      onValidationChange?.(false)
      return
    }

    const validation = validateUrl(value)
    const isValid = validation.valid
    setValidationState(isValid ? 'valid' : 'invalid')
    setValidationMessage(validation.message)
    onValidationChange?.(isValid)
  }, [value, showValidation, onValidationChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit && validationState === 'valid') {
      onSubmit()
    }
  }

  const getBorderColor = () => {
    if (validationState === 'valid') return validBorderColor
    if (validationState === 'invalid') return invalidBorderColor
    return borderColor
  }

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          padding: '1rem 1.5rem',
          paddingRight: '1.5rem',
          fontSize: '1rem',
          lineHeight: '1.5',
          background: bgColor,
          color: textColor,
          border: `2px solid ${getBorderColor()}`,
          borderRadius: '8px',
          outline: 'none',
          transition: 'border-color 0.2s, background-color 0.3s, color 0.3s',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          if (validationState === 'idle') {
            e.currentTarget.style.borderColor = focusBorderColor
          }
        }}
        onBlur={(e) => {
          if (validationState === 'idle') {
            e.currentTarget.style.borderColor = borderColor
          }
        }}
      />

      {showValidation && validationMessage && validationState !== 'idle' && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: validationState === 'valid' ? validBorderColor : invalidBorderColor,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <span>{validationMessage}</span>
        </div>
      )}
    </div>
  )
}

