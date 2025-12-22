
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ApiTest from './components/ApiTest'
import AuthCallback from './pages/AuthCallback'

function App() {
  return (
    <BrowserRouter>
      <div style={{ color: '#213547' }}>
        <h1 style={{ color: '#213547' }}>URL Shortener</h1>
        <Routes>
          <Route path="/" element={
            <div>
              <p>API Client Testing</p>
              <ApiTest />
            </div>
          } />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
