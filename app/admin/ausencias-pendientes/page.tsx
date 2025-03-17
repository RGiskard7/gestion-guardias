"use client"

import { useState } from "react"
import { useGuardias, type Ausencia } from "../../../src/contexts/GuardiasContext"
import { Pagination } from "@/components/ui/pagination"

export default function AusenciasPendientesPage() {
  const { 
    ausencias, 
    lugares, 
    usuarios, 
    getAusenciasPendientes, 
    acceptAusencia, 
    rejectAusencia, 
    getUsuarioById 
  } = useGuardias()

  // Estado para el formulario de aceptación
  const [formData, setFormData] = useState({
    tipoGuardia: "Aula",
    lugarId: 0,
    observaciones: "",
    tarea: "",
  })

  const [processingAusenciaId, setProcessingAusenciaId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAcceptForm, setShowAcceptForm] = useState(false)
  const [filterProfesor, setFilterProfesor] = useState<number | null>(null)
  const [filterFecha, setFilterFecha] = useState<string>("")

  // Tipos de guardia
  const tiposGuardia = ["Aula", "Patio", "Recreo"]

  // Obtener ausencias pendientes
  const ausenciasPendientes = getAusenciasPendientes()
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  // Filtrar ausencias
  const ausenciasFiltradas = ausenciasPendientes.filter(ausencia => {
    // Filtrar por profesor
    if (filterProfesor !== null && ausencia.profesorId !== filterProfesor) {
      return false
    }
    
    // Filtrar por fecha
    if (filterFecha && ausencia.fecha !== filterFecha) {
      return false
    }
    
    return true
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

  // Reset form
  const resetForm = () => {
    setFormData({
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
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: name === "lugarId" ? Number(value) : value
    }))
  }

  // Iniciar proceso de aceptación
  const handleInitAccept = (ausencia: Ausencia) => {
    setProcessingAusenciaId(ausencia.id)
    setShowAcceptForm(true)
    setFormData(prev => ({
      ...prev,
      observaciones: ausencia.observaciones
    }))
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
        formData.tipoGuardia,
        formData.lugarId,
        formData.observaciones,
        formData.tarea
      )
      
      if (guardiaId) {
        alert("Ausencia aceptada correctamente. Se ha creado una guardia.")
        resetForm()
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
      <h1 className="h3 mb-4">Ausencias Pendientes</h1>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-funnel me-2"></i>Filtros
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="filterProfesor" className="form-label">Profesor</label>
                  <select
                    className="form-select"
                    id="filterProfesor"
                    value={filterProfesor === null ? "" : filterProfesor}
                    onChange={handleFilterProfesorChange}
                  >
                    <option value="">Todos los profesores</option>
                    {usuarios
                      .filter(u => u.rol === "profesor" && u.activo)
                      .map(profesor => (
                        <option key={profesor.id} value={profesor.id}>
                          {profesor.nombre}
                        </option>
                      ))}
                  </select>
                </div>
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
              </div>
              <div className="d-flex justify-content-end">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setFilterProfesor(null)
                    setFilterFecha("")
                  }}
                >
                  <i className="bi bi-x-circle me-2"></i>Limpiar filtros
                </button>
              </div>
            </div>
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
                  <div className="p-2 rounded bg-warning bg-opacity-10">
                    <h3 className="text-warning">{ausenciasPendientes.length}</h3>
                    <p className="mb-0"><i className="bi bi-hourglass-split me-1"></i>Ausencias pendientes</p>
                  </div>
                </div>
                <div className="col-6 col-md-6 mb-2">
                  <div className="p-2 rounded bg-primary bg-opacity-10">
                    <h3 className="text-primary">{ausenciasFiltradas.length}</h3>
                    <p className="mb-0"><i className="bi bi-funnel me-1"></i>Ausencias filtradas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showAcceptForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-success text-white">
            <h5 className="card-title mb-0">
              <i className="bi bi-check-circle me-2"></i>
              Aceptar Ausencia
            </h5>
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
                    value={formData.tipoGuardia}
                    onChange={handleChange}
                    required
                  >
                    {tiposGuardia.map((tipo) => (
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
                    value={formData.lugarId}
                    onChange={handleChange}
                    required
                  >
                    <option value={0}>Selecciona un lugar</option>
                    {lugares.map((lugar) => (
                      <option key={lugar.id} value={lugar.id}>
                        {lugar.codigo} - {lugar.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="observaciones" className="form-label">Observaciones</label>
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
                  placeholder="Describe la tarea que deben realizar los alumnos durante la guardia"
                ></textarea>
              </div>
              
              <div className="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={isSubmitting || formData.lugarId === 0}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Aceptar y Crear Guardia
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-list-check me-2"></i>
            Ausencias Pendientes
          </h5>
          <span className="badge bg-light text-dark">
            Mostrando {currentItems.length} de {ausenciasFiltradas.length}
          </span>
        </div>
        <div className="card-body">
          {ausenciasFiltradas.length === 0 ? (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              No hay ausencias pendientes que coincidan con los filtros seleccionados
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Profesor</th>
                      <th>Fecha</th>
                      <th>Tramo</th>
                      <th>Observaciones</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((ausencia) => (
                      <tr key={`${ausencia.id}-${ausencia.tramoHorario}`} className={getBackgroundColor(ausencia.estado)}>
                        <td>{getProfesorName(ausencia.profesorId)}</td>
                        <td>{new Date(ausencia.fecha).toLocaleDateString("es-ES")}</td>
                        <td>{ausencia.tramoHorario}</td>
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
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleInitAccept(ausencia)}
                              title="Aceptar ausencia"
                              disabled={processingAusenciaId !== null}
                            >
                              <i className="bi bi-check-circle"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleReject(ausencia)}
                              title="Rechazar ausencia"
                              disabled={processingAusenciaId !== null}
                            >
                              <i className="bi bi-x-circle"></i>
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
                onPageChange={onPageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
} 