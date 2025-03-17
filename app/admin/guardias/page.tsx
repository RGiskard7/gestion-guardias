"use client"

import { useState, useEffect } from "react"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { useHorarios } from "@/src/contexts/HorariosContext"
import { Guardia, Usuario, Lugar, Horario } from "@/src/types"
import { Pagination } from "@/components/ui/pagination"
import DataCard from "@/components/common/DataCard"

export default function GuardiasPage() {
  const { 
    guardias, 
    addGuardia, 
    updateGuardia, 
    deleteGuardia, 
    addTareaGuardia, 
    anularGuardia,
    canProfesorAsignarGuardia,
    getProfesorAusenteIdByGuardia,
    refreshGuardias
  } = useGuardias()
  
  const { usuarios } = useUsuarios()
  const { lugares } = useLugares()
  const { horarios } = useHorarios()

  // Estado para controlar la carga de datos
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Actualizar datos al cargar la página
  useEffect(() => {
    handleRefresh()
  }, [])

  // Función para refrescar los datos
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshGuardias()
    } catch (error) {
      console.error("Error al refrescar las guardias:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Obtener solo profesores (no admins)
  const profesores = usuarios.filter((u: Usuario) => u.rol === "profesor" && u.activo)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    fecha: "",
    tramoHorario: "",
    tipoGuardia: "Normal",
    lugarId: "",
    tarea: "",
    observaciones: "",
    profesorCubridorId: null as number | null
  })
  
  const [error, setError] = useState<string | null>(null)

  // Estado para rango de fechas
  const [rangoFechas, setRangoFechas] = useState({
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaFin: new Date().toISOString().split("T")[0],
  })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isRangeMode, setIsRangeMode] = useState(false)
  const [filterEstado, setFilterEstado] = useState<string>("")
  const [filterFecha, setFilterFecha] = useState<string>("")

  const [sortField, setSortField] = useState<'fecha' | 'tramoHorario'>('fecha')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Filtrar guardias según los criterios
  const filteredGuardias = guardias
    .filter((guardia: Guardia) => {
      // Filtrar por estado
      if (filterEstado && guardia.estado !== filterEstado) {
        return false
      }
      // Filtrar por fecha
      if (filterFecha && guardia.fecha !== filterFecha) {
        return false
      }
      return true
    })
    .sort((a: Guardia, b: Guardia) => {
      // Ordenar por fecha (más reciente primero) y luego por tramo horario
      if (a.fecha !== b.fecha) {
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      }

      // Extraer número del tramo horario (ej: "1ª hora" -> 1)
      const getTramoNumber = (tramo: string) => {
        const match = tramo.match(/(\d+)/)
        return match ? Number.parseInt(match[1]) : 0
      }

      return getTramoNumber(a.tramoHorario) - getTramoNumber(b.tramoHorario)
    })

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Calcular el número total de páginas
  const totalPages = Math.max(1, Math.ceil(filteredGuardias.length / itemsPerPage))

  // Obtener los elementos de la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, filteredGuardias.length)
    return filteredGuardias.slice(startIndex, endIndex)
  }

  // Cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Cambiar elementos por página
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Resetear a la primera página cuando cambia el número de elementos
  }

  // Tramos horarios
  const tramosHorarios = ["1ª hora", "2ª hora", "3ª hora", "4ª hora", "5ª hora", "6ª hora"]

  // Tipos de guardia
  const tiposGuardia = ["Aula", "Patio", "Recreo"]

  // Estados de guardia
  const estadosGuardia = ["Pendiente", "Asignada", "Firmada", "Anulada"]

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

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "lugarId" || (name === "profesorAusenteId" && value !== "") || (name === "profesorCubridorId" && value !== "")
            ? Number.parseInt(value)
            : (name === "profesorAusenteId" || name === "profesorCubridorId") && value === ""
              ? null
              : value,
    }))
  }

  // Manejar cambios en el rango de fechas
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setRangoFechas((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Generar fechas entre fecha inicio y fin
  const generateDateRange = (start: string, end: string) => {
    const dates = []
    const currentDate = new Date(start)
    const endDate = new Date(end)

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate).toISOString().split("T")[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      // Actualizar guardia existente
      const { tarea, ...guardiaData } = formData
      // Convertir lugarId a número
      updateGuardia(editingId, {
        ...guardiaData,
        lugarId: guardiaData.lugarId ? Number(guardiaData.lugarId) : 0
      })
      setEditingId(null)
    } else if (isRangeMode) {
      // Crear guardias para un rango de fechas
      const fechas = generateDateRange(rangoFechas.fechaInicio, rangoFechas.fechaFin)
      
      // Crear una guardia para cada fecha
      fechas.forEach(async (fecha) => {
        const { tarea, ...guardiaData } = formData
        const guardiaWithDate = { 
          ...guardiaData, 
          fecha,
          lugarId: guardiaData.lugarId ? Number(guardiaData.lugarId) : 0,
          firmada: false,
          estado: "Pendiente" as "Pendiente" | "Asignada" | "Firmada" | "Anulada",
          profesorCubridorId: null
        }
        
        // Añadir guardia con tarea
        await addGuardia(guardiaWithDate, tarea)
      })
    } else {
      // Añadir una sola guardia
      const { tarea, ...guardiaData } = formData
      
      // Añadir guardia con tarea
      await addGuardia({
        ...guardiaData,
        lugarId: guardiaData.lugarId ? Number(guardiaData.lugarId) : 0,
        firmada: false,
        estado: "Pendiente" as "Pendiente" | "Asignada" | "Firmada" | "Anulada",
        profesorCubridorId: null
      }, tarea)
    }

    // Resetear formulario
    resetForm()
  }

  // Resetear formulario y estado
  const resetForm = () => {
    setFormData({
      fecha: "",
      tramoHorario: "",
      tipoGuardia: "Normal",
      lugarId: "",
      tarea: "",
      observaciones: "",
      profesorCubridorId: null
    })
    setRangoFechas({
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaFin: new Date().toISOString().split("T")[0],
    })
    setEditingId(null)
    setShowForm(false)
    setIsRangeMode(false)
    setError(null)
  }

  // Comenzar edición de guardia
  const handleEdit = (guardia: Guardia) => {
    setFormData({
      fecha: guardia.fecha,
      tramoHorario: guardia.tramoHorario,
      tipoGuardia: guardia.tipoGuardia,
      observaciones: guardia.observaciones,
      lugarId: String(guardia.lugarId),
      profesorCubridorId: guardia.profesorCubridorId,
      tarea: ""
    })
    setEditingId(guardia.id)
    setShowForm(true)
  }

  // Manejar anulación de guardia
  const handleAnular = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres anular esta guardia?")) {
      const motivo = prompt("Por favor, indica el motivo de la anulación:", "");
      if (motivo !== null) {
        anularGuardia(id, motivo);
      }
    }
  }

  // Obtener nombre del profesor por ID
  const getProfesorName = (id: number | null) => {
    if (!id) return "No asignado"

    const profesor = profesores.find((p: Usuario) => p.id === id)
    return profesor ? profesor.nombre : "Desconocido"
  }

  // Obtener nombre del profesor ausente para una guardia
  const getProfesorAusenteNombre = (guardiaId: number) => {
    const profesorId = getProfesorAusenteIdByGuardia(guardiaId)
    return getProfesorName(profesorId)
  }

  // Obtener nombre del lugar por ID
  const getLugarName = (id: number) => {
    const lugar = lugares.find((l: Lugar) => l.id === id)
    return lugar ? `${lugar.codigo} - ${lugar.descripcion}` : "Desconocido"
  }

  // Función para crear guardias para una fecha
  const createGuardiasForDate = async (fecha: string) => {
    try {
      // Crear guardias para cada tramo horario y lugar
      for (const tramo of tramosHorarios) {
        for (const lugar of lugares) {
          // Verificar si ya existe una guardia para esta fecha, tramo y lugar
          const existingGuardia = guardias.find(
            g => g.fecha === fecha && g.tramoHorario === tramo && g.lugarId === lugar.id
          )
          
          if (!existingGuardia) {
            // Crear nueva guardia
            const tarea = "Guardia creada automáticamente"
            const guardiaWithDate: Omit<Guardia, "id"> = {
              fecha,
              tramoHorario: tramo,
              tipoGuardia: "Normal",
              firmada: false,
              estado: "Pendiente",
              observaciones: "",
              lugarId: lugar.id,
              profesorCubridorId: null
            }
            
            await addGuardia(guardiaWithDate, tarea)
          }
        }
      }
      
      alert(`Guardias creadas correctamente para ${new Date(fecha).toLocaleDateString()}`)
    } catch (error) {
      console.error("Error al crear guardias:", error)
      alert("Error al crear guardias")
    }
  }

  // Función para crear una guardia manualmente
  const handleCreateGuardia = async () => {
    try {
      // Validar formulario
      if (!formData.fecha || !formData.tramoHorario || !formData.lugarId) {
        setError("Todos los campos son obligatorios")
        return
      }
      
      // Verificar si ya existe una guardia para esta fecha, tramo y lugar
      const existingGuardia = guardias.find(
        g => g.fecha === formData.fecha && 
             g.tramoHorario === formData.tramoHorario && 
             g.lugarId === Number(formData.lugarId)
      )
      
      if (existingGuardia) {
        setError("Ya existe una guardia para esta fecha, tramo y lugar")
        return
      }
      
      // Crear nueva guardia
      const tarea = formData.tarea || "Guardia creada manualmente"
      const guardiaData: Omit<Guardia, "id"> = {
        fecha: formData.fecha,
        tramoHorario: formData.tramoHorario,
        tipoGuardia: formData.tipoGuardia,
        firmada: false,
        estado: "Pendiente",
        observaciones: formData.observaciones || "",
        lugarId: Number(formData.lugarId),
        profesorCubridorId: null
      }
      
      await addGuardia(guardiaData, tarea)
      
      // Resetear formulario
      resetForm()
      alert("Guardia creada correctamente")
    } catch (error) {
      console.error("Error al crear guardia:", error)
      setError("Error al crear guardia")
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Gestión de Guardias</h1>
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
              {estadosGuardia.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
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
                  resetForm()
                  setShowForm(!showForm)
                  setIsRangeMode(false)
                }}
              >
                {showForm ? "Cancelar" : "Nueva Guardia"}
              </button>
              {!showForm && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    resetForm()
                    setShowForm(true)
                    setIsRangeMode(true)
                  }}
                >
                  Rango de Guardias
                </button>
              )}
            </div>
          </div>
        </div>
      </DataCard>

      {showForm && (
        <DataCard
          title={editingId ? "Editar Guardia" : isRangeMode ? "Añadir Guardias por Rango" : "Añadir Nueva Guardia"}
          className="mb-4"
        >
          <form onSubmit={handleSubmit}>
            {isRangeMode ? (
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="fechaInicio" className="form-label">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="fechaInicio"
                    name="fechaInicio"
                    value={rangoFechas.fechaInicio}
                    onChange={handleRangeChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="fechaFin" className="form-label">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="fechaFin"
                    name="fechaFin"
                    value={rangoFechas.fechaFin}
                    onChange={handleRangeChange}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="fecha" className="form-label">
                    Fecha
                  </label>
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
                <div className="col-md-6">
                  <label htmlFor="tramoHorario" className="form-label">
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
                    <option value="1ª Hora">1ª Hora</option>
                    <option value="2ª Hora">2ª Hora</option>
                    <option value="3ª Hora">3ª Hora</option>
                    <option value="Recreo">Recreo</option>
                    <option value="4ª Hora">4ª Hora</option>
                    <option value="5ª Hora">5ª Hora</option>
                    <option value="6ª Hora">6ª Hora</option>
                  </select>
                </div>
              </div>
            )}

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="tipoGuardia" className="form-label">
                  Tipo de Guardia
                </label>
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
              <div className="col-md-6">
                <label htmlFor="lugarId" className="form-label">
                  Lugar
                </label>
                <select
                  className="form-select"
                  id="lugarId"
                  name="lugarId"
                  value={formData.lugarId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un lugar</option>
                  {lugares.map((lugar) => (
                    <option key={lugar.id} value={lugar.id}>
                      {lugar.codigo} - {lugar.descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="tarea" className="form-label">
                Tarea
              </label>
              <textarea
                className="form-control"
                id="tarea"
                name="tarea"
                rows={3}
                value={formData.tarea}
                onChange={handleChange}
                placeholder="Descripción de la tarea a realizar durante la guardia"
              ></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="observaciones" className="form-label">
                Observaciones
              </label>
              <textarea
                className="form-control"
                id="observaciones"
                name="observaciones"
                rows={3}
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Observaciones adicionales sobre la guardia"
              ></textarea>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="d-flex justify-content-end">
              <button type="button" className="btn btn-secondary me-2" onClick={resetForm}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </DataCard>
      )}

      <DataCard
        title="Listado de Guardias"
        icon="clipboard-check"
        actions={
          <button
            className="btn btn-outline-primary"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-arrow-clockwise me-1"></i>
            )}
            Actualizar
          </button>
        }
      >
        {filteredGuardias.length === 0 ? (
          <div className="alert alert-info">
            No hay guardias que coincidan con los filtros seleccionados.
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
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
                    <th>Tipo</th>
                    <th>Lugar</th>
                    <th>Profesor Ausente</th>
                    <th>Profesor Cubridor</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageItems().map((guardia) => {
                    const profesorAusenteId = getProfesorAusenteIdByGuardia(guardia.id)
                    const profesorAusente = profesorAusenteId
                      ? usuarios.find((u) => u.id === profesorAusenteId)
                      : null
                    const profesorCubridor = guardia.profesorCubridorId
                      ? usuarios.find((u) => u.id === guardia.profesorCubridorId)
                      : null
                    const lugar = lugares.find((l) => l.id === guardia.lugarId)

                    return (
                      <tr key={guardia.id}>
                        <td>{new Date(guardia.fecha).toLocaleDateString()}</td>
                        <td>{guardia.tramoHorario}</td>
                        <td>{guardia.tipoGuardia}</td>
                        <td>{lugar ? `${lugar.codigo} - ${lugar.descripcion}` : "No especificado"}</td>
                        <td>{profesorAusente ? profesorAusente.nombre : "No especificado"}</td>
                        <td>{profesorCubridor ? profesorCubridor.nombre : "Pendiente"}</td>
                        <td>
                          <span
                            className={`badge ${
                              guardia.estado === "Pendiente"
                                ? "bg-warning text-dark"
                                : guardia.estado === "Asignada"
                                ? "bg-info"
                                : guardia.estado === "Firmada"
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                          >
                            {guardia.estado}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(guardia)}
                              title="Editar"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            {guardia.estado === "Pendiente" && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleAnular(guardia.id)}
                                title="Anular"
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteGuardia(guardia.id)}
                              title="Eliminar"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <div>
                Mostrando {currentPage * itemsPerPage - itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredGuardias.length)} de {filteredGuardias.length} guardias
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPage={itemsPerPage}
              />
            </div>
          </>
        )}
      </DataCard>
    </div>
  )
} 