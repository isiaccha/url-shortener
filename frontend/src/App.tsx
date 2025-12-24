import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, ThemeProvider, ToastProvider } from './contexts'
import { Home, Login, AuthCallback, Dashboard, LinkStats } from './pages'
import { ProtectedRoute } from './components'

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/links/:linkId/stats" element={<LinkStats />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
