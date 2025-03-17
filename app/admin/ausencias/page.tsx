"use client"

import { useState, useEffect } from "react"
import { useAusencias } from "@/src/contexts/AusenciasContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { Ausencia, Usuario } from "@/src/types"
import { Pagination } from "@/components/ui/pagination"
import { useForm } from "@/hooks/use-form"
import DataCard from "@/components/common/DataCard"

export default function AdminAusenciasPage() {
  const { ausencias, addAusencia, updateAusencia, deleteAusencia, acceptAusencia, rejectAusencia, refreshAusencias } = useAusencias()
  const { usuarios, getUsuarioById } = useUsuarios()
  const { guardias } = useGuardias()
  const { lugares } = useLugares()

  // Estados para la gestión de la interfaz
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showAcceptForm, setShowAcceptForm] = useState(false)
  const [processingAusenciaId, setProcessingAusenciaId] = useState<number | null>(null)
  const [filterProfesorId, setFilterProfesorId] = useState<number | null>(null)
  const [filterFecha, setFilterFecha] = useState("")
  const [filterEstado, setFilterEstado] = useState("")
  const [sortField, setSortField] = useState<'fecha' | 'tramoHorario'>('fecha')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Tramos horarios
  const tramosHorariosOptions = ["1ª hora", "2ª hora", "3ª hora", "4ª hora", "5ª hora", "6ª hora"]

  // Actualizar datos al cargar la página
  useEffect(() => {
    handleRefresh()
  }, [])

  // Función para refrescar los datos
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshAusencias()
    } catch (error) {
      console.error("Error al refrescar las ausencias:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Formulario principal usando el hook personalizado
  const { 
    formData, 
    handleChange, 
    setFormData, 
    resetForm, 
    handleSubmit 
  } = useForm<Omit<Ausencia, "id"> & { tramosHorarios?: string[] }>({
    initialValues: {
      profesorId: 0,
      fecha: "",
      tramoHorario: "",
      tramosHorarios: [],
      estado: "Pendiente",
      observaciones: "",
      tareas: ""
    },
    onSubmit: async (values) => {
      try {
        // Validar que se hayan seleccionado tramos horarios
        if (!values.tramosHorarios || values.tramosHorarios.length === 0) {
          alert("Por favor, selecciona al menos un tramo horario")
          return
        }
        
        // Crear ausencias para cada tramo horario seleccionado
        for (const tramoHorario of values.tramosHorarios) {
          // Preparar datos para enviar
          const ausenciaData: Omit<Ausencia, "id"> = {
            profesorId: values.profesorId,
            fecha: values.fecha,
            tramoHorario,
            estado: values.estado as "Pendiente" | "Aceptada" | "Rechazada",
            observaciones: values.observaciones,
            tareas: values.tareas
          }

          if (editingId) {
            // Actualizar ausencia existente
            await updateAusencia(editingId, ausenciaData)
          } else {
            // Crear nueva ausencia
            await addAusencia(ausenciaData)
          }
          
          // Pequeña pausa para evitar problemas de concurrencia
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        alert(editingId ? "Ausencia actualizada correctamente" : "Ausencias creadas correctamente")

        // Limpiar formulario y actualizar lista
        resetForm()
        setEditingId(null)
        setShowForm(false)
        refreshAusencias()
      } catch (error) {
        console.error("Error al guardar la ausencia:", error)
        alert("Error al guardar la ausencia")
      }
    }
  })

  // Método personalizado para manejar cambios en los checkboxes
  const handleTramoHorarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    
    if (value === "todo-el-dia") {
      // Si se marca "Todo el día", seleccionar todos los tramos
      // Si se desmarca, deseleccionar todos los tramos
      setFormData(prev => ({
        ...prev,
        tramosHorarios: checked ? [...tramosHorariosOptions] : []
      }))
    } else {
      setFormData(prev => {
        const tramosHorarios = checked
          ? [...(prev.tramosHorarios || []), value]
          : (prev.tramosHorarios || []).filter(t => t !== value)
        
        return {
          ...prev,
          tramosHorarios
        }
      })
    }
  }

  // Formulario de aceptación usando el hook personalizado
  const { 
    formData: acceptFormData, 
    handleChange: handleAcceptFormChange, 
    setFormData: setAcceptFormData, 
    resetForm: resetAcceptForm, 
    handleSubmit: handleAcceptFormSubmit 
  } = useForm({
    initialValues: {
      estado: "Aceptada",
      tipoGuardia: "Aula",
      lugarId: "",
      observaciones: "",
      tarea: "",
    },
    onSubmit: async (values) => {
      if (!processingAusenciaId) return

      try {
        const ausencia = ausencias.find(a => a.id === processingAusenciaId)
        if (!ausencia) return

        if (values.estado === "Aceptada") {
          // Validar que se haya seleccionado un lugar
          if (!values.lugarId) {
            alert("Por favor, selecciona un lugar para la guardia")
            return
          }

          // Aceptar la ausencia y crear la guardia
          const guardiaId = await acceptAusencia(
            processingAusenciaId,
            values.tipoGuardia,
            Number(values.lugarId),
            values.observaciones,
            values.tarea
          )

          if (guardiaId) {
            alert("Ausencia aceptada correctamente. Se ha creado una guardia.")
          } else {
            alert("Error al aceptar la ausencia. No se ha podido crear la guardia.")
          }
        } else {
          // Rechazar la ausencia
          await updateAusencia(processingAusenciaId, {
            ...ausencia,
            estado: "Rechazada",
            observaciones: values.observaciones ? `${ausencia.observaciones}\nMotivo de rechazo: ${values.observaciones}` : ausencia.observaciones
          })
          alert("Ausencia rechazada correctamente")
        }

        resetAcceptForm()
        setProcessingAusenciaId(null)
        setShowAcceptForm(false)
        refreshAusencias()
      } catch (error) {
        console.error("Error al procesar la ausencia:", error)
        alert("Error al procesar la ausencia")
      }
    }
  })

  // Función para cambiar el orden
  const handleSort = (field: 'fecha' | 'tramoHorario') => {
    if (sortField === field) {
      // Si ya estamos ordenando por este campo, cambiamos la dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Si cambiamos de campo, establecemos el nuevo campo y dirección por defecto (descendente)
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Filtrar ausencias
  const handleFilterProfesorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFilterProfesorId(value ? Number.parseInt(value) : null)
  }

  // Filtrar ausencias
  const filteredAusencias = ausencias.filter(ausencia => {
    // Filtrar por profesor
    if (filterProfesorId && ausencia.profesorId !== filterProfesorId) {
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

  // Ordenar ausencias según el campo y dirección seleccionados
  const sortedAusencias = [...filteredAusencias].sort((a, b) => {
    if (sortField === 'fecha') {
      // Ordenar por fecha
      const dateA = new Date(a.fecha).getTime()
      const dateB = new Date(b.fecha).getTime()
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
    } else if (sortField === 'tramoHorario') {
      // Ordenar por tramo horario
      // Definir el orden de los tramos
      const tramoOrder: { [key: string]: number } = {
        "1ª Hora": 1,
        "2ª Hora": 2,
        "3ª Hora": 3,
        "4ª Hora": 4,
        "5ª Hora": 5,
        "6ª Hora": 6
      }
      
      // Obtener el valor numérico de cada tramo
      const tramoA = tramoOrder[a.tramoHorario] || 999
      const tramoB = tramoOrder[b.tramoHorario] || 999
      
      // Si los tramos son iguales, ordenar por fecha
      if (tramoA === tramoB) {
        const dateA = new Date(a.fecha).getTime()
        const dateB = new Date(b.fecha).getTime()
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
      }
      
      return sortDirection === 'asc' ? tramoA - tramoB : tramoB - tramoA
    }
    
    // Por defecto, ordenar por fecha
    return 0
  })

  // Paginar ausencias
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentAusencias = sortedAusencias.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedAusencias.length / itemsPerPage)

  // Cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Manejar edición de ausencia
  const handleEdit = (ausencia: Ausencia) => {
    // Cerrar otros formularios
    setShowAcceptForm(false)
    setProcessingAusenciaId(null)
    
    // Configurar formulario de edición
    setFormData({
      profesorId: ausencia.profesorId,
      fecha: ausencia.fecha,
      tramoHorario: ausencia.tramoHorario,
      tramosHorarios: [ausencia.tramoHorario], // Solo incluimos el tramo actual de la ausencia
      estado: ausencia.estado,
      observaciones: ausencia.observaciones,
      tareas: ausencia.tareas || ""
    })
    
    setEditingId(ausencia.id)
    setShowForm(true)
  }

  // Manejar eliminación de ausencia
  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta ausencia?")) {
      try {
        await deleteAusencia(id)
        alert("Ausencia eliminada correctamente")
        refreshAusencias()
      } catch (error) {
        console.error("Error al eliminar la ausencia:", error)
        alert("Error al eliminar la ausencia")
      }
    }
  }

  // Manejar procesamiento de ausencia
  const handleProcess = (ausencia: Ausencia) => {
    // Cerrar otros formularios
    setShowForm(false)
    setEditingId(null)
    
    // Configurar formulario de procesamiento
    setAcceptFormData({
      estado: "Aceptada",
      tipoGuardia: "Aula",
      lugarId: "",
      observaciones: ausencia.observaciones,
      tarea: ausencia.tareas || "",
    })
    
    setProcessingAusenciaId(ausencia.id)
    setShowAcceptForm(true)
  }

  // Manejar anulación de ausencia
  const handleAnular = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas anular esta ausencia?")) {
      try {
        const ausencia = ausencias.find(a => a.id === id)
        if (!ausencia) return

        const motivo = prompt("Introduce el motivo de la anulación:")
        if (motivo === null) return // Usuario canceló

        await updateAusencia(id, {
          ...ausencia,
          estado: "Rechazada",
          observaciones: `${ausencia.observaciones}\nAnulada: ${motivo}`
        })

        alert("Ausencia anulada correctamente")
        refreshAusencias()
      } catch (error) {
        console.error("Error al anular la ausencia:", error)
        alert("Error al anular la ausencia")
      }
    }
  }

  // Obtener nombre de profesor
  const getProfesorName = (id: number) => {
    const profesor = getUsuarioById(id)
    return profesor ? profesor.nombre : "Desconocido"
  }

  // Obtener nombre de lugar
  const getLugarName = (id: number) => {
    const lugar = lugares.find(l => l.id === id)
    return lugar ? `${lugar.codigo} - ${lugar.descripcion}` : "Desconocido"
  }

  // Renderizar página
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
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Gestión de Ausencias</h1>
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
        <div className="row mb-3">
          <div className="col-md-4 mb-3 mb-md-0">
            <label htmlFor="filterEstado" className="form-label">Estado</label>
            <select
              id="filterEstado"
              className="form-select"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aceptada">Aceptada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <label htmlFor="filterFecha" className="form-label">Fecha</label>
            <input
              type="date"
              id="filterFecha"
              className="form-control"
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
            />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowAcceptForm(false)
                  setProcessingAusenciaId(null)
                  setEditingId(null)
                  resetForm()
                  setShowForm(!showForm)
                }}
              >
                {showForm ? "Cancelar" : "Nueva Ausencia"}
              </button>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-4 mb-3">
            <label htmlFor="filterProfesor" className="form-label">Profesor</label>
            <select
              id="filterProfesor"
              className="form-select"
              value={filterProfesorId || ""}
              onChange={handleFilterProfesorChange}
            >
              <option value="">Todos los profesores</option>
              {usuarios
                .filter(u => u.rol === "profesor")
                .map(profesor => (
                  <option key={profesor.id} value={profesor.id}>
                    {profesor.nombre}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </DataCard>

      {showForm && (
        <DataCard
          title={editingId ? "Editar Ausencia" : "Nueva Ausencia"}
          icon="calendar-edit"
          className="mb-4"
        >
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="profesorId" className="form-label">Profesor</label>
                <select
                  id="profesorId"
                  name="profesorId"
                  className="form-select"
                  value={formData.profesorId || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un profesor</option>
                  {usuarios
                    .filter(u => u.rol === "profesor")
                    .map(profesor => (
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
                  id="fecha"
                  name="fecha"
                  className="form-control"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="tramoHorario" className="form-label">Tramo Horario</label>
                <div className="border rounded p-3">
                  <div className="form-check mb-2 border-bottom pb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="todo-el-dia"
                      name="tramosHorarios"
                      value="todo-el-dia"
                      checked={formData.tramosHorarios?.length === tramosHorariosOptions.length}
                      onChange={handleTramoHorarioChange}
                    />
                    <label className="form-check-label" htmlFor="todo-el-dia">
                      <strong>Todo el día</strong>
                    </label>
                  </div>
                  {tramosHorariosOptions.map(tramo => (
                    <div key={tramo} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`tramoHorario-${tramo}`}
                        name="tramosHorarios"
                        value={tramo}
                        checked={formData.tramosHorarios?.includes(tramo)}
                        onChange={handleTramoHorarioChange}
                      />
                      <label htmlFor={`tramoHorario-${tramo}`} className="form-check-label">
                        {tramo}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="estado" className="form-label">Estado</label>
                <select
                  id="estado"
                  name="estado"
                  className="form-select"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aceptada">Aceptada</option>
                  <option value="Rechazada">Rechazada</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="observaciones" className="form-label">Observaciones</label>
              <textarea
                id="observaciones"
                name="observaciones"
                className="form-control"
                value={formData.observaciones}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="tareas" className="form-label">Tareas para los alumnos</label>
              <textarea
                id="tareas"
                name="tareas"
                className="form-control"
                value={formData.tareas || ""}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="d-flex justify-content-end">
              <button type="button" className="btn btn-secondary me-2" onClick={() => {
                resetForm()
                setEditingId(null)
                setShowForm(false)
              }}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? "Actualizar" : "Crear"} Ausencia
              </button>
            </div>
          </form>
        </DataCard>
      )}

      {showAcceptForm && (
        <DataCard
          title="Procesar Ausencia"
          icon="check-circle"
          className="mb-4"
        >
          <form onSubmit={handleAcceptFormSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="estado" className="form-label">Estado</label>
                <select
                  id="estado"
                  name="estado"
                  className="form-select"
                  value={acceptFormData.estado}
                  onChange={handleAcceptFormChange}
                  required
                >
                  <option value="Aceptada">Aceptada</option>
                  <option value="Rechazada">Rechazada</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="tipoGuardia" className="form-label">Tipo de Guardia</label>
                <select
                  id="tipoGuardia"
                  name="tipoGuardia"
                  className="form-select"
                  value={acceptFormData.tipoGuardia}
                  onChange={handleAcceptFormChange}
                >
                  <option value="Aula">Aula</option>
                  <option value="Recreo">Recreo</option>
                </select>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="lugarId" className="form-label">Lugar</label>
                <select
                  id="lugarId"
                  name="lugarId"
                  className="form-select"
                  value={acceptFormData.lugarId}
                  onChange={handleAcceptFormChange}
                >
                  <option value="">Selecciona un lugar</option>
                  {lugares.map(lugar => (
                    <option key={lugar.id} value={lugar.id}>
                      {lugar.codigo} - {lugar.descripcion}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="observaciones" className="form-label">Observaciones</label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  className="form-control"
                  value={acceptFormData.observaciones}
                  onChange={handleAcceptFormChange}
                  rows={3}
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="tarea" className="form-label">Tareas para los alumnos</label>
              <textarea
                id="tarea"
                name="tarea"
                className="form-control"
                value={acceptFormData.tarea}
                onChange={handleAcceptFormChange}
                rows={3}
              />
            </div>
            <div className="d-flex justify-content-end">
              <button type="button" className="btn btn-secondary me-2" onClick={() => {
                resetAcceptForm()
                setProcessingAusenciaId(null)
                setShowAcceptForm(false)
              }}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Procesar Ausencia
              </button>
            </div>
          </form>
        </DataCard>
      )}
      
      <DataCard
        title="Listado de Ausencias"
        icon="calendar-x"
      >
        {currentAusencias.length === 0 ? (
          <div className="alert alert-info">No hay ausencias que coincidan con los filtros.</div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Profesor</th>
                    <th onClick={() => handleSort('fecha')} className="cursor-pointer">
                      Fecha
                      {sortField === 'fecha' && (
                        <span className="ms-1">
                          {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </th>
                    <th onClick={() => handleSort('tramoHorario')} className="cursor-pointer">
                      Tramo
                      {sortField === 'tramoHorario' && (
                        <span className="ms-1">
                          {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAusencias.map(ausencia => (
                    <tr key={ausencia.id}>
                      <td>{getProfesorName(ausencia.profesorId)}</td>
                      <td>{new Date(ausencia.fecha).toLocaleDateString()}</td>
                      <td>{ausencia.tramoHorario}</td>
                      <td>
                        <span className={`badge ${
                          ausencia.estado === "Pendiente" ? "bg-warning text-dark" :
                          ausencia.estado === "Aceptada" ? "bg-success" :
                          "bg-danger"
                        }`}>
                          {ausencia.estado}
                        </span>
                      </td>
                      <td>{ausencia.observaciones || '-'}</td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(ausencia)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          {ausencia.estado === "Pendiente" && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleProcess(ausencia)}
                              title="Procesar"
                            >
                              <i className="bi bi-check-circle"></i>
                            </button>
                          )}
                          {ausencia.estado === "Pendiente" && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleAnular(ausencia.id)}
                              title="Anular"
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(ausencia.id)}
                            title="Eliminar"
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

            <div className="d-flex justify-content-between align-items-center mt-4">
              <div>
                Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedAusencias.length)} de {sortedAusencias.length} ausencias
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