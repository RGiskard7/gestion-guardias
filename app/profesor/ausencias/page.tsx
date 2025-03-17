"use client"

import { useState, useEffect } from "react"
import { useAusencias } from "@/src/contexts/AusenciasContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { useAuth } from "@/src/contexts/AuthContext"
import { Ausencia } from "@/src/types"
import { Pagination } from "@/components/ui/pagination"

export default function AusenciasPage() {
  const { user } = useAuth()
  const { ausencias, addAusencia, updateAusencia, deleteAusencia, getAusenciasByProfesor, refreshAusencias } = useAusencias()
  const { lugares } = useLugares()

  if (!user) return null

  // Estados para filtros y ordenamiento
  const [filterFecha, setFilterFecha] = useState<string>("")
  const [filterEstado, setFilterEstado] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // State for the form
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    tramosHorarios: [] as string[],
    observaciones: "",
    tarea: "",
  })

  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  // Tramos horarios
  const tramosHorariosOptions = ["1ª hora", "2ª hora", "3ª hora", "4ª hora", "5ª hora", "6ª hora"]

  // Estados de ausencia
  const estadosAusencia = ["Pendiente", "Aceptada", "Rechazada"]

  // Get mis ausencias con filtros y ordenamiento
  const misAusenciasFiltradas = getAusenciasByProfesor(user.id)
    .filter(ausencia => {
      // Filtrar por fecha
      if (filterFecha && ausencia.fecha !== filterFecha) {
        return false
      }
      
      // Filtrar por estado
      if (filterEstado && ausencia.estado !== filterEstado) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      // Ordenar por fecha según la dirección seleccionada
      const dateComparison = sortDirection === 'desc' 
        ? new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        : new Date(a.fecha).getTime() - new Date(b.fecha).getTime()

      // Si las fechas son iguales, ordenar por estado (Pendiente primero)
      if (dateComparison === 0) {
        if (a.estado === "Pendiente") return -1
        if (b.estado === "Pendiente") return 1
        return 0
      }

      return dateComparison
    })

  // Imprimir la cantidad de ausencias encontradas
  console.log(`Total de ausencias encontradas: ${misAusenciasFiltradas.length}`)

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Calcular el número total de páginas de forma explícita
  let totalPages = 1
  if (misAusenciasFiltradas.length > 0) {
    totalPages = Math.max(1, Math.ceil(misAusenciasFiltradas.length / itemsPerPage))
  }

  // Calcular los índices de inicio y fin para la paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = misAusenciasFiltradas.slice(indexOfFirstItem, indexOfLastItem)

  // Función para cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Reset form
  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split("T")[0],
      tramosHorarios: [],
      observaciones: "",
      tarea: "",
    })
    setFormErrors({})
  }

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement
      const isChecked = checkbox.checked
      const tramoHorario = checkbox.value

      if (tramoHorario === "todo-el-dia") {
        // Si se marca "Todo el día", seleccionar todos los tramos
        // Si se desmarca, deseleccionar todos los tramos
        setFormData(prev => ({
          ...prev,
          tramosHorarios: isChecked ? [...tramosHorariosOptions] : []
        }))
      } else {
        setFormData(prev => {
          const tramosHorarios = isChecked
            ? [...prev.tramosHorarios, tramoHorario]
            : prev.tramosHorarios.filter(t => t !== tramoHorario)

          return {
            ...prev,
            tramosHorarios
          }
        })
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Validar el formulario
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const selectedDate = new Date(formData.fecha)
    selectedDate.setHours(0, 0, 0, 0)
    
    // Validar fecha (no puede ser en el pasado)
    if (selectedDate < today) {
      errors.fecha = "No puedes registrar ausencias en fechas pasadas"
    }
    
    // Validar que se ha seleccionado al menos un tramo horario
    if (formData.tramosHorarios.length === 0) {
      errors.tramosHorarios = "Debes seleccionar al menos un tramo horario"
    }
    
    // Validar que no exista ya una ausencia para la misma fecha y tramos
    for (const tramo of formData.tramosHorarios) {
      const existeAusencia = misAusenciasFiltradas.some(
        ausencia => 
          ausencia.fecha === formData.fecha && 
          ausencia.tramoHorario === tramo &&
          ausencia.estado !== "Rechazada"
      )
      
      if (existeAusencia) {
        errors.tramosHorarios = `Ya tienes una ausencia registrada para el ${new Date(formData.fecha).toLocaleDateString("es-ES")} en el tramo ${tramo}`
        break
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Función para refrescar los datos
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAusencias();
    } catch (error) {
      console.error("Error al refrescar los datos:", error);
    } finally {
      setIsRefreshing(false);
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar el formulario
    if (!validateForm()) {
      return
    }

    // Evitar múltiples envíos simultáneos
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      // Crear ausencias secuencialmente para evitar problemas de concurrencia
      for (const tramoHorario of formData.tramosHorarios) {
        // Add ausencia
        const newAusencia: Omit<Ausencia, "id"> = {
          fecha: formData.fecha,
          tramoHorario,
          estado: "Pendiente",
          observaciones: formData.observaciones,
          profesorId: user.id,
          tareas: formData.tarea || undefined
        }

        try {
          // Esperar a que se cree la ausencia y obtener el ID devuelto
          const ausenciaId = await addAusencia(newAusencia)
          
          if (ausenciaId === null) {
            console.error("Error al crear ausencia: ID nulo")
            alert(`Error al crear ausencia para ${formData.fecha}, ${tramoHorario}: ID nulo`)
          }
        } catch (error) {
          console.error("Error al crear ausencia:", error)
          alert(`Error al crear ausencia para ${formData.fecha}, ${tramoHorario}: ${error}`)
          // Continuamos con la siguiente ausencia en lugar de detener todo el proceso
        }
        
        // Pequeña pausa para evitar problemas de concurrencia
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Refrescar los datos después de crear todas las ausencias
      await handleRefresh()

      // Reset form
      resetForm()
      setShowForm(false)
      alert("Ausencias registradas correctamente")
    } catch (error) {
      console.error("Error al registrar ausencias:", error)
      alert(`Error al registrar ausencias: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cancelar ausencia
  const handleCancelarAusencia = async (ausencia: Ausencia) => {
    if (!confirm(`¿Estás seguro de que deseas cancelar esta ausencia del ${new Date(ausencia.fecha).toLocaleDateString("es-ES")}?`)) {
      return
    }

    try {
      // Solo se pueden cancelar ausencias pendientes
      if (ausencia.estado !== "Pendiente") {
        alert("Solo puedes cancelar ausencias pendientes")
        return
      }

      // Eliminar la ausencia
      await deleteAusencia(ausencia.id)
      alert("Ausencia cancelada correctamente")
    } catch (error) {
      console.error("Error al cancelar ausencia:", error)
      alert(`Error al cancelar ausencia: ${error}`)
    }
  }

  // Obtener el color de fondo según el estado de la ausencia
  const getBackgroundColor = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "bg-warning bg-opacity-10 border-warning";
      case "Aceptada":
        return "bg-success bg-opacity-10 border-success";
      case "Rechazada":
        return "bg-danger bg-opacity-10 border-danger";
      default:
        return "bg-primary bg-opacity-10 border-primary";
    }
  }

  // Obtener el color del badge según el estado de la ausencia
  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "bg-warning text-dark";
      case "Aceptada":
        return "bg-success";
      case "Rechazada":
        return "bg-danger";
      default:
        return "bg-primary";
    }
  }

  return (
    <div className="container-fluid">
      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <h1 className="h3 mb-4">Gestión de Ausencias</h1>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <button 
            className="btn btn-primary mb-3"
            onClick={() => setShowForm(!showForm)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            {showForm ? "Cancelar" : "Registrar Nueva Ausencia"}
          </button>
          
          {showForm && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">
                  <i className="bi bi-calendar-plus me-2"></i>
                  Registrar Nueva Ausencia
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="fecha" className="form-label">Fecha de la ausencia</label>
                    <input
                      type="date"
                      className={`form-control ${formErrors.fecha ? 'is-invalid' : ''}`}
                      id="fecha"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                    {formErrors.fecha && <div className="invalid-feedback">{formErrors.fecha}</div>}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Tramos horarios</label>
                    <div className={`border rounded p-3 ${formErrors.tramosHorarios ? 'border-danger' : ''}`}>
                      <div className="form-check mb-2 border-bottom pb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="todo-el-dia"
                          name="tramosHorarios"
                          value="todo-el-dia"
                          checked={formData.tramosHorarios.length === tramosHorariosOptions.length}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="todo-el-dia">
                          <strong>Todo el día</strong>
                        </label>
                      </div>
                      {tramosHorariosOptions.map((tramo) => (
                        <div className="form-check" key={tramo}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`tramo-${tramo}`}
                            name="tramosHorarios"
                            value={tramo}
                            checked={formData.tramosHorarios.includes(tramo)}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor={`tramo-${tramo}`}>
                            {tramo}
                          </label>
                        </div>
                      ))}
                    </div>
                    {formErrors.tramosHorarios && <div className="text-danger small mt-1">{formErrors.tramosHorarios}</div>}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="observaciones" className="form-label">Observaciones (opcional)</label>
                    <textarea
                      className="form-control"
                      id="observaciones"
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleChange}
                      rows={3}
                    ></textarea>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="tarea" className="form-label">Tarea para los alumnos (opcional)</label>
                    <textarea
                      className="form-control"
                      id="tarea"
                      name="tarea"
                      value={formData.tarea}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Describe la tarea que deben realizar los alumnos durante tu ausencia"
                    ></textarea>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Registrando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Registrar Ausencia
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
        
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-funnel me-2"></i>Filtros
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="filterFecha" className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    id="filterFecha"
                    value={filterFecha}
                    onChange={(e) => setFilterFecha(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="filterEstado" className="form-label">Estado</label>
                  <select
                    className="form-select"
                    id="filterEstado"
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    {estadosAusencia.map(estado => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setFilterFecha("")
                    setFilterEstado("")
                  }}
                >
                  <i className="bi bi-x-circle me-2"></i>Limpiar filtros
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
                  title="Cambiar orden"
                >
                  <i className={`bi bi-sort-down${sortDirection === 'asc' ? '-alt' : ''}`}></i>
                  {sortDirection === 'desc' ? ' Más recientes primero' : ' Más antiguos primero'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-list-check me-2"></i>
            Mis Ausencias
          </h5>
          <div className="d-flex align-items-center">
            <button
              className="btn btn-light btn-sm me-2"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refrescar datos"
            >
              <i className={`bi bi-arrow-clockwise ${isRefreshing ? 'spin' : ''}`}></i>
            </button>
            <span className="badge bg-light text-dark">
              Total: {misAusenciasFiltradas.length}
            </span>
          </div>
        </div>
        <div className="card-body">
          {misAusenciasFiltradas.length === 0 ? (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              No tienes ausencias registradas
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tramo</th>
                      <th>Estado</th>
                      <th>Observaciones</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((ausencia) => (
                      <tr key={`${ausencia.id}-${ausencia.tramoHorario}`} className={getBackgroundColor(ausencia.estado)}>
                        <td>{new Date(ausencia.fecha).toLocaleDateString("es-ES")}</td>
                        <td>{ausencia.tramoHorario}</td>
                        <td>
                          <span className={`badge ${getBadgeColor(ausencia.estado)}`}>
                            {ausencia.estado}
                          </span>
                        </td>
                        <td>
                          {ausencia.observaciones ? (
                            <span title={ausencia.observaciones}>
                              {ausencia.observaciones.length > 50
                                ? `${ausencia.observaciones.substring(0, 50)}...`
                                : ausencia.observaciones}
                            </span>
                          ) : (
                            <span className="text-muted">Sin observaciones</span>
                          )}
                        </td>
                        <td>
                          {ausencia.estado === "Pendiente" && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleCancelarAusencia(ausencia)}
                              title="Cancelar ausencia"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={paginate}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
} 