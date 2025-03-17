"use client"

import Link from "next/link"
import { useState } from "react"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useHorarios } from "@/src/contexts/HorariosContext"
import { useAusencias } from "@/src/contexts/AusenciasContext"
import { useAuth } from "@/src/contexts/AuthContext"
import { Horario } from "@/src/types"
import StatusCard from "@/components/common/StatusCard"
import ActionCard from "@/components/common/ActionCard"
import DataCard from "@/components/common/DataCard"

export default function ProfesorDashboardPage() {
  const { user } = useAuth()
  const { guardias } = useGuardias()
  const { horarios } = useHorarios()
  const { ausencias } = useAusencias()

  if (!user) return null

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // Get ausencias where the profesor is ausente
  const misAusencias = ausencias.filter((a) => a.profesorId === user.id)
  const ausenciasHoy = misAusencias.filter((a) => a.fecha === today)

  // Get guardias where the profesor is cubridor
  const misGuardias = guardias.filter((g) => g.profesorCubridorId === user.id)
  const guardiasPendientesFirma = misGuardias.filter((g) => g.estado === "Asignada")

  // Get guardias pendientes that the profesor could cover
  const guardiasPendientes = guardias.filter((g) => g.estado === "Pendiente")

  // Get horarios of the profesor
  const misHorarios = horarios.filter((h) => h.profesorId === user.id)

  // Filter guardias for today
  const guardiasHoy = guardias.filter((g) => g.fecha === today)
  const pendientes = guardiasHoy.filter((g) => g.estado === "Pendiente").length
  const asignadas = guardiasHoy.filter((g) => g.estado === "Asignada").length
  const firmadas = guardiasHoy.filter((g) => g.estado === "Firmada").length

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4">
        <i className="bi bi-speedometer2 me-3" style={{ fontSize: '2rem', color: '#007bff' }}></i>
        <h1 className="mb-0">Panel de Profesor</h1>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <StatusCard 
            title="Guardias Pendientes" 
            value={pendientes} 
            icon="hourglass-split" 
            color="warning"
            subtitle="Hoy"
          />
        </div>
        <div className="col-md-4">
          <StatusCard 
            title="Guardias Asignadas" 
            value={asignadas} 
            icon="clipboard-check" 
            color="info"
            subtitle="Hoy"
          />
        </div>
        <div className="col-md-4">
          <StatusCard 
            title="Guardias Firmadas" 
            value={firmadas} 
            icon="check-circle" 
            color="success"
            subtitle="Hoy"
          />
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Mis Ausencias"
            description="Gestiona tus ausencias y permisos."
            icon="calendar-x"
            linkHref="/profesor/ausencias"
            linkText="Gestionar Ausencias"
            color="warning"
          />
        </div>

        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Guardias Pendientes"
            description="Revisa las guardias que tienes asignadas."
            icon="clipboard-check"
            linkHref="/profesor/guardias-pendientes"
            linkText="Ver Guardias"
            color="info"
          />
        </div>

        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Sala de Guardias"
            description="Visualiza el estado actual de las guardias."
            icon="display"
            linkHref="/sala-guardias"
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
                No tienes horarios de guardia asignados.
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
              <Link href="/profesor/horario" className="btn btn-sm btn-outline-primary">
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
                No tienes guardias pendientes de firma.
              </div>
            ) : (
              <div className="list-group">
                {guardiasPendientesFirma.slice(0, 5).map((guardia) => (
                  <Link
                    key={guardia.id}
                    href="/profesor/firmar-guardia"
                    className="list-group-item list-group-item-action"
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">
                        <i className="bi bi-calendar-date me-2"></i>
                        {new Date(guardia.fecha).toLocaleDateString("es-ES")} - {guardia.tramoHorario}
                      </h5>
                      <small><span className="badge bg-info">{guardia.tipoGuardia}</span></small>
                    </div>
                    <p className="mb-1"><i className="bi bi-exclamation-circle me-2"></i>Pendiente de firma</p>
                  </Link>
                ))}
                {guardiasPendientesFirma.length > 5 && (
                  <Link href="/profesor/firmar-guardia" className="list-group-item list-group-item-action text-center">
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