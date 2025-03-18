"use client"

import { useState, useEffect } from "react"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import GuardiaCard from "@/app/guardia/guardia-card"
import { Pagination } from "@/components/ui/pagination"

export default function SalaGuardiasPage() {
  const { guardias, getProfesorAusenteIdByGuardia } = useGuardias()
  const { getUsuarioById } = useUsuarios()
  const { getLugarById } = useLugares()
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [viewMode, setViewMode] = useState<"day" | "week">("day")
  const [filterEstado, setFilterEstado] = useState<string>("")

  // Log para depuración - Muestra todas las guardias recuperadas
  console.log("TODAS LAS GUARDIAS RECUPERADAS:", guardias.map(g => ({
    id: g.id,
    fecha: g.fecha,
    tramoHorario: g.tramoHorario,
    estado: g.estado,
    tipoGuardia: g.tipoGuardia,
    lugarId: g.lugarId,
    profesorCubridorId: g.profesorCubridorId
  })));

  // Estados disponibles para el filtro
  const estadosGuardia = ["Pendiente", "Asignada", "Firmada", "Anulada"]

  // Calcular fechas de inicio y fin de la semana
  const getWeekDates = (date: string) => {
    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay()
    
    // Calcular el lunes (inicio de semana)
    const monday = new Date(selectedDate)
    monday.setDate(selectedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    monday.setHours(0, 0, 0, 0)
    
    // Calcular el domingo (fin de semana)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    
    return { monday, sunday }
  }

  // Filter guardias by selected date or week and estado
  const filteredGuardias = guardias.filter((guardia) => {
    if (viewMode === "day") {
      return guardia.fecha === selectedDate && (filterEstado === "" || guardia.estado === filterEstado)
    } else {
      const { monday, sunday } = getWeekDates(selectedDate)
      const guardiaDate = new Date(guardia.fecha)
      return guardiaDate >= monday && guardiaDate <= sunday
    }
  })

  // Group guardias by date and tramo horario for week view
  const guardiasByDateAndTramo: { [key: string]: { [key: string]: typeof filteredGuardias } } = {}

  if (viewMode === "week") {
    const { monday } = getWeekDates(selectedDate)
    
    // Crear un objeto para cada día de la semana
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday)
      currentDate.setDate(monday.getDate() + i)
      const dateString = currentDate.toISOString().split("T")[0]
      guardiasByDateAndTramo[dateString] = {}
    }
    
    // Agrupar guardias por fecha y tramo
    filteredGuardias.forEach((guardia) => {
      if (!guardiasByDateAndTramo[guardia.fecha]) {
        guardiasByDateAndTramo[guardia.fecha] = {}
      }
      
      if (!guardiasByDateAndTramo[guardia.fecha][guardia.tramoHorario]) {
        guardiasByDateAndTramo[guardia.fecha][guardia.tramoHorario] = []
      }
      
      guardiasByDateAndTramo[guardia.fecha][guardia.tramoHorario].push(guardia)
    })
  }

  // Group guardias by tramo horario for day view
  const guardiasByTramo: { [key: string]: typeof filteredGuardias } = {}

  if (viewMode === "day") {
    filteredGuardias.forEach((guardia) => {
      if (!guardiasByTramo[guardia.tramoHorario]) {
        guardiasByTramo[guardia.tramoHorario] = []
      }
      guardiasByTramo[guardia.tramoHorario].push(guardia)
    })
  }

  // Sort tramos horarios
  const sortTramos = (tramos: string[]) => {
    return tramos.sort((a, b) => {
      const getTramoNumber = (tramo: string) => {
        const match = tramo.match(/(\d+)/)
        return match ? Number.parseInt(match[1]) : 0
      }
      return getTramoNumber(a) - getTramoNumber(b)
    })
  }

  // Tramos horarios disponibles
  const tramosHorarios = ["1ª Hora", "2ª Hora", "3ª Hora", "4ª Hora", "5ª Hora", "6ª Hora"]
  const tramosOrdenados = viewMode === "day" 
    ? sortTramos(Object.keys(guardiasByTramo))
    : tramosHorarios

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
  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
    })
  }

  // Contar guardias por estado
  const pendientes = filteredGuardias.filter((g) => g.estado === "Pendiente").length
  const asignadas = filteredGuardias.filter((g) => g.estado === "Asignada").length
  const firmadas = filteredGuardias.filter((g) => g.estado === "Firmada").length
  const total = filteredGuardias.length

  // Obtener fechas ordenadas para la vista semanal
  const fechasOrdenadas = viewMode === "week" 
    ? Object.keys(guardiasByDateAndTramo).sort()
    : []

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
        return "bg-light";
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
        return "bg-light";
    }
  }

  // Obtener el icono según el tipo de guardia
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "Aula":
        return <i className="bi bi-building me-1"></i>;
      case "Patio":
        return <i className="bi bi-tree me-1"></i>;
      case "Recreo":
        return <i className="bi bi-people me-1"></i>;
      default:
        return <i className="bi bi-question-circle me-1"></i>;
    }
  }

  // Estado para la paginación (solo para vista diaria)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Obtener los elementos de la página actual para la vista de tarjetas
  const getCurrentPageItems = () => {
    if (viewMode !== "day" || !tramosOrdenados.length) return [];
    
    // Aplanar todas las guardias de todos los tramos
    const allGuardias = tramosOrdenados.flatMap(tramo => guardiasByTramo[tramo]);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, allGuardias.length);
    
    return allGuardias.slice(startIndex, endIndex);
  }
  
  // Calcular el número total de páginas para la vista de tarjetas
  const totalGuardias = viewMode === "day" 
    ? tramosOrdenados.flatMap(tramo => guardiasByTramo[tramo]).length 
    : 0;
  
  const totalPages = Math.ceil(totalGuardias / itemsPerPage);
  
  // Cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  }
  
  // Resetear la página cuando cambia la fecha o el modo de vista
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, viewMode]);

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Sala de Guardias</h1>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group mb-3">
            <button 
              className="btn btn-outline-secondary" 
              type="button"
              onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() - (viewMode === "week" ? 7 : 1));
                setSelectedDate(date.toISOString().split("T")[0]);
              }}
              aria-label={viewMode === "week" ? "Semana anterior" : "Día anterior"}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <span className="input-group-text">Fecha</span>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Seleccionar fecha para ver guardias"
            />
            <button 
              className="btn btn-outline-secondary" 
              type="button"
              onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() + (viewMode === "week" ? 7 : 1));
                setSelectedDate(date.toISOString().split("T")[0]);
              }}
              aria-label={viewMode === "week" ? "Semana siguiente" : "Día siguiente"}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
          
          <div className="btn-group mb-3" role="group" aria-label="Seleccionar vista">
            <button 
              type="button" 
              className={`btn ${viewMode === "day" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setViewMode("day")}
            >
              <i className="bi bi-calendar-day me-1"></i> Ver día
            </button>
            <button 
              type="button" 
              className={`btn ${viewMode === "week" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setViewMode("week")}
            >
              <i className="bi bi-calendar-week me-1"></i> Ver semana
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
                <div className="col-3">
                  <div className="p-2 rounded bg-warning bg-opacity-10">
                    <h3 className="text-warning">{pendientes}</h3>
                    <p className="mb-0"><i className="bi bi-clock me-1"></i>Pendientes</p>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 rounded bg-info bg-opacity-10">
                    <h3 className="text-info">{asignadas}</h3>
                    <p className="mb-0"><i className="bi bi-person-check me-1"></i>Asignadas</p>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 rounded bg-success bg-opacity-10">
                    <h3 className="text-success">{firmadas}</h3>
                    <p className="mb-0"><i className="bi bi-check-circle me-1"></i>Firmadas</p>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 rounded bg-secondary bg-opacity-10">
                    <h3 className="text-secondary">{total}</h3>
                    <p className="mb-0"><i className="bi bi-list-check me-1"></i>Total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {viewMode === "day" && (
        <>
          <div className="alert alert-info d-flex justify-content-between align-items-center">
            <div>
              <i className="bi bi-calendar-date me-2"></i>
              Mostrando guardias para: <strong>{formatDate(selectedDate)}</strong>
            </div>
            <div className="input-group" style={{ width: "auto" }}>
              <span className="input-group-text">Estado</span>
              <select 
                className="form-select" 
                value={filterEstado} 
                onChange={(e) => setFilterEstado(e.target.value)}
                aria-label="Filtrar guardias por estado"
              >
                <option value="">Todos los estados</option>
                {estadosGuardia.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {tramosOrdenados.length === 0 ? (
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              No hay guardias registradas para esta fecha.
            </div>
          ) : (
            tramosOrdenados.map((tramo) => (
              <div key={tramo} className="mb-4">
                <h3 className="border-bottom pb-2">{tramo}</h3>
                <div className="row">
                  {guardiasByTramo[tramo].map((guardia) => (
                    <div key={guardia.id} className="col-md-6 col-lg-4 mb-3">
                      <GuardiaCard guardia={guardia} />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          
          {/* Paginación para la vista diaria cuando hay muchas guardias */}
          {totalGuardias > itemsPerPage && (
            <div className="mt-4">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
        </>
      )}

      {viewMode === "week" && (
        <>
          <div className="alert alert-info">
            <i className="bi bi-calendar-week me-2"></i>
            Mostrando guardias para la semana del: <strong>{formatDate(getWeekDates(selectedDate).monday.toISOString())}</strong> al <strong>{formatDate(getWeekDates(selectedDate).sunday.toISOString())}</strong>
          </div>

          {/* Vista para pantallas grandes */}
          <div className="d-none d-lg-block">
            <div className="table-responsive table-weekly-view">
              <table className="table table-bordered shadow-sm">
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: "10%" }} className="text-center align-middle">Tramo</th>
                    {fechasOrdenadas.map(fecha => (
                      <th key={fecha} style={{ width: `${90/fechasOrdenadas.length}%` }} className="text-center">
                        <div>{formatDateShort(fecha)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tramosOrdenados.map(tramo => (
                    <tr key={tramo}>
                      <td className="text-center align-middle">
                        <strong>{tramo}</strong>
                      </td>
                      {fechasOrdenadas.map(fecha => (
                        <td key={fecha} className="p-1">
                          {guardiasByDateAndTramo[fecha][tramo]?.length > 0 ? (
                            <div className="d-flex flex-column gap-2">
                              {guardiasByDateAndTramo[fecha][tramo].map(guardia => (
                                <div 
                                  key={guardia.id} 
                                  className={`card border ${getBackgroundColor(guardia.estado)} shadow-sm sala-guardias-card`}
                                >
                                  <div className="card-body p-2">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                      <span className={`badge ${getBadgeColor(guardia.estado)}`}>
                                        {guardia.estado}
                                      </span>
                                      <span className="badge bg-primary">
                                        {getTipoIcon(guardia.tipoGuardia)}{guardia.tipoGuardia}
                                      </span>
                                    </div>
                                    <small className="d-block">
                                      <i className="bi bi-geo-alt me-1"></i>
                                      {guardia.lugarId ? 
                                        `${getLugarById(guardia.lugarId)?.codigo} - ${getLugarById(guardia.lugarId)?.descripcion}` : 
                                        "Sin lugar"
                                      }
                                    </small>
                                    <small className="d-block">
                                      {getProfesorAusenteIdByGuardia(guardia.id) ? (
                                        <>
                                          <i className="bi bi-person-dash me-1"></i>
                                          {getUsuarioById(getProfesorAusenteIdByGuardia(guardia.id) || 0)?.nombre}
                                        </>
                                      ) : ""}
                                    </small>
                                    <small className="d-block">
                                      {guardia.profesorCubridorId ? (
                                        <>
                                          <i className="bi bi-person-fill-check me-1"></i>
                                          {getUsuarioById(guardia.profesorCubridorId)?.nombre}
                                        </>
                                      ) : (
                                        <>
                                          <i className="bi bi-person-fill-x me-1"></i>
                                          Sin asignar
                                        </>
                                      )}
                                    </small>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-muted py-3">
                              <i className="bi bi-dash-circle"></i>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista para dispositivos móviles */}
          <div className="d-lg-none">
            <div className="accordion" id="accordionTramos">
              {tramosOrdenados.map((tramo, tramoIndex) => (
                <div className="accordion-item" key={tramo}>
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
                      {fechasOrdenadas.map(fecha => {
                        const guardiasEnTramo = guardiasByDateAndTramo[fecha][tramo] || [];
                        if (guardiasEnTramo.length === 0) return null;
                        
                        return (
                          <div key={fecha} className="mb-3">
                            <div className="bg-light p-2 mb-2 rounded">
                              <strong>{formatDateShort(fecha)}</strong>
                            </div>
                            <div className="d-flex flex-column gap-2">
                              {guardiasEnTramo.map(guardia => (
                                <div 
                                  key={guardia.id} 
                                  className={`card border ${getBackgroundColor(guardia.estado)} shadow-sm sala-guardias-card`}
                                >
                                  <div className="card-body p-2">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                      <span className={`badge ${getBadgeColor(guardia.estado)}`}>
                                        {guardia.estado}
                                      </span>
                                      <span className="badge bg-primary">
                                        {getTipoIcon(guardia.tipoGuardia)}{guardia.tipoGuardia}
                                      </span>
                                    </div>
                                    <small className="d-block">
                                      <i className="bi bi-geo-alt me-1"></i>
                                      {guardia.lugarId ? 
                                        `${getLugarById(guardia.lugarId)?.codigo} - ${getLugarById(guardia.lugarId)?.descripcion}` : 
                                        "Sin lugar"
                                      }
                                    </small>
                                    <small className="d-block">
                                      {getProfesorAusenteIdByGuardia(guardia.id) ? (
                                        <>
                                          <i className="bi bi-person-dash me-1"></i>
                                          {getUsuarioById(getProfesorAusenteIdByGuardia(guardia.id) || 0)?.nombre}
                                        </>
                                      ) : ""}
                                    </small>
                                    <small className="d-block">
                                      {guardia.profesorCubridorId ? (
                                        <>
                                          <i className="bi bi-person-fill-check me-1"></i>
                                          {getUsuarioById(guardia.profesorCubridorId)?.nombre}
                                        </>
                                      ) : (
                                        <>
                                          <i className="bi bi-person-fill-x me-1"></i>
                                          Sin asignar
                                        </>
                                      )}
                                    </small>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {!fechasOrdenadas.some(fecha => (guardiasByDateAndTramo[fecha][tramo] || []).length > 0) && (
                        <div className="alert alert-light">
                          No hay guardias para este tramo horario.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
} 