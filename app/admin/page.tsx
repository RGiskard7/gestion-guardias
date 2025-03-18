"use client"

import Link from "next/link"
import { useState } from "react"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { Usuario } from "@/src/types"
import StatusCard from "@/components/common/StatusCard"
import ActionCard from "@/components/common/ActionCard"

export default function AdminDashboardPage() {
  const { guardias } = useGuardias()
  const { usuarios } = useUsuarios()
  const { lugares } = useLugares()

  // Estadísticas
  const totalUsuarios = usuarios.length
  const totalGuardias = guardias.length
  const totalLugares = lugares.length
  const guardiasCompletadas = guardias.filter(g => g.estado === "Firmada").length

  // Filtrar profesores (rol = profesor)
  const profesores = usuarios.filter(u => u.rol === "profesor")

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]
  
  // Count guardias by estado for today
  const guardiasHoy = guardias.filter((g) => g.fecha === today)
  const pendientesHoy = guardiasHoy.filter((g) => g.estado === "Pendiente").length
  const asignadasHoy = guardiasHoy.filter((g) => g.estado === "Asignada").length
  const firmadasHoy = guardiasHoy.filter((g) => g.estado === "Firmada").length

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4">
        <i className="bi bi-speedometer2 me-3" style={{ fontSize: '2rem', color: '#007bff' }}></i>
        <h1 className="mb-0">Panel de Administración</h1>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <StatusCard 
            title="Profesores" 
            value={profesores.length} 
            icon="people" 
            color="primary"
            subtitle="Total activos"
          />
        </div>
        <div className="col-md-3">
          <StatusCard 
            title="Guardias Pendientes" 
            value={pendientesHoy} 
            icon="hourglass-split" 
            color="warning"
            subtitle="Hoy"
          />
        </div>
        <div className="col-md-3">
          <StatusCard 
            title="Guardias Asignadas" 
            value={asignadasHoy} 
            icon="clipboard-check" 
            color="info"
            subtitle="Hoy"
          />
        </div>
        <div className="col-md-3">
          <StatusCard 
            title="Guardias Firmadas" 
            value={firmadasHoy} 
            icon="check-circle" 
            color="success"
            subtitle="Hoy"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Gestión de Usuarios"
            description="Administra los usuarios del sistema, crea nuevos profesores y asigna roles."
            icon="people"
            linkHref="/admin/users"
            linkText="Gestionar Usuarios"
          />
        </div>
        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Gestión de Guardias"
            description="Administra las guardias, asigna profesores y gestiona su estado."
            icon="clipboard-check"
            linkHref="/admin/guardias"
            linkText="Gestionar Guardias"
            color="info"
          />
        </div>
        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Gestión de Ausencias"
            description="Administra las ausencias de profesores y genera guardias automáticamente."
            icon="calendar-x"
            linkHref="/admin/ausencias"
            linkText="Gestionar Ausencias"
            color="warning"
          />
        </div>
        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Gestión de Horarios"
            description="Administra los horarios de los profesores para la asignación de guardias."
            icon="calendar-week"
            linkHref="/admin/horarios"
            linkText="Gestionar Horarios"
            color="success"
          />
        </div>
        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Gestión de Lugares"
            description="Administra los lugares donde se realizan las guardias."
            icon="geo-alt"
            linkHref="/admin/lugares"
            linkText="Gestionar Lugares"
            color="secondary"
          />
        </div>
        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Sala de Guardias"
            description="Visualiza el estado actual de las guardias en tiempo real."
            icon="display"
            linkHref="/sala-guardias"
            linkText="Ver Sala de Guardias"
            color="primary"
          />
        </div>
        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Estadísticas"
            description="Visualiza estadísticas sobre guardias, ausencias y profesores."
            icon="bar-chart"
            linkHref="/admin/estadisticas"
            linkText="Ver Estadísticas"
            color="danger"
          />
        </div>
      </div>
    </div>
  )
} 