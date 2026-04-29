import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  QrCode, Bike, CheckCircle2, Clock, XCircle, Calendar,
  MapPin, Trophy, User, Mail, Phone, ArrowRight,
  Wrench, Eye, Route, Zap, Tag, AlertCircle
} from 'lucide-react'
import './MisEventosPage.css'

const TIPO_ICONS = {
  carrera: <Trophy size={18} />,
  paseo: <Bike size={18} />,
  taller: <Wrench size={18} />,
  exhibicion: <Eye size={18} />,
  tour: <Route size={18} />,
  competencia: <Zap size={18} />,
}

const ESTADO_CONFIG = {
  validado: { icon: <CheckCircle2 size={14} />, color: 'var(--emerald-400)', label: 'Validado' },
  pendiente: { icon: <Clock size={14} />, color: 'var(--sky-400)', label: 'Pendiente' },
  rechazado: { icon: <XCircle size={14} />, color: 'var(--rose-400)', label: 'Rechazado' },
}

export default function MisEventosPage() {
  const { user, token, API_URL } = useAuth()
  const [inscripciones, setInscripciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadMisEventos()
  }, [])

  async function loadMisEventos() {
    try {
      const res = await fetch(`${API_URL}/inscripciones/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setInscripciones(data)
      } else {
        setError('Error al cargar tus eventos')
      }
    } catch {
      setError('Error de conexión. Verifica que el servidor esté corriendo.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mis-eventos" id="mis-eventos-page">
        <div className="loading-screen"><div className="loading-spinner" /></div>
      </div>
    )
  }

  return (
    <div className="mis-eventos" id="mis-eventos-page">
      <div className="mis-eventos__bg">
        <div className="mis-eventos__orb" />
      </div>
      <div className="container">
        {/* User Info Header */}
        <div className="mis-eventos__header">
          <div className="mis-eventos__user-card glass">
            <div className="mis-eventos__avatar">
              <span>{user?.nombre?.charAt(0) || 'U'}</span>
            </div>
            <div className="mis-eventos__user-info">
              <h1 className="mis-eventos__user-name">{user?.nombre}</h1>
              <div className="mis-eventos__user-details">
                <span><Mail size={14} /> {user?.email}</span>
                {user?.telefono && <span><Phone size={14} /> {user?.telefono}</span>}
              </div>
              <div className="mis-eventos__user-stats">
                <div className="mis-eventos__stat">
                  <span className="mis-eventos__stat-value">{inscripciones.length}</span>
                  <span className="mis-eventos__stat-label">Eventos</span>
                </div>
                <div className="mis-eventos__stat">
                  <span className="mis-eventos__stat-value">{inscripciones.filter(i => i.estado === 'validado').length}</span>
                  <span className="mis-eventos__stat-label">Validados</span>
                </div>
                <div className="mis-eventos__stat">
                  <span className="mis-eventos__stat-value">{inscripciones.filter(i => i.estado === 'pendiente').length}</span>
                  <span className="mis-eventos__stat-label">Pendientes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="eventos-message eventos-message--error" style={{ marginBottom: '24px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Inscriptions */}
        <h2 className="mis-eventos__section-title">Mis Inscripciones</h2>

        {inscripciones.length === 0 ? (
          <div className="mis-eventos__empty glass">
            <Bike size={48} />
            <h3>Aún no te has inscrito a ningún evento</h3>
            <p>Explora los eventos disponibles y encuentra tu próxima aventura.</p>
            <Link to="/eventos" className="btn btn-primary btn-lg">
              Explorar Eventos <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="mis-eventos__list">
            {inscripciones.map(insc => {
              const estado = ESTADO_CONFIG[insc.estado] || ESTADO_CONFIG.pendiente
              const tipoIcon = TIPO_ICONS[insc.tipo_evento] || <Bike size={18} />

              return (
                <div key={insc.id} className="mis-evento-card glass" id={`inscripcion-${insc.id}`}>
                  <div className="mis-evento-card__left">
                    <div className="mis-evento-card__tipo-icon" style={{ color: estado.color }}>
                      {tipoIcon}
                    </div>
                    <div className="mis-evento-card__info">
                      <h3>{insc.evento_nombre}</h3>
                      <div className="mis-evento-card__meta">
                        <span><Tag size={12} /> {insc.tipo_evento}</span>
                        {insc.fecha_evento && (
                          <span>
                            <Calendar size={12} /> {new Date(insc.fecha_evento).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                        <span><MapPin size={12} /> {insc.ubicacion || 'Por confirmar'}</span>
                        <span><Tag size={12} /> ${insc.precio} MXN</span>
                      </div>
                      <div className="mis-evento-card__inscripcion-date">
                        Inscrito: {new Date(insc.fecha_inscripcion).toLocaleDateString('es-MX')} • {insc.metodo_pago}
                      </div>
                    </div>
                  </div>

                  <div className="mis-evento-card__right">
                    <div className={`mis-evento-card__estado mis-evento-card__estado--${insc.estado}`} style={{ color: estado.color }}>
                      {estado.icon} {estado.label}
                    </div>
                    {insc.numero_competidor && (
                      <div className="mis-evento-card__numero">
                        <QrCode size={24} />
                        <span className="mis-evento-card__numero-value">#{String(insc.numero_competidor).padStart(4, '0')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
