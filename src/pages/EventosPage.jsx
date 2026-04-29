import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Bike, Trophy, Users, Calendar, MapPin, Clock, Search, Filter,
  ArrowRight, CheckCircle2, Loader2, AlertCircle, Star,
  Mountain, Wrench, Eye, Route, Zap, Tag
} from 'lucide-react'
import './EventosPage.css'

const TIPO_CONFIG = {
  carrera: { icon: <Trophy size={18} />, label: 'Carrera', color: 'var(--orange-500)' },
  paseo: { icon: <Bike size={18} />, label: 'Paseo', color: 'var(--emerald-400)' },
  taller: { icon: <Wrench size={18} />, label: 'Taller', color: 'var(--sky-400)' },
  exhibicion: { icon: <Eye size={18} />, label: 'Exhibición', color: 'var(--violet-400)' },
  tour: { icon: <Route size={18} />, label: 'Tour', color: 'var(--rose-400)' },
  competencia: { icon: <Zap size={18} />, label: 'Competencia', color: '#f59e0b' },
}

export default function EventosPage() {
  const navigate = useNavigate()
  const { token, API_URL } = useAuth()
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [enrolling, setEnrolling] = useState(null)
  const [enrolledIds, setEnrolledIds] = useState(new Set())
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadEventos()
    loadMisInscripciones()
  }, [])

  async function loadEventos() {
    try {
      const res = await fetch(`${API_URL}/eventos`)
      const data = await res.json()
      setEventos(data)
    } catch {
      setMessage({ type: 'error', text: 'Error al cargar eventos. Verifica que el servidor esté corriendo.' })
    } finally {
      setLoading(false)
    }
  }

  async function loadMisInscripciones() {
    try {
      const res = await fetch(`${API_URL}/inscripciones/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setEnrolledIds(new Set(data.map(i => i.evento_id)))
      }
    } catch {}
  }

  async function handleInscribirse(eventoId) {
    navigate(`/pago/${eventoId}`)
  }

  const filtered = eventos.filter(e => {
    const matchSearch = e.nombre.toLowerCase().includes(search.toLowerCase()) ||
                        e.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
                        e.ubicacion?.toLowerCase().includes(search.toLowerCase())
    const matchTipo = tipoFilter === 'todos' || e.tipo_evento === tipoFilter
    return matchSearch && matchTipo
  })

  const tipoOptions = ['todos', ...new Set(eventos.map(e => e.tipo_evento))]

  if (loading) {
    return (
      <div className="eventos-page" id="eventos-page">
        <div className="loading-screen"><div className="loading-spinner" /></div>
      </div>
    )
  }

  return (
    <div className="eventos-page" id="eventos-page">
      <div className="eventos-page__bg">
        <div className="eventos-page__orb" />
      </div>
      <div className="container">
        {/* Header */}
        <div className="eventos-header">
          <div>
            <div className="badge"><Bike size={14} /> Todos los Eventos</div>
            <h1 className="eventos-header__title">Explora Eventos de Bicicleta</h1>
            <p className="eventos-header__sub">
              Carreras, paseos, talleres, exhibiciones, tours y más — encuentra tu próxima aventura sobre ruedas.
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`eventos-message eventos-message--${message.type}`} id="eventos-message">
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="eventos-message__close">×</button>
          </div>
        )}

        {/* Filters */}
        <div className="eventos-filters glass">
          <div className="eventos-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar eventos por nombre, lugar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="eventos-search__input"
              id="eventos-search"
            />
          </div>
          <div className="eventos-tipo-filters">
            {tipoOptions.map(tipo => {
              const config = TIPO_CONFIG[tipo]
              return (
                <button
                  key={tipo}
                  className={`eventos-tipo-btn ${tipoFilter === tipo ? 'eventos-tipo-btn--active' : ''}`}
                  onClick={() => setTipoFilter(tipo)}
                  style={tipoFilter === tipo && config ? { borderColor: config.color, color: config.color } : {}}
                >
                  {config ? config.icon : <Filter size={14} />}
                  {config ? config.label : 'Todos'}
                </button>
              )
            })}
          </div>
        </div>

        {/* Events Grid */}
        <div className="eventos-grid">
          {filtered.map(evento => {
            const config = TIPO_CONFIG[evento.tipo_evento] || TIPO_CONFIG.carrera
            const isEnrolled = enrolledIds.has(evento.id)
            const isEnrolling = enrolling === evento.id
            return (
              <div key={evento.id} className="evento-card card" id={`evento-${evento.id}`}>
                <div className="evento-card__header" style={{ borderColor: config.color }}>
                  <div className="evento-card__tipo" style={{ color: config.color, background: `${config.color}15` }}>
                    {config.icon} {config.label}
                  </div>
                  <div className="evento-card__precio">
                    <span className="evento-card__precio-value">${evento.precio}</span>
                    <span className="evento-card__precio-currency">MXN</span>
                  </div>
                </div>

                <h3 className="evento-card__title">{evento.nombre}</h3>
                <p className="evento-card__desc">{evento.descripcion}</p>

                <div className="evento-card__meta">
                  <div className="evento-card__meta-item">
                    <Calendar size={14} />
                    <span>{new Date(evento.fecha_evento).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="evento-card__meta-item">
                    <Clock size={14} />
                    <span>{evento.hora_inicio?.slice(0, 5) || '07:00'}</span>
                  </div>
                  <div className="evento-card__meta-item">
                    <MapPin size={14} />
                    <span>{evento.ubicacion}</span>
                  </div>
                  {evento.distancia_km && (
                    <div className="evento-card__meta-item">
                      <Route size={14} />
                      <span>{evento.distancia_km} km</span>
                    </div>
                  )}
                  <div className="evento-card__meta-item">
                    <Users size={14} />
                    <span>Cupo: {evento.cupo_maximo}</span>
                  </div>
                  <div className="evento-card__meta-item">
                    <Tag size={14} />
                    <span style={{ textTransform: 'capitalize' }}>{evento.categoria}</span>
                  </div>
                </div>

                <div className="evento-card__footer">
                  {isEnrolled ? (
                    <button className="btn btn-secondary btn-sm evento-card__btn evento-card__btn--enrolled" disabled>
                      <CheckCircle2 size={16} /> Ya inscrito
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm evento-card__btn"
                      onClick={() => handleInscribirse(evento.id)}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? (
                        <><Loader2 size={16} className="spin" /> Inscribiendo...</>
                      ) : (
                        <>Inscribirse <ArrowRight size={16} /></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="eventos-empty glass">
            <Bike size={48} />
            <h3>No se encontraron eventos</h3>
            <p>Intenta con otro filtro o término de búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
