import { useState, useEffect } from 'react'
import { getCurrentUser, getLinks, createLink, initiateGoogleLogin, logout } from '@/api'
import type { User, LinkListItem } from '@/types/api'

export default function ApiTest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [links, setLinks] = useState<LinkListItem[]>([])
  const [testUrl, setTestUrl] = useState('https://example.com')

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      console.log('✅ User is authenticated:', currentUser)
    } catch (err: any) {
      // 401 is expected if not logged in, so we don't show it as an error
      if (err.response?.status !== 401) {
        const errorMsg = err.response?.data?.detail || err.message || 'Unknown error'
        setError(errorMsg)
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    console.log('🔐 Initiating Google OAuth login...')
    initiateGoogleLogin()
  }

  const handleLogout = async () => {
    setLoading(true)
    setError(null)
    try {
      await logout()
      setUser(null)
      setLinks([])
      console.log('✅ Logged out successfully')
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Unknown error'
      setError(errorMsg)
      console.error('❌ Logout error:', err)
    } finally {
      setLoading(false)
    }
  }

  const testGetUser = async () => {
    setLoading(true)
    setError(null)
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      console.log('✅ getCurrentUser success:', currentUser)
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Unknown error'
      setError(errorMsg)
      console.error('❌ getCurrentUser error:', err)
    } finally {
      setLoading(false)
    }
  }

  const testGetLinks = async () => {
    setLoading(true)
    setError(null)
    try {
      const userLinks = await getLinks(10, 0)
      setLinks(userLinks)
      console.log('✅ getLinks success:', userLinks)
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Unknown error'
      setError(errorMsg)
      console.error('❌ getLinks error:', err)
    } finally {
      setLoading(false)
    }
  }

  const testCreateLink = async () => {
    if (!testUrl.trim()) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const newLink = await createLink({ target_url: testUrl })
      console.log('✅ createLink success:', newLink)
      // Refresh links list
      await testGetLinks()
      setTestUrl('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Unknown error'
      setError(errorMsg)
      console.error('❌ createLink error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: '#213547' }}>
      <h2 style={{ color: '#213547' }}>API Client Test</h2>
      
      {/* Auth Section */}
      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#e8f5e9', borderRadius: '8px', color: '#1b5e20' }}>
        <h3 style={{ color: '#1b5e20', marginTop: 0 }}>Authentication</h3>
        {user ? (
          <div>
            <p style={{ marginBottom: '1rem', color: '#1b5e20' }}>
              ✅ <strong>Logged in as:</strong> {user.email} {user.display_name && `(${user.display_name})`}
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={checkAuthStatus} 
                disabled={loading}
                style={{ 
                  padding: '0.5rem 1rem', 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Refresh Auth Status
              </button>
              <button 
                onClick={handleLogout} 
                disabled={loading}
                style={{ 
                  padding: '0.5rem 1rem', 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '1rem', color: '#1b5e20' }}>❌ Not logged in</p>
            <button 
              onClick={handleLogin}
              disabled={loading}
              style={{ 
                padding: '0.75rem 1.5rem', 
                cursor: loading ? 'not-allowed' : 'pointer',
                background: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              🔐 Login with Google
            </button>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9em', color: '#666' }}>
              This will redirect you to Google for authentication
            </p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px', color: '#213547' }}>
        <h3 style={{ color: '#213547', marginTop: 0 }}>Test Endpoints</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <button 
            onClick={testGetUser} 
            disabled={loading}
            style={{ 
              padding: '0.5rem 1rem', 
              cursor: loading ? 'not-allowed' : 'pointer',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Test GET /auth/me
          </button>
          <button 
            onClick={testGetLinks} 
            disabled={loading}
            style={{ 
              padding: '0.5rem 1rem', 
              cursor: loading ? 'not-allowed' : 'pointer',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Test GET /api/links
          </button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ color: '#213547' }}>Test Create Link</h4>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://example.com"
              style={{ 
                flex: 1, 
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                color: '#213547',
                background: 'white'
              }}
            />
            <button 
              onClick={testCreateLink} 
              disabled={loading || !testUrl.trim()}
              style={{ 
                padding: '0.5rem 1rem', 
                cursor: loading ? 'not-allowed' : 'pointer',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Test POST /api/links
            </button>
          </div>
        </div>
      </div>

      {loading && <p style={{ color: '#213547' }}>Loading...</p>}
      
      {error && (
        <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginTop: '1rem' }}>
          <strong>Error:</strong> {error}
          {error.includes('401') && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
              💡 This is expected if you're not logged in. Try logging in first!
            </p>
          )}
        </div>
      )}

      {user && (
        <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '8px', marginTop: '1rem', color: '#1b5e20' }}>
          <h4 style={{ color: '#1b5e20', marginTop: 0 }}>Current User:</h4>
          <pre style={{ background: 'white', padding: '0.5rem', borderRadius: '4px', overflow: 'auto', color: '#213547' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}

      {links.length > 0 && (
        <div style={{ padding: '1rem', background: '#e3f2fd', borderRadius: '8px', marginTop: '1rem', color: '#0d47a1' }}>
          <h4 style={{ color: '#0d47a1', marginTop: 0 }}>Links ({links.length}):</h4>
          <pre style={{ background: 'white', padding: '0.5rem', borderRadius: '4px', overflow: 'auto', maxHeight: '400px', color: '#213547' }}>
            {JSON.stringify(links, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff3e0', borderRadius: '8px', color: '#e65100' }}>
        <h4 style={{ color: '#e65100', marginTop: 0 }}>API Configuration:</h4>
        <ul style={{ listStyle: 'none', padding: 0, color: '#213547' }}>
          <li>API URL: <code style={{ background: '#f5f5f5', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>{import.meta.env.VITE_API_URL || 'http://localhost:8000'}</code></li>
          <li>With Credentials: <code style={{ background: '#f5f5f5', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>true</code> (for session cookies)</li>
          <li>Check browser console (F12) for detailed logs</li>
        </ul>
      </div>
    </div>
  )
}

