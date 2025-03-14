"use client"

import type React from "react"
import { type Guardia, type Lugar, type Usuario, type TareaGuardia, useGuardias } from "@/src/contexts/GuardiasContext"

interface GuardiaCardProps {
  guardia: Guardia
  showActions?: boolean
  onAsignar?: (guardiaId: number) => void
  onFirmar?: (guardiaId: number) => void
}

const GuardiaCard: React.FC<GuardiaCardProps> = ({ guardia, showActions = false, onAsignar, onFirmar }) => {
  const { getLugarById, getUsuarioById, getTareasByGuardia } = useGuardias()

  const lugar: Lugar | undefined = getLugarById(guardia.lugarId)
  const profesorAusente: Usuario | undefined = guardia.profesorAusenteId
    ? getUsuarioById(guardia.profesorAusenteId)
    : undefined
  const profesorCubridor: Usuario | undefined = guardia.profesorCubridorId
    ? getUsuarioById(guardia.profesorCubridorId)
    : undefined
  const tareas: TareaGuardia[] = getTareasByGuardia(guardia.id)

  // Format date to display in Spanish format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Get badge class based on guardia status
  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "badge bg-warning text-dark"
      case "Asignada":
        return "badge bg-info"
      case "Firmada":
        return "badge bg-success"
      case "Anulada":
        return "badge bg-danger"
      default:
        return "badge bg-secondary"
    }
  }

  return (
    <div className="card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <span className={getBadgeClass(guardia.estado)}>{guardia.estado}</span>
          <span className="ms-2">
            {formatDate(guardia.fecha)} - {guardia.tramoHorario}
          </span>
        </div>
        <div>
          <span className="badge bg-primary">{guardia.tipoGuardia}</span>
        </div>
      </div>
      <div className="card-body">
        <h5 className="card-title">{lugar ? `${lugar.codigo} - ${lugar.descripcion}` : "Lugar no especificado"}</h5>

        <div className="row mb-3">
          <div className="col-md-6">
            <p className="mb-1">
              <strong>Profesor ausente:</strong>
            </p>
            <p>{profesorAusente ? profesorAusente.nombre : "No especificado"}</p>
          </div>
          <div className="col-md-6">
            <p className="mb-1">
              <strong>Profesor cubridor:</strong>
            </p>
            <p>{profesorCubridor ? profesorCubridor.nombre : "Pendiente de asignar"}</p>
          </div>
        </div>

        {tareas.length > 0 && (
          <div className="mb-3">
            <h6>Tareas:</h6>
            <ul className="list-group">
              {tareas.map((tarea) => (
                <li key={tarea.id} className="list-group-item">
                  {tarea.descripcionTarea}
                </li>
              ))}
            </ul>
          </div>
        )}

        {guardia.observaciones && (
          <div className="mb-3">
            <h6>Observaciones:</h6>
            <p>{guardia.observaciones}</p>
          </div>
        )}

        {showActions && (
          <div className="d-flex justify-content-end">
            {guardia.estado === "Pendiente" && onAsignar && (
              <button className="btn btn-primary me-2" onClick={() => onAsignar(guardia.id)}>
                Asignarme esta guardia
              </button>
            )}

            {guardia.estado === "Asignada" && onFirmar && (
              <button className="btn btn-success" onClick={() => onFirmar(guardia.id)}>
                Firmar guardia
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GuardiaCard 