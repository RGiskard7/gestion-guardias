"use client"

import Link from "next/link"
import { useGuardias } from "../../src/contexts/GuardiasContext"
import { useAuth } from "../../src/contexts/AuthContext"

export default function ProfesorDashboardPage() {
  const { user } = useAuth()
  const { guardias, horarios } = useGuardias()

  if (!user) return null

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // Get guardias where the profesor is ausente
  const misAusencias = guardias.filter((g) => g.profesorAusenteId === user.id)
  const ausenciasHoy = misAusencias.filter((g) => g.fecha === today)

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
    <div className="container-fluid">
      <div className="d-flex align-items-center mb-4">
        <i className="bi bi-speedometer2 me-3" style={{ fontSize: '2rem', color: '#007bff' }}></i>
        <h1 className="h3 mb-0">Panel de Profesor</h1>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="card-title">Guardias Pendientes</h5>
                  <p className="card-text display-4">{pendientes}</p>
                  <p className="card-text">Hoy</p>
                </div>
                <i className="bi bi-hourglass-split" style={{ fontSize: '2.5rem', opacity: '0.5' }}></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-info mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="card-title">Guardias Asignadas</h5>
                  <p className="card-text display-4">{asignadas}</p>
                  <p className="card-text">Hoy</p>
                </div>
                <i className="bi bi-clipboard-check" style={{ fontSize: '2.5rem', opacity: '0.5' }}></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="card-title">Guardias Firmadas</h5>
                  <p className="card-text display-4">{firmadas}</p>
                  <p className="card-text">Hoy</p>
                </div>
                <i className="bi bi-check-circle" style={{ fontSize: '2.5rem', opacity: '0.5' }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card dashboard-card">
            <div className="card-body">
              <div className="dashboard-icon">
                <i className="bi bi-calendar-x"></i>
              </div>
              <h5 className="card-title">Mis Ausencias</h5>
              <p className="card-text">Gestiona tus ausencias y permisos.</p>
              <Link href="/profesor/ausencias" className="btn btn-primary">
                <i className="bi bi-arrow-right-circle me-2"></i>
                Gestionar
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card dashboard-card">
            <div className="card-body">
              <div className="dashboard-icon">
                <i className="bi bi-clipboard-check"></i>
              </div>
              <h5 className="card-title">Guardias Pendientes</h5>
              <p className="card-text">Revisa las guardias que tienes asignadas.</p>
              <Link href="/profesor/guardias-pendientes" className="btn btn-primary">
                <i className="bi bi-arrow-right-circle me-2"></i>
                Ver Guardias
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card dashboard-card">
            <div className="card-body">
              <div className="dashboard-icon">
                <i className="bi bi-display"></i>
              </div>
              <h5 className="card-title">Sala de Guardias</h5>
              <p className="card-text">Visualiza el estado actual de las guardias.</p>
              <Link href="/sala-guardias" className="btn btn-primary">
                <i className="bi bi-arrow-right-circle me-2"></i>
                Ver Sala
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex align-items-center">
              <i className="bi bi-calendar-week me-2"></i>
              Mi Horario de Guardias
            </div>
            <div className="card-body">
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
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex align-items-center">
              <i className="bi bi-pen me-2"></i>
              Guardias Pendientes de Firma
            </div>
            <div className="card-body">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 