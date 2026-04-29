import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  CreditCard, ShieldCheck, Lock, ArrowLeft, 
  Loader2, AlertCircle, CheckCircle2, Bike,
  Calendar, MapPin, DollarSign, Wallet
} from 'lucide-react'
import './PaymentPage.css'

export default function PaymentPage() {
  const { eventoId } = useParams()
  const navigate = useNavigate()
  const { token, API_URL, user } = useAuth()
  
  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [form, setForm] = useState({
    cardName: user?.nombre || '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  })

  useEffect(() => {
    loadEvento()
  }, [eventoId])

  async function loadEvento() {
    try {
      const res = await fetch(`${API_URL}/eventos/${eventoId}`)
      if (!res.ok) throw new Error('Evento no encontrado')
      const data = await res.json()
      setEvento(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setError('')
    setPaying(true)

    // Simulate payment processing
    setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/inscripciones`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            evento_id: eventoId,
            metodo_pago: 'Tarjeta de Crédito',
            monto: evento.precio
          }),
        })
        
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        setSuccess(true)
        setTimeout(() => navigate('/mis-eventos'), 3000)
      } catch (err) {
        setError(err.message)
        setPaying(false)
      }
    }, 2000)
  }

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>

  if (success) {
    return (
      <div className="payment-page payment-page--success">
        <div className="payment-card glass animate-scale-in">
          <div className="payment-success-icon">
            <CheckCircle2 size={64} color="var(--emerald-400)" />
          </div>
          <h1 className="payment-title">¡Pago Exitoso!</h1>
          <p className="payment-subtitle">
            Tu inscripción al evento <strong>{evento?.nombre}</strong> ha sido procesada.
          </p>
          <div className="payment-details glass-dark">
            <div className="payment-detail-row">
              <span>Monto Pagado:</span>
              <strong>${evento?.precio} MXN</strong>
            </div>
            <div className="payment-detail-row">
              <span>Transacción:</span>
              <strong>#TRX-{Math.floor(Math.random() * 1000000)}</strong>
            </div>
          </div>
          <p className="payment-redirect-msg">Redirigiendo a tus eventos en unos segundos...</p>
          <Link to="/mis-eventos" className="btn btn-primary btn-lg">Ver mis eventos</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-page">
      <div className="payment-page__bg">
        <div className="payment-page__orb payment-page__orb--1" />
        <div className="payment-page__orb payment-page__orb--2" />
      </div>

      <div className="container">
        <Link to="/eventos" className="payment-back">
          <ArrowLeft size={18} /> Volver a eventos
        </Link>

        <div className="payment-grid">
          {/* Order Summary */}
          <div className="payment-summary card glass">
            <h2 className="payment-section-title">Resumen del Evento</h2>
            <div className="payment-event-info">
              <div className="payment-event-badge">
                <Bike size={20} />
              </div>
              <div>
                <h3 className="payment-event-name">{evento?.nombre}</h3>
                <p className="payment-event-desc">{evento?.tipo_evento}</p>
              </div>
            </div>

            <div className="payment-event-meta">
              <div className="meta-item">
                <Calendar size={16} />
                <span>{new Date(evento?.fecha_evento).toLocaleDateString()}</span>
              </div>
              <div className="meta-item">
                <MapPin size={16} />
                <span>{evento?.ubicacion}</span>
              </div>
            </div>

            <div className="payment-divider" />

            <div className="payment-price-breakdown">
              <div className="price-row">
                <span>Inscripción</span>
                <span>${evento?.precio}</span>
              </div>
              <div className="price-row">
                <span>Cargos por servicio</span>
                <span>$0.00</span>
              </div>
              <div className="price-row price-row--total">
                <span>Total a Pagar</span>
                <span>${evento?.precio} MXN</span>
              </div>
            </div>

            <div className="payment-security-notice">
              <ShieldCheck size={16} />
              <span>Pago seguro procesado por CycleRace Pro Pay</span>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form-container card glass">
            <div className="payment-form-header">
              <h2 className="payment-section-title">Método de Pago</h2>
              <div className="payment-methods">
                <CreditCard size={24} className="active" />
                <Wallet size={24} />
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePayment} className="payment-form">
              <div className="input-group">
                <label>Titular de la Tarjeta</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Nombre como aparece en la tarjeta"
                  value={form.cardName}
                  onChange={e => setForm({...form, cardName: e.target.value})}
                  required
                />
              </div>

              <div className="input-group">
                <label>Número de Tarjeta</label>
                <div className="input-wrapper">
                  <CreditCard size={18} className="input-icon" />
                  <input 
                    type="text" 
                    className="input-field input-field--icon" 
                    placeholder="0000 0000 0000 0000"
                    maxLength="19"
                    value={form.cardNumber}
                    onChange={e => setForm({...form, cardNumber: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="payment-form-row">
                <div className="input-group">
                  <label>Vencimiento</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="MM/YY"
                    maxLength="5"
                    value={form.expiry}
                    onChange={e => setForm({...form, expiry: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>CVV</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type="password" 
                      className="input-field input-field--icon" 
                      placeholder="123"
                      maxLength="4"
                      value={form.cvv}
                      onChange={e => setForm({...form, cvv: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg payment-btn" disabled={paying}>
                {paying ? (
                  <><Loader2 size={20} className="spin" /> Procesando pago...</>
                ) : (
                  <>Pagar ${evento?.precio} MXN</>
                )}
              </button>
              
              <p className="payment-terms">
                Al hacer clic en pagar, aceptas los términos y condiciones de inscripción al evento.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
