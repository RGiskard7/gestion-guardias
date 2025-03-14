"use client"

import type React from "react"
import { useState } from "react"
import Layout from "../../components/Layout"
import { useGuardias, type Guardia } from "../../contexts/GuardiasContext"

const ManageGuardias: React.FC = () => {
  const { guardias, lugares, usuarios, addGuardia, updateGuardia, deleteGuardia, addTareaGuardia, anularGuardia } =
    useGuardias()

  // Get only profesores (not admins)
  const profesores = usuarios.filter((u) => u.rol === "profesor" && u.activo)

  // State for the form
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

  // State for range of dates
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

  // Handle form input changes
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

  // Handle range date changes
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setRangoFechas((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Generate dates between start and end date
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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      // Update existing guardia
      const { tarea, ...guardiaData } = formData
      updateGuardia(editingId, guardiaData)

      // Add tarea if provided
      if (tarea) {
        addTareaGuardia({
          guardiaId: editingId,
          descripcionTarea: tarea,
        })
      }
    } else if (isRangeMode) {
      // Create guardias for a range of dates
      const dateRange = generateDateRange(rangoFechas.fechaInicio, rangoFechas.fechaFin)

      dateRange.forEach((fecha) => {
        const { tarea, ...guardiaData } = formData
        const newGuardia = {
          ...guardiaData,
          fecha,
        }

        // Add guardia
        addGuardia(newGuardia)

        // Get the ID of the newly added guardia
        const newGuardiaId = Math.max(...guardias.map((g) => g.id)) + 1

        // Add tarea if provided
        if (tarea) {
          addTareaGuardia({
            guardiaId: newGuardiaId,
            descripcionTarea: tarea,
          })
        }
      })
    } else {
      // Add single guardia
      const { tarea, ...guardiaData } = formData

      // Add guardia
      addGuardia(guardiaData)

      // Get the ID of the newly added guardia
      const newGuardiaId = Math.max(...guardias.map((g) => g.id)) + 1

      // Add tarea if provided
      if (tarea) {
        addTareaGuardia({
          guardiaId: newGuardiaId,
          descripcionTarea: tarea,
        })
      }
    }

    // Reset form
    resetForm()
  }

  // Reset form and state
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

  // Start editing a guardia
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

  // Handle guardia cancellation
  const handleAnular = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres anular esta guardia?")) {
      anularGuardia(id)
    }
  }

  // Filter guardias by estado and fecha
  const filteredGuardias = guardias
    .filter((g) => !filterEstado || g.estado === filterEstado)
    .filter((g) => !filterFecha || g.fecha === filterFecha)
    .sort((a, b) => {
      // Sort by date (newest first) and then by tramo horario
      if (a.fecha !== b.fecha) {
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      }

      // Extract number from tramo horario (e.g., "1ª hora" -> 1)
      const getTramoNumber = (tramo: string) => {
        const match = tramo.match(/(\d+)/)
        return match ? Number.parseInt(match[1]) : 0
      }

      return getTramoNumber(a.tramoHorario) - getTramoNumber(b.tramoHorario)
    })

  // Get profesor name by ID
  const getProfesorName = (id: number | null) => {
    if (!id) return "No asignado"

    const profesor = profesores.find((p) => p.id === id)
    return profesor ? profesor.nombre : "Desconocido"
  }

  // Get lugar name by ID
  const getLugarName = (id: number) => {
    const lugar = lugares.find((l) => l.id === id)
    return lugar ? `${lugar.codigo} - ${lugar.descripcion}` : "Desconocido"
  }

  return (
    <Layout title="Gestión de Guardias">
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="input-group">
            <span className="input-group-text">Filtrar por Estado</span>
            <select className="form-select" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
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
            {showForm && !isRangeMode ? "Cancelar" : "Añadir Guardia"}
          </button>
          <button
            className="btn btn-success"
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
              setIsRangeMode(true)
            }}
          >
            {showForm && isRangeMode ? "Cancelar" : "Añadir Rango de Guardias"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            {editingId ? "Editar Guardia" : isRangeMode ? "Añadir Rango de Guardias" : "Añadir Guardia"}
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
                  {lugares.map((lugar) => (
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
                  <option value="">Sin profesor ausente</option>
                  {profesores.map((profesor) => (
                    <option key={profesor.id} value={profesor.id}>
                      {profesor.nombre}
                    </option>
                  ))}
                </select>
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
                ></textarea>
              </div>

              <div className="mb-3">
                <label htmlFor="tarea" className="form-label">
                  Tarea para los alumnos
                </label>
                <textarea
                  className="form-control"
                  id="tarea"
                  name="tarea"
                  value={formData.tarea || ""}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ej: Realizar ejercicios 1-5 de la página 45"
                ></textarea>
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
            <div className="alert alert-info">No hay guardias registradas con los filtros seleccionados.</div>
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
                  {filteredGuardias.map((guardia) => (
                    <tr key={guardia.id}>
                      <td>{guardia.id}</td>
                      <td>{new Date(guardia.fecha).toLocaleDateString("es-ES")}</td>
                      <td>{guardia.tramoHorario}</td>
                      <td>{guardia.tipoGuardia}</td>
                      <td>{getLugarName(guardia.lugarId)}</td>
                      <td>{getProfesorName(guardia.profesorAusenteId)}</td>
                      <td>{getProfesorName(guardia.profesorCubridorId)}</td>
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
                        <button
                          className="btn btn-sm btn-primary me-1"
                          onClick={() => handleEdit(guardia)}
                          disabled={guardia.estado === "Anulada"}
                        >
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
    </Layout>
  )
}

export default ManageGuardias

