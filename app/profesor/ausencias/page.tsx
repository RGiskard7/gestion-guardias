"use client"

import { useState } from "react"
import { useGuardias, type Guardia, type Usuario } from "../../../src/contexts/GuardiasContext"
import { useAuth } from "../../../src/contexts/AuthContext"

export default function AusenciasPage() {
  const { user } = useAuth()
  const { guardias, lugares, usuarios, addGuardia, addTareaGuardia, anularGuardia, getTareasByGuardia } = useGuardias()

  if (!user) return null

  // State for the form
  const [formData, setFormData] = useState({
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaFin: new Date().toISOString().split("T")[0],
    tramosHorarios: [] as string[],
    tipoGuardia: "Aula",
    lugarId: "",
    observaciones: "",
    tarea: "",
  })

  const [showForm, setShowForm] = useState(false)

  // Tramos horarios
  const tramosHorariosOptions = ["1ª hora", "2ª hora", "3ª hora", "4ª hora", "5ª hora", "6ª hora"]

  // Tipos de guardia
  const tiposGuardia = ["Aula", "Patio", "Recreo"]

  // Get mis ausencias
  const misAusencias = guardias
    .filter((g) => g.profesorAusenteId === user.id)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle checkbox changes for tramos horarios
  const handleTramoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target

    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          tramosHorarios: [...prev.tramosHorarios, value],
        }
      } else {
        return {
          ...prev,
          tramosHorarios: prev.tramosHorarios.filter((tramo) => tramo !== value),
        }
      }
    })
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

    if (formData.tramosHorarios.length === 0) {
      alert("Debes seleccionar al menos un tramo horario")
      return
    }

    // Generate dates
    const dateRange = generateDateRange(formData.fechaInicio, formData.fechaFin)

    // Create guardias for each date and tramo
    dateRange.forEach((fecha) => {
      formData.tramosHorarios.forEach((tramoHorario) => {
        // Add guardia
        const newGuardia: Omit<Guardia, "id"> = {
          fecha,
          tramoHorario,
          tipoGuardia: formData.tipoGuardia,
          firmada: false,
          estado: "Pendiente" as const,
          observaciones: formData.observaciones,
          lugarId: Number.parseInt(formData.lugarId),
          profesorAusenteId: user.id,
          profesorCubridorId: null,
        }

        addGuardia(newGuardia)

        // Get the ID of the newly added guardia
        const newGuardiaId = Math.max(...guardias.map((g) => g.id)) + 1

        // Add tarea if provided
        if (formData.tarea) {
          addTareaGuardia({
            guardiaId: newGuardiaId,
            descripcionTarea: formData.tarea,
          })
        }
      })
    })

    // Reset form
    resetForm()
    setShowForm(false)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaFin: new Date().toISOString().split("T")[0],
      tramosHorarios: [],
      tipoGuardia: "Aula",
      lugarId: "",
      observaciones: "",
      tarea: "",
    })
  }

  // Handle guardia cancellation
  const handleAnular = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres anular esta ausencia?")) {
      const motivo = prompt("Por favor, indica el motivo de la anulación:", "");
      if (motivo !== null) {
        anularGuardia(id, motivo);
      }
    }
  }

  // Get lugar name by ID
  const getLugarName = (id: number) => {
    const lugar = lugares.find((l) => l.id === id)
    return lugar ? `${lugar.codigo} - ${lugar.descripcion}` : "Desconocido"
  }

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Mis Ausencias</h1>

      <div className="mb-4">
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
        >
          {showForm ? "Cancelar" : "Registrar Nueva Ausencia"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">Registrar Nueva Ausencia</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
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
                    value={formData.fechaInicio}
                    onChange={handleChange}
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
                    value={formData.fechaFin}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Tramos Horarios</label>
                <div className="row">
                  {tramosHorariosOptions.map((tramo) => (
                    <div key={tramo} className="col-md-4 mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`tramo-${tramo}`}
                          value={tramo}
                          checked={formData.tramosHorarios.includes(tramo)}
                          onChange={handleTramoChange}
                        />
                        <label className="form-check-label" htmlFor={`tramo-${tramo}`}>
                          {tramo}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
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
                  rows={2}
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
                  value={formData.tarea}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ej: Realizar ejercicios 1-5 de la página 45"
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary">
                Registrar Ausencia
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">Mis Ausencias Registradas</div>
        <div className="card-body">
          {misAusencias.length === 0 ? (
            <div className="alert alert-info">No tienes ausencias registradas.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tramo</th>
                    <th>Lugar</th>
                    <th>Estado</th>
                    <th>Profesor Cubridor</th>
                    <th>Tarea</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {misAusencias.map((ausencia) => {
                    const tareas = getTareasByGuardia(ausencia.id)
                    const tieneTarea = tareas.length > 0

                    return (
                      <tr key={ausencia.id}>
                        <td>{new Date(ausencia.fecha).toLocaleDateString("es-ES")}</td>
                        <td>{ausencia.tramoHorario}</td>
                        <td>{getLugarName(ausencia.lugarId)}</td>
                        <td>
                          <span
                            className={`badge ${
                              ausencia.estado === "Pendiente"
                                ? "bg-warning text-dark"
                                : ausencia.estado === "Asignada"
                                  ? "bg-info"
                                  : ausencia.estado === "Firmada"
                                    ? "bg-success"
                                    : "bg-danger"
                            }`}
                          >
                            {ausencia.estado}
                          </span>
                        </td>
                        <td>
                          {ausencia.profesorCubridorId
                            ? usuarios.find((u: Usuario) => u.id === ausencia.profesorCubridorId)?.nombre || "Desconocido"
                            : "Sin asignar"}
                        </td>
                        <td>
                          {tieneTarea ? (
                            <button
                              className="btn btn-sm btn-outline-info"
                              data-bs-toggle="tooltip"
                              title={tareas[0].descripcionTarea}
                            >
                              Ver tarea
                            </button>
                          ) : (
                            "Sin tarea"
                          )}
                        </td>
                        <td>
                          {ausencia.estado === "Pendiente" && (
                            <button className="btn btn-sm btn-danger" onClick={() => handleAnular(ausencia.id)}>
                              Anular
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 