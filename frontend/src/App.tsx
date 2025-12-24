import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, ThemeProvider } from './contexts'
import { Home, Login, AuthCallback, Dashboard, LinkStats } from './pages'
import { ProtectedRoute } from './components'

function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  )
}

export default App
