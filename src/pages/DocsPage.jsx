import {
  Server, Database, Lock, Users, CreditCard, QrCode,
  BarChart3, Monitor, Smartphone, Cloud, Globe,
  Shield, GitBranch, Zap, ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'
import './DocsPage.css'

const MICROSERVICES = [
  { name: 'Auth Service', tech: 'Node.js / Express', db: 'PostgreSQL', dbType: 'Relacional', icon: <Lock size={20} />, color: 'var(--orange-500)', desc: 'Registro, login, emisión y validación de JWT' },
  { name: 'Registration', tech: 'Node.js / NestJS', db: 'MySQL', dbType: 'Relacional', icon: <Users size={20} />, color: 'var(--emerald-400)', desc: 'Gestión de inscripciones por carrera y categoría' },
  { name: 'Payment', tech: 'Python / FastAPI', db: 'MongoDB', dbType: 'NoSQL', icon: <CreditCard size={20} />, color: 'var(--sky-400)', desc: 'Comprobantes, validación admin, activación de número' },
  { name: 'Competitor', tech: 'Go / Gin', db: 'Redis', dbType: 'Clave-Valor', icon: <QrCode size={20} />, color: 'var(--violet-400)', desc: 'Numeración consecutiva y generación de QR' },
  { name: 'Reports', tech: 'Python / FastAPI', db: 'MongoDB', dbType: 'NoSQL', icon: <BarChart3 size={20} />, color: 'var(--rose-400)', desc: 'Reportes estadísticos, gráficas, dashboards' },
]

const TECH_STACK = [
  { icon: <Monitor size={18} />, label: 'React + Vite', sub: 'Frontend Web' },
  { icon: <Smartphone size={18} />, label: 'React Native', sub: 'App Móvil' },
  { icon: <Cloud size={18} />, label: 'AWS', sub: 'Backend Cloud' },
  { icon: <Globe size={18} />, label: 'Vercel', sub: 'Landing Page' },
  { icon: <Shield size={18} />, label: 'JWT', sub: 'Autenticación' },
  { icon: <GitBranch size={18} />, label: 'GitHub Actions', sub: 'CI/CD' },
]

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
          <p className="docs-header__sub">Documentación interna del patrón hexagonal, microservicios, bases de datos y stack tecnológico.</p>
        </div>

        {/* Hex Architecture */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Server size={20} /> Arquitectura Hexagonal</h2>
          <div className="docs-hex glass">
            <pre className="docs-hex__diagram">{`
┌─────────────────────────────────────────────────┐
│                  ADAPTADORES                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ REST API │  │  React   │  │ React Native │  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │               │           │
│  ─────────────── PUERTOS (IN) ───────────────── │
│  │                                             │ │
│  │           DOMINIO / LÓGICA DE NEGOCIO       │ │
│  │   (Entidades, Casos de Uso, Reglas)         │ │
│  │                                             │ │
│  ─────────────── PUERTOS (OUT) ──────────────── │
│       │              │               │           │
│  ┌────┴─────┐  ┌─────┴────┐  ┌──────┴───────┐  │
│  │   MySQL  │  │ MongoDB  │  │   Redis/SQS  │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────┘`}</pre>
          </div>
        </section>

        {/* Microservices */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Server size={20} /> 05 Microservicios</h2>
          <div className="docs-ms-grid">
            {MICROSERVICES.map((ms, i) => (
              <div key={i} className="docs-ms-card card">
                <div className="docs-ms-card__header">
                  <div className="docs-ms-card__icon" style={{ color: ms.color, background: `${ms.color}15` }}>{ms.icon}</div>
                  <div className="docs-ms-card__dot" style={{ background: ms.color }} />
                </div>
                <h3 className="docs-ms-card__name">{ms.name}</h3>
                <p className="docs-ms-card__desc">{ms.desc}</p>
                <div className="docs-ms-card__meta">
                  <div className="docs-ms-card__row"><Server size={14} /> {ms.tech}</div>
                  <div className="docs-ms-card__row"><Database size={14} /> {ms.db} <span className="docs-ms-card__tag">{ms.dbType}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Databases */}
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
                <tr><td>Registration</td><td>MySQL</td><td>Relacional</td><td>3306</td><td>Relaciones inscripciones-categorías</td></tr>
                <tr><td>Payment</td><td>MongoDB</td><td>NoSQL</td><td>27017</td><td>Documentos de comprobantes flexibles</td></tr>
                <tr><td>Competitor</td><td>Redis</td><td>Clave-Valor</td><td>6379</td><td>Velocidad en numeración consecutiva</td></tr>
                <tr><td>Reports</td><td>MongoDB</td><td>NoSQL</td><td>27018</td><td>Agregaciones y estadísticas</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* JWT Security */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Shield size={20} /> Seguridad JWT</h2>
          <div className="docs-hex glass">
            <pre className="docs-hex__diagram">{`
Cliente (Web/Mobile)
    │
    │  POST /auth/login
    ▼
┌─────────────┐
│ Auth Service│ ──▶ JWT Token (Access + Refresh)
└─────────────┘
    │
    │  Authorization: Bearer <token>
    ▼
┌────────────────────────────────────┐
│        API Gateway                 │
│  • Valida firma JWT                │
│  • Extrae claims (userId, rol)     │
│  • Roles: admin, corredor, viewer  │
└────────────────────────────────────┘`}</pre>
          </div>
        </section>

        {/* Tech Stack */}
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

        {/* AWS Deployment */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Cloud size={20} /> Despliegue AWS</h2>
          <div className="docs-hex glass">
            <pre className="docs-hex__diagram">{`
Internet ──▶ Route 53 ──▶ ALB (Load Balancer)
                              │
                    ┌─────────┴──────────┐
                    │  ECS / EC2 Cluster  │
                    │  ┌───┐ ┌───┐ ┌───┐ │
                    │  │MS1│ │MS2│ │MS3│ │
                    │  └───┘ └───┘ └───┘ │
                    │  ┌───┐ ┌───┐       │
                    │  │MS4│ │MS5│       │
                    │  └───┘ └───┘       │
                    └────────────────────┘
                    ┌────┐ ┌──────┐ ┌─────┐
                    │ RDS│ │Mongo │ │Redis│
                    └────┘ └──────┘ └─────┘
                    ┌─────────────────────┐
                    │ S3 (Comprobantes)    │
                    └─────────────────────┘`}</pre>
          </div>
        </section>

        {/* Docker */}
        <section className="docs-section">
          <h2 className="docs-section__title"><Server size={20} /> Docker Compose</h2>
          <div className="docs-hex glass">
            <p style={{color:'var(--text-muted)', marginBottom:'var(--space-md)', fontSize:'0.9rem'}}>
              Archivo <code style={{color:'var(--orange-400)'}}>docker-compose.yml</code> para levantar las 5 bases de datos:
            </p>
            <pre className="docs-hex__diagram" style={{fontSize:'0.8rem'}}>{`docker compose up -d

Services:
  • cyclerace-postgres  (5432)  → Auth Service
  • cyclerace-mysql     (3306)  → Registration Service
  • cyclerace-mongo     (27017) → Payment Service
  • cyclerace-redis     (6379)  → Competitor Service
  • cyclerace-mongo2    (27018) → Reports Service
  • mongo-express       (8081)  → Admin UI MongoDB
  • adminer             (8080)  → Admin UI SQL`}</pre>
          </div>
        </section>

      </div>
    </div>
  )
}
