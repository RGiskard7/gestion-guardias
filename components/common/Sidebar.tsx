"use client"

import type React from "react"
import Link from "next/link"
import { useAuth } from "@/src/contexts/AuthContext"

interface SidebarProps {
  role: "admin" | "profesor"
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  return (
    <div className="sidebar d-none d-md-flex flex-column flex-shrink-0 p-3 text-white bg-dark h-100">
      <ul className="nav nav-pills flex-column mb-auto">
        {role === "admin" ? (
          <>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/admin">
                <i className="bi bi-speedometer2 me-2"></i>Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/admin/users">
                <i className="bi bi-people me-2"></i>Usuarios
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/admin/horarios">
                <i className="bi bi-calendar3 me-2"></i>Horarios
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/admin/lugares">
                <i className="bi bi-geo-alt me-2"></i>Lugares
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/admin/guardias">
                <i className="bi bi-clipboard-check me-2"></i>Guardias
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/admin/estadisticas">
                <i className="bi bi-bar-chart me-2"></i>Estadísticas
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/profesor">
                <i className="bi bi-speedometer2 me-2"></i>Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/profesor/horario">
                <i className="bi bi-calendar-week me-2"></i>Mi Horario
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/profesor/ausencias">
                <i className="bi bi-calendar-x me-2"></i>Mis Ausencias
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/profesor/guardias-pendientes">
                <i className="bi bi-list-check me-2"></i>Guardias Pendientes
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/profesor/firmar-guardia">
                <i className="bi bi-check-circle me-2"></i>Firmar Guardia
              </Link>
            </li>
          </>
        )}
        <li className="nav-item">
          <Link className="nav-link text-white" href="/sala-guardias">
            <i className="bi bi-display me-2"></i>Sala de Guardias
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default Sidebar 