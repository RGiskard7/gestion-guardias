"use client"

import { useState } from "react"
import { useGuardias, type Ausencia, type Usuario } from "../../../src/contexts/GuardiasContext"
import { Pagination } from "@/components/ui/pagination"

export default function AusenciasPage() {
  const { 
    ausencias, 
    lugares, 
    usuarios, 
    guardias,
    addAusencia,
    updateAusencia,
    deleteAusencia,
    acceptAusencia, 
    rejectAusencia,
    anularGuardia, 
    getUsuarioById,
    anularAusencia
  } = useGuardias()

  // Estado para el formulario
  const [formData, setFormData] = useState<Omit<Ausencia, "id"> & { tarea?: string }>({
    profesorId: 0,
    fecha: new Date().toISOString().split("T")[0],
    tramoHorario: "",
    estado: "Pendiente",
    observaciones: "",
    tarea: "",
  })

  // Estado para el formulario de aceptación
  const [acceptFormData, setAcceptFormData] = useState({
    tipoGuardia: "Aula",
    lugarId: 0,
    observaciones: "",
    tarea: "",
  })

  // Estados para la gestión de la interfaz
  const [editingId, setEditingId] = useState<number | null>(null)
  const [processingAusenciaId, setProcessingAusenciaId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showAcceptForm, setShowAcceptForm] = useState(false)
  const [filterProfesor, setFilterProfesor] = useState<number | null>(null)
  const [filterFecha, setFilterFecha] = useState<string>("")
  const [filterEstado, setFilterEstado] = useState<string>("")

  // Tramos horarios
  const tramosHorarios = ["1ª hora", "2ª hora", "3ª hora", "4ª hora", "5ª hora", "6ª hora"]

  // Tipos de guardia
  const tiposGuardia = ["Aula", "Patio", "Recreo"]

  // Estados de ausencia
  const estadosAusencia = ["Pendiente", "Aceptada", "Rechazada"]

  // Obtener profesores (no admins)
  const profesores = usuarios.filter((u: Usuario) => u.rol === "profesor" && u.activo)

  // Filtrar ausencias
  const ausenciasFiltradas = ausencias
    .filter(ausencia => {
      // Filtrar por profesor
      if (filterProfesor !== null && ausencia.profesorId !== filterProfesor) {
        return false
      }
      
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
      // Ordenar primero por estado (Pendiente primero)
      if (a.estado !== b.estado) {
        if (a.estado === "Pendiente") return -1
        if (b.estado === "Pendiente") return 1
      }
      
      // Luego por fecha (más reciente primero)
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    })

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Calcular el número total de páginas
  const totalPages = Math.max(1, Math.ceil(ausenciasFiltradas.length / itemsPerPage))

  // Calcular los índices de inicio y fin para la paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = ausenciasFiltradas.slice(indexOfFirstItem, indexOfLastItem)

  // Función para cambiar de página
  const onPageChange = (pageNumber: number) => setCurrentPage(pageNumber)

  // Reset formulario
  const resetForm = () => {
    setFormData({
      profesorId: 0,
      fecha: new Date().toISOString().split("T")[0],
      tramoHorario: "",
      estado: "Pendiente",
      observaciones: "",
      tarea: "",
    })
    setEditingId(null)
    setShowForm(false)
  }

  // Reset formulario de aceptación
  const resetAcceptForm = () => {
    setAcceptFormData({
      tipoGuardia: "Aula",
      lugarId: 0,
      observaciones: "",
      tarea: "",
    })
    setProcessingAusenciaId(null)
    setShowAcceptForm(false)
  }

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: name === "profesorId" ? Number(value) : value
    }))
  }

  // Handle accept form change
  const handleAcceptFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    setAcceptFormData(prev => ({
      ...prev,
      [name]: name === "lugarId" ? Number(value) : value
    }))
  }

  // Iniciar edición de ausencia
  const handleEdit = (ausencia: Ausencia) => {
    setFormData({
      profesorId: ausencia.profesorId,
      fecha: ausencia.fecha,
      tramoHorario: ausencia.tramoHorario,
      estado: ausencia.estado,
      observaciones: ausencia.observaciones,
      tarea: ausencia.tareas,
    })
    setEditingId(ausencia.id)
    setShowForm(true)
  }

  // Iniciar proceso de aceptación
  const handleInitAccept = (ausencia: Ausencia) => {
    setProcessingAusenciaId(ausencia.id)
    setShowAcceptForm(true)
    setAcceptFormData(prev => ({
      ...prev,
      observaciones: ausencia.observaciones,
      tarea: ausencia.tareas || "",
    }))
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingId) {
        // Actualizar ausencia existente
        const { tarea, ...ausenciaData } = formData
        await updateAusencia(editingId, ausenciaData)
        alert("Ausencia actualizada correctamente")
      } else {
        // Crear nueva ausencia
        const newAusenciaId = await addAusencia(formData, formData.tarea)
        if (newAusenciaId) {
          alert("Ausencia creada correctamente")
        } else {
          alert("Error al crear la ausencia")
        }
      }
      resetForm()
    } catch (error) {
      console.error("Error al procesar ausencia:", error)
      alert(`Error al procesar ausencia: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Aceptar ausencia
  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!processingAusenciaId) return
    
    setIsSubmitting(true)

    try {
      // Aceptar la ausencia y crear la guardia
      const guardiaId = await acceptAusencia(
        processingAusenciaId,
        acceptFormData.tipoGuardia,
        acceptFormData.lugarId,
        acceptFormData.observaciones,
        acceptFormData.tarea
      )
      
      if (guardiaId) {
        alert("Ausencia aceptada correctamente. Se ha creado una guardia.")
        resetAcceptForm()
      } else {
        alert("Error al aceptar la ausencia. No se ha podido crear la guardia.")
      }
    } catch (error) {
      console.error("Error al aceptar ausencia:", error)
      alert(`Error al aceptar ausencia: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Rechazar ausencia
  const handleReject = async (ausencia: Ausencia) => {
    if (!confirm(`¿Estás seguro de que deseas rechazar esta ausencia del profesor ${getUsuarioById(ausencia.profesorId)?.nombre}?`)) {
      return
    }

    const motivo = prompt("Por favor, indica el motivo del rechazo:")
    if (motivo === null) return // El usuario canceló

    try {
      await rejectAusencia(ausencia.id, motivo)
      alert("Ausencia rechazada correctamente")
    } catch (error) {
      console.error("Error al rechazar ausencia:", error)
      alert(`Error al rechazar ausencia: ${error}`)
    }
  }

  // Anular ausencia
  const handleAnular = async (ausencia: Ausencia) => {
    if (!confirm(`¿Estás seguro de que deseas anular esta ausencia del profesor ${getUsuarioById(ausencia.profesorId)?.nombre}?`)) {
      return
    }

    const motivo = prompt("Por favor, indica el motivo de la anulación:")
    if (motivo === null) return // El usuario canceló

    try {
      const success = await anularAusencia(ausencia.id, motivo);
      
      if (success) {
        alert("Ausencia anulada correctamente. Si existía una guardia asociada, también ha sido anulada.");
      } else {
        alert("Error al anular la ausencia. Por favor, inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error al anular ausencia:", error)
      alert(`Error al anular ausencia: ${error}`)
    }
  }

  // Obtener el nombre del profesor
  const getProfesorName = (id: number) => {
    const profesor = getUsuarioById(id)
    return profesor ? profesor.nombre : "Desconocido"
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

  // Manejar cambio en el filtro de profesor
  const handleFilterProfesorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilterProfesor(value === "" ? null : Number(value));
  };

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Gestión de Ausencias</h1>
      
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-funnel me-2"></i>Filtros
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="filterProfesor" className="form-label">Profesor</label>
                  <select
                    className="form-select"
                    id="filterProfesor"
                    value={filterProfesor === null ? "" : filterProfesor}
                    onChange={handleFilterProfesorChange}
                  >
                    <option value="">Todos los profesores</option>
                    {profesores.map(profesor => (
                      <option key={profesor.id} value={profesor.id}>
                        {profesor.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="filterFecha" className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    id="filterFecha"
                    value={filterFecha}
                    onChange={(e) => setFilterFecha(e.target.value)}
                  />
                </div>
                <div className="col-md-4 mb-3">
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
              <div className="d-flex justify-content-end">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setFilterProfesor(null)
                    setFilterFecha("")
                    setFilterEstado("")
                  }}
                >
                  <i className="bi bi-x-circle me-2"></i>Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 text-end">
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
            }}
          >
            {showForm ? (
              <><i className="bi bi-x-circle me-2"></i>Cancelar</>
            ) : (
              <><i className="bi bi-plus-circle me-2"></i>Nueva Ausencia</>
            )}
          </button>
        </div>
      </div>
      
      {showForm && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <i className="bi bi-calendar-plus me-2"></i>
            {editingId ? "Editar Ausencia" : "Registrar Nueva Ausencia"}
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="profesorId" className="form-label">Profesor</label>
                  <select
                    className="form-select"
                    id="profesorId"
                    name="profesorId"
                    value={formData.profesorId || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un profesor</option>
                    {profesores.map(profesor => (
                      <option key={profesor.id} value={profesor.id}>
                        {profesor.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="fecha" className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    id="fecha"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="tramoHorario" className="form-label">Tramo Horario</label>
                  <select
                    className="form-select"
                    id="tramoHorario"
                    name="tramoHorario"
                    value={formData.tramoHorario}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un tramo</option>
                    {tramosHorarios.map(tramo => (
                      <option key={tramo} value={tramo}>
                        {tramo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="estado" className="form-label">Estado</label>
                  <select
                    className="form-select"
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    required
                  >
                    {estadosAusencia.map(estado => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="tarea" className="form-label">Tarea para los alumnos</label>
                <textarea
                  className="form-control"
                  id="tarea"
                  name="tarea"
                  rows={3}
                  value={formData.tarea || ""}
                  onChange={handleChange}
                  placeholder="Descripción de la tarea que deben realizar los alumnos durante la ausencia"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="observaciones" className="form-label">Observaciones</label>
                <textarea
                  className="form-control"
                  id="observaciones"
                  name="observaciones"
                  rows={3}
                  value={formData.observaciones}
                  onChange={handleChange}
                  placeholder="Observaciones adicionales sobre la ausencia"
                />
              </div>
              
              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Procesando...</>
                  ) : (
                    <>{editingId ? "Actualizar" : "Guardar"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showAcceptForm && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-success text-white">
            <i className="bi bi-check-circle me-2"></i>Aceptar Ausencia
          </div>
          <div className="card-body">
            <form onSubmit={handleAccept}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="tipoGuardia" className="form-label">Tipo de Guardia</label>
                  <select
                    className="form-select"
                    id="tipoGuardia"
                    name="tipoGuardia"
                    value={acceptFormData.tipoGuardia}
                    onChange={handleAcceptFormChange}
                    required
                  >
                    {tiposGuardia.map(tipo => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="lugarId" className="form-label">Lugar</label>
                  <select
                    className="form-select"
                    id="lugarId"
                    name="lugarId"
                    value={acceptFormData.lugarId || ""}
                    onChange={handleAcceptFormChange}
                    required
                  >
                    <option value="">Selecciona un lugar</option>
                    {lugares.map(lugar => (
                      <option key={lugar.id} value={lugar.id}>
                        {lugar.codigo} - {lugar.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="tarea" className="form-label">Tarea para la guardia</label>
                <textarea
                  className="form-control"
                  id="tarea"
                  name="tarea"
                  rows={3}
                  value={acceptFormData.tarea}
                  onChange={handleAcceptFormChange}
                  placeholder="Descripción de la tarea que debe realizar el profesor de guardia"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="observaciones" className="form-label">Observaciones</label>
                <textarea
                  className="form-control"
                  id="observaciones"
                  name="observaciones"
                  rows={3}
                  value={acceptFormData.observaciones}
                  onChange={handleAcceptFormChange}
                  placeholder="Observaciones adicionales para la guardia"
                />
              </div>
              
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={resetAcceptForm}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Procesando...</>
                  ) : (
                    <>Aceptar y Crear Guardia</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <i className="bi bi-calendar-check me-2"></i>Ausencias
          <span className="badge bg-light text-dark ms-2">{ausenciasFiltradas.length}</span>
        </div>
        <div className="card-body">
          {ausenciasFiltradas.length === 0 ? (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>No hay ausencias que coincidan con los filtros seleccionados.
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Profesor</th>
                      <th>Fecha</th>
                      <th>Tramo</th>
                      <th>Estado</th>
                      <th>Observaciones</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(ausencia => (
                      <tr key={ausencia.id} className={getBackgroundColor(ausencia.estado)}>
                        <td>{ausencia.id}</td>
                        <td>{getProfesorName(ausencia.profesorId)}</td>
                        <td>{new Date(ausencia.fecha).toLocaleDateString()}</td>
                        <td>{ausencia.tramoHorario}</td>
                        <td>
                          <span className={`badge ${getBadgeColor(ausencia.estado)}`}>
                            {ausencia.estado}
                          </span>
                        </td>
                        <td>
                          {ausencia.observaciones ? (
                            <span title={ausencia.observaciones}>
                              {ausencia.observaciones.length > 30
                                ? `${ausencia.observaciones.substring(0, 30)}...`
                                : ausencia.observaciones}
                            </span>
                          ) : (
                            <span className="text-muted">Sin observaciones</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(ausencia)}
                              title="Editar ausencia"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            
                            {ausencia.estado === "Pendiente" && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleInitAccept(ausencia)}
                                  title="Aceptar ausencia"
                                >
                                  <i className="bi bi-check-lg"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleReject(ausencia)}
                                  title="Rechazar ausencia"
                                >
                                  <i className="bi bi-x-lg"></i>
                                </button>
                              </>
                            )}
                            
                            {ausencia.estado !== "Rechazada" && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleAnular(ausencia)}
                                title="Anular ausencia"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
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
                onPageChange={onPageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={ausenciasFiltradas.length}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
} 