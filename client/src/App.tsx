import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { ChatProvider } from './context/ChatContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import JoinChat from './pages/JoinChat'
import ChatRoom from './pages/ChatRoom'
import SupportChat from './pages/SupportChat'
import Dashboard from './pages/Dashboard'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import About from './pages/About'
import Disclaimer from './pages/Disclaimer'
import CrisisResources from './pages/CrisisResources'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('adminToken')
  if (!token) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/join" element={<JoinChat />} />
              <Route path="/chat/:roomId" element={<ChatRoom />} />
              <Route path="/support/:roomId" element={<SupportChat />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/panel" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/about" element={<About />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/resources" element={<CrisisResources />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </ChatProvider>
    </ThemeProvider>
  )
}

export default App
