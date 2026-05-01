import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import EventosPage from './pages/EventosPage'
import MisEventosPage from './pages/MisEventosPage'
import PaymentPage from './pages/PaymentPage'
import DocsPage from './pages/DocsPage'
import AnalyzerPage from './pages/AnalyzerPage'
import StatusPage from './pages/StatusPage'

// Protected route — only authenticated users
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Admin-only route
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/eventos" replace />
  return children
}

function App() {
  const { user } = useAuth(); // Need to get user to send user_id

  useEffect(() => {
    const handleGlobalClick = (e) => {
      // Find the closest button, a, or element with text
      const target = e.target.closest('button, a, input, select') || e.target;
      const targetText = target.innerText || target.name || target.id || target.tagName;
      
      const eventData = {
        user_id: user ? `user_${user.id}` : 'anonymous',
        action_type: 'CLICK',
        target_element: targetText.substring(0, 50), // Limit length
        payload: {
          path: window.location.pathname,
          nodeName: target.nodeName,
          className: target.className
        }
      };

      fetch('/analyzer/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      }).catch(err => console.error('Error tracking click:', err));
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [user]);

  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/olvidar-contrasena" element={<ForgotPasswordPage />} />
          
          {/* Protected: logged in users */}
          <Route path="/eventos" element={
            <ProtectedRoute><EventosPage /></ProtectedRoute>
          } />
          <Route path="/mis-eventos" element={
            <ProtectedRoute><MisEventosPage /></ProtectedRoute>
          } />
          <Route path="/pago/:eventoId" element={
            <ProtectedRoute><PaymentPage /></ProtectedRoute>
          } />
          
          {/* Admin only */}
          <Route path="/dashboard" element={
            <AdminRoute><DashboardPage /></AdminRoute>
          } />
          <Route path="/analizador" element={
            <AdminRoute><AnalyzerPage /></AdminRoute>
          } />
          
          {/* Hidden route - only accessible via URL bar */}
          <Route path="/docs" element={<DocsPage />} />
          
          <Route path="/status" element={
            <AdminRoute><StatusPage /></AdminRoute>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
