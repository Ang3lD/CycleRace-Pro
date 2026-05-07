import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Bike, LogOut, User, LayoutDashboard, Calendar } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAdmin, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      navigate('/', { replace: true }) // Clear hash
    }
  }

  const isLinkActive = (path, hash = '') => {
    if (hash) {
      return location.pathname === path && location.hash === hash
    }
    return location.pathname === path && location.hash === ''
  }

  return (
    <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`} id="main-navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__brand" id="navbar-brand">
          <div className="navbar__logo">
            <Bike size={28} />
          </div>
          <span className="navbar__title">CycleRace<span className="navbar__title-accent">Pro</span></span>
        </Link>

        <div className={`navbar__links ${isMobileOpen ? 'navbar__links--open' : ''}`}>
          <Link 
            to="/" 
            className={`navbar__link ${isLinkActive('/') ? 'navbar__link--active' : ''}`} 
            id="nav-home"
            onClick={handleHomeClick}
          >
            Inicio
          </Link>
          <a 
            href="/#eventos" 
            className={`navbar__link ${isLinkActive('/', '#eventos') ? 'navbar__link--active' : ''}`} 
            id="nav-races"
          >
            Eventos
          </a>
          <a 
            href="/#como-funciona" 
            className={`navbar__link ${isLinkActive('/', '#como-funciona') ? 'navbar__link--active' : ''}`} 
            id="nav-how"
          >
            Cómo Funciona
          </a>

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

          {/* Mobile-only auth buttons */}
          <div className="navbar__actions-mobile">
            {user ? (
              <>
                <div className="navbar__user-info-mobile">
                  <User size={16} />
                  <span>{user.nombre}</span>
                  <span className={`navbar__role-badge navbar__role-badge--${user.rol}`}>{user.rol}</span>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm" id="nav-logout-mobile">
                  <LogOut size={14} /> Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm" id="nav-login-mobile">Iniciar Sesión</Link>
                <Link to="/registro" className="btn btn-primary btn-sm" id="nav-register-mobile">Registrarse</Link>
              </>
            )}
          </div>
        </div>

        <div className="navbar__actions">
          {user ? (
            <>
              <div className="navbar__user-pill" id="nav-user-pill">
                <div className="navbar__user-avatar">{user.nombre.charAt(0)}</div>
                <span className="navbar__user-name">{user.nombre.split(' ')[0]}</span>
                <span className={`navbar__role-badge navbar__role-badge--${user.rol}`}>{user.rol}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" id="nav-logout">
                <LogOut size={14} /> Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm" id="nav-login">Iniciar Sesión</Link>
              <Link to="/registro" className="btn btn-primary btn-sm" id="nav-register">Registrarse</Link>
            </>
          )}
        </div>

        <button
          className="navbar__toggle"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle menu"
          id="navbar-toggle"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  )
}
