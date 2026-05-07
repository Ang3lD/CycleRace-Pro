import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bike, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { forgotPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" id="forgot-password-page">
      <div className="auth-page__bg">
        <div className="auth-page__orb auth-page__orb--1" />
        <div className="auth-page__orb auth-page__orb--2" />
      </div>

      <div className="auth-container">
        <div className="auth-card glass">
          <div className="auth-card__header">
            <div className="auth-card__logo" style={{ background: sent ? 'linear-gradient(135deg, var(--emerald-400), var(--emerald-500))' : undefined }}>
              {sent ? <CheckCircle2 size={28} /> : <KeyRound size={28} />}
            </div>
            <h1 className="auth-card__title">
              {sent ? '¡Correo Enviado!' : 'Recuperar Contraseña'}
            </h1>
            <p className="auth-card__subtitle">
              {sent
                ? `Hemos enviado un enlace de recuperación a ${email}`
                : 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña'
              }
            </p>
          </div>

          {!sent ? (
            <>
              {error && (
                <div className="auth-error" id="forgot-error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit} id="forgot-form">
                <div className="input-group">
                  <label htmlFor="forgot-email">Correo Electrónico</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="forgot-email"
                      type="email"
                      className="input-field input-field--icon"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg auth-btn" id="forgot-submit" disabled={loading}>
                  {loading ? (
                    <><Loader2 size={18} className="spin" /> Enviando...</>
                  ) : (
                    <>Enviar Enlace de Recuperación <ArrowRight size={18} /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="forgot-success">
              <div className="forgot-success__icon">
                <Mail size={48} />
              </div>
              <div className="forgot-success__steps">
                <div className="forgot-success__step">
                  <span className="forgot-success__step-num">1</span>
                  <p>Revisa tu bandeja de entrada (y spam)</p>
                </div>
                <div className="forgot-success__step">
                  <span className="forgot-success__step-num">2</span>
                  <p>Haz clic en el enlace del correo</p>
                </div>
                <div className="forgot-success__step">
                  <span className="forgot-success__step-num">3</span>
                  <p>Crea tu nueva contraseña</p>
                </div>
              </div>
              <button
                className="btn btn-secondary btn-lg auth-btn"
                onClick={() => { setSent(false); setEmail(''); }}
                id="forgot-retry"
              >
                Enviar a otro correo
              </button>
            </div>
          )}

          <div className="auth-card__footer">
            <p>
              <Link to="/login" className="auth-link" id="forgot-back-login">
                <ArrowLeft size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Volver al inicio de sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
