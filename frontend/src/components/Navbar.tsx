import { useNavigate } from 'react-router-dom'
import { useAuth, useTheme } from '@/contexts'

export default function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const bgColor = theme === 'dark' ? '#111827' : '#ffffff'
  const textColor = theme === 'dark' ? '#f9fafb' : '#111827'
  const textSecondary = theme === 'dark' ? '#d1d5db' : '#6b7280'
  const borderColor = theme === 'dark' ? '#374151' : '#e5e7eb'
  const bgSecondary = theme === 'dark' ? '#1f2937' : '#f3f4f6'
  const buttonBg = theme === 'dark' ? '#f9fafb' : '#111827'
  const buttonText = theme === 'dark' ? '#111827' : '#ffffff'

  const handleNavClick = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else {
      // If on dashboard, navigate to home first
      if (window.location.pathname !== '/') {
        navigate('/')
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }

  return (
    <header style={{
      padding: '1.5rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${borderColor}`,
      background: bgColor,
      maxWidth: '1400px',
      margin: '0 auto',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    }}>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: textColor,
          cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        <span>🔗</span>
        <span>LinkShort</span>
      </div>
      
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
        <a
          href="#features"
          onClick={(e) => {
            e.preventDefault()
            handleNavClick('features')
          }}
          style={{
            color: textSecondary,
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = textColor}
          onMouseLeave={(e) => e.currentTarget.style.color = textSecondary}
        >
          Features
        </a>
        <a
          href="#about"
          onClick={(e) => {
            e.preventDefault()
            handleNavClick('about')
          }}
          style={{
            color: textSecondary,
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = textColor}
          onMouseLeave={(e) => e.currentTarget.style.color = textSecondary}
        >
          About
        </a>
        <a
          href="#faq"
          onClick={(e) => {
            e.preventDefault()
            handleNavClick('faq')
          }}
          style={{
            color: textSecondary,
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = textColor}
          onMouseLeave={(e) => e.currentTarget.style.color = textSecondary}
        >
          FAQ
        </a>
      </nav>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            padding: '0.5rem',
            background: 'transparent',
            border: `1px solid ${borderColor}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            transition: 'border-color 0.3s ease',
          }}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {!isAuthenticated ? (
          <>
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault()
                navigate('/login')
              }}
              style={{
                color: textColor,
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = textSecondary}
              onMouseLeave={(e) => e.currentTarget.style.color = textColor}
            >
              Log in
            </a>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '0.5rem 1.5rem',
                background: buttonBg,
                border: 'none',
                color: buttonText,
                fontSize: '0.875rem',
                fontWeight: '500',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Get Started
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '0.5rem 1.5rem',
                background: 'transparent',
                border: `1px solid ${borderColor}`,
                color: textColor,
                fontSize: '0.875rem',
                fontWeight: '500',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s, border-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = bgSecondary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Dashboard
            </button>
            <button
              onClick={logout}
              style={{
                padding: '0.5rem 1.5rem',
                background: buttonBg,
                border: 'none',
                color: buttonText,
                fontSize: '0.875rem',
                fontWeight: '500',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  )
}

