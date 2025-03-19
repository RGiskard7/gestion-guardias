"use client"

import Link from "next/link"
import { useState } from "react"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { Usuario } from "@/src/types"
import StatusCard from "@/components/common/StatusCard"
import ActionCard from "@/components/common/ActionCard"
import { DB_CONFIG } from "@/lib/db-config"

export default function AdminDashboardPage() {
  const { guardias } = useGuardias()
  const { usuarios } = useUsuarios()
  const { lugares } = useLugares()

  // Estadísticas
  const totalUsuarios = usuarios.length
  const totalGuardias = guardias.length
  const totalLugares = lugares.length
  const guardiasCompletadas = guardias.filter(g => g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA).length

  // Filtrar profesores (rol = profesor)
  const profesores = usuarios.filter(u => u.rol === DB_CONFIG.ROLES.PROFESOR)

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]
  
  // Count guardias by estado for today
  const guardiasHoy = guardias.filter((g) => g.fecha === today)
  const pendientesHoy = guardiasHoy.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE).length
  const asignadasHoy = guardiasHoy.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA).length
  const firmadasHoy = guardiasHoy.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA).length
  const profesoresActivos = profesores.filter(p => p.activo).length

  return (
    <div className="container py-5">
      <div className="mb-5">
        <h1 className="page-title">Panel de Administración</h1>
        <p className="text-muted">Bienvenido al panel de control de gestión de guardias</p>
      </div>

      <div className="mb-5">
        <h2 className="h5 mb-4">Resumen de hoy</h2>
        <div className="row g-3">
          <div className="col-xl-3 col-md-6 mb-3">
            <StatusCard 
              title="Profesores Activos" 
              value={profesoresActivos} 
              icon="people" 
              color="primary"
              subtitle="Total activos"
            />
          </div>
          <div className="col-xl-3 col-md-6 mb-3">
            <StatusCard 
              title="Guardias Pendientes" 
              value={pendientesHoy} 
              icon="hourglass-split" 
              color="warning"
              subtitle="Hoy"
            />
          </div>
          <div className="col-xl-3 col-md-6 mb-3">
            <StatusCard 
              title="Guardias Asignadas" 
              value={asignadasHoy} 
              icon="clipboard-check" 
              color="info"
              subtitle="Sin firmar"
            />
          </div>
          <div className="col-xl-3 col-md-6 mb-3">
            <StatusCard 
              title="Guardias Firmadas" 
              value={firmadasHoy} 
              icon="check-circle" 
              color="success"
              subtitle="Completadas hoy"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="h5 mb-4">Gestión del sistema</h2>
        <div className="row g-3">
          <div className="col-lg-4 col-md-6 mb-3">
            <ActionCard
              title="Gestión de Usuarios"
              description="Administra los usuarios del sistema, crea nuevos profesores y asigna roles."
              icon="people"
              linkHref={DB_CONFIG.RUTAS.ADMIN_USERS}
              linkText="Gestionar Usuarios"
            />
          </div>
          <div className="col-lg-4 col-md-6 mb-3">
            <ActionCard
              title="Gestión de Guardias"
              description="Administra las guardias, asigna profesores y gestiona su estado."
              icon="clipboard-check"
              linkHref={DB_CONFIG.RUTAS.ADMIN_GUARDIAS}
              linkText="Gestionar Guardias"
              color="info"
            />
          </div>
          <div className="col-lg-4 col-md-6 mb-3">
            <ActionCard
              title="Gestión de Ausencias"
              description="Administra las ausencias de profesores y genera guardias automáticamente."
              icon="calendar-x"
              linkHref={DB_CONFIG.RUTAS.ADMIN_AUSENCIAS}
              linkText="Gestionar Ausencias"
              color="warning"
            />
          </div>
          <div className="col-lg-4 col-md-6 mb-3">
            <ActionCard
              title="Gestión de Horarios"
              description="Administra los horarios de los profesores para la asignación de guardias."
              icon="calendar-week"
              linkHref={DB_CONFIG.RUTAS.ADMIN_HORARIOS}
              linkText="Gestionar Horarios"
              color="success"
            />
          </div>
          <div className="col-lg-4 col-md-6 mb-3">
            <ActionCard
              title="Gestión de Lugares"
              description="Administra los lugares donde se realizan las guardias."
              icon="geo-alt"
              linkHref={DB_CONFIG.RUTAS.ADMIN_LUGARES}
              linkText="Gestionar Lugares"
              color="secondary"
            />
          </div>
          <div className="col-lg-4 col-md-6 mb-3">
            <ActionCard
              title="Sala de Guardias"
              description="Visualiza el estado actual de las guardias en tiempo real."
              icon="display"
              linkHref={DB_CONFIG.RUTAS.SALA_GUARDIAS}
              linkText="Ver Sala de Guardias"
              color="primary"
            />
          </div>
          <div className="col-lg-4 col-md-6 mb-3">
            <ActionCard
              title="Estadísticas"
              description="Visualiza estadísticas sobre guardias, ausencias y profesores."
              icon="bar-chart"
              linkHref={DB_CONFIG.RUTAS.ADMIN_ESTADISTICAS}
              linkText="Ver Estadísticas"
              color="danger"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 