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

  // Get background color based on guardia status
  const getBackgroundColor = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "bg-warning bg-opacity-10 border-warning"
      case "Asignada":
        return "bg-info bg-opacity-10 border-info"
      case "Firmada":
        return "bg-success bg-opacity-10 border-success"
      case "Anulada":
        return "bg-secondary bg-opacity-10 border-secondary"
      default:
        return "bg-light"
    }
  }

  // Get icon based on guardia type
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "Aula":
        return <i className="bi bi-building me-1"></i>
      case "Patio":
        return <i className="bi bi-tree me-1"></i>
      case "Recreo":
        return <i className="bi bi-people me-1"></i>
      default:
        return <i className="bi bi-question-circle me-1"></i>
    }
  }

  return (
    <div className={`card mb-3 shadow-sm sala-guardias-card border ${getBackgroundColor(guardia.estado)}`}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <span className={getBadgeClass(guardia.estado)}>{guardia.estado}</span>
          <span className="ms-2">
            <i className="bi bi-calendar-date me-1"></i>
            {formatDate(guardia.fecha)} - {guardia.tramoHorario}
          </span>
        </div>
        <div>
          <span className="badge bg-primary">
            {getTipoIcon(guardia.tipoGuardia)}{guardia.tipoGuardia}
          </span>
        </div>
      </div>
      <div className="card-body">
        <h5 className="card-title">
          <i className="bi bi-geo-alt me-2"></i>
          {lugar ? `${lugar.codigo} - ${lugar.descripcion}` : "Lugar no especificado"}
        </h5>

        <div className="row mb-3">
          <div className="col-md-6">
            <p className="mb-1">
              <strong><i className="bi bi-person-dash me-1"></i>Profesor ausente:</strong>
            </p>
            <p>{profesorAusente ? profesorAusente.nombre : "No especificado"}</p>
          </div>
          <div className="col-md-6">
            <p className="mb-1">
              <strong>
                {profesorCubridor ? (
                  <><i className="bi bi-person-fill-check me-1"></i>Profesor cubridor:</>
                ) : (
                  <><i className="bi bi-person-fill-x me-1"></i>Profesor cubridor:</>
                )}
              </strong>
            </p>
            <p>{profesorCubridor ? profesorCubridor.nombre : "Pendiente de asignar"}</p>
          </div>
        </div>

        {tareas.length > 0 && (
          <div className="mb-3">
            <h6><i className="bi bi-list-check me-1"></i>Tareas:</h6>
            <ul className="list-group">
              {tareas.map((tarea) => (
                <li key={tarea.id} className="list-group-item">
                  <i className="bi bi-check2-square me-2"></i>
                  {tarea.descripcionTarea}
                </li>
              ))}
            </ul>
          </div>
        )}

        {guardia.observaciones && (
          <div className="mb-3">
            <h6><i className="bi bi-chat-left-text me-1"></i>Observaciones:</h6>
            <p>{guardia.observaciones}</p>
          </div>
        )}

        {showActions && (
          <div className="d-flex justify-content-end">
            {guardia.estado === "Pendiente" && onAsignar && (
              <button className="btn btn-primary me-2" onClick={() => onAsignar(guardia.id)}>
                <i className="bi bi-person-check me-1"></i>
                Asignarme esta guardia
              </button>
            )}

            {guardia.estado === "Asignada" && onFirmar && (
              <button className="btn btn-success" onClick={() => onFirmar(guardia.id)}>
                <i className="bi bi-check-circle me-1"></i>
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