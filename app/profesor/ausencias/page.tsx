"use client"

import { useState, useEffect } from "react"
import { useAusencias } from "@/src/contexts/AusenciasContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { useAuth } from "@/src/contexts/AuthContext"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { Ausencia } from "@/src/types"
import { Pagination } from "@/components/ui/pagination"
import { DB_CONFIG } from "@/lib/db-config"

export default function AusenciasPage() {
  const { user } = useAuth()
  const { ausencias, addAusencia, updateAusencia, deleteAusencia, getAusenciasByProfesor, refreshAusencias } = useAusencias()
  const { lugares, getLugarById } = useLugares()
  const { getGuardiaByAusenciaId } = useGuardias()
  const { getUsuarioById } = useUsuarios()

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
  })

  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [editingId, setEditingId] = useState<number | null>(null)

  // Tramos horarios
  const tramosHorariosOptions = DB_CONFIG.TRAMOS_HORARIOS

  // Estados de ausencia
  const estadosAusencia = [
    DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE,
    DB_CONFIG.ESTADOS_AUSENCIA.ACEPTADA,
    DB_CONFIG.ESTADOS_AUSENCIA.RECHAZADA
  ]

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
        if (a.estado === DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE) return -1
        if (b.estado === DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE) return 1
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

  // Función para cargar ausencia al formulario
  const handleEditAusencia = (ausencia: Ausencia) => {
    // Solo se pueden editar ausencias pendientes
    if (ausencia.estado !== DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE) {
      alert("Solo puedes editar ausencias pendientes")
      return
    }

    // Cargar los datos de la ausencia al formulario
    setFormData({
      fecha: ausencia.fecha,
      tramosHorarios: [ausencia.tramoHorario],
      observaciones: ausencia.observaciones || "",
    })
    setEditingId(ausencia.id)
    setShowForm(true)
    
    // Desplazar la página hacia arriba para mostrar el formulario
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split("T")[0],
      tramosHorarios: [],
      observaciones: "",
    })
    setFormErrors({})
    setEditingId(null)
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
    // Solo validar si no estamos en modo edición o si hemos cambiado la fecha/tramo
    for (const tramo of formData.tramosHorarios) {
      const existeAusencia = misAusenciasFiltradas.some(
        ausencia => 
          ausencia.fecha === formData.fecha && 
          ausencia.tramoHorario === tramo &&
          ausencia.estado !== DB_CONFIG.ESTADOS_AUSENCIA.RECHAZADA &&
          ausencia.id !== editingId // No validar contra la misma ausencia
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
      if (editingId) {
        // Modo edición - solo se edita una ausencia
        const tramoHorario = formData.tramosHorarios[0] // En modo edición solo se permite un tramo
        
        const ausenciaActualizada: Partial<Ausencia> = {
          fecha: formData.fecha,
          tramoHorario,
          observaciones: formData.observaciones
        }

        await updateAusencia(editingId, ausenciaActualizada)
        alert("Ausencia actualizada correctamente")
      } else {
        // Modo creación - se pueden crear múltiples ausencias
        // Crear ausencias secuencialmente para evitar problemas de concurrencia
        for (const tramoHorario of formData.tramosHorarios) {
          // Add ausencia
          const newAusencia: Omit<Ausencia, "id"> = {
            fecha: formData.fecha,
            tramoHorario,
            estado: DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE,
            observaciones: formData.observaciones,
            profesorId: user.id,
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
      }

      // Refrescar los datos después de crear todas las ausencias
      await handleRefresh()

      // Reset form
      resetForm()
      setShowForm(false)
      alert(editingId ? "Ausencia actualizada correctamente" : "Ausencias registradas correctamente")
    } catch (error) {
      console.error(editingId ? "Error al actualizar ausencia:" : "Error al registrar ausencias:", error)
      alert(editingId ? `Error al actualizar ausencia: ${error}` : `Error al registrar ausencias: ${error}`)
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
      if (ausencia.estado !== DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE) {
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
      case DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE:
        return "bg-warning bg-opacity-10 border-warning";
      case DB_CONFIG.ESTADOS_AUSENCIA.ACEPTADA:
        return "bg-success bg-opacity-10 border-success";
      case DB_CONFIG.ESTADOS_AUSENCIA.RECHAZADA:
        return "bg-danger bg-opacity-10 border-danger";
      default:
        return "bg-primary bg-opacity-10 border-primary";
    }
  }

  // Obtener el color del badge según el estado de la ausencia
  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE:
        return "bg-warning text-dark";
      case DB_CONFIG.ESTADOS_AUSENCIA.ACEPTADA:
        return "bg-success";
      case DB_CONFIG.ESTADOS_AUSENCIA.RECHAZADA:
        return "bg-danger";
      default:
        return "bg-primary";
    }
  }

  // Estado para el modal de detalle
  const [selectedAusencia, setSelectedAusencia] = useState<Ausencia | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Función para abrir el modal con los detalles de la ausencia
  const handleViewAusencia = (ausencia: Ausencia) => {
    setSelectedAusencia(ausencia)
    setShowModal(true)
  }

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setSelectedAusencia(null)
    setShowModal(false)
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
            className="btn btn-primary btn-sm mb-3 shadow-sm"
            onClick={() => {
              if (showForm && !editingId) {
                // Si el formulario está abierto en modo creación, cerrarlo
                setShowForm(false)
              } else {
                // Si está cerrado o en modo edición, abrir en modo creación
                resetForm()
                setShowForm(true)
              }
            }}
          >
            <i className="bi bi-plus-circle me-1"></i>
            {showForm && !editingId ? "Cancelar" : "Registrar Nueva Ausencia"}
          </button>
          
          {showForm && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">
                  <i className={`bi ${editingId ? "bi-pencil-square" : "bi-calendar-plus"} me-1`}></i>
                  {editingId ? "Editar Ausencia" : "Registrar Nueva Ausencia"}
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
                      disabled={editingId !== null} // No permitir cambiar la fecha al editar
                    />
                    {formErrors.fecha && <div className="invalid-feedback">{formErrors.fecha}</div>}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Tramos horarios</label>
                    <div className={`border rounded p-3 ${formErrors.tramosHorarios ? 'border-danger' : ''}`}>
                      {editingId ? (
                        // En modo edición, mostrar solo el tramo seleccionado
                        <div className="alert alert-info mb-0">
                          <i className="bi bi-info-circle me-2"></i>
                          Tramo horario: <strong>{formData.tramosHorarios[0]}</strong>
                          <div className="small mt-1">(No se puede modificar el tramo horario al editar)</div>
                        </div>
                      ) : (
                        // En modo creación, mostrar todos los tramos
                        <>
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
                        </>
                      )}
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
                  
                  <div className="text-end mt-4">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary btn-sm me-2"
                      onClick={() => {
                        resetForm()
                        setShowForm(false)
                      }}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-sm"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          {editingId ? "Actualizando..." : "Registrando..."}
                        </>
                      ) : (
                        <>
                          <i className={`bi ${editingId ? "bi-check-circle" : "bi-plus-circle"} me-1`}></i>
                          {editingId ? "Actualizar" : "Registrar"}
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
              <i className="bi bi-funnel me-1"></i>Filtros
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
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setFilterFecha("")
                    setFilterEstado("")
                  }}
                >
                  <i className="bi bi-x-circle me-1"></i>Limpiar filtros
                </button>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
                  title="Cambiar orden"
                >
                  <i className={`bi bi-sort-down${sortDirection === 'asc' ? '-alt' : ''} me-1`}></i>
                  {sortDirection === 'desc' ? 'Más recientes primero' : 'Más antiguos primero'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-list-check me-1"></i>
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
                          <div className="d-flex gap-1">
                            {ausencia.estado === DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEditAusencia(ausencia)}
                                  title="Editar ausencia"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleCancelarAusencia(ausencia)}
                                  title="Cancelar ausencia"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </>
                            )}
                            {/* Botón de ver detalles para cualquier estado */}
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleViewAusencia(ausencia)}
                              title="Ver detalles"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                          </div>
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

      {/* Modal para mostrar detalles de la ausencia */}
      {showModal && selectedAusencia && (
        <div className="modal fade show" 
             tabIndex={-1} 
             role="dialog"
             style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-info-circle me-2"></i>
                  Detalles de la Ausencia
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCloseModal}
                  aria-label="Cerrar">
                </button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-hash me-1"></i>
                      ID de la Ausencia
                    </h6>
                    <p className="mb-0">{selectedAusencia.id}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-flag-fill me-1"></i>
                      Estado
                    </h6>
                    <p className="mb-0">
                      <span className={`badge ${getBadgeColor(selectedAusencia.estado)}`}>
                        {selectedAusencia.estado}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-person-fill me-1"></i>
                      Profesor
                    </h6>
                    <p className="mb-0">
                      {user.nombre}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-calendar-event me-1"></i>
                      Fecha
                    </h6>
                    <p className="mb-0">{new Date(selectedAusencia.fecha).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-clock me-1"></i>
                      Tramo Horario
                    </h6>
                    <p className="mb-0">{selectedAusencia.tramoHorario}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-card-text me-1"></i>
                      Observaciones
                    </h6>
                    {selectedAusencia.observaciones ? (
                      <p className="mb-0">{selectedAusencia.observaciones}</p>
                    ) : (
                      <p className="text-muted mb-0">Sin observaciones</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-3">
                  <h6 className="fw-bold border-bottom pb-2 mb-3">
                    <i className="bi bi-shield-fill me-1"></i>
                    Información de Guardia Asociada
                  </h6>
                  {(() => {
                    const guardia = getGuardiaByAusenciaId(selectedAusencia.id)
                    return guardia ? (
                      <div className="card border">
                        <div className="card-body">
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <h6 className="card-subtitle mb-1 text-muted">
                                <i className="bi bi-hash me-1"></i>
                                ID de Guardia
                              </h6>
                              <p className="card-text">{guardia.id}</p>
                            </div>
                            <div className="col-md-6">
                              <h6 className="card-subtitle mb-1 text-muted">
                                <i className="bi bi-flag-fill me-1"></i>
                                Estado
                              </h6>
                              <p className="card-text">
                                <span className={`badge ${
                                  guardia.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE ? "bg-warning text-dark" : 
                                  guardia.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA ? "bg-info" : 
                                  guardia.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA ? "bg-success" : "bg-secondary"
                                }`}>{guardia.estado}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <h6 className="card-subtitle mb-1 text-muted">
                                <i className="bi bi-tag-fill me-1"></i>
                                Tipo de Guardia
                              </h6>
                              <p className="card-text">{guardia.tipoGuardia}</p>
                            </div>
                            <div className="col-md-6">
                              <h6 className="card-subtitle mb-1 text-muted">
                                <i className="bi bi-geo-alt-fill me-1"></i>
                                Lugar
                              </h6>
                              {(() => {
                                const lugar = getLugarById(guardia.lugarId)
                                return lugar ? (
                                  <p className="card-text">
                                    <strong>{lugar.codigo}</strong> - {lugar.descripcion}
                                    <br />
                                    <span className="text-muted small">
                                      <i className="bi bi-building me-1"></i>
                                      {lugar.tipoLugar}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="card-text">ID: {guardia.lugarId}</p>
                                )
                              })()}
                            </div>
                          </div>
                          
                          {guardia.profesorCubridorId && (
                            <div className="mb-3">
                              <h6 className="card-subtitle mb-1 text-muted">
                                <i className="bi bi-person-fill me-1"></i>
                                Profesor Cubridor
                              </h6>
                              {(() => {
                                const profesor = getUsuarioById(guardia.profesorCubridorId)
                                return profesor ? (
                                  <p className="card-text">
                                    <i className="bi bi-person-badge me-1"></i>
                                    {profesor.nombre}
                                    <span className="text-muted small ms-2">(ID: {profesor.id})</span>
                                  </p>
                                ) : (
                                  <p className="card-text">ID: {guardia.profesorCubridorId}</p>
                                )
                              })()}
                            </div>
                          )}
                          
                          {guardia.observaciones && (
                            <div>
                              <h6 className="card-subtitle mb-1 text-muted">
                                <i className="bi bi-chat-left-text me-1"></i>
                                Observaciones de la Guardia
                              </h6>
                              <p className="card-text">{guardia.observaciones}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        No hay guardia asociada a esta ausencia
                      </div>
                    )
                  })()}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}>
                  <i className="bi bi-x-circle me-2"></i>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 