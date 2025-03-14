"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: 'bi-speedometer2' },
    { href: '/admin/users', label: 'Usuarios', icon: 'bi-people' },
    { href: '/admin/horarios', label: 'Horarios', icon: 'bi-calendar3' },
    { href: '/admin/lugares', label: 'Lugares', icon: 'bi-geo-alt' },
    { href: '/admin/guardias', label: 'Guardias', icon: 'bi-clipboard-check' },
    { href: '/admin/estadisticas', label: 'Estadísticas', icon: 'bi-bar-chart' },
  ]

  const profesorLinks = [
    { href: '/profesor', label: 'Dashboard', icon: 'bi-speedometer2' },
    { href: '/profesor/ausencias', label: 'Mis Ausencias', icon: 'bi-calendar-x' },
    { href: '/profesor/guardias-pendientes', label: 'Guardias Pendientes', icon: 'bi-list-check' },
    { href: '/profesor/firmar-guardia', label: 'Firmar Guardia', icon: 'bi-pen' },
  ]

  const links = user?.rol === 'admin' ? adminLinks : profesorLinks

  return (
    <div className="bg-dark text-white" style={{ width: '250px', minHeight: '100vh' }}>
      <div className="d-flex flex-column p-3">
        <ul className="nav nav-pills flex-column mb-auto">
          {links.map((link) => (
            <li key={link.href} className="nav-item">
              <Link
                href={link.href}
                className={`nav-link text-white ${pathname === link.href ? 'active' : ''}`}
              >
                <i className={`bi ${link.icon} me-2`}></i>
                {link.label}
              </Link>
            </li>
          ))}
          <li className="nav-item mt-3">
            <Link href="/sala-guardias" className={`nav-link text-white ${pathname === '/sala-guardias' ? 'active' : ''}`}>
              <i className="bi bi-display me-2"></i>
              Sala de Guardias
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
} 