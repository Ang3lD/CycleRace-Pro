# 🚴 CycleRace Pro — Mejoras Propuestas

> Documento técnico con implementaciones concretas para mejorar la plataforma.  
> Cada sección incluye el archivo a modificar y el código exacto a agregar o reemplazar.

---

## Índice

1. [Admin no ve páginas de usuario](#1-admin-no-ve-páginas-de-usuario)
2. [Exportar analizador a .txt](#2-exportar-analizador-a-txt)
3. [DocsPage actualizada con arquitectura completa](#3-docspage-actualizada-con-arquitectura-completa)
4. [Visualizar CRUD completo en Docs](#4-visualizar-crud-completo-en-docs)
5. [Comprobante PDF al pagar (usuario)](#5-comprobante-pdf-al-pagar-usuario)
6. [Admin ve comprobantes en Dashboard](#6-admin-ve-comprobantes-en-dashboard)
7. [Extras recomendados](#7-extras-recomendados)

---

## 1. Admin no ve páginas de usuario

### Problema
El admin puede navegar a `/eventos`, `/mis-eventos` y `/pago/:id` aunque son rutas de usuario corredor. Esas páginas no tienen sentido para él.

### Solución — `frontend/src/App.jsx`

Crear un guard `UserOnlyRoute` que redirija al admin al dashboard si intenta entrar a rutas de usuario:

```jsx
// Agregar después de AdminRoute (línea ~34)

// Ruta SOLO para usuarios normales (no admin)
function UserOnlyRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (isAdmin) return <Navigate to="/dashboard" replace />  // Admin → Dashboard
  return children
}
```

Luego actualizar las rutas de usuario en el mismo archivo:

```jsx
// Reemplazar las rutas protegidas de usuario (líneas ~58-66)

{/* Solo para usuarios normales — admin redirige al dashboard */}
<Route path="/eventos" element={
  <UserOnlyRoute><EventosPage /></UserOnlyRoute>
} />
<Route path="/mis-eventos" element={
  <UserOnlyRoute><MisEventosPage /></UserOnlyRoute>
} />
<Route path="/pago/:eventoId" element={
  <UserOnlyRoute><PaymentPage /></UserOnlyRoute>
} />
```

### Solución — `frontend/src/components/Navbar.jsx`

Ocultar los links de usuario del navbar cuando el usuario es admin:

```jsx
// Reemplazar el bloque {user && ( ... )} del navbar (línea ~68)

{user && !isAdmin && (
  <>
    <Link to="/eventos" className={`navbar__link ${location.pathname === '/eventos' ? 'navbar__link--active' : ''}`} id="nav-explore">
      Explorar Eventos
    </Link>
    <Link to="/mis-eventos" className={`navbar__link ${location.pathname === '/mis-eventos' ? 'navbar__link--active' : ''}`} id="nav-my-events">
      Mis Eventos
    </Link>
  </>
)}
{isAdmin && (
  <Link to="/dashboard" className={`navbar__link navbar__link--admin ${location.pathname === '/dashboard' ? 'navbar__link--active' : ''}`} id="nav-dashboard">
    <LayoutDashboard size={14} /> Dashboard
  </Link>
)}
```

---

## 2. Exportar Analizador a .txt

### Archivo — `frontend/src/pages/AnalyzerPage.jsx`

Agregar función de exportación y botón en el header del analizador:

```jsx
// 1. Agregar import del ícono (junto a los demás imports de lucide-react)
import { Terminal, ShieldAlert, Activity, Search, Database, Fingerprint, Download } from 'lucide-react'

// 2. Agregar función de exportación dentro del componente (antes del return)
const handleExportTxt = () => {
  const now = new Date()
  const dateStr = now.toLocaleString('es-MX')
  
  let content = `REPORTE DE ANÁLISIS HEURÍSTICO — CycleRace Pro\n`
  content += `Exportado: ${dateStr}\n`
  content += `Total de registros: ${logs.length}\n`
  content += `${'='.repeat(70)}\n\n`

  logs.forEach((log, i) => {
    const isVulnerable = log.analysis?.includes('VULNERABILIDAD')
    content += `[${logs.length - i}] ${new Date(log.timestamp).toLocaleString('es-MX')}\n`
    content += `  Usuario   : ${log.user_id}\n`
    content += `  Acción    : ${log.action_type}\n`
    content += `  Objetivo  : ${log.target_element}\n`
    content += `  Token     : ${log.token}\n`
    content += `  Análisis  : ${log.analysis}\n`
    content += `  Estado    : ${isVulnerable ? '⚠ ANOMALÍA DETECTADA' : '✓ VÁLIDO'}\n`
    content += `${'─'.repeat(50)}\n`
  })

  const vulnerables = logs.filter(l => l.analysis?.includes('VULNERABILIDAD')).length
  content += `\nRESUMEN FINAL\n`
  content += `${'='.repeat(70)}\n`
  content += `  Total registros : ${logs.length}\n`
  content += `  Válidos         : ${logs.length - vulnerables}\n`
  content += `  Anomalías       : ${vulnerables}\n`

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analyzer-report-${now.toISOString().slice(0, 10)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// 3. Agregar el botón en el header del analizador (dentro del <header className="analyzer-header">)
// Buscar la línea del <header> y agregar al final, antes del </header>:
<button
  onClick={handleExportTxt}
  className="btn btn-secondary"
  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
  disabled={logs.length === 0}
  title="Exportar logs a archivo .txt"
>
  <Download size={16} /> Exportar .txt
</button>
```

---

## 3. DocsPage actualizada con arquitectura completa

### Archivo — `frontend/src/pages/DocsPage.jsx`

Reemplazar el archivo completo con la versión mejorada que incluye:
- **8 microservicios reales** con sus puertos (8001, 8002…)
- **Arquitectura hexagonal** visual actualizada
- **Links a cada microservicio** (localhost y producción)
- **Estructura de carpetas** del proyecto
- **Diagrama de flujo de datos**

```jsx
import {
  Server, Database, Lock, Users, CreditCard, QrCode,
  BarChart3, Monitor, Smartphone, Cloud, Globe,
  Shield, GitBranch, Zap, ArrowLeft, Activity,
  Terminal, ExternalLink, Folder, ChevronRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import './DocsPage.css'

// ─── Microservicios con puertos reales del proyecto ───
const MICROSERVICES = [
  {
    name: 'Node API (Principal)',
    tech: 'Node.js / Express',
    db: 'MySQL + PostgreSQL + MongoDB',
    dbType: 'Multi-DB',
    icon: <Server size={20} />,
    color: 'var(--orange-500)',
    desc: 'API principal: auth, eventos, inscripciones. Punto de entrada unificado.',
    port: 3001,
    localUrl: 'http://localhost:3001',
    nginxPath: '/api/',
    status: 'core'
  },
  {
    name: 'Auth Service',
    tech: 'Python / FastAPI',
    db: 'PostgreSQL',
    dbType: 'Relacional',
    icon: <Lock size={20} />,
    color: 'var(--emerald-400)',
    desc: 'Registro, login, validación de JWT. Puerto interno del contenedor.',
    port: 8001,
    localUrl: 'http://localhost:8001',
    nginxPath: 'Interno (vía node-api)',
    status: 'active'
  },
  {
    name: 'Eventos Service',
    tech: 'Python / FastAPI',
    db: 'MySQL',
    dbType: 'Relacional',
    icon: <Globe size={20} />,
    color: 'var(--sky-400)',
    desc: 'Catálogo de eventos ciclistas, categorías y cupos.',
    port: 8002,
    localUrl: 'http://localhost:8002',
    nginxPath: 'Interno (vía node-api)',
    status: 'active'
  },
  {
    name: 'Corredores Service',
    tech: 'Python / FastAPI',
    db: 'MySQL',
    dbType: 'Relacional',
    icon: <QrCode size={20} />,
    color: 'var(--violet-400)',
    desc: 'Numeración consecutiva de competidores y generación de QR.',
    port: 8003,
    localUrl: 'http://localhost:8003',
    nginxPath: 'Interno (vía node-api)',
    status: 'active'
  },
  {
    name: 'Tracking Service',
    tech: 'Python / FastAPI',
    db: 'Redis',
    dbType: 'Clave-Valor',
    icon: <Activity size={20} />,
    color: 'var(--rose-400)',
    desc: 'Seguimiento en tiempo real de corredores durante la carrera.',
    port: 8004,
    localUrl: 'http://localhost:8004',
    nginxPath: 'Interno (vía node-api)',
    status: 'active'
  },
  {
    name: 'Log Analyzer',
    tech: 'Go / Gin',
    db: 'MongoDB',
    dbType: 'NoSQL',
    icon: <Terminal size={20} />,
    color: '#f59e0b',
    desc: 'Analizador heurístico léxico-semántico. Motor de seguridad en tiempo real.',
    port: 8081,
    localUrl: 'http://localhost:8081',
    nginxPath: '/analyzer/',
    status: 'active'
  },
  {
    name: 'Monitor Service',
    tech: 'Python / FastAPI',
    db: '—',
    dbType: 'Sin BD propia',
    icon: <BarChart3 size={20} />,
    color: 'var(--emerald-400)',
    desc: 'Healthcheck de todos los microservicios. Retorna estado en tiempo real.',
    port: 8000,
    localUrl: 'http://localhost:8000',
    nginxPath: '/monitor/',
    status: 'active'
  },
  {
    name: 'Reports Service',
    tech: 'Python / FastAPI',
    db: 'MongoDB (reports)',
    dbType: 'NoSQL',
    icon: <BarChart3 size={20} />,
    color: '#10b981',
    desc: 'Estadísticas, reportes de inscripciones, dashboards y métricas.',
    port: 8005,
    localUrl: 'http://localhost:8005',
    nginxPath: 'Interno',
    status: 'planned'
  },
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

export default function DocsPage() {
  return (
    <div className="docs-page" id="docs-page">
      <div className="docs-page__bg">
        <div className="docs-page__orb docs-page__orb--1" />
      </div>
      <div className="container">
        <Link to="/" className="docs-back"><ArrowLeft size={16} /> Volver al inicio</Link>

        <div className="docs-header">
          <div className="badge"><Zap size={14} /> Documentación Técnica</div>
          <h1 className="docs-header__title">Arquitectura del Sistema</h1>
          <p className="docs-header__sub">
            Documentación interna: patrón hexagonal, 8 microservicios, bases de datos,
            puertos, rutas Nginx y stack tecnológico completo.
          </p>
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

        {/* 8 Microservicios con puertos */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Server size={20} /> 8 Microservicios</h2>
          <div className="docs-ms-grid">
            {MICROSERVICES.map((ms, i) => (
              <div key={i} className="docs-ms-card card">
                <div className="docs-ms-card__header">
                  <div className="docs-ms-card__icon" style={{ color: ms.color, background: `${ms.color}15` }}>{ms.icon}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700,
                      padding: '2px 8px', borderRadius: '20px',
                      background: ms.status === 'core' ? 'var(--orange-500)20' :
                                  ms.status === 'planned' ? '#ffffff10' : 'var(--emerald-400)20',
                      color: ms.status === 'core' ? 'var(--orange-500)' :
                             ms.status === 'planned' ? 'var(--text-muted)' : 'var(--emerald-400)',
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
                    <a href={ms.localUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                      :{ms.port} <ExternalLink size={11} style={{ display: 'inline' }} />
                    </a>
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
              <thead>
                <tr>
                  <th>Microservicio</th>
                  <th>Base de Datos</th>
                  <th>Tipo</th>
                  <th>Puerto Docker</th>
                  <th>Justificación</th>
                </tr>
              </thead>
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
      </div>
    </div>
  )
}
```

---

## 4. Visualizar CRUD completo en Docs

### Agregar nueva sección en `DocsPage.jsx`

Esta sección muestra todos los endpoints GET, POST, PUT, DELETE disponibles en la API.

```jsx
// Agregar antes del cierre </div> del componente, después de la sección Docker

{/* ─── CRUD Explorer ─── */}
<section className="docs-section">
  <h2 className="docs-section__title"><Database size={20} /> API CRUD — Endpoints</h2>
  
  {/* Usar un componente interno de tabla de endpoints */}
  <CrudExplorer />
</section>
```

Agregar el componente `CrudExplorer` en el mismo archivo (o en un archivo separado `components/CrudExplorer.jsx`):

```jsx
// Componente para visualizar CRUD — agregar dentro de DocsPage.jsx o importar

const ENDPOINTS = [
  // AUTH
  { method: 'POST', path: '/api/auth/login',           auth: false, admin: false, desc: 'Iniciar sesión. Retorna JWT.',            body: '{ email, password }' },
  { method: 'POST', path: '/api/auth/register',        auth: false, admin: false, desc: 'Registrar nuevo usuario.',                body: '{ nombre, email, password, telefono }' },
  { method: 'POST', path: '/api/auth/forgot-password', auth: false, admin: false, desc: 'Solicitar reseteo de contraseña.',        body: '{ email }' },
  { method: 'POST', path: '/api/auth/reset-password',  auth: false, admin: false, desc: 'Confirmar nueva contraseña con token.',   body: '{ token, newPassword }' },
  { method: 'GET',  path: '/api/auth/me',              auth: true,  admin: false, desc: 'Obtener usuario autenticado actual.',     body: null },
  { method: 'GET',  path: '/api/auth/users',           auth: true,  admin: true,  desc: 'Listar todos los usuarios (admin).',     body: null },
  // EVENTOS
  { method: 'GET',  path: '/api/eventos',              auth: false, admin: false, desc: 'Listar todos los eventos disponibles.',   body: null },
  { method: 'GET',  path: '/api/eventos/:id',          auth: false, admin: false, desc: 'Obtener detalle de un evento.',           body: null },
  { method: 'POST', path: '/api/eventos',              auth: true,  admin: true,  desc: 'Crear nuevo evento (admin).',             body: '{ nombre, descripcion, tipo, precio, cupo_maximo, fecha_evento, hora_evento, lugar }' },
  // INSCRIPCIONES
  { method: 'POST', path: '/api/inscripciones',        auth: true,  admin: false, desc: 'Inscribirse a un evento (pagar).',        body: '{ evento_id, metodo_pago, monto }' },
  { method: 'GET',  path: '/api/inscripciones/me',     auth: true,  admin: false, desc: 'Listar mis inscripciones (usuario).',     body: null },
  { method: 'GET',  path: '/api/inscripciones',        auth: true,  admin: true,  desc: 'Listar todas las inscripciones (admin).',  body: null },
  { method: 'PUT',  path: '/api/inscripciones/:id/validar',  auth: true, admin: true, desc: 'Validar pago de inscripción (admin).', body: null },
  { method: 'PUT',  path: '/api/inscripciones/:id/rechazar', auth: true, admin: true, desc: 'Rechazar inscripción (admin).',         body: null },
  // DASHBOARD
  { method: 'GET',  path: '/api/dashboard/stats',      auth: true,  admin: true,  desc: 'Estadísticas generales del sistema.',    body: null },
  // ANALYZER (Go)
  { method: 'POST', path: '/analyzer/ingest',          auth: false, admin: false, desc: 'Ingestar evento de click del frontend.', body: '{ user_id, action_type, target_element, payload }' },
  { method: 'GET',  path: '/analyzer/api/analyzer/logs',   auth: true, admin: true, desc: 'Obtener logs analizados en tiempo real.', body: null },
  { method: 'POST', path: '/analyzer/api/analyzer/query',  auth: true, admin: true, desc: 'Consultar BD de logs por regla.',         body: '{ rule: "string" }' },
  // MONITOR
  { method: 'GET',  path: '/monitor/api/status',       auth: false, admin: false, desc: 'Estado de todos los microservicios.',    body: null },
]

const METHOD_COLORS = {
  GET:    { bg: '#10b98120', text: '#10b981', label: 'GET' },
  POST:   { bg: '#3b82f620', text: '#3b82f6', label: 'POST' },
  PUT:    { bg: '#f59e0b20', text: '#f59e0b', label: 'PUT' },
  DELETE: { bg: '#ef444420', text: '#ef4444', label: 'DELETE' },
}

function CrudExplorer() {
  const [expandedRow, setExpandedRow] = useState(null)
  const [filterMethod, setFilterMethod] = useState('ALL')

  const filtered = filterMethod === 'ALL' ? ENDPOINTS : ENDPOINTS.filter(e => e.method === filterMethod)

  return (
    <div>
      {/* Filtros por método */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map(m => (
          <button
            key={m}
            onClick={() => setFilterMethod(m)}
            style={{
              padding: '4px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.78rem',
              background: filterMethod === m
                ? (m === 'ALL' ? 'var(--orange-500)' : METHOD_COLORS[m]?.bg.replace('20', ''))
                : 'var(--glass-bg)',
              color: filterMethod === m ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            {m}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem', alignSelf: 'center' }}>
          {filtered.length} endpoints
        </span>
      </div>

      <div className="docs-table-wrap glass" style={{ padding: 0 }}>
        <table className="docs-table" style={{ marginBottom: 0 }}>
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Método</th>
              <th>Ruta</th>
              <th>Auth</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ep, i) => {
              const mc = METHOD_COLORS[ep.method] || METHOD_COLORS.GET
              const isExpanded = expandedRow === i
              return (
                <>
                  <tr
                    key={i}
                    onClick={() => setExpandedRow(isExpanded ? null : i)}
                    style={{ cursor: ep.body ? 'pointer' : 'default' }}
                  >
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                        fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace',
                        background: mc.bg, color: mc.text
                      }}>
                        {ep.method}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.82rem', color: 'var(--orange-400)' }}>{ep.path}</code>
                    </td>
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
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

> **Nota**: Agregar `import { useState } from 'react'` al inicio del archivo si aún no está.

---

## 5. Comprobante PDF al pagar (usuario)

### Dependencia necesaria

```bash
# En el frontend
npm install jspdf
```

### Archivo — `frontend/src/pages/PaymentPage.jsx`

Agregar la función de generación de PDF y el botón de descarga en la pantalla de éxito:

```jsx
// 1. Agregar import al inicio del archivo
import { jsPDF } from 'jspdf'

// 2. Generar un ID de transacción único al entrar en success
// Reemplazar el useState de success:
const [success, setSuccess] = useState(false)
const [transaccionId, setTransaccionId] = useState('')
const [inscripcionData, setInscripcionData] = useState(null)

// 3. Al hacer el pago exitoso, guardar los datos de la inscripción:
// Dentro de handlePayment, reemplazar setSuccess(true) por:
const txId = `TRX-${Date.now().toString(36).toUpperCase()}`
setTransaccionId(txId)
setInscripcionData(data)
setSuccess(true)
// Eliminar el setTimeout de navigate para que el usuario pueda descargar primero

// 4. Función para generar el PDF del comprobante:
const handleDownloadComprobante = () => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const now = new Date()
  
  // Fondo
  doc.setFillColor(15, 15, 20)
  doc.rect(0, 0, 210, 297, 'F')
  
  // Header naranja
  doc.setFillColor(234, 88, 12)
  doc.rect(0, 0, 210, 45, 'F')
  
  // Título
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('CycleRace Pro', 20, 22)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Comprobante de Inscripción', 20, 32)
  doc.text(`Folio: ${transaccionId}`, 20, 40)
  
  // Sello de éxito
  doc.setFillColor(16, 185, 129)
  doc.roundedRect(140, 10, 55, 25, 4, 4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('✓ PAGO EXITOSO', 152, 22, { align: 'center' })
  doc.text('INSCRIPCIÓN CONFIRMADA', 167, 29, { align: 'center' })
  
  // Datos del evento
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Datos del Evento', 20, 65)
  
  const rows = [
    ['Evento', evento?.nombre || '—'],
    ['Tipo', evento?.tipo_evento || '—'],
    ['Fecha del Evento', evento?.fecha_evento ? new Date(evento.fecha_evento).toLocaleDateString('es-MX') : '—'],
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
  
  // Datos del usuario
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Datos del Participante', 20, 135)
  
  const userRows = [
    ['Nombre', user?.nombre || '—'],
    ['Email', user?.email || '—'],
    ['No. Competidor', inscripcionData?.numero_competidor ? `#${String(inscripcionData.numero_competidor).padStart(4, '0')}` : 'Pendiente de asignación'],
    ['Estado', 'Pendiente de validación'],
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
  
  // Resumen de pago
  doc.setFillColor(30, 30, 40)
  doc.roundedRect(15, 205, 180, 55, 4, 4, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen de Pago', 20, 220)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150, 150, 160)
  doc.text('Monto de inscripción:', 20, 233)
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
  
  // Footer
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 90)
  doc.text(`Fecha de pago: ${now.toLocaleString('es-MX')}`, 20, 278)
  doc.text('CycleRace Pro — cyclerace.pro | Comprobante generado automáticamente.', 20, 285)
  doc.text(`Folio: ${transaccionId}`, 20, 291)
  
  doc.save(`comprobante-${transaccionId}.pdf`)
}

// 5. Reemplazar el bloque de éxito (if success) con:
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

        {/* Botones de acción */}
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
```

> Agregar `import { Download } from 'lucide-react'` al inicio del archivo.

---

## 6. Admin ve comprobantes en Dashboard

### Archivo — `frontend/src/pages/DashboardPage.jsx`

Agregar botón para ver/descargar el comprobante de cada inscripción validada:

```jsx
// 1. Agregar imports al inicio
import { jsPDF } from 'jspdf'
import { Download, FileText } from 'lucide-react'

// 2. Función para generar comprobante admin (agregar dentro del componente)
const handleVerComprobante = (insc) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const now = new Date()
  
  // Fondo
  doc.setFillColor(15, 15, 20)
  doc.rect(0, 0, 210, 297, 'F')
  
  // Header
  doc.setFillColor(234, 88, 12)
  doc.rect(0, 0, 210, 45, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('CycleRace Pro — Admin', 20, 20)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Comprobante de Inscripción (Vista Admin)', 20, 30)
  doc.text(`Generado: ${now.toLocaleString('es-MX')}`, 20, 40)

  // Estado badge
  const estadoColor = insc.estado === 'validado' ? [16, 185, 129] : [239, 68, 68]
  doc.setFillColor(...estadoColor)
  doc.roundedRect(140, 12, 55, 20, 4, 4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(insc.estado?.toUpperCase(), 167, 25, { align: 'center' })

  // Datos participante
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Participante', 20, 65)
  
  const rows = [
    ['Nombre', insc.nombre_completo || '—'],
    ['Email', insc.email || '—'],
    ['No. Competidor', insc.numero_competidor ? `#${String(insc.numero_competidor).padStart(4, '0')}` : '—'],
    ['Estado', insc.estado?.charAt(0).toUpperCase() + insc.estado?.slice(1) || '—'],
    ['Fecha Inscripción', insc.fecha_inscripcion ? new Date(insc.fecha_inscripcion).toLocaleDateString('es-MX') : '—'],
    ['Método de Pago', insc.metodo_pago || '—'],
  ]
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  rows.forEach(([label, value], i) => {
    const y = 78 + i * 12
    doc.setTextColor(150, 150, 160)
    doc.text(label + ':', 20, y)
    doc.setTextColor(255, 255, 255)
    doc.text(String(value), 80, y)
  })

  // Datos evento
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Evento', 20, 163)
  
  const eventRows = [
    ['Evento', insc.evento_nombre || '—'],
    ['Tipo', insc.tipo_evento || '—'],
    ['Precio', insc.precio ? `$${insc.precio} MXN` : '—'],
  ]
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  eventRows.forEach(([label, value], i) => {
    const y = 176 + i * 12
    doc.setTextColor(150, 150, 160)
    doc.text(label + ':', 20, y)
    doc.setTextColor(255, 255, 255)
    doc.text(String(value), 80, y)
  })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 90)
  doc.text('CycleRace Pro — Documento generado por panel administrativo.', 20, 285)
  doc.text(`ID Inscripción: ${insc.id}`, 20, 291)
  
  doc.save(`comprobante-admin-${insc.id}-${insc.nombre_completo?.replace(/\s/g, '_')}.pdf`)
}

// 3. En la tabla de inscripciones, agregar el botón de comprobante en la columna Acciones
// Dentro del <tbody>, en la fila de cada inscripción, agregar dentro de <div className="dash-actions">:

{/* Botón de comprobante — siempre visible */}
<button
  className="dash-action-btn"
  onClick={() => handleVerComprobante(c)}
  title="Descargar comprobante PDF"
  style={{ color: 'var(--sky-400)', border: '1px solid var(--sky-400)30' }}
>
  <FileText size={16} />
</button>
```

---

## 7. Extras recomendados

Estas mejoras adicionales no afectan la lógica existente y elevan la calidad general:

---

### 7.1 Toast de notificaciones (reemplazar `alert()`)

El dashboard usa `alert('Evento creado exitosamente')` nativo. Reemplazar por un sistema de toasts:

```jsx
// Agregar en DashboardPage.jsx — estado para toast
const [toast, setToast] = useState(null)

const showToast = (msg, type = 'success') => {
  setToast({ msg, type })
  setTimeout(() => setToast(null), 3500)
}

// Reemplazar alert() por:
showToast('Evento creado exitosamente', 'success')

// Agregar el toast visual al final del JSX (antes del </div> final):
{toast && (
  <div style={{
    position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
    background: toast.type === 'success' ? 'var(--emerald-400)' : 'var(--rose-400)',
    color: '#fff', padding: '12px 20px', borderRadius: '8px',
    fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    animation: 'slideIn 0.3s ease'
  }}>
    {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
  </div>
)}
```

---

### 7.2 Búsqueda en tiempo real en EventosPage

Agregar un input de búsqueda en la página de eventos del usuario para filtrar por nombre/tipo/lugar sin petición al servidor.

```jsx
// En EventosPage.jsx — agregar estado
const [searchEvento, setSearchEvento] = useState('')

// Filtrar antes del .map():
const eventosFiltrados = eventos.filter(e =>
  e.nombre?.toLowerCase().includes(searchEvento.toLowerCase()) ||
  e.tipo_evento?.toLowerCase().includes(searchEvento.toLowerCase()) ||
  e.lugar?.toLowerCase().includes(searchEvento.toLowerCase())
)

// Agregar input de búsqueda en el JSX:
<input
  type="text"
  placeholder="Buscar eventos por nombre, tipo o lugar..."
  value={searchEvento}
  onChange={e => setSearchEvento(e.target.value)}
  className="form-input"
  style={{ marginBottom: '24px', maxWidth: '400px' }}
/>
```

---

### 7.3 Redirección post-login según rol

Actualmente todos van a `/eventos` después de login. Mejorar para que:
- **Admin → /dashboard**
- **Corredor → /eventos**

```jsx
// En LoginPage.jsx — reemplazar la lógica de navegación post-login:
const loggedUser = await login(email, password)
if (loggedUser.rol === 'admin') {
  navigate('/dashboard')
} else {
  navigate('/eventos')
}
```

---

### 7.4 Contador de cupos disponibles en EventosPage

Mostrar visualmente cuántos cupos quedan en cada tarjeta de evento:

```jsx
// En el card de cada evento, agregar:
const cuposRestantes = evento.cupo_maximo - (evento.inscritos || 0)
const pctOcupado = Math.min(100, Math.round(((evento.inscritos || 0) / evento.cupo_maximo) * 100))

// JSX:
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
```

---

### 7.5 Confirmación antes de rechazar inscripción

Antes de rechazar evitar clics accidentales:

```jsx
// En DashboardPage.jsx — reemplazar handleReject:
const handleReject = async (id, nombre) => {
  if (!window.confirm(`¿Estás seguro de rechazar la inscripción de ${nombre}? Esta acción no se puede deshacer.`)) return
  setActionLoading(id)
  // ... resto del código igual
}

// Y en el JSX del botón rechazar:
onClick={() => handleReject(c.id, c.nombre_completo)}
```

---

## Resumen de archivos modificados

| Archivo | Cambio |
|---|---|
| `frontend/src/App.jsx` | Nuevo guard `UserOnlyRoute` para admin |
| `frontend/src/components/Navbar.jsx` | Ocultar links de usuario para admin |
| `frontend/src/pages/AnalyzerPage.jsx` | Botón exportar a `.txt` |
| `frontend/src/pages/DocsPage.jsx` | Arquitectura completa, 8 microservicios, CRUD explorer |
| `frontend/src/pages/PaymentPage.jsx` | Comprobante PDF al pagar + jsPDF |
| `frontend/src/pages/DashboardPage.jsx` | Comprobante PDF por inscripción + toast + confirmación rechazo |
| `frontend/src/pages/EventosPage.jsx` | Búsqueda en tiempo real + cupos |
| `frontend/src/pages/LoginPage.jsx` | Redirección según rol post-login |

---

> Todas las mejoras son **aditivas**: no eliminan funcionalidad existente ni rompen rutas actuales.
