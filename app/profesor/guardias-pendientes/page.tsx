"use client"

import { useState } from "react"
import { useGuardias } from "../../../src/contexts/GuardiasContext"
import { useAuth } from "../../../src/contexts/AuthContext"
import GuardiaCard from "@/app/guardia/guardia-card"

export default function GuardiasPendientesPage() {
  const { user } = useAuth()
  const { guardias, horarios, asignarGuardia } = useGuardias()
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])

  if (!user) return null

  // Get profesor's schedules
  const misHorarios = horarios.filter((h) => h.profesorId === user.id)

  // Filter guardias pendientes for selected date
  const guardiasPendientes = guardias.filter((g) => {
    // La guardia debe estar pendiente y ser de la fecha seleccionada
    const esPendiente = g.estado === "Pendiente" && g.fecha === selectedDate

    // Verificar si el profesor tiene horario disponible en ese tramo
    const tieneHorarioOcupado = misHorarios.some(
      (h) => h.diaSemana === new Date(g.fecha).toLocaleDateString("es-ES", { weekday: "long" }) && 
             h.tramoHorario === g.tramoHorario
    )

    // Solo mostrar las guardias donde el profesor no tiene clase
    return esPendiente && !tieneHorarioOcupado
  })

  // Handle asignar guardia
  const handleAsignarGuardia = (guardiaId: number) => {
    if (window.confirm("¿Estás seguro de que quieres asignarte esta guardia?")) {
      asignarGuardia(guardiaId, user.id)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Guardias Pendientes</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">Fecha</span>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Seleccionar fecha para ver guardias pendientes"
            />
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        Mostrando guardias pendientes para: <strong>{formatDate(selectedDate)}</strong>
      </div>

      {guardiasPendientes.length === 0 ? (
        <div className="alert alert-warning">
          No hay guardias pendientes disponibles para la fecha seleccionada o no tienes horario disponible.
        </div>
      ) : (
        <div className="row">
          {guardiasPendientes.map((guardia) => (
            <div key={guardia.id} className="col-md-6 col-lg-4 mb-3">
              <GuardiaCard
                guardia={guardia}
                showActions={true}
                onAsignar={handleAsignarGuardia}
              />
            </div>
          ))}
        </div>
      )}

      <div className="card mt-4">
        <div className="card-header">Mi Horario</div>
        <div className="card-body">
          {misHorarios.length === 0 ? (
            <div className="alert alert-info">No tienes horarios asignados.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Día</th>
                    <th>Tramo Horario</th>
                  </tr>
                </thead>
                <tbody>
                  {misHorarios.map((horario, index) => (
                    <tr key={index}>
                      <td>{horario.diaSemana}</td>
                      <td>{horario.tramoHorario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 