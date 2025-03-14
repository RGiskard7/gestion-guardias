"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  role: "admin" | "profesor"
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path ? "nav-link active" : "nav-link"
  }

  return (
    <div className="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse">
      <div className="position-sticky pt-3">
        <ul className="nav flex-column">
          {role === "admin" ? (
            <>
              <li className="nav-item">
                <Link className={isActive("/admin")} href="/admin">
                  <i className="bi bi-speedometer2"></i> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/admin/users")} href="/admin/users">
                  <i className="bi bi-people"></i> Usuarios
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/admin/horarios")} href="/admin/horarios">
                  <i className="bi bi-calendar3"></i> Horarios
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/admin/lugares")} href="/admin/lugares">
                  <i className="bi bi-geo-alt"></i> Lugares
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/admin/guardias")} href="/admin/guardias">
                  <i className="bi bi-clipboard-check"></i> Guardias
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/admin/estadisticas")} href="/admin/estadisticas">
                  <i className="bi bi-bar-chart"></i> Estadísticas
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className={isActive("/profesor")} href="/profesor">
                  <i className="bi bi-speedometer2"></i> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/profesor/ausencias")} href="/profesor/ausencias">
                  <i className="bi bi-calendar-x"></i> Mis Ausencias
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/profesor/guardias-pendientes")} href="/profesor/guardias-pendientes">
                  <i className="bi bi-list-check"></i> Guardias Pendientes
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/profesor/firmar-guardia")} href="/profesor/firmar-guardia">
                  <i className="bi bi-check-circle"></i> Firmar Guardia
                </Link>
              </li>
            </>
          )}
          <li className="nav-item">
            <Link className={isActive("/sala-guardias")} href="/sala-guardias">
              <i className="bi bi-display"></i> Sala de Guardias
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar

