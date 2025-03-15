"use client"

import { useState } from "react"
import { useGuardias } from "../../src/contexts/GuardiasContext"
import GuardiaCard from "@/app/guardia/guardia-card"

export default function SalaGuardiasPage() {
  const { guardias, getUsuarioById, getLugarById } = useGuardias()
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [viewMode, setViewMode] = useState<"day" | "week">("day")

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

  // Filter guardias by selected date or week
  const filteredGuardias = guardias.filter((guardia) => {
    if (viewMode === "day") {
      return guardia.fecha === selectedDate
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

  const tramosOrdenados = viewMode === "day" 
    ? sortTramos(Object.keys(guardiasByTramo))
    : ["1ª hora", "2ª hora", "3ª hora", "4ª hora", "5ª hora", "6ª hora"]

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

  // Contar guardias por estado
  const pendientes = filteredGuardias.filter((g) => g.estado === "Pendiente").length
  const asignadas = filteredGuardias.filter((g) => g.estado === "Asignada").length
  const firmadas = filteredGuardias.filter((g) => g.estado === "Firmada").length
  const total = filteredGuardias.length

  // Obtener fechas ordenadas para la vista semanal
  const fechasOrdenadas = viewMode === "week" 
    ? Object.keys(guardiasByDateAndTramo).sort()
    : []

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Sala de Guardias</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group mb-3">
            <span className="input-group-text">Fecha</span>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Seleccionar fecha para ver guardias"
            />
          </div>
          
          <div className="btn-group mb-3" role="group" aria-label="Seleccionar vista">
            <button 
              type="button" 
              className={`btn ${viewMode === "day" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setViewMode("day")}
            >
              Ver día
            </button>
            <button 
              type="button" 
              className={`btn ${viewMode === "week" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setViewMode("week")}
            >
              Ver semana
            </button>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Resumen</div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col">
                  <h3 className="text-warning">{pendientes}</h3>
                  <p>Pendientes</p>
                </div>
                <div className="col">
                  <h3 className="text-info">{asignadas}</h3>
                  <p>Asignadas</p>
                </div>
                <div className="col">
                  <h3 className="text-success">{firmadas}</h3>
                  <p>Firmadas</p>
                </div>
                <div className="col">
                  <h3 className="text-primary">{total}</h3>
                  <p>Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewMode === "day" && (
        <>
          <div className="alert alert-info">
            Mostrando guardias para: <strong>{formatDate(selectedDate)}</strong>
          </div>

          {tramosOrdenados.length === 0 ? (
            <div className="alert alert-warning">No hay guardias registradas para esta fecha.</div>
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
        </>
      )}

      {viewMode === "week" && (
        <>
          <div className="alert alert-info">
            Mostrando guardias para la semana del: <strong>{formatDate(getWeekDates(selectedDate).monday.toISOString())}</strong> al <strong>{formatDate(getWeekDates(selectedDate).sunday.toISOString())}</strong>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Tramo</th>
                  {fechasOrdenadas.map(fecha => (
                    <th key={fecha}>{formatDate(fecha)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tramosOrdenados.map(tramo => (
                  <tr key={tramo}>
                    <td><strong>{tramo}</strong></td>
                    {fechasOrdenadas.map(fecha => (
                      <td key={fecha}>
                        {guardiasByDateAndTramo[fecha][tramo]?.length > 0 ? (
                          <div className="d-flex flex-column gap-2">
                            {guardiasByDateAndTramo[fecha][tramo].map(guardia => (
                              <div 
                                key={guardia.id} 
                                className={`p-2 rounded ${
                                  guardia.estado === "Pendiente" ? "bg-warning bg-opacity-25" :
                                  guardia.estado === "Asignada" ? "bg-info bg-opacity-25" :
                                  guardia.estado === "Firmada" ? "bg-success bg-opacity-25" :
                                  "bg-secondary bg-opacity-25"
                                }`}
                              >
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className={`badge ${
                                    guardia.estado === "Pendiente" ? "bg-warning text-dark" :
                                    guardia.estado === "Asignada" ? "bg-info" :
                                    guardia.estado === "Firmada" ? "bg-success" :
                                    "bg-secondary"
                                  }`}>
                                    {guardia.estado}
                                  </span>
                                  <span className="badge bg-primary">{guardia.tipoGuardia}</span>
                                </div>
                                <small className="d-block">
                                  {guardia.lugarId ? 
                                    `${getLugarById(guardia.lugarId)?.codigo} - ${getLugarById(guardia.lugarId)?.descripcion}` : 
                                    "Sin lugar"
                                  }
                                </small>
                                <small className="d-block">
                                  {guardia.profesorAusenteId ? 
                                    `Ausente: ${getUsuarioById(guardia.profesorAusenteId)?.nombre}` : 
                                    ""
                                  }
                                </small>
                                <small className="d-block">
                                  {guardia.profesorCubridorId ? 
                                    `Cubridor: ${getUsuarioById(guardia.profesorCubridorId)?.nombre}` : 
                                    "Sin asignar"
                                  }
                                </small>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
} 