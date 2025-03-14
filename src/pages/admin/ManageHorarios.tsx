"use client"

import type React from "react"
import { useState } from "react"
import Layout from "../../components/Layout"
import { useGuardias, type Horario } from "../../contexts/GuardiasContext"

const ManageHorarios: React.FC = () => {
  const { horarios, usuarios, addHorario, updateHorario, deleteHorario } = useGuardias()

  // Get only profesores (not admins)
  const profesores = usuarios.filter((u) => u.rol === "profesor" && u.activo)

  // State for the form
  const [formData, setFormData] = useState<Omit<Horario, "id">>({
    profesorId: 0,
    diaSemana: "",
    tramoHorario: "",
  })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedProfesor, setSelectedProfesor] = useState<number | null>(null)

  // Días de la semana
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

  // Tramos horarios
  const tramosHorarios = ["1ª hora", "2ª hora", "3ª hora", "4ª hora", "5ª hora", "6ª hora"]

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: name === "profesorId" ? Number.parseInt(value) : value,
    }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      // Update existing horario
      updateHorario(editingId, formData)
    } else {
      // Add new horario
      addHorario(formData)
    }

    // Reset form
    resetForm()
  }

  // Reset form and state
  const resetForm = () => {
    setFormData({
      profesorId: 0,
      diaSemana: "",
      tramoHorario: "",
    })
    setEditingId(null)
    setShowForm(false)
  }

  // Start editing a horario
  const handleEdit = (horario: Horario) => {
    setFormData({
      profesorId: horario.profesorId,
      diaSemana: horario.diaSemana,
      tramoHorario: horario.tramoHorario,
    })
    setEditingId(horario.id)
    setShowForm(true)
  }

  // Handle horario deletion
  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este horario?")) {
      deleteHorario(id)
    }
  }

  // Filter horarios by selected profesor
  const filteredHorarios = selectedProfesor ? horarios.filter((h) => h.profesorId === selectedProfesor) : horarios

  // Get profesor name by ID
  const getProfesorName = (id: number) => {
    const profesor = profesores.find((p) => p.id === id)
    return profesor ? profesor.nombre : "Desconocido"
  }

  return (
    <Layout title="Gestión de Horarios">
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">Filtrar por Profesor</span>
            <select
              className="form-select"
              value={selectedProfesor || ""}
              onChange={(e) => setSelectedProfesor(e.target.value ? Number.parseInt(e.target.value) : null)}
            >
              <option value="">Todos los profesores</option>
              {profesores.map((profesor) => (
                <option key={profesor.id} value={profesor.id}>
                  {profesor.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-md-6 text-end">
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
            }}
          >
            {showForm ? "Cancelar" : "Añadir Nuevo Horario"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">{editingId ? "Editar Horario" : "Añadir Nuevo Horario"}</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="profesorId" className="form-label">
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
                  {profesores.map((profesor) => (
                    <option key={profesor.id} value={profesor.id}>
                      {profesor.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="diaSemana" className="form-label">
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
              </div>

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

              <button type="submit" className="btn btn-primary">
                {editingId ? "Actualizar" : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">Horarios de Guardia</div>
        <div className="card-body">
          {filteredHorarios.length === 0 ? (
            <div className="alert alert-info">No hay horarios registrados.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Profesor</th>
                    <th>Día</th>
                    <th>Tramo Horario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHorarios.map((horario) => (
                    <tr key={horario.id}>
                      <td>{horario.id}</td>
                      <td>{getProfesorName(horario.profesorId)}</td>
                      <td>{horario.diaSemana}</td>
                      <td>{horario.tramoHorario}</td>
                      <td>
                        <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(horario)}>
                          Editar
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(horario.id)}>
                          Eliminar
                        </button>
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

export default ManageHorarios

