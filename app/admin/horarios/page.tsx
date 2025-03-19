"use client"

import { useState, useEffect } from "react"
import { useHorarios } from "@/src/contexts/HorariosContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { Horario, Usuario } from "@/src/types"
import { Pagination } from "@/components/ui/pagination"
import DataCard from "@/components/common/DataCard"
import { Calendar } from "@/components/ui/calendar"
import { DB_CONFIG } from "@/lib/db-config"

export default function HorariosPage() {
  const { horarios, addHorario, updateHorario, deleteHorario } = useHorarios()
  const { usuarios } = useUsuarios()
  const { lugares } = useLugares()

  // Obtener solo profesores (no admins)
  const profesores = usuarios.filter((u: Usuario) => u.rol === DB_CONFIG.ROLES.PROFESOR && u.activo)

  // Estado para el formulario
  const [formData, setFormData] = useState<Omit<Horario, "id"> & { tramosHorarios?: string[] }>({
    profesorId: 0,
    diaSemana: "",
    tramoHorario: "",
    tramosHorarios: [],
  })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Estados para filtros
  const [selectedProfesor, setSelectedProfesor] = useState<number | null>(null)
  const [filterDia, setFilterDia] = useState<string>("")
  const [filterTramo, setFilterTramo] = useState<string>("")

  // Estado para la visualización
  const [viewMode, setViewMode] = useState<string>("lista")

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filtrar horarios según criterios
  const filteredHorarios = horarios.filter((horario: Horario) => {
    // Filtrar por profesor
    if (selectedProfesor && horario.profesorId !== selectedProfesor) {
      return false
    }
    
    // Filtrar por día de la semana
    if (filterDia && horario.diaSemana !== filterDia) {
      return false
    }
    
    // Filtrar por tramo horario
    if (filterTramo && horario.tramoHorario !== filterTramo) {
      return false
    }
    
    return true
  })

  // Calcular el número total de páginas
  const totalPages = Math.ceil(filteredHorarios.length / itemsPerPage)
  
  // Obtener los elementos de la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredHorarios.slice(startIndex, endIndex)
  }
  
  // Cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Días de la semana
  const diasSemana = DB_CONFIG.DIAS_SEMANA
  
  // Tramos horarios
  const tramosHorarios = DB_CONFIG.TRAMOS_HORARIOS

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: name === "profesorId" ? Number.parseInt(value) : value,
    }))

    // Si se cambia el día, resetear los tramos seleccionados
    if (name === "diaSemana") {
      setFormData((prev) => ({
        ...prev,
        tramosHorarios: [],
      }))
    }
  }

  // Manejar cambios en los checkboxes de tramos horarios
  const handleTramoHorarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    
    // Actualizar los tramos seleccionados
    setFormData((prev) => {
      const tramosActuales = prev.tramosHorarios || []
      
      if (checked) {
        // Añadir el tramo si no está ya en la lista
        return {
          ...prev,
          tramosHorarios: [...tramosActuales, value]
        }
      } else {
        // Quitar el tramo de la lista
        return {
          ...prev,
          tramosHorarios: tramosActuales.filter(tramo => tramo !== value)
        }
      }
    })
  }

  // Verificar si ya existe un horario para un profesor, día y tramo
  const horarioExistente = (profesorId: number, diaSemana: string, tramoHorario: string, horarioId?: number) => {
    return horarios.some(h => 
      h.profesorId === profesorId && 
      h.diaSemana === diaSemana && 
      h.tramoHorario === tramoHorario && 
      (horarioId === undefined || h.id !== horarioId)
    )
  }

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validación básica
    if (!formData.profesorId || !formData.diaSemana) {
      setError("Por favor, completa todos los campos requeridos.")
      return
    }

    if (editingId) {
      // Caso de edición: validar que no exista duplicado
      if (horarioExistente(formData.profesorId, formData.diaSemana, formData.tramoHorario, editingId)) {
        setError(`Ya existe un horario asignado para este profesor el ${formData.diaSemana} en el tramo ${formData.tramoHorario}.`)
        return
      }
      
      // Actualizar horario existente
      updateHorario(editingId, {
        profesorId: formData.profesorId,
        diaSemana: formData.diaSemana,
        tramoHorario: formData.tramoHorario
      })
    } else {
      // Caso de creación: usar tramosHorarios
      if (!formData.tramosHorarios || formData.tramosHorarios.length === 0) {
        setError("Por favor, selecciona al menos un tramo horario.")
        return
      }

      // Comprobar duplicados y añadir cada tramo como un horario separado
      const tramosACrear = formData.tramosHorarios
      let creacionExitosa = true
      
      for (const tramo of tramosACrear) {
        if (horarioExistente(formData.profesorId, formData.diaSemana, tramo)) {
          setError(`Ya existe un horario asignado para este profesor el ${formData.diaSemana} en el tramo ${tramo}.`)
          creacionExitosa = false
          break
        }
      }
      
      if (creacionExitosa) {
        // Crear un horario para cada tramo seleccionado
        for (const tramo of tramosACrear) {
          addHorario({
            profesorId: formData.profesorId,
            diaSemana: formData.diaSemana,
            tramoHorario: tramo
          })
        }
      } else {
        return // No seguir si hay error
      }
    }

    // Resetear formulario
    resetForm()
    // Ocultar formulario después de enviar
    setShowForm(false)
  }

  // Resetear formulario y estado
  const resetForm = () => {
    setFormData({
      profesorId: 0,
      diaSemana: "",
      tramoHorario: "",
      tramosHorarios: [],
    })
    setEditingId(null)
    setError(null)
  }

  // Comenzar edición de horario
  const handleEdit = (horario: Horario) => {
    setFormData({
      profesorId: horario.profesorId,
      diaSemana: horario.diaSemana,
      tramoHorario: horario.tramoHorario,
    })
    setEditingId(horario.id)
    setShowForm(true)
  }

  // Manejar eliminación de horario
  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este horario?")) {
      deleteHorario(id)
    }
  }

  // Obtener nombre del profesor por ID
  const getProfesorName = (id: number) => {
    const profesor = profesores.find((p: Usuario) => p.id === id)
    return profesor ? profesor.nombre : "Desconocido"
  }

  // Función para refrescar los datos
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // En un entorno real, aquí iría la llamada para refrescar datos
      // Por ahora, simulamos un retraso
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Error al refrescar los horarios:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Organizar horarios por profesor para la vista semanal
  const horariosPorProfesor = profesores.reduce((acc: Record<number, Record<string, string[]>>, profesor: Usuario) => {
    acc[profesor.id] = diasSemana.reduce((diasAcc: Record<string, string[]>, dia) => {
      diasAcc[dia] = []
      return diasAcc
    }, {})
    return acc
  }, {})

  // Rellenar la matriz con los horarios
  horarios.forEach((horario) => {
    if (horariosPorProfesor[horario.profesorId] && 
        horariosPorProfesor[horario.profesorId][horario.diaSemana]) {
      horariosPorProfesor[horario.profesorId][horario.diaSemana].push(horario.tramoHorario)
    }
  })

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Gestión de Horarios de Guardia</h1>

      <DataCard
        title="Filtros y Acciones"
        icon="filter"
        className="mb-4"
      >
        <div className="row g-4">
          <div className="col-md-3">
            <div className="form-group">
              <label htmlFor="selectedProfesor" className="form-label fw-bold">Profesor</label>
              <select
                id="selectedProfesor"
                className="form-select"
                value={selectedProfesor || ""}
                onChange={(e) => setSelectedProfesor(e.target.value ? Number.parseInt(e.target.value) : null)}
              >
                <option value="">Todos los profesores</option>
                {profesores.map((profesor: Usuario) => (
                  <option key={profesor.id} value={profesor.id}>
                    {profesor.nombre}
                  </option>
                ))}
              </select>
              <small className="form-text text-muted">Filtrar por profesor</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label htmlFor="filterDia" className="form-label fw-bold">Día de la Semana</label>
              <select
                id="filterDia"
                className="form-select"
                value={filterDia}
                onChange={(e) => setFilterDia(e.target.value)}
              >
                <option value="">Todos los días</option>
                {diasSemana.map((dia) => (
                  <option key={dia} value={dia}>
                    {dia}
                  </option>
                ))}
              </select>
              <small className="form-text text-muted">Filtrar por día</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label htmlFor="filterTramo" className="form-label fw-bold">Tramo Horario</label>
              <select
                id="filterTramo"
                className="form-select"
                value={filterTramo}
                onChange={(e) => setFilterTramo(e.target.value)}
              >
                <option value="">Todos los tramos</option>
                {tramosHorarios.map((tramo) => (
                  <option key={tramo} value={tramo}>
                    {tramo}
                  </option>
                ))}
              </select>
              <small className="form-text text-muted">Filtrar por tramo horario</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group d-flex flex-column h-100">
              <label className="form-label fw-bold">Acciones</label>
              <div className="mt-auto">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    resetForm()
                    setShowForm(!showForm)
                  }}
                >
                  <i className={`bi ${showForm ? "bi-x-circle" : "bi-plus-circle"} me-2`}></i>
                  {showForm ? "Cancelar" : "Nuevo Horario"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DataCard>

      {showForm && (
        <DataCard
          title={editingId ? "Editar Horario" : "Nuevo Horario"}
          icon={editingId ? "pencil-square" : "calendar-plus"}
          className="mb-4"
        >
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="profesorId" className="form-label fw-bold">
                    Profesor
                  </label>
                  <select
                    className="form-select"
                    id="profesorId"
                    name="profesorId"
                    value={formData.profesorId || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un profesor</option>
                    {profesores.map((profesor: Usuario) => (
                      <option key={profesor.id} value={profesor.id}>
                        {profesor.nombre}
                      </option>
                    ))}
                  </select>
                  <small className="form-text text-muted">Profesor asignado a esta hora de guardia</small>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="diaSemana" className="form-label fw-bold">
                    Día de la Semana
                  </label>
                  <select
                    className="form-select"
                    id="diaSemana"
                    name="diaSemana"
                    value={formData.diaSemana}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un día</option>
                    {diasSemana.map((dia) => (
                      <option key={dia} value={dia}>
                        {dia}
                      </option>
                    ))}
                  </select>
                  <small className="form-text text-muted">Día de la semana para la guardia</small>
                </div>
              </div>

              <div className="col-12">
                <div className="form-group">
                  <label className="form-label fw-bold">
                    {editingId ? "Tramo Horario" : "Tramos Horarios"}
                  </label>
                  
                  {editingId ? (
                    // Modo edición: solo permitir seleccionar un tramo horario
                    <select
                      className="form-select"
                      id="tramoHorario"
                      name="tramoHorario"
                      value={formData.tramoHorario}
                      onChange={handleChange}
                      required
                      aria-label="Seleccionar tramo horario"
                    >
                      <option value="">Selecciona un tramo</option>
                      {tramosHorarios.map((tramo) => (
                        <option key={tramo} value={tramo}>
                          {tramo}
                        </option>
                      ))}
                    </select>
                  ) : (
                    // Modo creación: permitir seleccionar múltiples tramos horarios
                    <div className="d-flex flex-wrap gap-3">
                      {tramosHorarios.map((tramo) => (
                        <div key={tramo} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`tramo-${tramo}`}
                            name={tramo}
                            value={tramo}
                            checked={formData.tramosHorarios?.includes(tramo) || false}
                            onChange={handleTramoHorarioChange}
                          />
                          <label className="form-check-label" htmlFor={`tramo-${tramo}`}>
                            {tramo}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  <small className="form-text text-muted">
                    {editingId 
                      ? "Seleccione el tramo horario de la guardia" 
                      : "Seleccione los tramos horarios en los que estará disponible"}
                  </small>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
              <button type="button" className="btn btn-outline-secondary me-3" onClick={() => {
                resetForm()
                setShowForm(false)
              }}>
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                <i className={`bi ${editingId ? "bi-check-circle" : "bi-plus-circle"} me-2`}></i>
                {editingId ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </DataCard>
      )}

      <DataCard
        title="Visualización de Horarios de Guardia"
        icon="calendar-week"
        className="mb-4"
      >
        <div className="mb-4">
          {/* Pestañas de vista en estilo Bootstrap */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            <button 
              className={`btn ${viewMode === "lista" ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode("lista")}
            >
              <i className="bi bi-list-ul me-2"></i>
              Lista de Horarios
            </button>
            <button 
              className={`btn ${viewMode === "semanal" ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode("semanal")}
            >
              <i className="bi bi-calendar-week me-2"></i>
              Vista Semanal
            </button>
          </div>
            
          {viewMode === "lista" && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Profesor</th>
                    <th>Día</th>
                    <th>Tramo Horario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageItems().length > 0 ? (
                    getCurrentPageItems().map((horario: Horario) => (
                      <tr key={horario.id}>
                        <td>{getProfesorName(horario.profesorId)}</td>
                        <td>{horario.diaSemana}</td>
                        <td>{horario.tramoHorario}</td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleEdit(horario)}
                              aria-label="Editar"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(horario.id)}
                              aria-label="Eliminar"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        <i className="bi bi-info-circle me-2"></i>No hay horarios que coincidan con los filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}
            
          {viewMode === "semanal" && (
            <>
              {selectedProfesor ? (
                <>
                  <h4 className="mb-3">{getProfesorName(selectedProfesor)}</h4>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "16%" }}>Tramo / Día</th>
                          {diasSemana.map(dia => (
                            <th key={dia} style={{ width: "16%" }} className="text-center">{dia}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tramosHorarios.map(tramo => (
                          <tr key={tramo}>
                            <th className="table-light">{tramo}</th>
                            {diasSemana.map(dia => {
                              const hasHorario = horariosPorProfesor[selectedProfesor] && 
                                               horariosPorProfesor[selectedProfesor][dia] && 
                                               horariosPorProfesor[selectedProfesor][dia].includes(tramo)
                              
                              return (
                                <td key={`${dia}-${tramo}`} className="p-3 text-center">
                                  {hasHorario ? (
                                    <div className="card border bg-primary bg-opacity-10 border-primary shadow-sm sala-guardias-card">
                                      <div className="card-body p-2">
                                        <div className="d-flex justify-content-center align-items-center">
                                          <span className="badge bg-primary">
                                            <i className="bi bi-clock me-1"></i>{DB_CONFIG.ETIQUETAS.GUARDIAS.DISPONIBLE}
                                          </span>
                                        </div>
                                        <small className="d-block mt-2 text-center">
                                          <i className="bi bi-calendar-date me-1"></i>
                                          {dia} - {tramo}
                                        </small>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center text-muted">
                                      <i className="bi bi-dash-circle"></i>
                                    </div>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Selecciona un profesor en el filtro superior para ver su horario semanal.
                </div>
              )}
            </>
          )}
        </div>
      </DataCard>
    </div>
  )
} 