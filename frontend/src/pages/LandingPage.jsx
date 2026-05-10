import { Link } from 'react-router-dom'
import {
  Bike, ArrowRight, QrCode, Users, CreditCard,
  CheckCircle2, Zap, Timer, Trophy, Calendar,
  MapPin, Star, Wrench, Eye, Route, Mountain,
  Smartphone, Download
} from 'lucide-react'
import './LandingPage.css'

const EVENT_TYPES = [
  { icon: <Trophy size={28} />, title: 'Carreras', desc: 'Competencias de ruta, montaña, criterium y contrarreloj para todos los niveles.', color: 'var(--orange-500)', tag: 'COMPETIR' },
  { icon: <Bike size={28} />, title: 'Paseos Recreativos', desc: 'Rutas nocturnas, familiares y turísticas. Pedalea sin prisa.', color: 'var(--emerald-400)', tag: 'PASEAR' },
  { icon: <Wrench size={28} />, title: 'Talleres y Clínicas', desc: 'Mecánica básica, técnicas de MTB y ciclismo de ruta con instructores.', color: 'var(--sky-400)', tag: 'APRENDER' },
  { icon: <Eye size={28} />, title: 'Exhibiciones y Expos', desc: 'Ferias de bicicletas, lowriders, accesorios y las últimas novedades.', color: 'var(--violet-400)', tag: 'EXPLORAR' },
  { icon: <Route size={28} />, title: 'Tours Guiados', desc: 'Recorridos culturales, arquitectónicos y de murales en bicicleta.', color: 'var(--rose-400)', tag: 'DESCUBRIR' },
  { icon: <Zap size={28} />, title: 'Competencias Especiales', desc: 'Duatlón, contrarreloj, circuitos nocturnos y retos especiales.', color: '#f59e0b', tag: 'RETAR' },
]

const STEPS = [
  { num: '01', icon: <Users size={24} />, title: 'Crea tu Cuenta', desc: 'Regístrate con tus datos personales.' },
  { num: '02', icon: <Star size={24} />, title: 'Explora Eventos', desc: 'Busca entre carreras, paseos, talleres, tours y más.' },
  { num: '03', icon: <CreditCard size={24} />, title: 'Inscríbete y Paga', desc: 'Elige tu evento favorito y realiza el pago.' },
  { num: '04', icon: <QrCode size={24} />, title: 'Recibe tu Acceso', desc: 'El admin valida tu pago y recibes tu número + QR.' },
]

const TESTIMONIALS = [
  { name: 'Carlos M.', event: '100km Élite', text: 'Encontré desde carreras hasta talleres de mecánica. ¡Todo en un solo lugar!', number: '#0012' },
  { name: 'María G.', event: 'Paseo Nocturno', text: 'Me encantó el paseo nocturno por la CDMX. La organización fue impecable.', number: '#0045' },
  { name: 'Diego T.', event: 'Tour Arquitectónico', text: 'Descubrí rincones de la ciudad que no conocía, todo desde mi bicicleta.', number: '#0078' },
]

export default function LandingPage() {
  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero__bg">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__grid-overlay" />
        </div>
        <div className="container hero__content">
          <div className="hero__text">
            <div className="badge animate-fade-in-up"><Bike size={14} /> Plataforma de Eventos Ciclistas 2026</div>
            <h1 className="hero__title animate-fade-in-up delay-100">
              Tu mundo de<span className="hero__title-gradient"> Bicicleta</span> en un solo lugar
            </h1>
            <p className="hero__subtitle animate-fade-in-up delay-200">
              Descubre carreras, paseos, talleres, exhibiciones, tours y más.
              Inscríbete en línea, recibe tu número de competidor con código QR y vive la experiencia ciclista.
            </p>
            <div className="hero__cta animate-fade-in-up delay-300">
              <Link to="/registro" className="btn btn-primary btn-lg" id="hero-register">Crear Cuenta Gratis <ArrowRight size={18} /></Link>
              <a href="#como-funciona" className="btn btn-secondary btn-lg" id="hero-learn">Cómo Funciona</a>
            </div>
            <div className="hero__trust animate-fade-in-up delay-400">
              <div className="hero__trust-avatars">
                <div className="hero__trust-avatar">C</div>
                <div className="hero__trust-avatar">M</div>
                <div className="hero__trust-avatar">D</div>
                <div className="hero__trust-avatar">+</div>
              </div>
              <span className="hero__trust-text">+200 ciclistas ya disfrutan nuestros eventos</span>
            </div>
          </div>
          <div className="hero__visual animate-fade-in-up delay-400">
            <div className="hero__card glass">
              <div className="hero__card-header">
                <div className="hero__card-dot" style={{ background: 'var(--rose-400)' }} />
                <div className="hero__card-dot" style={{ background: 'var(--orange-400)' }} />
                <div className="hero__card-dot" style={{ background: 'var(--emerald-400)' }} />
              </div>
              <div className="hero__card-body">
                <div className="hero__card-row">
                  <QrCode size={48} className="hero__card-qr" />
                  <div>
                    <div className="hero__card-label">Competidor</div>
                    <div className="hero__card-number">#0042</div>
                  </div>
                </div>
                <div className="hero__card-divider" />
                <div className="hero__card-info">
                  <div><span className="hero__card-key">Nombre:</span> Juan Pérez</div>
                  <div><span className="hero__card-key">Evento:</span> Gran Fondo 100K</div>
                  <div><span className="hero__card-key">Estado:</span> <span className="hero__card-status">✓ Validado</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIPOS DE EVENTOS */}
      <section className="section" id="eventos">
        <div className="container">
          <div className="section-header">
            <div className="badge"><Star size={14} /> Todo tipo de eventos</div>
            <h2 className="section-title">Eventos para Todos</h2>
            <p className="section-subtitle">No solo carreras — encuentra todo tipo de experiencias sobre ruedas.</p>
          </div>
          <div className="races-grid races-grid--6">
            {EVENT_TYPES.map((evt, i) => (
              <div key={i} className="race-card card">
                <div className="race-card__icon" style={{ color: evt.color, background: `${evt.color}15` }}>{evt.icon}</div>
                <div className="race-card__tag" style={{ color: evt.color }}>{evt.tag}</div>
                <h3 className="race-card__title">{evt.title}</h3>
                <p className="race-card__desc">{evt.desc}</p>
                <Link to="/login" className="btn btn-primary btn-sm race-card__btn">Ver Eventos <ArrowRight size={14} /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="section steps-section" id="como-funciona">
        <div className="container">
          <div className="section-header">
            <div className="badge"><Zap size={14} /> Proceso</div>
            <h2 className="section-title">¿Cómo Funciona?</h2>
            <p className="section-subtitle">4 simples pasos para participar en cualquier evento.</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-card__num">{step.num}</div>
                <div className="step-card__icon">{step.icon}</div>
                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INFO EVENTO */}
      <section className="section" id="evento">
        <div className="container">
          <div className="section-header">
            <div className="badge"><Calendar size={14} /> Próximos Eventos</div>
            <h2 className="section-title">Próximamente</h2>
          </div>
          <div className="event-grid">
            <div className="event-card glass">
              <Calendar size={32} className="event-card__icon" />
              <h3>Junio 2026</h3>
              <p className="event-card__value">16 eventos</p>
              <p className="event-card__sub">Carreras, paseos y más</p>
            </div>
            <div className="event-card glass">
              <MapPin size={32} className="event-card__icon" />
              <h3>Ubicaciones</h3>
              <p className="event-card__value">CDMX, GDL, MTY</p>
              <p className="event-card__sub">y más ciudades</p>
            </div>
            <div className="event-card glass">
              <Users size={32} className="event-card__icon" />
              <h3>Comunidad</h3>
              <p className="event-card__value">+500 Ciclistas</p>
              <p className="event-card__sub">Creciendo cada día</p>
            </div>
            <div className="event-card glass">
              <Trophy size={32} className="event-card__icon" />
              <h3>Categorías</h3>
              <p className="event-card__value">6 tipos de eventos</p>
              <p className="event-card__sub">Para todos los gustos</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="section testimonials-section" id="testimonios">
        <div className="container">
          <div className="section-header">
            <div className="badge"><Star size={14} /> Testimonios</div>
            <h2 className="section-title">Lo que dicen los Ciclistas</h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card card">
                <div className="testimonial-card__stars">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="var(--orange-400)" color="var(--orange-400)" />)}
                </div>
                <p className="testimonial-card__text">"{t.text}"</p>
                <div className="testimonial-card__footer">
                  <div className="testimonial-card__avatar">{t.name.charAt(0)}</div>
                  <div>
                    <div className="testimonial-card__name">{t.name}</div>
                    <div className="testimonial-card__race">{t.event} · {t.number}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <section className="app-download-section" id="app">
        <div className="container">
          <div className="app-download-box glass">
            <div className="app-download-box__orb" />
            <div className="app-download-content">
              <div className="badge"><Smartphone size={14} /> Aplicación Móvil</div>
              <h2 className="app-download-title">Lleva tus eventos en el bolsillo</h2>
              <p className="app-download-desc">
                Instala nuestra app oficial (Progressive Web App) en tu dispositivo. Accede más rápido, lleva tus códigos QR sin conexión y recibe notificaciones.
              </p>
              <div className="app-download-features">
                <div className="app-download-feature"><CheckCircle2 size={18} /> Instalación directa y segura</div>
                <div className="app-download-feature"><CheckCircle2 size={18} /> Acceso rápido desde tu inicio</div>
                <div className="app-download-feature"><CheckCircle2 size={18} /> No ocupa espacio de almacenamiento</div>
              </div>
              <button 
                onClick={() => {
                  window.location.href = `${window.location.protocol}//${window.location.hostname}:8081`;
                }} 
                className="btn btn-primary btn-lg" 
                style={{ backgroundColor: 'var(--sky-500)', borderColor: 'var(--sky-500)' }}
              >
                <Download size={18} /> Obtener App
              </button>
            </div>
            <div className="app-download-visual">
              <div className="app-mockup">
                <div className="app-mockup-screen">
                  <div className="app-mockup-header">
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-elevated)' }}></div>
                    <div style={{ width: 100, height: 16, borderRadius: 8, background: 'var(--bg-elevated)' }}></div>
                  </div>
                  <div className="app-mockup-card">
                    <div style={{ width: '100%', height: 120, borderRadius: 8, background: 'var(--gradient-brand-soft)', marginBottom: 12 }}></div>
                    <div style={{ width: '80%', height: 14, borderRadius: 4, background: 'var(--text-primary)', marginBottom: 8 }}></div>
                    <div style={{ width: '60%', height: 12, borderRadius: 4, background: 'var(--text-muted)' }}></div>
                  </div>
                  <div className="app-mockup-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="app-mockup-qr">
                      <div className="app-mockup-qr-inner"></div>
                    </div>
                    <div style={{ width: '50%', height: 16, borderRadius: 4, background: 'var(--text-primary)' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="cta">
        <div className="container">
          <div className="cta-box glass">
            <div className="cta-box__orb" />
            <h2 className="cta-box__title">¿Listo para Pedalear?</h2>
            <p className="cta-box__desc">Crea tu cuenta y descubre todos los eventos de bicicleta disponibles.</p>
            <div className="cta-box__actions">
              <Link to="/registro" className="btn btn-primary btn-lg" id="cta-register">Crear Cuenta <ArrowRight size={18} /></Link>
              <Link to="/login" className="btn btn-secondary btn-lg" id="cta-login">Ya tengo cuenta</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
