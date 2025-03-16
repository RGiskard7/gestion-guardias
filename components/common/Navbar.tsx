"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/src/contexts/AuthContext"
import { ThemeToggle } from "@/components/common/ThemeToggle"

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!user) return null

  return (
    <nav className="navbar navbar-expand-md navbar-custom">
      <div className="container-fluid">
        <Link className="navbar-brand" href={user.rol === "admin" ? "/admin" : "/profesor"}>
          Gestión de Guardias
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon text-white"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Menú móvil - Solo visible en pantallas pequeñas */}
          <ul className="navbar-nav d-md-none">
            {user.rol === "admin" ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/admin">
                    <i className="bi bi-speedometer2 me-2"></i>Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/admin/users">
                    <i className="bi bi-people me-2"></i>Usuarios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/admin/horarios">
                    <i className="bi bi-calendar3 me-2"></i>Horarios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/admin/lugares">
                    <i className="bi bi-geo-alt me-2"></i>Lugares
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/admin/guardias">
                    <i className="bi bi-clipboard-check me-2"></i>Guardias
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/admin/estadisticas">
                    <i className="bi bi-bar-chart me-2"></i>Estadísticas
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/profesor">
                    <i className="bi bi-speedometer2 me-2"></i>Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/profesor/horario">
                    <i className="bi bi-calendar-week me-2"></i>Mi Horario
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/profesor/ausencias">
                    <i className="bi bi-calendar-x me-2"></i>Mis Ausencias
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/profesor/guardias-pendientes">
                    <i className="bi bi-list-check me-2"></i>Guardias Pendientes
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/profesor/firmar-guardia">
                    <i className="bi bi-check-circle me-2"></i>Firmar Guardia
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <Link className="nav-link" href="/sala-guardias">
                <i className="bi bi-display me-2"></i>Sala de Guardias
              </Link>
            </li>
            <li className="nav-item">
              <hr className="dropdown-divider bg-secondary my-2" />
            </li>
            <li className="nav-item">
              <button className="nav-link text-danger w-100 text-start" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
              </button>
            </li>
          </ul>

          {/* Menú de usuario - Visible en todas las pantallas */}
          <ul className="navbar-nav ms-auto">
            <li className="nav-item me-2 d-flex align-items-center">
              <ThemeToggle />
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {user.nombre}
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                <li>
                  <span className="dropdown-item-text text-muted">
                    {user.rol === "admin" ? "Administrador" : "Profesor"}
                  </span>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
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