import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts'
import { Home, Login, AuthCallback, Dashboard } from './pages'
import { ProtectedRoute } from './components'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
