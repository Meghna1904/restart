import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import TabBar from './components/TabBar'
import AuthPage from './pages/auth/AuthPage'
import HomePage from './pages/home/HomePage'
import BrainPage from './pages/brain/BrainPage'
import IdeasPage from './pages/ideas/IdeasPage'
import VaultPage from './pages/vault/VaultPage'
import MePage from './pages/me/MePage'
import InsightsPage from './pages/insights/InsightsPage'
import LandingPage from './pages/landing/LandingPage'
import RestartSpacePage from './pages/restart/RestartSpacePage'

// Protected route wrapper
function Protected({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/auth" replace />
  return <>{children}</>
}

// App shell wrapping main pages
function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell cinematic-shell">
      <main className="page-content">
        {children}
      </main>
      <TabBar />
    </div>
  )
}

export default function App() {
  const { session, loading } = useAuth()
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (loading) return null

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={session ? <Navigate to="/home" replace /> : <AuthPage />} />
      
      <Route path="/home" element={<Protected><AppShell><HomePage /></AppShell></Protected>} />
      <Route path="/brain" element={<Protected><AppShell><BrainPage /></AppShell></Protected>} />
      <Route path="/ideas" element={<Protected><AppShell><IdeasPage /></AppShell></Protected>} />
      <Route path="/vault" element={<Protected><AppShell><VaultPage /></AppShell></Protected>} />
      <Route path="/me" element={<Protected><AppShell><MePage /></AppShell></Protected>} />
      <Route path="/insights" element={<Protected><AppShell><InsightsPage /></AppShell></Protected>} />
      <Route path="/restart" element={<Protected><AppShell><RestartSpacePage /></AppShell></Protected>} />
      
      {/* Fallback to home if logged in, auth if not */}
      <Route path="*" element={<Navigate to={session ? '/home' : '/auth'} replace />} />
    </Routes>
  )
}
