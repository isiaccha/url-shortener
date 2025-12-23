import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts'
import { Login, AuthCallback, Dashboard } from './pages'
import { ProtectedRoute } from './components'
import ApiTest from './components/ApiTest'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ color: '#213547' }}>
          <Routes>
            <Route path="/" element={
              <div>
                <h1 style={{ color: '#213547' }}>URL Shortener</h1>
                <p>API Client Testing</p>
                <ApiTest />
              </div>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
