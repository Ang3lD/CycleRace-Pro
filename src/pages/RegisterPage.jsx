import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bike, User, Mail, Lock, Phone, MapPin, ArrowRight, Upload, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

export default function RegisterPage() {
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '', direccion: '',
    password: '', confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register: registerUser, user } = useAuth()
  const navigate = useNavigate()

  // If already logged in, redirect
  useEffect(() => {
    if (user) navigate('/eventos', { replace: true })
  }, [user, navigate])

  if (user) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)
    try {
      await registerUser({
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        telefono: form.telefono,
        direccion: form.direccion,
      })
      navigate('/eventos')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-page__bg">
        <div className="auth-page__orb auth-page__orb--1" />
        <div className="auth-page__orb auth-page__orb--2" />
      </div>

      <div className="auth-container auth-container--wide">
        <div className="auth-card glass">
          <div className="auth-card__header">
            <div className="auth-card__logo">
              <Bike size={28} />
            </div>
            <h1 className="auth-card__title">Crear Cuenta</h1>
            <p className="auth-card__subtitle">Regístrate para explorar y unirte a eventos de bicicleta</p>
          </div>

          {error && (
            <div className="auth-error" id="register-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} id="register-form">
            <div className="auth-form__grid">
              <div className="input-group">
                <label htmlFor="reg-nombre">Nombre Completo</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    id="reg-nombre"
                    type="text"
                    className="input-field input-field--icon"
                    placeholder="Juan Pérez López"
                    value={form.nombre}
                    onChange={e => setForm({...form, nombre: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="reg-email">Correo Electrónico</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="reg-email"
                    type="email"
                    className="input-field input-field--icon"
                    placeholder="correo@ejemplo.com"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="reg-telefono">Teléfono</label>
                <div className="input-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input
                    id="reg-telefono"
                    type="tel"
                    className="input-field input-field--icon"
                    placeholder="+52 555 123 4567"
                    value={form.telefono}
                    onChange={e => setForm({...form, telefono: e.target.value})}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="reg-direccion">Dirección</label>
                <div className="input-wrapper">
                  <MapPin size={18} className="input-icon" />
                  <input
                    id="reg-direccion"
                    type="text"
                    className="input-field input-field--icon"
                    placeholder="Calle, Colonia, Ciudad"
                    value={form.direccion}
                    onChange={e => setForm({...form, direccion: e.target.value})}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="reg-password">Contraseña</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="reg-password"
                    type="password"
                    className="input-field input-field--icon"
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    required
                    minLength={8}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="reg-confirm-password">Confirmar Contraseña</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="reg-confirm-password"
                    type="password"
                    className="input-field input-field--icon"
                    placeholder="Repite tu contraseña"
                    value={form.confirmPassword}
                    onChange={e => setForm({...form, confirmPassword: e.target.value})}
                    required
                    minLength={8}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-btn" id="register-submit" disabled={loading}>
              {loading ? (
                <><Loader2 size={18} className="spin" /> Creando cuenta...</>
              ) : (
                <>Crear Cuenta <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>¿Ya tienes cuenta? <Link to="/login" className="auth-link" id="register-to-login">Inicia sesión</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
