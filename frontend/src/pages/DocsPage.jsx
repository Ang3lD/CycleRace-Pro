import React, { useState } from 'react'
import {
  Server, Database, Lock, Users, CreditCard, QrCode,
  BarChart3, Monitor, Smartphone, Cloud, Globe,
  Shield, GitBranch, Zap, ArrowLeft, Activity,
  Terminal, ExternalLink, Folder, ChevronRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import './DocsPage.css'

const MICROSERVICES = [
  { name: 'Node API (Principal)', tech: 'Node.js / Express', db: 'MySQL + PostgreSQL + MongoDB', dbType: 'Multi-DB', icon: <Server size={20} />, color: 'var(--orange-500)', desc: 'API principal: auth, eventos, inscripciones. Punto de entrada unificado.', port: 3001, nginxRoute: '/api/', nginxPath: '/api/', status: 'core' },
  { name: 'Auth Service', tech: 'Python / FastAPI', db: 'PostgreSQL', dbType: 'Relacional', icon: <Lock size={20} />, color: 'var(--emerald-400)', desc: 'Registro, login, validación de JWT. Puerto interno del contenedor.', port: 8001, nginxRoute: '/api/auth/me', nginxPath: 'Interno (vía node-api)', status: 'active' },
  { name: 'Eventos Service', tech: 'Python / FastAPI', db: 'MySQL', dbType: 'Relacional', icon: <Globe size={20} />, color: 'var(--sky-400)', desc: 'Catálogo de eventos ciclistas, categorías y cupos.', port: 8002, nginxRoute: '/api/eventos', nginxPath: 'Interno (vía node-api)', status: 'active' },
  { name: 'Corredores Service', tech: 'Python / FastAPI', db: 'MySQL', dbType: 'Relacional', icon: <QrCode size={20} />, color: 'var(--violet-400)', desc: 'Numeración consecutiva de competidores y generación de QR.', port: 8003, nginxRoute: '/api/inscripciones', nginxPath: 'Interno (vía node-api)', status: 'active' },
  { name: 'Tracking Service', tech: 'Python / FastAPI', db: 'Redis', dbType: 'Clave-Valor', icon: <Activity size={20} />, color: 'var(--rose-400)', desc: 'Seguimiento en tiempo real de corredores durante la carrera.', port: 8004, nginxRoute: null, nginxPath: 'Interno (vía node-api)', status: 'active' },
  { name: 'Log Analyzer', tech: 'Go / Gin', db: 'MongoDB', dbType: 'NoSQL', icon: <Terminal size={20} />, color: '#f59e0b', desc: 'Analizador heurístico léxico-semántico. Motor de seguridad en tiempo real.', port: 8081, nginxRoute: '/analyzer/api/analyzer/logs', nginxPath: '/analyzer/', status: 'active' },
  { name: 'Monitor Service', tech: 'Python / FastAPI', db: '—', dbType: 'Sin BD propia', icon: <BarChart3 size={20} />, color: 'var(--emerald-400)', desc: 'Healthcheck de todos los microservicios. Retorna estado en tiempo real.', port: 8000, nginxRoute: '/monitor/api/status', nginxPath: '/monitor/', status: 'active' },
  { name: 'Reports Service', tech: 'Python / FastAPI', db: 'MongoDB (reports)', dbType: 'NoSQL', icon: <BarChart3 size={20} />, color: '#10b981', desc: 'Estadísticas, reportes de inscripciones, dashboards y métricas.', port: 8005, nginxRoute: null, nginxPath: 'Interno', status: 'planned' },
]

const TECH_STACK = [
  { icon: <Monitor size={18} />, label: 'React 18 + Vite', sub: 'Frontend Web' },
  { icon: <Smartphone size={18} />, label: 'React Native', sub: 'App Móvil' },
  { icon: <Cloud size={18} />, label: 'AWS ECS / EC2', sub: 'Backend Cloud' },
  { icon: <Globe size={18} />, label: 'Nginx', sub: 'Reverse Proxy' },
  { icon: <Shield size={18} />, label: 'JWT + bcrypt', sub: 'Autenticación' },
  { icon: <GitBranch size={18} />, label: 'GitHub Actions', sub: 'CI/CD' },
  { icon: <Database size={18} />, label: 'PostgreSQL + MySQL', sub: 'SQL' },
  { icon: <Database size={18} />, label: 'MongoDB + Redis', sub: 'NoSQL' },
]

const PROJECT_STRUCTURE = `CycleRace-Pro/
├── docker-compose.yml          # Orquestación local
├── docker-compose.prod.yml     # Orquestación producción
├── docker/
│   ├── nginx/nginx.conf        # Reverse proxy (puerto 80)
│   └── init/
│       ├── mysql/              # Schema MySQL (eventos, inscripciones)
│       ├── postgres/           # Schema PostgreSQL (usuarios)
│       └── mongo/              # Init MongoDB (pagos)
├── frontend/                   # React + Vite (puerto 5173)
│   └── src/
│       ├── pages/              # EventosPage, DashboardPage, etc.
│       ├── components/         # Navbar, Footer
│       └── context/            # AuthContext (JWT)
└── services/
    ├── node-api/               # API principal (puerto 3001)
    │   └── src/modules/
    │       ├── auth/           # Login, register, JWT
    │       ├── eventos/        # CRUD eventos
    │       ├── inscripciones/  # Pagos e inscripciones
    │       └── dashboard/      # Estadísticas admin
    ├── auth-backend/           # FastAPI (puerto 8001)
    ├── eventos-backend/        # FastAPI (puerto 8002)
    ├── corredores-backend/     # FastAPI (puerto 8003)
    ├── tracking-backend/       # FastAPI (puerto 8004)
    ├── log-backend/            # Go/Gin (puerto 8081)
    └── monitor-backend/        # FastAPI (puerto 8000)`

const ENDPOINTS = [
  { method: 'POST', path: '/api/auth/login', auth: false, admin: false, desc: 'Iniciar sesión. Retorna JWT.', body: '{ email, password }' },
  { method: 'POST', path: '/api/auth/register', auth: false, admin: false, desc: 'Registrar nuevo usuario.', body: '{ nombre, email, password, telefono }' },
  { method: 'POST', path: '/api/auth/forgot-password', auth: false, admin: false, desc: 'Solicitar reseteo de contraseña.', body: '{ email }' },
  { method: 'POST', path: '/api/auth/reset-password', auth: false, admin: false, desc: 'Confirmar nueva contraseña con token.', body: '{ token, newPassword }' },
  { method: 'GET', path: '/api/auth/me', auth: true, admin: false, desc: 'Obtener usuario autenticado actual.', body: null },
  { method: 'GET', path: '/api/auth/users', auth: true, admin: true, desc: 'Listar todos los usuarios (admin).', body: null },
  { method: 'GET', path: '/api/eventos', auth: false, admin: false, desc: 'Listar todos los eventos disponibles.', body: null },
  { method: 'GET', path: '/api/eventos/:id', auth: false, admin: false, desc: 'Obtener detalle de un evento.', body: null },
  { method: 'POST', path: '/api/eventos', auth: true, admin: true, desc: 'Crear nuevo evento (admin).', body: '{ nombre, descripcion, tipo, precio, cupo_maximo, fecha_evento, hora_evento, lugar }' },
  { method: 'POST', path: '/api/inscripciones', auth: true, admin: false, desc: 'Inscribirse a un evento (pagar).', body: '{ evento_id, metodo_pago, monto }' },
  { method: 'GET', path: '/api/inscripciones/me', auth: true, admin: false, desc: 'Listar mis inscripciones (usuario).', body: null },
  { method: 'GET', path: '/api/inscripciones', auth: true, admin: true, desc: 'Listar todas las inscripciones (admin).', body: null },
  { method: 'PUT', path: '/api/inscripciones/:id/validar', auth: true, admin: true, desc: 'Validar pago de inscripción (admin).', body: null },
  { method: 'PUT', path: '/api/inscripciones/:id/rechazar', auth: true, admin: true, desc: 'Rechazar inscripción (admin).', body: null },
  { method: 'GET', path: '/api/dashboard/stats', auth: true, admin: true, desc: 'Estadísticas generales del sistema.', body: null },
  { method: 'POST', path: '/analyzer/ingest', auth: false, admin: false, desc: 'Ingestar evento de click del frontend.', body: '{ user_id, action_type, target_element, payload }' },
  { method: 'GET', path: '/analyzer/api/analyzer/logs', auth: true, admin: true, desc: 'Obtener logs analizados en tiempo real.', body: null },
  { method: 'POST', path: '/analyzer/api/analyzer/query', auth: true, admin: true, desc: 'Consultar BD de logs por regla.', body: '{ rule: "string" }' },
  { method: 'GET', path: '/monitor/api/status', auth: false, admin: false, desc: 'Estado de todos los microservicios.', body: null },
]

const METHOD_COLORS = {
  GET: { bg: '#10b98120', text: '#10b981' },
  POST: { bg: '#3b82f620', text: '#3b82f6' },
  PUT: { bg: '#f59e0b20', text: '#f59e0b' },
  DELETE: { bg: '#ef444420', text: '#ef4444' },
}

function CrudExplorer() {
  const [expandedRow, setExpandedRow] = useState(null)
  const [filterMethod, setFilterMethod] = useState('ALL')
  const filtered = filterMethod === 'ALL' ? ENDPOINTS : ENDPOINTS.filter(e => e.method === filterMethod)

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map(m => (
          <button key={m} onClick={() => setFilterMethod(m)} style={{
            padding: '4px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.78rem',
            background: filterMethod === m ? (m === 'ALL' ? 'var(--orange-500)' : METHOD_COLORS[m]?.bg.replace('20', '')) : 'var(--glass-bg)',
            color: filterMethod === m ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s'
          }}>{m}</button>
        ))}
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem', alignSelf: 'center' }}>{filtered.length} endpoints</span>
      </div>
      <div className="docs-table-wrap glass" style={{ padding: 0 }}>
        <table className="docs-table" style={{ marginBottom: 0 }}>
          <thead><tr><th style={{ width: '80px' }}>Método</th><th>Ruta</th><th>Auth</th><th>Descripción</th></tr></thead>
          <tbody>
            {filtered.map((ep, i) => {
              const mc = METHOD_COLORS[ep.method] || METHOD_COLORS.GET
              const isExpanded = expandedRow === i
              return (
                <React.Fragment key={i}>
                  <tr onClick={() => setExpandedRow(isExpanded ? null : i)} style={{ cursor: ep.body ? 'pointer' : 'default' }}>
                    <td><span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace', background: mc.bg, color: mc.text }}>{ep.method}</span></td>
                    <td><code style={{ fontSize: '0.82rem', color: 'var(--orange-400)' }}>{ep.path}</code></td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {ep.auth && <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', background: 'var(--sky-400)20', color: 'var(--sky-400)' }}>JWT</span>}
                        {ep.admin && <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', background: 'var(--orange-500)20', color: 'var(--orange-500)' }}>Admin</span>}
                        {!ep.auth && <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', background: '#ffffff10', color: 'var(--text-muted)' }}>Público</span>}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{ep.desc}</td>
                  </tr>
                  {isExpanded && ep.body && (
                    <tr key={`${i}-body`}>
                      <td colSpan={4} style={{ background: '#0a0a0a', padding: '12px 20px' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Body (JSON):</div>
                        <code style={{ fontSize: '0.82rem', color: '#a3e635' }}>{ep.body}</code>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function DocsPage() {
  return (
    <div className="docs-page" id="docs-page">
      <div className="docs-page__bg"><div className="docs-page__orb docs-page__orb--1" /></div>
      <div className="container">
        <Link to="/" className="docs-back"><ArrowLeft size={16} /> Volver al inicio</Link>
        <div className="docs-header">
          <div className="badge"><Zap size={14} /> Documentación Técnica</div>
          <h1 className="docs-header__title">Arquitectura del Sistema</h1>
          <p className="docs-header__sub">Documentación interna: patrón hexagonal, 8 microservicios, bases de datos, puertos, rutas Nginx y stack tecnológico completo.</p>
        </div>

        {/* Arquitectura Hexagonal */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Server size={20} /> Arquitectura Hexagonal</h2>
          <div className="docs-hex glass">
            <pre className="docs-hex__diagram">{`
┌────────────────────────────────────────────────────────────┐
│                      ADAPTADORES (IN)                      │
│   ┌─────────────┐   ┌─────────────┐   ┌────────────────┐  │
│   │  REST API   │   │  React Web  │   │  React Native  │  │
│   │ (Nginx :80) │   │  (:5173)    │   │   (Mobile)     │  │
│   └──────┬──────┘   └──────┬──────┘   └───────┬────────┘  │
│          │                 │                   │           │
│  ──────────────── PUERTOS DE ENTRADA ────────────────────  │
│  │                                                       │ │
│  │                DOMINIO / LÓGICA DE NEGOCIO            │ │
│  │         (Entidades, Casos de Uso, Reglas)             │ │
│  │         Auth · Eventos · Inscripciones · Pagos        │ │
│  │                                                       │ │
│  ──────────────── PUERTOS DE SALIDA ─────────────────────  │
│          │                 │                   │           │
│   ┌──────┴──────┐   ┌──────┴──────┐   ┌───────┴────────┐  │
│   │ PostgreSQL  │   │    MySQL    │   │ MongoDB/Redis  │  │
│   │  (usuarios) │   │  (eventos)  │   │ (pagos/caché)  │  │
│   └─────────────┘   └─────────────┘   └────────────────┘  │
│                      ADAPTADORES (OUT)                     │
└────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </section>

        {/* 8 Microservicios */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Server size={20} /> 8 Microservicios</h2>
          <div className="docs-ms-grid">
            {MICROSERVICES.map((ms, i) => (
              <div key={i} className="docs-ms-card card">
                <div className="docs-ms-card__header">
                  <div className="docs-ms-card__icon" style={{ color: ms.color, background: `${ms.color}15` }}>{ms.icon}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                      background: ms.status === 'core' ? 'var(--orange-500)20' : ms.status === 'planned' ? '#ffffff10' : 'var(--emerald-400)20',
                      color: ms.status === 'core' ? 'var(--orange-500)' : ms.status === 'planned' ? 'var(--text-muted)' : 'var(--emerald-400)',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {ms.status === 'core' ? 'CORE' : ms.status === 'planned' ? 'PLANNED' : 'ACTIVE'}
                    </span>
                    <div className="docs-ms-card__dot" style={{ background: ms.color }} />
                  </div>
                </div>
                <h3 className="docs-ms-card__name">{ms.name}</h3>
                <p className="docs-ms-card__desc">{ms.desc}</p>
                <div className="docs-ms-card__meta">
                  <div className="docs-ms-card__row"><Server size={14} /> {ms.tech}</div>
                  <div className="docs-ms-card__row"><Database size={14} /> {ms.db} <span className="docs-ms-card__tag">{ms.dbType}</span></div>
                  <div className="docs-ms-card__row" style={{ color: ms.color, fontWeight: 600 }}>
                    <Globe size={14} />
                    {ms.nginxRoute ? (
                      <a href={ms.nginxRoute} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {ms.nginxRoute} <ExternalLink size={11} style={{ display: 'inline' }} />
                      </a>
                    ) : (
                      <span>:{ms.port} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>(interno)</span></span>
                    )}
                  </div>
                  <div className="docs-ms-card__row" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <ChevronRight size={12} /> Nginx: <code style={{ color: 'var(--orange-400)' }}>{ms.nginxPath}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tabla de BDs */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Database size={20} /> Bases de Datos Independientes</h2>
          <div className="docs-table-wrap glass">
            <table className="docs-table">
              <thead><tr><th>Microservicio</th><th>Base de Datos</th><th>Tipo</th><th>Puerto Docker</th><th>Justificación</th></tr></thead>
              <tbody>
                <tr><td>Auth Service</td><td>PostgreSQL</td><td>Relacional</td><td>5432</td><td>Integridad en datos de usuarios y roles</td></tr>
                <tr><td>Eventos / Inscripciones</td><td>MySQL</td><td>Relacional</td><td>3306</td><td>Relaciones eventos-inscripciones-categorías</td></tr>
                <tr><td>Payment / Log</td><td>MongoDB</td><td>NoSQL</td><td>27017</td><td>Documentos de comprobantes y logs flexibles</td></tr>
                <tr><td>Tracking</td><td>Redis</td><td>Clave-Valor</td><td>6379</td><td>Velocidad en numeración y posición en tiempo real</td></tr>
                <tr><td>Reports Service</td><td>MongoDB (2ª instancia)</td><td>NoSQL</td><td>27018</td><td>Agregaciones y estadísticas históricas</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Rutas Nginx */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Globe size={20} /> Rutas Nginx (Puerto 80)</h2>
          <div className="docs-hex glass">
            <pre className="docs-hex__diagram">{`
Nginx :80
├── /                → frontend React      (puerto 5173)
├── /api/            → node-api            (puerto 3001)
│   ├── /auth/       → Autenticación (JWT, registro, login)
│   ├── /eventos/    → CRUD eventos
│   ├── /inscripciones/ → Pagos e inscripciones
│   └── /dashboard/  → Estadísticas admin
├── /analyzer/       → log-backend Go      (puerto 8081)
│   ├── /ingest      → POST: captura eventos del frontend
│   ├── /api/analyzer/logs → GET: logs en tiempo real
│   └── /api/analyzer/query → POST: consulta por regla
└── /monitor/        → monitor-backend     (puerto 8000)
    └── /api/status  → GET: healthcheck de servicios`}</pre>
          </div>
        </section>

        {/* Estructura del proyecto */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Folder size={20} /> Estructura del Proyecto</h2>
          <div className="docs-hex glass">
            <pre className="docs-hex__diagram" style={{ fontSize: '0.78rem' }}>{PROJECT_STRUCTURE}</pre>
          </div>
        </section>

        {/* Seguridad JWT */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Shield size={20} /> Seguridad JWT</h2>
          <div className="docs-hex glass">
            <pre className="docs-hex__diagram">{`
Cliente (Web/Mobile)
    │
    │  POST /api/auth/login  { email, password }
    ▼
┌─────────────┐
│ Auth Service│ ──▶ JWT Token  (payload: { id, email, rol })
└─────────────┘
    │
    │  Authorization: Bearer <token>
    ▼
┌─────────────────────────────────────────┐
│           Nginx → node-api              │
│  • Valida firma JWT con SECRET          │
│  • Extrae claims: userId, rol           │
│  • Roles: "admin" | "corredor"          │
│  • Admin  → /dashboard, /analizador     │
│  • Corredor → /eventos, /mis-eventos    │
└─────────────────────────────────────────┘`}</pre>
          </div>
        </section>

        {/* Stack tecnológico */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Zap size={20} /> Stack Tecnológico</h2>
          <div className="docs-tech-grid">
            {TECH_STACK.map((t, i) => (
              <div key={i} className="docs-tech-badge glass">
                <div className="docs-tech-badge__icon">{t.icon}</div>
                <div>
                  <div className="docs-tech-badge__label">{t.label}</div>
                  <div className="docs-tech-badge__sub">{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Docker Compose */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Server size={20} /> Docker Compose — Levantar el Proyecto</h2>
          <div className="docs-hex glass">
            <pre className="docs-hex__diagram" style={{ fontSize: '0.8rem' }}>{`# Levantar todo el stack:
docker compose up -d

Contenedores que se inician:
  cyclerace-nginx          :80    → Reverse proxy (punto de entrada)
  cyclerace-postgres       :5432  → Auth Service DB
  cyclerace-mysql          :3306  → Eventos & Inscripciones DB
  cyclerace-mongo          :27017 → Pagos / Logs DB
  cyclerace-redis          :6379  → Tracking / Caché
  cyclerace-mongo-reports  :27018 → Reports Service DB
  cyclerace-adminer        :8080  → Admin UI para MySQL/PostgreSQL
  cyclerace-mongo-express  :8081  → Admin UI para MongoDB
  cyclerace-node-api       :3001  → API Principal
  cyclerace-auth-backend   :8001  → Auth Microservicio
  cyclerace-eventos-backend:8002  → Eventos Microservicio
  cyclerace-corredores-backend:8003
  cyclerace-tracking-backend  :8004
  cyclerace-log-backend    :8081  → Go Analyzer
  cyclerace-monitor-backend:8000  → Monitor Service
  cyclerace-frontend       :5173  → React Dev Server`}</pre>
          </div>
        </section>

        {/* AWS */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Cloud size={20} /> Despliegue AWS (Producción)</h2>
          <div className="docs-hex glass">
            <pre className="docs-hex__diagram">{`
Internet ──▶ Route 53 ──▶ ALB (Load Balancer)
                               │
                     ┌─────────┴──────────┐
                     │  ECS / EC2 Cluster  │
                     │  node-api  :3001    │
                     │  auth      :8001    │
                     │  eventos   :8002    │
                     │  corredores:8003    │
                     │  tracking  :8004    │
                     │  log-go    :8081    │
                     │  monitor   :8000    │
                     └────────────────────┘
                     ┌──────┐ ┌──────┐ ┌───────┐
                     │ RDS  │ │Mongo │ │ Redis │
                     │MySQL │ │Atlas │ │ Cloud │
                     └──────┘ └──────┘ └───────┘
                     ┌─────────────────────────┐
                     │ S3 (comprobantes PDF)    │
                     └─────────────────────────┘`}</pre>
          </div>
        </section>

        {/* CRUD Explorer */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Database size={20} /> API CRUD — Endpoints</h2>
          <CrudExplorer />
        </section>

      </div>
    </div>
  )
}
