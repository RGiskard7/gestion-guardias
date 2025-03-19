"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useHorarios } from "@/src/contexts/HorariosContext"
import { useAusencias } from "@/src/contexts/AusenciasContext"
import { useAuth } from "@/src/contexts/AuthContext"
import { Horario } from "@/src/types"
import StatusCard from "@/components/common/StatusCard"
import ActionCard from "@/components/common/ActionCard"
import DataCard from "@/components/common/DataCard"
import { DB_CONFIG, getDuracionTramo } from "@/lib/db-config"

export default function ProfesorDashboardPage() {
  const { user } = useAuth()
  const { guardias } = useGuardias()
  const { horarios } = useHorarios()
  const { ausencias } = useAusencias()

  if (!user) return null

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]
  
  // Función para obtener el lunes de la semana actual
  const getStartOfWeek = () => {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = domingo, 1 = lunes, ...
    // Ajustar para que semana comience el lunes (Si es domingo, restar 6 días, sino restar dayOfWeek - 1)
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = new Date(now)
    monday.setDate(now.getDate() - diff)
    monday.setHours(0, 0, 0, 0)
    return monday
  }
  
  // Función para obtener el viernes de la semana actual
  const getEndOfWeek = () => {
    const monday = getStartOfWeek()
    const friday = new Date(monday)
    friday.setDate(monday.getDate() + 4) // 4 días después del lunes es viernes
    friday.setHours(23, 59, 59, 999)
    return friday
  }
  
  // Obtener las fechas de inicio y fin de la semana actual
  const startOfWeek = getStartOfWeek()
  const endOfWeek = getEndOfWeek()

  // Get ausencias where the profesor is ausente
  const misAusencias = ausencias.filter((a) => a.profesorId === user.id)
  const ausenciasHoy = misAusencias.filter((a) => a.fecha === today)

  // Get guardias where the profesor is cubridor
  const misGuardias = guardias.filter((g) => g.profesorCubridorId === user.id)
  const guardiasPendientesFirma = misGuardias.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA)
  
  // Obtener guardias firmadas de la semana actual
  const misGuardiasFirmadasSemana = misGuardias.filter((g) => {
    const fechaGuardia = new Date(g.fecha)
    return g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA && 
           fechaGuardia >= startOfWeek && 
           fechaGuardia <= endOfWeek
  })
  
  // Calcular total de horas de guardia en la semana
  const totalHorasSemanales = misGuardiasFirmadasSemana.reduce((total, guardia) => {
    const duracionTramo = getDuracionTramo(guardia.tramoHorario)
    return total + duracionTramo
  }, 0)

  // Get guardias pendientes that the profesor could cover
  const guardiasPendientes = guardias.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE)

  // Get horarios of the profesor
  const misHorarios = horarios.filter((h) => h.profesorId === user.id)

  // Filter guardias for today
  const guardiasHoy = guardias.filter((g) => g.fecha === today)
  const pendientes = guardiasHoy.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE).length
  const asignadas = guardiasHoy.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA).length
  const firmadas = guardiasHoy.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA).length

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4">
        <i className="bi bi-speedometer2 me-3" style={{ fontSize: '2rem', color: '#007bff' }}></i>
        <h1 className="mb-0">Panel de Profesor</h1>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <StatusCard 
            title="Guardias Pendientes" 
            value={pendientes} 
            icon="hourglass-split" 
            color="warning"
            subtitle="Hoy"
          />
        </div>
        <div className="col-md-3">
          <StatusCard 
            title="Guardias Asignadas" 
            value={asignadas} 
            icon="clipboard-check" 
            color="info"
            subtitle="Hoy"
          />
        </div>
        <div className="col-md-3">
          <StatusCard 
            title="Guardias Firmadas" 
            value={firmadas} 
            icon="check-circle" 
            color="success"
            subtitle="Hoy"
          />
        </div>
        <div className="col-md-3">
          <StatusCard 
            title="Horas de Guardia" 
            value={totalHorasSemanales.toString()}
            icon="clock-history" 
            color="primary"
            subtitle={`Semana (${startOfWeek.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit'})} - ${endOfWeek.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit'})})`}
          />
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Mis Ausencias"
            description="Gestiona tus ausencias y permisos."
            icon="calendar-x"
            linkHref={DB_CONFIG.RUTAS.PROFESOR_AUSENCIAS}
            linkText="Gestionar Ausencias"
            color="warning"
          />
        </div>

        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Mis Guardias"
            description="Revisa y gestiona todas tus guardias."
            icon="clipboard-check"
            linkHref={DB_CONFIG.RUTAS.PROFESOR_MIS_GUARDIAS}
            linkText="Ver Guardias"
            color="info"
          />
        </div>

        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Sala de Guardias"
            description="Visualiza el estado actual de las guardias."
            icon="display"
            linkHref={DB_CONFIG.RUTAS.SALA_GUARDIAS}
            linkText="Ver Sala"
            color="primary"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <DataCard
            title="Mi Horario de Guardias"
            icon="calendar-week"
          >
            {misHorarios.length === 0 ? (
              <div className="alert alert-info d-flex align-items-center">
                <i className="bi bi-info-circle me-2"></i>
                {DB_CONFIG.ETIQUETAS.MENSAJES.SIN_HORARIOS}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th><i className="bi bi-calendar-day me-2"></i>Día</th>
                      <th><i className="bi bi-clock me-2"></i>Tramo Horario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {misHorarios.map((horario) => (
                      <tr key={horario.id}>
                        <td>{horario.diaSemana}</td>
                        <td>{horario.tramoHorario}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-3 text-end">
              <Link href={DB_CONFIG.RUTAS.PROFESOR_HORARIO} className="btn btn-sm btn-outline-primary">
                <i className="bi bi-calendar-week me-1"></i>
                Ver horario semanal
              </Link>
            </div>
          </DataCard>
        </div>

        <div className="col-md-6 mb-4">
          <DataCard
            title="Guardias Pendientes de Firma"
            icon="pen"
          >
            {guardiasPendientesFirma.length === 0 ? (
              <div className="alert alert-info d-flex align-items-center">
                <i className="bi bi-info-circle me-2"></i>
                {DB_CONFIG.ETIQUETAS.MENSAJES.SIN_GUARDIAS_FIRMA}
              </div>
            ) : (
              <div className="list-group">
                {guardiasPendientesFirma.slice(0, DB_CONFIG.LIMITES.LISTA_PREVIEW).map((guardia) => (
                  <Link
                    key={guardia.id}
                    href={`${DB_CONFIG.RUTAS.PROFESOR_MIS_GUARDIAS}?tab=por-firmar`}
                    className="list-group-item list-group-item-action"
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">
                        <i className="bi bi-calendar-date me-2"></i>
                        {new Date(guardia.fecha).toLocaleDateString("es-ES")} - {guardia.tramoHorario}
                      </h5>
                      <small><span className="badge bg-info">{guardia.tipoGuardia}</span></small>
                    </div>
                    <p className="mb-1"><i className="bi bi-exclamation-circle me-2"></i>{DB_CONFIG.ETIQUETAS.GUARDIAS.PENDIENTE_FIRMA}</p>
                  </Link>
                ))}
                {guardiasPendientesFirma.length > DB_CONFIG.LIMITES.LISTA_PREVIEW && (
                  <Link href={`${DB_CONFIG.RUTAS.PROFESOR_MIS_GUARDIAS}?tab=por-firmar`} className="list-group-item list-group-item-action text-center">
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    Ver todas ({guardiasPendientesFirma.length})
                  </Link>
                )}
              </div>
            )}
          </DataCard>
        </div>
      </div>
    </div>
  )
} 