"use client"

import { useState, useEffect } from "react"
import { useGuardias } from "../../../src/contexts/GuardiasContext"
import { useAuth } from "../../../src/contexts/AuthContext"

export default function HorarioProfesorPage() {
  const { horarios, guardias, getHorariosByProfesor, getGuardiasByProfesor } = useGuardias()
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [viewMode, setViewMode] = useState<"disponibilidad" | "guardias">("guardias")
  
  // Días de la semana en español
  const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes"]
  
  // Tramos horarios
  const tramosHorarios = ["1ª hora", "2ª hora", "3ª hora", "4ª hora", "5ª hora", "6ª hora"]
  
  // Calcular fechas de inicio y fin de la semana
  const getWeekDates = (date: string) => {
    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay()
    
    // Calcular el lunes (inicio de semana)
    const monday = new Date(selectedDate)
    monday.setDate(selectedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    monday.setHours(0, 0, 0, 0)
    
    // Calcular el viernes (fin de semana laboral)
    const friday = new Date(monday)
    friday.setDate(monday.getDate() + 4)
    friday.setHours(23, 59, 59, 999)
    
    return { monday, friday }
  }

  // Obtener las fechas de la semana actual
  const { monday, friday } = getWeekDates(selectedDate)
  
  // Obtener las fechas de cada día de la semana
  const fechasSemana = diasSemana.map((_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return date
  })
  
  // Convertir fechas a formato ISO para comparación
  const fechasISO = fechasSemana.map(fecha => fecha.toISOString().split("T")[0])
  
  // Obtener los horarios del profesor logueado (disponibilidad)
  const horarioProfesor = user ? getHorariosByProfesor(user.id) : []
  
  // Obtener las guardias asignadas al profesor en la semana seleccionada
  const todasLasGuardias = user ? getGuardiasByProfesor(user.id) : []
  const guardiasEnSemana = todasLasGuardias.filter(guardia => 
    fechasISO.includes(guardia.fecha) && 
    (guardia.estado === "Asignada" || guardia.estado === "Firmada") &&
    guardia.profesorCubridorId === user?.id
  )
  
  // Crear una matriz para representar el horario de disponibilidad
  const horarioDisponibilidad: { [dia: string]: { [tramo: string]: boolean } } = {}
  
  // Inicializar la matriz con valores vacíos
  diasSemana.forEach(dia => {
    horarioDisponibilidad[dia] = {}
    tramosHorarios.forEach(tramo => {
      horarioDisponibilidad[dia][tramo] = false
    })
  })
  
  // Rellenar la matriz con los horarios del profesor (disponibilidad)
  horarioProfesor.forEach(horario => {
    const dia = horario.diaSemana.toLowerCase()
    const tramo = horario.tramoHorario
    if (diasSemana.includes(dia) && tramosHorarios.includes(tramo)) {
      horarioDisponibilidad[dia][tramo] = true
    }
  })
  
  // Crear una matriz para representar las guardias asignadas
  const guardiasAsignadas: { [fecha: string]: { [tramo: string]: { guardia: typeof guardiasEnSemana[0] | null, lugar: string } } } = {}
  
  // Inicializar la matriz de guardias asignadas
  fechasISO.forEach(fecha => {
    guardiasAsignadas[fecha] = {}
    tramosHorarios.forEach(tramo => {
      guardiasAsignadas[fecha][tramo] = { guardia: null, lugar: "" }
    })
  })
  
  // Rellenar la matriz con las guardias asignadas
  guardiasEnSemana.forEach(guardia => {
    const fecha = guardia.fecha
    const tramo = guardia.tramoHorario
    if (fechasISO.includes(fecha) && tramosHorarios.includes(tramo)) {
      const lugar = guardia.lugarId ? `${guardia.lugarId}` : "Sin lugar"
      guardiasAsignadas[fecha][tramo] = { guardia, lugar }
    }
  })

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

  // Format date short for display
  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
    })
  }
  
  // Obtener el color de fondo según el estado de la guardia
  const getBackgroundColor = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "bg-warning bg-opacity-10 border-warning";
      case "Asignada":
        return "bg-info bg-opacity-10 border-info";
      case "Firmada":
        return "bg-success bg-opacity-10 border-success";
      case "Anulada":
        return "bg-secondary bg-opacity-10 border-secondary";
      default:
        return "bg-primary bg-opacity-10 border-primary";
    }
  }

  // Obtener el color del badge según el estado de la guardia
  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "bg-warning text-dark";
      case "Asignada":
        return "bg-info";
      case "Firmada":
        return "bg-success";
      case "Anulada":
        return "bg-secondary";
      default:
        return "bg-primary";
    }
  }

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Mi Horario de Guardias</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group mb-3">
            <span className="input-group-text">Semana del</span>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Seleccionar semana para ver horario"
            />
          </div>
          
          <div className="btn-group mb-3" role="group" aria-label="Seleccionar vista">
            <button 
              type="button" 
              className={`btn ${viewMode === "guardias" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setViewMode("guardias")}
            >
              <i className="bi bi-clipboard-check me-1"></i> Guardias Asignadas
            </button>
            <button 
              type="button" 
              className={`btn ${viewMode === "disponibilidad" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setViewMode("disponibilidad")}
            >
              <i className="bi bi-calendar-week me-1"></i> Mi Disponibilidad
            </button>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-info-circle me-2"></i>Resumen
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6 col-md-6 mb-2">
                  <div className="p-2 rounded bg-primary bg-opacity-10">
                    <h3 className="text-primary">{guardiasEnSemana.length}</h3>
                    <p className="mb-0"><i className="bi bi-clipboard-check me-1"></i>Guardias esta semana</p>
                  </div>
                </div>
                <div className="col-6 col-md-6 mb-2">
                  <div className="p-2 rounded bg-success bg-opacity-10">
                    <h3 className="text-success">{guardiasEnSemana.filter(g => g.estado === "Firmada").length}</h3>
                    <p className="mb-0"><i className="bi bi-check-circle me-1"></i>Firmadas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-calendar-week me-2"></i>
        Mostrando {viewMode === "guardias" ? "guardias asignadas" : "disponibilidad"} para la semana del: <strong>{formatDate(monday.toISOString())}</strong>
      </div>

      {/* Vista para pantallas grandes */}
      <div className="d-none d-lg-block">
        <div className="table-responsive">
          <table className="table table-bordered shadow-sm">
            <thead className="bg-light">
              <tr>
                <th style={{ width: "10%" }} className="text-center align-middle">Tramo</th>
                {fechasSemana.map((fecha, index) => (
                  <th key={index} style={{ width: `${90/fechasSemana.length}%` }} className="text-center">
                    <div>{formatDateShort(fecha)}</div>
                    <div className="small text-muted">{fechasISO[index]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tramosHorarios.map((tramo, tramoIndex) => (
                <tr key={tramoIndex}>
                  <td className="text-center align-middle bg-light">
                    <strong>{tramo}</strong>
                  </td>
                  {fechasISO.map((fecha, fechaIndex) => {
                    const diaIndex = fechaIndex % 7;
                    const diaSemana = diasSemana[diaIndex];
                    
                    if (viewMode === "disponibilidad") {
                      // Mostrar disponibilidad
                      return (
                        <td key={fechaIndex} className="p-3 text-center">
                          {horarioDisponibilidad[diaSemana][tramo] ? (
                            <div className="card border bg-primary bg-opacity-10 border-primary shadow-sm sala-guardias-card">
                              <div className="card-body p-2">
                                <div className="d-flex justify-content-center align-items-center">
                                  <span className="badge bg-primary">
                                    <i className="bi bi-clock me-1"></i>Disponible
                                  </span>
                                </div>
                                <small className="d-block mt-2 text-center">
                                  <i className="bi bi-calendar-date me-1"></i>
                                  {diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} - {tramo}
                                </small>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-muted">
                              <i className="bi bi-dash-circle"></i>
                            </div>
                          )}
                        </td>
                      );
                    } else {
                      // Mostrar guardias asignadas
                      const guardiaInfo = guardiasAsignadas[fecha][tramo];
                      return (
                        <td key={fechaIndex} className="p-3 text-center">
                          {guardiaInfo.guardia ? (
                            <div className={`card border ${getBackgroundColor(guardiaInfo.guardia.estado)} shadow-sm sala-guardias-card`}>
                              <div className="card-body p-2">
                                <div className="d-flex justify-content-center align-items-center">
                                  <span className={`badge ${getBadgeColor(guardiaInfo.guardia.estado)}`}>
                                    <i className="bi bi-clipboard-check me-1"></i>
                                    {guardiaInfo.guardia.estado}
                                  </span>
                                </div>
                                <small className="d-block mt-2 text-center">
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {guardiaInfo.guardia.lugarId ? `Lugar: ${guardiaInfo.guardia.lugarId}` : "Sin lugar"}
                                </small>
                                <small className="d-block text-center">
                                  <i className="bi bi-person-dash me-1"></i>
                                  {guardiaInfo.guardia.profesorAusenteId ? `Ausente: ${guardiaInfo.guardia.profesorAusenteId}` : ""}
                                </small>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-muted">
                              <i className="bi bi-dash-circle"></i>
                            </div>
                          )}
                        </td>
                      );
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista para dispositivos móviles */}
      <div className="d-lg-none">
        <div className="accordion" id="accordionTramos">
          {tramosHorarios.map((tramo, tramoIndex) => (
            <div className="accordion-item" key={tramoIndex}>
              <h2 className="accordion-header">
                <button 
                  className="accordion-button collapsed" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target={`#collapse${tramoIndex}`}
                  aria-expanded="false" 
                  aria-controls={`collapse${tramoIndex}`}
                >
                  <strong>{tramo}</strong>
                </button>
              </h2>
              <div 
                id={`collapse${tramoIndex}`} 
                className="accordion-collapse collapse" 
                data-bs-parent="#accordionTramos"
              >
                <div className="accordion-body p-2">
                  {viewMode === "disponibilidad" ? (
                    // Mostrar disponibilidad
                    diasSemana.map((dia, diaIndex) => {
                      if (!horarioDisponibilidad[dia][tramo]) return null;
                      
                      return (
                        <div key={diaIndex} className="mb-3">
                          <div className="bg-light p-2 mb-2 rounded">
                            <strong>{dia.charAt(0).toUpperCase() + dia.slice(1)} - {formatDateShort(fechasSemana[diaIndex])}</strong>
                          </div>
                          <div className="card border bg-primary bg-opacity-10 border-primary shadow-sm sala-guardias-card">
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-center align-items-center">
                                <span className="badge bg-primary">
                                  <i className="bi bi-clock me-1"></i>Disponible
                                </span>
                              </div>
                              <small className="d-block mt-2 text-center">
                                <i className="bi bi-calendar-date me-1"></i>
                                {dia.charAt(0).toUpperCase() + dia.slice(1)} - {tramo}
                              </small>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Mostrar guardias asignadas
                    fechasISO.map((fecha, fechaIndex) => {
                      const guardiaInfo = guardiasAsignadas[fecha][tramo];
                      if (!guardiaInfo.guardia) return null;
                      
                      return (
                        <div key={fechaIndex} className="mb-3">
                          <div className="bg-light p-2 mb-2 rounded">
                            <strong>{formatDateShort(fechasSemana[fechaIndex])} - {fecha}</strong>
                          </div>
                          <div className={`card border ${getBackgroundColor(guardiaInfo.guardia.estado)} shadow-sm sala-guardias-card`}>
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-center align-items-center">
                                <span className={`badge ${getBadgeColor(guardiaInfo.guardia.estado)}`}>
                                  <i className="bi bi-clipboard-check me-1"></i>
                                  {guardiaInfo.guardia.estado}
                                </span>
                              </div>
                              <small className="d-block mt-2 text-center">
                                <i className="bi bi-geo-alt me-1"></i>
                                {guardiaInfo.guardia.lugarId ? `Lugar: ${guardiaInfo.guardia.lugarId}` : "Sin lugar"}
                              </small>
                              <small className="d-block text-center">
                                <i className="bi bi-person-dash me-1"></i>
                                {guardiaInfo.guardia.profesorAusenteId ? `Ausente: ${guardiaInfo.guardia.profesorAusenteId}` : ""}
                              </small>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  
                  {viewMode === "disponibilidad" && !diasSemana.some(dia => horarioDisponibilidad[dia][tramo]) && (
                    <div className="alert alert-light">
                      No tienes horas de guardia asignadas en este tramo horario.
                    </div>
                  )}
                  
                  {viewMode === "guardias" && !fechasISO.some(fecha => guardiasAsignadas[fecha][tramo].guardia) && (
                    <div className="alert alert-light">
                      No tienes guardias asignadas en este tramo horario para esta semana.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="alert alert-secondary mt-4">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Nota:</strong> {viewMode === "disponibilidad" 
          ? "Este horario muestra tus horas de guardia asignadas. Durante estas horas, podrás cubrir guardias pendientes si coinciden con tu horario." 
          : "Este horario muestra las guardias que tienes asignadas para cubrir en la semana seleccionada."}
      </div>
    </div>
  )
} 