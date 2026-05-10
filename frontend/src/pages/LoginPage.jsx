import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bike, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.rol === 'admin') {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/eventos', { replace: true })
      }
    }
  }, [user, navigate])

  if (user) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const loggedUser = await login(form.email, form.password)
      if (loggedUser.rol === 'admin') {
        navigate('/dashboard')
      } else {
        navigate('/eventos')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-page__bg">
        <div className="auth-page__orb auth-page__orb--1" />
        <div className="auth-page__orb auth-page__orb--2" />
      </div>

      <div className="auth-container">
        <div className="auth-card glass">
          <div className="auth-card__header">
            <div className="auth-card__logo">
              <Bike size={28} />
            </div>
            <h1 className="auth-card__title">Bienvenido de vuelta</h1>
            <p className="auth-card__subtitle">Inicia sesión para acceder a tu panel</p>
          </div>

          {error && (
            <div className="auth-error" id="login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} id="login-form">
            <div className="input-group">
              <label htmlFor="login-email">Correo Electrónico</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="input-field input-field--icon"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="login-password">Contraseña</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field input-field--icon"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Toggle password"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-form__extras">
              <label className="auth-checkbox">
                <input type="checkbox" id="remember-me" />
                <span>Recordarme</span>
              </label>
              <Link to="/olvidar-contrasena" className="auth-link">¿Olvidaste tu contraseña?</Link>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-btn" id="login-submit" disabled={loading}>
              {loading ? (
                <><Loader2 size={18} className="spin" /> Iniciando sesión...</>
              ) : (
                <>Iniciar Sesión <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>¿No tienes cuenta? <Link to="/registro" className="auth-link" id="login-to-register">Regístrate aquí</Link></p>
          </div>

          {/* Demo credentials hint */}
          {<div className="auth-demo-info glass">
            <p className="auth-demo-info__title">👤 Usuarios de Prueba</p>
            <div className="auth-demo-info__row">
              <span className="auth-demo-info__label">Admin:</span>
              <code>admin@cycleracepro.com</code> / <code>LucarsTowers@05</code>
            </div>
            <div className="auth-demo-info__row">
              <span className="auth-demo-info__label">Usuario:</span>
              <code>carlos.mendoza@mail.com</code> / <code>Password123!</code>
            </div>
          </div>}
        </div>
      </div>
    </div>
  )
}
