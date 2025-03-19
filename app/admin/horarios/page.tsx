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
  const [formData, setFormData] = useState<Omit<Horario, "id">>({
    profesorId: 0,
    diaSemana: "",
    tramoHorario: "",
  })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Estados para filtros
  const [selectedProfesor, setSelectedProfesor] = useState<number | null>(null)
  const [filterDia, setFilterDia] = useState<string>("")
  const [filterTramo, setFilterTramo] = useState<string>("")

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
  }

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      // Actualizar horario existente
      updateHorario(editingId, formData)
    } else {
      // Añadir nuevo horario
      addHorario(formData)
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

  return (
    <div className="container py-4">
      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .user-select-none {
          user-select: none;
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Gestión de Horarios</h1>
        <button 
          className="btn btn-outline-primary" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Actualizando...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Actualizar
            </>
          )}
        </button>
      </div>
      
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
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-4">
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

              <div className="col-md-4">
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

              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="tramoHorario" className="form-label fw-bold">
                    Tramo Horario
                  </label>
                  <select
                    className="form-select"
                    id="tramoHorario"
                    name="tramoHorario"
                    value={formData.tramoHorario}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un tramo</option>
                    {tramosHorarios.map((tramo) => (
                      <option key={tramo} value={tramo}>
                        {tramo}
                      </option>
                    ))}
                  </select>
                  <small className="form-text text-muted">Periodo de tiempo para la guardia</small>
                </div>
              </div>
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}

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
        title="Listado de Horarios de Guardia"
        icon="calendar-week"
        className="mb-4"
      >
        {filteredHorarios.length === 0 ? (
          <div className="alert alert-info d-flex align-items-center">
            <i className="bi bi-info-circle-fill fs-4 me-3"></i>
            <div>No hay horarios que coincidan con los filtros seleccionados.</div>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Profesor</th>
                    <th scope="col">Día</th>
                    <th scope="col">Tramo Horario</th>
                    <th scope="col" className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageItems().map((horario: Horario) => (
                    <tr key={horario.id}>
                      <td className="fw-medium">{getProfesorName(horario.profesorId)}</td>
                      <td>{horario.diaSemana}</td>
                      <td>
                        <span className="badge bg-secondary rounded-pill px-3 py-2">
                          {horario.tramoHorario}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(horario)}
                            title="Editar horario"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(horario.id)}
                            title="Eliminar horario"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <div className="text-muted small">
                Mostrando <span className="fw-bold">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredHorarios.length)}</span> de <span className="fw-bold">{filteredHorarios.length}</span> horarios
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </DataCard>
    </div>
  )
} 