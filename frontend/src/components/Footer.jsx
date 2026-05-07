import { Link } from 'react-router-dom'
import { Bike, GitBranch, Mail, MapPin } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="footer__logo-row">
              <div className="footer__logo-icon">
                <Bike size={24} />
              </div>
              <span className="footer__logo-text">CycleRace<span className="footer__logo-accent">Pro</span></span>
            </div>
            <p className="footer__desc">
              Plataforma integral para gestión de carreras de ciclismo.
              Registro, pagos, numeración y reportes en tiempo real.
            </p>
            <div className="footer__social">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="footer__social-link" id="footer-github">
                <GitBranch size={18} />
              </a>
              <a href="mailto:contacto@cycleracepro.com" className="footer__social-link" id="footer-email">
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Plataforma</h4>
            <Link to="/" className="footer__col-link">Inicio</Link>
            <Link to="/registro" className="footer__col-link">Registro</Link>
            <Link to="/login" className="footer__col-link">Iniciar Sesión</Link>
            <Link to="/dashboard" className="footer__col-link">Dashboard</Link>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Carreras</h4>
            <span className="footer__col-link">100 Kilómetros</span>
            <span className="footer__col-link">Carrera Infantil</span>
            <span className="footer__col-link">Carrera Damas</span>
            <span className="footer__col-link">Categorías por Edad</span>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Contacto</h4>
            <span className="footer__col-link">contacto@cycleracepro.com</span>
            <span className="footer__col-link">+52 555 000 0000</span>
            <span className="footer__col-link">Preguntas Frecuentes</span>
            <span className="footer__col-link">Soporte</span>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} CycleRace Pro — Todos los derechos reservados</p>
          <p className="footer__bottom-sub">
            <MapPin size={14} /> Plataforma de Carreras de Ciclismo
          </p>
        </div>
      </div>
    </footer>
  )
}
