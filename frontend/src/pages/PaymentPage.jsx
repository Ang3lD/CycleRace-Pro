import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { jsPDF } from 'jspdf'
import { 
  CreditCard, ShieldCheck, Lock, ArrowLeft, 
  Loader2, AlertCircle, CheckCircle2, Bike,
  Calendar, MapPin, DollarSign, Wallet, Download
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
  const [transaccionId, setTransaccionId] = useState('')
  const [inscripcionData, setInscripcionData] = useState(null)
  
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

        const txId = `TRX-${Date.now().toString(36).toUpperCase()}`
        setTransaccionId(txId)
        setInscripcionData(data)
        setSuccess(true)
      } catch (err) {
        setError(err.message)
        setPaying(false)
      }
    }, 2000)
  }

  const handleDownloadComprobante = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const now = new Date()
    
    doc.setFillColor(15, 15, 20)
    doc.rect(0, 0, 210, 297, 'F')
    
    doc.setFillColor(234, 88, 12)
    doc.rect(0, 0, 210, 45, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('CycleRace Pro', 20, 22)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Comprobante de Inscripcion', 20, 32)
    doc.text(`Folio: ${transaccionId}`, 20, 40)
    
    doc.setFillColor(16, 185, 129)
    doc.roundedRect(140, 10, 55, 25, 4, 4, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('PAGO EXITOSO', 167, 22, { align: 'center' })
    doc.text('INSCRIPCION CONFIRMADA', 167, 29, { align: 'center' })
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Datos del Evento', 20, 65)
    
    const rows = [
      ['Evento', evento?.nombre || '-'],
      ['Tipo', evento?.tipo_evento || '-'],
      ['Fecha del Evento', evento?.fecha_evento ? new Date(evento.fecha_evento).toLocaleDateString('es-MX') : '-'],
      ['Lugar', evento?.ubicacion || 'Por confirmar'],
    ]
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    rows.forEach(([label, value], i) => {
      const y = 78 + i * 12
      doc.setTextColor(150, 150, 160)
      doc.text(label + ':', 20, y)
      doc.setTextColor(255, 255, 255)
      doc.text(value, 80, y)
    })
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Datos del Participante', 20, 135)
    
    const userRows = [
      ['Nombre', user?.nombre || '-'],
      ['Email', user?.email || '-'],
      ['No. Competidor', inscripcionData?.numero_competidor ? `#${String(inscripcionData.numero_competidor).padStart(4, '0')}` : 'Pendiente de asignacion'],
      ['Estado', 'Pendiente de validacion'],
    ]
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    userRows.forEach(([label, value], i) => {
      const y = 148 + i * 12
      doc.setTextColor(150, 150, 160)
      doc.text(label + ':', 20, y)
      doc.setTextColor(255, 255, 255)
      doc.text(String(value), 80, y)
    })
    
    doc.setFillColor(30, 30, 40)
    doc.roundedRect(15, 205, 180, 55, 4, 4, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumen de Pago', 20, 220)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150, 150, 160)
    doc.text('Monto de inscripcion:', 20, 233)
    doc.setTextColor(255, 255, 255)
    doc.text(`$${evento?.precio} MXN`, 120, 233)
    
    doc.setTextColor(150, 150, 160)
    doc.text('Cargos por servicio:', 20, 243)
    doc.setTextColor(255, 255, 255)
    doc.text('$0.00', 120, 243)
    
    doc.setDrawColor(234, 88, 12)
    doc.setLineWidth(0.5)
    doc.line(20, 248, 195, 248)
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(234, 88, 12)
    doc.text('Total Pagado:', 20, 258)
    doc.text(`$${evento?.precio} MXN`, 120, 258)
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 90)
    doc.text(`Fecha de pago: ${now.toLocaleString('es-MX')}`, 20, 278)
    doc.text('CycleRace Pro | Comprobante generado automaticamente.', 20, 285)
    doc.text(`Folio: ${transaccionId}`, 20, 291)
    
    doc.save(`comprobante-${transaccionId}.pdf`)
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
              <span>Folio de Transacción:</span>
              <strong>{transaccionId}</strong>
            </div>
            <div className="payment-detail-row">
              <span>Estado:</span>
              <strong style={{ color: 'var(--sky-400)' }}>Pendiente de validación</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
            <button
              onClick={handleDownloadComprobante}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Download size={18} /> Descargar Comprobante PDF
            </button>
            <Link to="/mis-eventos" className="btn btn-secondary">
              Ver mis eventos
            </Link>
          </div>
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
