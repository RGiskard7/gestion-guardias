"use client"

import type React from "react"
import Link from "next/link"
import { DB_CONFIG } from "@/lib/db-config"
import { useAuth } from "@/src/contexts/AuthContext"

interface SidebarProps {
  role: typeof DB_CONFIG.ROLES.ADMIN | typeof DB_CONFIG.ROLES.PROFESOR
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  return (
    <div className="sidebar d-none d-md-flex flex-column flex-shrink-0 p-3 text-white bg-dark h-100">
      <ul className="nav nav-pills flex-column mb-auto">
        {role === "admin" ? (
          <>
            <li className="nav-item">
              <Link className="nav-link text-white" href={DB_CONFIG.RUTAS.ADMIN}>
                <i className="bi bi-speedometer2 me-2"></i>Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href={DB_CONFIG.RUTAS.ADMIN_USERS}>
                <i className="bi bi-people me-2"></i>Usuarios
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href={DB_CONFIG.RUTAS.ADMIN_HORARIOS}>
                <i className="bi bi-calendar3 me-2"></i>Horarios
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href={DB_CONFIG.RUTAS.ADMIN_LUGARES}>
                <i className="bi bi-geo-alt me-2"></i>Lugares
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href={DB_CONFIG.RUTAS.ADMIN_GUARDIAS}>
                <i className="bi bi-clipboard-check me-2"></i>Guardias
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href={DB_CONFIG.RUTAS.ADMIN_AUSENCIAS}>
                <i className="bi bi-calendar-x me-2"></i>Ausencias
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href={DB_CONFIG.RUTAS.ADMIN_ESTADISTICAS}>
                <i className="bi bi-bar-chart me-2"></i>Estadísticas
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/admin/configuracion">
                <i className="bi bi-gear me-2"></i>Configuración
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <Link className="nav-link text-white" href={DB_CONFIG.RUTAS.PROFESOR}>
                <i className="bi bi-speedometer2 me-2"></i>Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href={DB_CONFIG.RUTAS.PROFESOR_HORARIO}>
                <i className="bi bi-calendar-week me-2"></i>Mi Horario
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href={DB_CONFIG.RUTAS.PROFESOR_AUSENCIAS}>
                <i className="bi bi-calendar-x me-2"></i>Mis Ausencias
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href={DB_CONFIG.RUTAS.PROFESOR_MIS_GUARDIAS}>
                <i className="bi bi-clipboard-check me-2"></i>Mis Guardias
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  )
}

export default Sidebar 