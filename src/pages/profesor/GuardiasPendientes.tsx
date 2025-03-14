"use client"

import type React from "react"
import { useState } from "react"
import Layout from "../../components/Layout"
import GuardiaCard from "../../components/GuardiaCard"
import { useGuardias } from "../../contexts/GuardiasContext"
import { useAuth } from "../../contexts/AuthContext"

const GuardiasPendientes: React.FC = () => {
  const { user } = useAuth()
  const { guardias, asignarGuardia, canProfesorAsignarGuardia, getHorariosByProfesor } = useGuardias()

  if (!user) return null

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])

  // Get profesor's horarios
  const misHorarios = getHorariosByProfesor(user.id)

  // Get guardias pendientes for the selected date
  const guardiasPendientes = guardias.filter((g) => g.estado === "Pendiente" && g.fecha === selectedDate)

  // Filter guardias that the profesor can cover
  const guardiasDisponibles = guardiasPendientes.filter((g) => canProfesorAsignarGuardia(g.id, user.id))

  // Handle asignar guardia
  const handleAsignarGuardia = (guardiaId: number) => {
    if (window.confirm("¿Estás seguro de que quieres asignarte esta guardia?")) {
      const success = asignarGuardia(guardiaId, user.id)

      if (!success) {
        alert("No se pudo asignar la guardia. Verifica que cumples con los requisitos.")
      }
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Layout title="Guardias Pendientes">
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">Fecha</span>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        Mostrando guardias pendientes para: <strong>{formatDate(selectedDate)}</strong>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">Mi Horario de Guardias</div>
            <div className="card-body">
              {misHorarios.length === 0 ? (
                <div className="alert alert-warning">
                  No tienes horarios de guardia asignados. Contacta con el administrador.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Día</th>
                        <th>Tramo Horario</th>
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
            </div>
          </div>
        </div>
      </div>

      {guardiasPendientes.length === 0 ? (
        <div className="alert alert-success">No hay guardias pendientes para esta fecha.</div>
      ) : guardiasDisponibles.length === 0 ? (
        <div className="alert alert-warning">
          Hay {guardiasPendientes.length} guardias pendientes, pero no puedes asignarte ninguna. Posibles razones:
          <ul className="mt-2">
            <li>No coinciden con tu horario de guardia</li>
            <li>Ya tienes una guardia asignada en ese tramo horario</li>
            <li>Has superado el límite de guardias semanales</li>
          </ul>
        </div>
      ) : (
        <div className="row">
          {guardiasDisponibles.map((guardia) => (
            <div key={guardia.id} className="col-md-6 col-lg-4 mb-3">
              <GuardiaCard guardia={guardia} showActions={true} onAsignar={handleAsignarGuardia} />
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

export default GuardiasPendientes

