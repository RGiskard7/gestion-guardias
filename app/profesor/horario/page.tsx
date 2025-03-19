"use client"

import { useState, useEffect } from "react"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useHorarios } from "@/src/contexts/HorariosContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { useAuth } from "@/src/contexts/AuthContext"
import { DB_CONFIG } from "@/lib/db-config"

export default function HorarioProfesorPage() {
  const { guardias, getGuardiasByProfesor, getProfesorAusenteIdByGuardia } = useGuardias()
  const { horarios, getHorariosByProfesor } = useHorarios()
  const { getLugarById } = useLugares()
  const { getUsuarioById } = useUsuarios()
  const { user } = useAuth()
  
  // Función para obtener la fecha actual en formato YYYY-MM-DD sin problemas de zona horaria
  const getTodayDate = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  }
  
  // Inicializar con la fecha actual
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate())
  const [viewMode, setViewMode] = useState<"disponibilidad" | "guardias">("guardias")
  
  // Días de la semana en español (manteniendo el caso original)
  const diasSemana = DB_CONFIG.DIAS_SEMANA
  
  // Tramos horarios
  const tramosHorarios = DB_CONFIG.TRAMOS_HORARIOS;
  
  /**
   * Calcula las fechas de inicio (lunes) y fin (viernes) de la semana que contiene la fecha proporcionada
   * @param dateStr Fecha en formato ISO string (YYYY-MM-DD)
   * @returns Objeto con las fechas de lunes y viernes de la semana
   */
  const getWeekDates = (dateStr: string) => {
    // Asegurarse de que la fecha es válida
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      dateStr = getTodayDate()
    }
    
    // Crear la fecha a las 12:00 para evitar problemas con cambios de hora
    const [year, month, day] = dateStr.split('-').map(Number)
    const selectedDate = new Date(year, month - 1, day, 12, 0, 0)
    
    // Si la fecha no es válida, usar la fecha actual
    if (isNaN(selectedDate.getTime())) {
      console.error("Fecha inválida:", dateStr)
      return getWeekDates(getTodayDate())
    }
    
    const dayOfWeek = selectedDate.getDay() // 0 = domingo, 1 = lunes, ..., 6 = sábado
    
    // Calcular el lunes (inicio de semana)
    const monday = new Date(selectedDate)
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Si es domingo, restar 6 días, sino restar (día - 1)
    monday.setDate(selectedDate.getDate() - daysToSubtract)
    
    // Calcular el viernes (fin de semana laboral)
    const friday = new Date(monday)
    friday.setDate(monday.getDate() + 4)
    
    return { monday, friday }
  }

  // Obtener las fechas de la semana actual
  const { monday, friday } = getWeekDates(selectedDate)
  
  // Asegurar que selectedDate esté dentro de la semana mostrada
  useEffect(() => {
    const { monday: weekMonday, friday: weekFriday } = getWeekDates(selectedDate)
    const selected = new Date(selectedDate)
    
    // Si la fecha seleccionada está fuera de la semana laboral (lunes a viernes)
    if (selected < weekMonday || selected > weekFriday) {
      // Ajustar a la fecha del lunes de esa semana
      const mondayStr = `${weekMonday.getFullYear()}-${String(weekMonday.getMonth() + 1).padStart(2, '0')}-${String(weekMonday.getDate()).padStart(2, '0')}`
      setSelectedDate(mondayStr)
    }
  }, [selectedDate])
  
  // Obtener las fechas de cada día de la semana (lunes a viernes)
  const fechasSemana = diasSemana.map((_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return date
  })
  
  // Convertir fechas a formato ISO para comparación
  const fechasISO = fechasSemana.map(fecha => {
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
  })
  
  // Obtener los horarios del profesor logueado (disponibilidad)
  const horarioProfesor = user ? getHorariosByProfesor(user.id) : []
  
  // Obtener las guardias asignadas al profesor en la semana seleccionada
  const todasLasGuardias = user ? getGuardiasByProfesor(user.id) : []
  const guardiasEnSemana = todasLasGuardias.filter(guardia => 
    fechasISO.includes(guardia.fecha) && 
    (guardia.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA || guardia.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA) &&
    guardia.profesorCubridorId === user?.id
  )
  
  // Crear una matriz para representar el horario de disponibilidad
  const horarioDisponibilidad: { [dia: string]: { [tramo: string]: boolean } } = {}
  
  // Inicializar la matriz con valores vacíos
  diasSemana.forEach(dia => {
    horarioDisponibilidad[dia.toLowerCase()] = {}
    tramosHorarios.forEach(tramo => {
      horarioDisponibilidad[dia.toLowerCase()][tramo] = false
    })
  })
  
  // Rellenar la matriz con los horarios del profesor (disponibilidad)
  horarioProfesor.forEach(horario => {
    const dia = horario.diaSemana
    const tramo = horario.tramoHorario
    if (diasSemana.includes(dia) && tramosHorarios.includes(tramo)) {
      horarioDisponibilidad[dia.toLowerCase()][tramo] = true
    }
  })
  
  // Crear una matriz para representar las guardias asignadas
  const guardiasAsignadas: { [fecha: string]: { [tramo: string]: { guardia: typeof guardiasEnSemana[0] | null, lugar: string, profesorAusente: string } } } = {}
  
  // Inicializar la matriz de guardias asignadas
  fechasISO.forEach(fecha => {
    guardiasAsignadas[fecha] = {}
    tramosHorarios.forEach(tramo => {
      guardiasAsignadas[fecha][tramo] = { guardia: null, lugar: "", profesorAusente: "" }
    })
  })
  
  // Rellenar la matriz con las guardias asignadas
  guardiasEnSemana.forEach(guardia => {
    const fecha = guardia.fecha
    const tramo = guardia.tramoHorario
    if (fechasISO.includes(fecha) && tramosHorarios.includes(tramo)) {
      // Obtener información del lugar
      const lugar = guardia.lugarId ? getLugarById(guardia.lugarId) : null
      const lugarNombre = lugar ? `${lugar.codigo} - ${lugar.descripcion}` : DB_CONFIG.ETIQUETAS.LUGARES.SIN_LUGAR
      
      // Obtener información del profesor ausente
      const profesorAusenteId = getProfesorAusenteIdByGuardia(guardia.id)
      const profesorAusente = profesorAusenteId ? getUsuarioById(profesorAusenteId) : null
      const profesorAusenteNombre = profesorAusente ? profesorAusente.nombre : DB_CONFIG.ETIQUETAS.USUARIOS.NO_ESPECIFICADO
      
      guardiasAsignadas[fecha][tramo] = { 
        guardia, 
        lugar: lugarNombre, 
        profesorAusente: profesorAusenteNombre 
      }
    }
  })

  // Format date for display
  const formatDate = (dateObj: Date) => {
    return dateObj.toLocaleDateString("es-ES", {
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
      case DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE:
        return "bg-warning bg-opacity-10 border-warning";
      case DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA:
        return "bg-info bg-opacity-10 border-info";
      case DB_CONFIG.ESTADOS_GUARDIA.FIRMADA:
        return "bg-success bg-opacity-10 border-success";
      case DB_CONFIG.ESTADOS_GUARDIA.ANULADA:
        return "bg-secondary bg-opacity-10 border-secondary";
      default:
        return "bg-primary bg-opacity-10 border-primary";
    }
  }

  // Obtener el color del badge según el estado de la guardia
  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE:
        return "bg-warning text-dark";
      case DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA:
        return "bg-info";
      case DB_CONFIG.ESTADOS_GUARDIA.FIRMADA:
        return "bg-success";
      case DB_CONFIG.ESTADOS_GUARDIA.ANULADA:
        return "bg-secondary";
      default:
        return "bg-primary";
    }
  }
  
  // Función para navegar a la semana anterior
  const goToPreviousWeek = () => {
    const prevMonday = new Date(monday)
    prevMonday.setDate(monday.getDate() - 7)
    const prevMondayStr = `${prevMonday.getFullYear()}-${String(prevMonday.getMonth() + 1).padStart(2, '0')}-${String(prevMonday.getDate()).padStart(2, '0')}`
    setSelectedDate(prevMondayStr)
  }
  
  // Función para navegar a la semana siguiente
  const goToNextWeek = () => {
    const nextMonday = new Date(monday)
    nextMonday.setDate(monday.getDate() + 7)
    const nextMondayStr = `${nextMonday.getFullYear()}-${String(nextMonday.getMonth() + 1).padStart(2, '0')}-${String(nextMonday.getDate()).padStart(2, '0')}`
    setSelectedDate(nextMondayStr)
  }

  // Agrupar los horarios por día de la semana
  const horariosPorDia = DB_CONFIG.DIAS_SEMANA.reduce((acc: any, dia) => {
    acc[dia] = horarioProfesor.filter(h => h.diaSemana === dia);
    return acc;
  }, {});

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Mi Horario de Guardias</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group mb-3">
            <button 
              className="btn btn-outline-secondary" 
              type="button"
              onClick={goToPreviousWeek}
              aria-label="Semana anterior"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <span className="input-group-text">Semana del</span>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Seleccionar semana para ver horario"
            />
            <button 
              className="btn btn-outline-secondary" 
              type="button"
              onClick={goToNextWeek}
              aria-label="Semana siguiente"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
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
                    <h3 className="text-success">{guardiasEnSemana.filter(g => g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA).length}</h3>
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
        Mostrando {viewMode === "guardias" ? "guardias asignadas" : "disponibilidad"} para la semana del: <strong>{formatDate(monday)}</strong> al <strong>{formatDate(friday)}</strong>
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
                          {horarioDisponibilidad[diaSemana.toLowerCase()][tramo] ? (
                            <div className="card border bg-primary bg-opacity-10 border-primary shadow-sm sala-guardias-card">
                              <div className="card-body p-2">
                                <div className="d-flex justify-content-center align-items-center">
                                  <span className="badge bg-primary">
                                    <i className="bi bi-clock me-1"></i>{DB_CONFIG.ETIQUETAS.GUARDIAS.DISPONIBLE}
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
                                  {guardiaInfo.lugar}
                                </small>
                                <small className="d-block text-center">
                                  <i className="bi bi-person-dash me-1"></i>
                                  {guardiaInfo.profesorAusente}
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
                      if (!horarioDisponibilidad[dia.toLowerCase()][tramo]) return null;
                      
                      return (
                        <div key={diaIndex} className="mb-3">
                          <div className="bg-light p-2 mb-2 rounded">
                            <strong>{dia.charAt(0).toUpperCase() + dia.slice(1)} - {formatDateShort(fechasSemana[diaIndex])}</strong>
                          </div>
                          <div className="card border bg-primary bg-opacity-10 border-primary shadow-sm sala-guardias-card">
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-center align-items-center">
                                <span className="badge bg-primary">
                                  <i className="bi bi-clock me-1"></i>{DB_CONFIG.ETIQUETAS.GUARDIAS.DISPONIBLE}
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
                                {guardiaInfo.lugar}
                              </small>
                              <small className="d-block text-center">
                                <i className="bi bi-person-dash me-1"></i>
                                {guardiaInfo.profesorAusente}
                              </small>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  
                  {viewMode === "disponibilidad" && !diasSemana.some(dia => horarioDisponibilidad[dia.toLowerCase()][tramo]) && (
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