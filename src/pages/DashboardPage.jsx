import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Users, CreditCard, QrCode, BarChart3, CheckCircle2,
  XCircle, Clock, Search, Filter, Eye, ChevronDown,
  TrendingUp, DollarSign, UserCheck, AlertTriangle,
  Loader2, ShieldCheck, LogOut
} from 'lucide-react'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user, token, API_URL, logout } = useAuth()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('todos')
  const [stats, setStats] = useState(null)
  const [inscripciones, setInscripciones] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const headers = { 'Authorization': `Bearer ${token}` }
      
      const [statsRes, inscRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/stats`, { headers }),
        fetch(`${API_URL}/inscripciones`, { headers }),
        fetch(`${API_URL}/auth/users`, { headers }),
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (inscRes.ok) setInscripciones(await inscRes.json())
      if (usersRes.ok) setAllUsers(await usersRes.json())
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async (id) => {
    setActionLoading(id)
    try {
      const res = await fetch(`${API_URL}/inscripciones/${id}/validar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        await loadDashboard()
      }
    } catch (err) {
      console.error('Validate error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    setActionLoading(id)
    try {
      const res = await fetch(`${API_URL}/inscripciones/${id}/rechazar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        await loadDashboard()
      }
    } catch (err) {
      console.error('Reject error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = inscripciones.filter(c => {
    const matchSearch = c.nombre_completo?.toLowerCase().includes(search.toLowerCase()) ||
                        c.email?.toLowerCase().includes(search.toLowerCase()) ||
                        c.evento_nombre?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'todos' || c.estado === filter
    return matchSearch && matchFilter
  })

  const STATS_CARDS = stats ? [
    { label: 'Total Inscritos', value: stats.totalInscritos, icon: <Users size={22} />, change: `${stats.totalUsers} usuarios`, color: 'var(--orange-500)' },
    { label: 'Pagos Validados', value: stats.validados, icon: <CheckCircle2 size={22} />, change: stats.totalInscritos > 0 ? `${Math.round((stats.validados / stats.totalInscritos) * 100)}%` : '0%', color: 'var(--emerald-400)' },
    { label: 'Pendientes', value: stats.pendientes, icon: <Clock size={22} />, change: 'Requieren validación', color: 'var(--sky-400)' },
    { label: 'Ingresos Totales', value: `$${Number(stats.ingresos).toLocaleString()}`, icon: <DollarSign size={22} />, change: 'Pagos validados', color: 'var(--violet-400)' },
  ] : []

  if (loading) {
    return (
      <div className="dashboard" id="dashboard-page">
        <div className="loading-screen"><div className="loading-spinner" /></div>
      </div>
    )
  }

  return (
    <div className="dashboard" id="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-header__title">Dashboard Administrativo</h1>
            <p className="dash-header__sub">Panel de gestión de eventos, corredores y validación de pagos</p>
          </div>
          <div className="dash-header__right">
            <div className="dash-header__badge badge">
              <ShieldCheck size={14} /> Admin: {user?.nombre}
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="dash-stats">
            {STATS_CARDS.map((stat, i) => (
              <div key={i} className="stat-card card" id={`stat-card-${i}`}>
                <div className="stat-card__top">
                  <div className="stat-card__icon" style={{ color: stat.color, background: `${stat.color}15` }}>
                    {stat.icon}
                  </div>
                  <TrendingUp size={16} className="stat-card__trend" />
                </div>
                <div className="stat-card__value">{stat.value}</div>
                <div className="stat-card__label">{stat.label}</div>
                <div className="stat-card__change" style={{ color: stat.color }}>{stat.change}</div>
              </div>
            ))}
          </div>
        )}

        {/* Users + Categories Row */}
        <div className="dash-row">
          <div className="dash-chart card">
            <div className="dash-chart__header">
              <h3>Usuarios Registrados</h3>
              <span className="dash-chart__period">{allUsers.length} usuarios</span>
            </div>
            <div className="dash-users-list">
              {allUsers.slice(0, 8).map((u, i) => (
                <div key={i} className="dash-user-row">
                  <div className="dash-user">
                    <div className="dash-user__avatar">{u.nombre.charAt(0)}</div>
                    <div>
                      <div className="dash-user__name">{u.nombre}</div>
                      <div className="dash-user__email">{u.email}</div>
                    </div>
                  </div>
                  <span className={`dash-role-tag dash-role-tag--${u.rol}`}>{u.rol}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-activity card">
            <h3>Por Tipo de Evento</h3>
            <div className="dash-activity__list">
              {stats?.porCategoria?.map((cat, i) => {
                const total = stats.totalInscritos || 1
                const pct = Math.round((cat.total / total) * 100)
                const colors = ['var(--orange-500)', 'var(--violet-400)', 'var(--sky-400)', 'var(--emerald-400)', 'var(--rose-400)', '#f59e0b']
                return (
                  <div key={i} className="dash-cat">
                    <div className="dash-cat__top">
                      <span className="dash-cat__name" style={{ textTransform: 'capitalize' }}>{cat.categoria}</span>
                      <span className="dash-cat__count">{cat.total} <span className="dash-cat__pct">({pct}%)</span></span>
                    </div>
                    <div className="dash-cat__bar-bg">
                      <div className="dash-cat__bar-fill" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Inscriptions Table */}
        <div className="dash-table-wrap card">
          <div className="dash-table__header">
            <h3>Inscripciones a Eventos</h3>
            <div className="dash-table__controls">
              <div className="dash-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o evento..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="dash-search__input"
                  id="dashboard-search"
                />
              </div>
              <div className="dash-filter">
                <Filter size={14} />
                <select value={filter} onChange={e => setFilter(e.target.value)} className="dash-filter__select" id="dashboard-filter">
                  <option value="todos">Todos</option>
                  <option value="validado">Validados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="rechazado">Rechazados</option>
                </select>
              </div>
            </div>
          </div>

          <div className="dash-table-scroll">
            <table className="dash-table" id="competitors-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Evento</th>
                  <th>Tipo</th>
                  <th>Fecha Insc.</th>
                  <th>Estado</th>
                  <th>Número</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="dash-user">
                        <div className="dash-user__avatar">{c.nombre_completo?.charAt(0)}</div>
                        <div>
                          <div className="dash-user__name">{c.nombre_completo}</div>
                          <div className="dash-user__email">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="dash-cell-evento">{c.evento_nombre}</td>
                    <td>
                      <span className="dash-tipo-tag" style={{ textTransform: 'capitalize' }}>{c.tipo_evento}</span>
                    </td>
                    <td className="dash-cell-muted">
                      {c.fecha_inscripcion ? new Date(c.fecha_inscripcion).toLocaleDateString('es-MX') : '—'}
                    </td>
                    <td>
                      <span className={`dash-status dash-status--${c.estado}`}>
                        {c.estado === 'validado' && <CheckCircle2 size={14} />}
                        {c.estado === 'pendiente' && <Clock size={14} />}
                        {c.estado === 'rechazado' && <XCircle size={14} />}
                        {c.estado?.charAt(0).toUpperCase() + c.estado?.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className="dash-numero">
                        {c.numero_competidor ? `#${String(c.numero_competidor).padStart(4, '0')}` : '—'}
                      </span>
                    </td>
                    <td>
                      <div className="dash-actions">
                        {c.estado === 'pendiente' && (
                          <>
                            <button
                              className="dash-action-btn dash-action-btn--approve"
                              onClick={() => handleValidate(c.id)}
                              title="Validar pago"
                              disabled={actionLoading === c.id}
                            >
                              {actionLoading === c.id ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
                            </button>
                            <button
                              className="dash-action-btn dash-action-btn--reject"
                              onClick={() => handleReject(c.id)}
                              title="Rechazar"
                              disabled={actionLoading === c.id}
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="dash-empty">
              <AlertTriangle size={24} />
              <p>No se encontraron inscripciones con ese criterio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
