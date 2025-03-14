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
    return pathname === path ? "nav-link active text-white" : "nav-link text-white"
  }

  return (
    <div className="col-md-3 col-lg-2 sidebar d-none d-md-block bg-dark min-vh-100">
      <div className="position-sticky pt-3">
        <ul className="nav flex-column">
          {role === "admin" ? (
            <>
              <li className="nav-item">
                <Link className={isActive("/admin")} href="/admin">
                  <i className="bi bi-speedometer2 me-2"></i> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/admin/users")} href="/admin/users">
                  <i className="bi bi-people me-2"></i> Usuarios
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/admin/horarios")} href="/admin/horarios">
                  <i className="bi bi-calendar3 me-2"></i> Horarios
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/admin/lugares")} href="/admin/lugares">
                  <i className="bi bi-geo-alt me-2"></i> Lugares
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/admin/guardias")} href="/admin/guardias">
                  <i className="bi bi-clipboard-check me-2"></i> Guardias
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/admin/estadisticas")} href="/admin/estadisticas">
                  <i className="bi bi-bar-chart me-2"></i> Estadísticas
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className={isActive("/profesor")} href="/profesor">
                  <i className="bi bi-speedometer2 me-2"></i> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/profesor/ausencias")} href="/profesor/ausencias">
                  <i className="bi bi-calendar-x me-2"></i> Mis Ausencias
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/profesor/guardias-pendientes")} href="/profesor/guardias-pendientes">
                  <i className="bi bi-list-check me-2"></i> Guardias Pendientes
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive("/profesor/firmar-guardia")} href="/profesor/firmar-guardia">
                  <i className="bi bi-check-circle me-2"></i> Firmar Guardia
                </Link>
              </li>
            </>
          )}
          <li className="nav-item">
            <Link className={isActive("/sala-guardias")} href="/sala-guardias">
              <i className="bi bi-display me-2"></i> Sala de Guardias
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar

