"use client"

import { useState } from "react"
import { useGuardias, type Guardia, type Usuario, type Lugar } from "../../../src/contexts/GuardiasContext"

export default function GuardiasPage() {
  const { guardias, lugares, usuarios, addGuardia, updateGuardia, deleteGuardia, addTareaGuardia, anularGuardia } =
    useGuardias()

  // Obtener solo profesores (no admins)
  const profesores = usuarios.filter((u: Usuario) => u.rol === "profesor" && u.activo)

  // Estado para el formulario
  const [formData, setFormData] = useState<Omit<Guardia, "id"> & { tarea?: string }>({
    fecha: new Date().toISOString().split("T")[0],
    tramoHorario: "",
    tipoGuardia: "",
    firmada: false,
    estado: "Pendiente",
    observaciones: "",
    lugarId: 0,
    profesorAusenteId: null,
    profesorCubridorId: null,
    tarea: "",
  })

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

  // Tramos horarios
  const tramosHorarios = ["1ª hora", "2ª hora", "3ª hora", "4ª hora", "5ª hora", "6ª hora"]

  // Tipos de guardia
  const tiposGuardia = ["Aula", "Patio", "Recreo"]

  // Estados de guardia
  const estadosGuardia = ["Pendiente", "Asignada", "Firmada", "Anulada"]

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "lugarId" || (name === "profesorAusenteId" && value !== "")
            ? Number.parseInt(value)
            : name === "profesorAusenteId" && value === ""
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
      updateGuardia(editingId, guardiaData)
      setEditingId(null)
    } else if (isRangeMode) {
      // Crear guardias para un rango de fechas
      const fechas = generateDateRange(rangoFechas.fechaInicio, rangoFechas.fechaFin)
      
      // Crear una guardia para cada fecha
      fechas.forEach(async (fecha) => {
        const { tarea, ...guardiaData } = formData
        const guardiaWithDate = { ...guardiaData, fecha }
        
        // Añadir guardia con tarea
        await addGuardia(guardiaWithDate, tarea)
      })
    } else {
      // Añadir una sola guardia
      const { tarea, ...guardiaData } = formData
      
      // Añadir guardia con tarea
      await addGuardia(guardiaData, tarea)
    }

    // Resetear formulario
    resetForm()
  }

  // Resetear formulario y estado
  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split("T")[0],
      tramoHorario: "",
      tipoGuardia: "",
      firmada: false,
      estado: "Pendiente",
      observaciones: "",
      lugarId: 0,
      profesorAusenteId: null,
      profesorCubridorId: null,
      tarea: "",
    })
    setRangoFechas({
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaFin: new Date().toISOString().split("T")[0],
    })
    setEditingId(null)
    setShowForm(false)
    setIsRangeMode(false)
  }

  // Comenzar edición de guardia
  const handleEdit = (guardia: Guardia) => {
    setFormData({
      fecha: guardia.fecha,
      tramoHorario: guardia.tramoHorario,
      tipoGuardia: guardia.tipoGuardia,
      firmada: guardia.firmada,
      estado: guardia.estado,
      observaciones: guardia.observaciones,
      lugarId: guardia.lugarId,
      profesorAusenteId: guardia.profesorAusenteId,
      profesorCubridorId: guardia.profesorCubridorId,
    })
    setEditingId(guardia.id)
    setShowForm(true)
    setIsRangeMode(false)
  }

  // Manejar anulación de guardia
  const handleAnular = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres anular esta guardia?")) {
      anularGuardia(id)
    }
  }

  // Filtrar guardias por estado y fecha
  const filteredGuardias = guardias
    .filter((g: Guardia) => !filterEstado || g.estado === filterEstado)
    .filter((g: Guardia) => !filterFecha || g.fecha === filterFecha)
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

  // Obtener nombre del profesor por ID
  const getProfesorName = (id: number | null) => {
    if (!id) return "No asignado"

    const profesor = profesores.find((p: Usuario) => p.id === id)
    return profesor ? profesor.nombre : "Desconocido"
  }

  // Obtener nombre del lugar por ID
  const getLugarName = (id: number) => {
    const lugar = lugares.find((l: Lugar) => l.id === id)
    return lugar ? `${lugar.codigo} - ${lugar.descripcion}` : "Desconocido"
  }

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Gestión de Guardias</h1>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="input-group">
            <span className="input-group-text">Filtrar por Estado</span>
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
        <div className="col-md-3">
          <div className="input-group">
            <span className="input-group-text">Filtrar por Fecha</span>
            <input
              type="date"
              className="form-control"
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              aria-label="Filtrar guardias por fecha"
            />
          </div>
        </div>
        <div className="col-md-6 text-end">
          <button
            className="btn btn-primary me-2"
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
              setIsRangeMode(false)
            }}
          >
            {showForm ? "Cancelar" : "Añadir Nueva Guardia"}
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
              Añadir Guardias por Rango
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            {editingId ? "Editar Guardia" : isRangeMode ? "Añadir Guardias por Rango" : "Añadir Nueva Guardia"}
          </div>
          <div className="card-body">
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
                <div className="mb-3">
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
              )}

              <div className="mb-3">
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
                  {tramosHorarios.map((tramo) => (
                    <option key={tramo} value={tramo}>
                      {tramo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
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
                  <option value="">Selecciona un tipo</option>
                  {tiposGuardia.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="lugarId" className="form-label">
                  Lugar
                </label>
                <select
                  className="form-select"
                  id="lugarId"
                  name="lugarId"
                  value={formData.lugarId || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un lugar</option>
                  {lugares.map((lugar: Lugar) => (
                    <option key={lugar.id} value={lugar.id}>
                      {lugar.codigo} - {lugar.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="profesorAusenteId" className="form-label">
                  Profesor Ausente
                </label>
                <select
                  className="form-select"
                  id="profesorAusenteId"
                  name="profesorAusenteId"
                  value={formData.profesorAusenteId || ""}
                  onChange={handleChange}
                >
                  <option value="">No asignado</option>
                  {profesores.map((profesor: Usuario) => (
                    <option key={profesor.id} value={profesor.id}>
                      {profesor.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="tarea" className="form-label">
                  Tarea
                </label>
                <textarea
                  className="form-control"
                  id="tarea"
                  name="tarea"
                  value={formData.tarea || ""}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Descripción de la tarea a realizar durante la guardia"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="observaciones" className="form-label">
                  Observaciones
                </label>
                <textarea
                  className="form-control"
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                {editingId ? "Actualizar" : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">Guardias</div>
        <div className="card-body">
          {filteredGuardias.length === 0 ? (
            <div className="alert alert-info">No hay guardias registradas.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Tramo</th>
                    <th>Tipo</th>
                    <th>Lugar</th>
                    <th>Profesor Ausente</th>
                    <th>Profesor Cubridor</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuardias.map((guardia: Guardia) => (
                    <tr key={guardia.id}>
                      <td>{guardia.id}</td>
                      <td>{guardia.fecha}</td>
                      <td>{guardia.tramoHorario}</td>
                      <td>{guardia.tipoGuardia}</td>
                      <td>{getLugarName(guardia.lugarId)}</td>
                      <td>{getProfesorName(guardia.profesorAusenteId)}</td>
                      <td>{getProfesorName(guardia.profesorCubridorId)}</td>
                      <td>
                        <span
                          className={`badge ${
                            guardia.estado === "Pendiente"
                              ? "bg-warning"
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
                        <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(guardia)}>
                          Editar
                        </button>
                        {guardia.estado !== "Anulada" && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleAnular(guardia.id)}>
                            Anular
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 