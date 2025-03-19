"use client"

import { useState, useEffect } from "react"
import type React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/src/contexts/AuthContext"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import { DB_CONFIG } from "@/lib/db-config"

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Cerrar el menú móvil cuando cambia la ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    logout()
    router.push(DB_CONFIG.RUTAS.LOGIN)
  }

  // Si no hay usuario autenticado, no renderizar nada
  if (!user) return null

  const isAdmin = user.rol === DB_CONFIG.ROLES.ADMIN
  const dashboardLink = isAdmin ? DB_CONFIG.RUTAS.ADMIN : DB_CONFIG.RUTAS.PROFESOR

  // Función para cerrar el menú móvil al hacer clic en un enlace
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav 
      className={`navbar navbar-expand-lg fixed-top ${isScrolled ? 'navbar-scrolled' : ''}`}
    >
      <div className="container-fluid px-4">
        <Link 
          className="navbar-brand d-flex align-items-center" 
          href={dashboardLink}
          onClick={handleLinkClick}
        >
          <i className="bi bi-clipboard-check me-2"></i>
          <span className="font-weight-bold">Gestión de Guardias</span>
        </Link>

        {isMobileMenuOpen ? (
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-controls="navbarNav"
            aria-expanded="true"
            aria-label="Toggle navigation"
          >
            <i className="bi bi-x"></i>
          </button>
        ) : (
          <button
            className="navbar-toggler collapsed"
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="bi bi-list"></i>
          </button>
        )}

        <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`} id="navbarNav">
          {/* Menú móvil - Visible solo en móvil */}
          <div className="d-lg-none">
            {/* Enlace a Sala de Guardias en móvil */}
            <div className="mobile-nav-section">
              <div className="mobile-nav-header">
                <small>Sala de Guardias</small>
              </div>
              <Link 
                href={DB_CONFIG.RUTAS.SALA_GUARDIAS}
                className={`nav-link-mobile ${pathname === DB_CONFIG.RUTAS.SALA_GUARDIAS ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <i className="bi bi-display me-2"></i>
                Sala de Guardias
              </Link>
            </div>

            {/* Enlaces específicos de rol en móvil */}
            <div className="mobile-nav-section">
              <div className="mobile-nav-header">
                <small>{isAdmin ? 'Administración' : 'Navegación'}</small>
              </div>
              {isAdmin ? (
                <>
                  <Link 
                    href={DB_CONFIG.RUTAS.ADMIN}
                    className={`nav-link-mobile ${pathname === DB_CONFIG.RUTAS.ADMIN ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </Link>
                  <Link 
                    href={DB_CONFIG.RUTAS.ADMIN_USERS}
                    className={`nav-link-mobile ${pathname.startsWith(DB_CONFIG.RUTAS.ADMIN_USERS) ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-people me-2"></i>
                    Usuarios
                  </Link>
                  <Link 
                    href={DB_CONFIG.RUTAS.ADMIN_GUARDIAS}
                    className={`nav-link-mobile ${pathname.startsWith(DB_CONFIG.RUTAS.ADMIN_GUARDIAS) ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-clipboard-check me-2"></i>
                    Guardias
                  </Link>
                  <Link 
                    href={DB_CONFIG.RUTAS.ADMIN_AUSENCIAS}
                    className={`nav-link-mobile ${pathname.startsWith(DB_CONFIG.RUTAS.ADMIN_AUSENCIAS) ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-calendar-x me-2"></i>
                    Ausencias
                  </Link>
                  <Link 
                    href={DB_CONFIG.RUTAS.ADMIN_HORARIOS}
                    className={`nav-link-mobile ${pathname.startsWith(DB_CONFIG.RUTAS.ADMIN_HORARIOS) ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-calendar3 me-2"></i>
                    Horarios
                  </Link>
                  <Link 
                    href={DB_CONFIG.RUTAS.ADMIN_LUGARES}
                    className={`nav-link-mobile ${pathname.startsWith(DB_CONFIG.RUTAS.ADMIN_LUGARES) ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-geo-alt me-2"></i>
                    Lugares
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href={DB_CONFIG.RUTAS.PROFESOR}
                    className={`nav-link-mobile ${pathname === DB_CONFIG.RUTAS.PROFESOR ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </Link>
                  <Link 
                    href={DB_CONFIG.RUTAS.PROFESOR_HORARIO}
                    className={`nav-link-mobile ${pathname === DB_CONFIG.RUTAS.PROFESOR_HORARIO ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-calendar-week me-2"></i>
                    Mi Horario
                  </Link>
                  <Link 
                    href={DB_CONFIG.RUTAS.PROFESOR_AUSENCIAS}
                    className={`nav-link-mobile ${pathname === DB_CONFIG.RUTAS.PROFESOR_AUSENCIAS ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-calendar-x me-2"></i>
                    Mis Ausencias
                  </Link>
                  <Link 
                    href={DB_CONFIG.RUTAS.PROFESOR_MIS_GUARDIAS}
                    className={`nav-link-mobile ${pathname === DB_CONFIG.RUTAS.PROFESOR_MIS_GUARDIAS ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-clipboard-check me-2"></i>
                    Mis Guardias
                  </Link>
                </>
              )}
            </div>
            
            {/* Toggle de tema para móvil - Solo visible en móvil */}
            <div className="d-flex justify-content-end my-3 d-lg-none">
              <ThemeToggle />
            </div>
            
            {/* Información del usuario en móvil - AL FINAL */}
            <div className="mobile-nav-section mt-3">
              <div className="mobile-nav-header">
                <small>Usuario</small>
              </div>
              <div className="nav-link-mobile">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar-circle me-2">
                    {user.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="fw-bold">{user.nombre} {user.apellido}</div>
                    <div className="small text-muted">{user.email}</div>
                    <div className="small mt-1">
                      <span className="badge rounded-pill text-bg-light">
                        {isAdmin ? "Administrador" : "Profesor"}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="btn btn-outline-danger btn-sm mt-2" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-1"></i>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>

          {/* Menú de usuario - Visible SOLO en desktop */}
          <ul className="navbar-nav ms-auto align-items-center d-none d-lg-flex">
            {/* Enlace a Sala de Guardias - Solo visible en desktop */}
            <li className="nav-item me-3">
              <Link 
                href={DB_CONFIG.RUTAS.SALA_GUARDIAS}
                className={`nav-link px-3 py-2 rounded-pill ${pathname === DB_CONFIG.RUTAS.SALA_GUARDIAS ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <i className="bi bi-display me-1"></i>
                Sala de Guardias
              </Link>
            </li>
            <li className="nav-item me-3">
              <ThemeToggle />
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div className="avatar-circle me-2">
                  {user.nombre.charAt(0).toUpperCase()}
                </div>
                <span className="d-none d-md-inline">{user.nombre}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="navbarDropdown">
                <li>
                  <div className="dropdown-item-text py-2">
                    <div className="fw-bold">{user.nombre} {user.apellido}</div>
                    <div className="small text-muted">{user.email}</div>
                    <div className="badge mt-1 rounded-pill text-bg-light">
                      {isAdmin ? "Administrador" : "Profesor"}
                    </div>
                  </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item d-flex align-items-center" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 