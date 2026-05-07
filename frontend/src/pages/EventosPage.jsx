import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Bike, Trophy, Users, Calendar, MapPin, Clock, Search, Filter,
  ArrowRight, CheckCircle2, Loader2, AlertCircle, Star,
  Mountain, Wrench, Eye, Route, Zap, Tag, Info, XCircle
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
  const [enrollments, setEnrollments] = useState([])
  const [message, setMessage] = useState(null)
  const [selectedEvento, setSelectedEvento] = useState(null)

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
        setEnrollments(data)
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
              <div key={evento.id} className="evento-card card" id={`evento-${evento.id}`} onClick={() => setSelectedEvento(evento)} style={{cursor: 'pointer'}}>
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

                {/* Cupos disponibles */}
                {(() => {
                  const cuposRestantes = evento.cupo_maximo - (evento.inscritos || 0)
                  const pctOcupado = Math.min(100, Math.round(((evento.inscritos || 0) / evento.cupo_maximo) * 100))
                  return (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span>{cuposRestantes} cupos disponibles</span>
                        <span>{pctOcupado}% ocupado</span>
                      </div>
                      <div style={{ height: '4px', background: 'var(--glass-bg)', borderRadius: '2px' }}>
                        <div style={{
                          height: '100%', borderRadius: '2px',
                          width: `${pctOcupado}%`,
                          background: pctOcupado > 80 ? 'var(--rose-400)' : pctOcupado > 50 ? 'var(--orange-500)' : 'var(--emerald-400)',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  )
                })()}

                <div className="evento-card__footer">
                  <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedEvento(evento); }}>
                    <Info size={16} /> Detalles
                  </button>
                  {isEnrolled ? (
                    <button className="btn btn-secondary btn-sm evento-card__btn evento-card__btn--enrolled" disabled onClick={e => e.stopPropagation()}>
                      <CheckCircle2 size={16} /> Ya inscrito
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm evento-card__btn"
                      onClick={(e) => { e.stopPropagation(); handleInscribirse(evento.id); }}
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

      {selectedEvento && (
        <div className="modal-overlay" onClick={() => setSelectedEvento(null)}>
          <div className="modal-content" style={{maxWidth: '500px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvento.nombre}</h2>
              <button className="modal-close" onClick={() => setSelectedEvento(null)}><XCircle size={24} /></button>
            </div>
            <div className="modal-body" style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div style={{background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px'}}>
                <p style={{margin: 0, lineHeight: '1.6'}}>{selectedEvento.descripcion}</p>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <div style={{background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px'}}>
                  <span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Fecha y Hora</span>
                  <div style={{display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px'}}>
                    <Calendar size={16} color="var(--sky-400)" />
                    <span style={{fontWeight: 'bold'}}>{new Date(selectedEvento.fecha_evento).toLocaleDateString()} {selectedEvento.hora_inicio?.slice(0, 5) || '08:00'}</span>
                  </div>
                </div>
                
                <div style={{background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px'}}>
                  <span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Faltan</span>
                  <div style={{display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px'}}>
                    <Clock size={16} color="var(--orange-400)" />
                    <span style={{fontWeight: 'bold'}}>
                      {Math.max(0, Math.ceil((new Date(selectedEvento.fecha_evento) - new Date()) / (1000 * 60 * 60 * 24)))} días
                    </span>
                  </div>
                </div>
              </div>

              <div style={{background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px'}}>
                <span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Ubicación</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px'}}>
                  <MapPin size={16} color="var(--emerald-400)" />
                  <span style={{fontWeight: 'bold'}}>{selectedEvento.lugar || selectedEvento.ubicacion}</span>
                </div>
              </div>
              
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <div style={{flex: 1, background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', textAlign: 'center'}}>
                  <span style={{color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block'}}>Precio</span>
                  <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>${selectedEvento.precio} MXN</span>
                </div>
                <div style={{flex: 1, background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', textAlign: 'center'}}>
                  <span style={{color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block'}}>Cupo Restante</span>
                  <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>{selectedEvento.cupo_maximo}</span>
                </div>
              </div>

              <div style={{marginTop: '15px'}}>
                {enrolledIds.has(selectedEvento.id) ? (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <div style={{background: 'rgba(52, 211, 153, 0.1)', border: '1px solid var(--emerald-400)', padding: '15px', borderRadius: '8px', textAlign: 'center'}}>
                      <span style={{color: 'var(--emerald-400)', fontSize: '0.9rem', display: 'block', marginBottom: '5px'}}>Tu Número de Competidor</span>
                      <span style={{fontWeight: '800', fontSize: '2rem', color: 'var(--text-primary)'}}>
                        #{enrollments.find(e => e.evento_id === selectedEvento.id)?.numero_competidor || 'PENDIENTE'}
                      </span>
                    </div>
                    <button className="btn btn-secondary" style={{width: '100%'}} disabled>
                      <CheckCircle2 size={18} /> Ya estás inscrito
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-primary" style={{width: '100%'}} onClick={() => handleInscribirse(selectedEvento.id)}>
                    Inscribirse Ahora <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
