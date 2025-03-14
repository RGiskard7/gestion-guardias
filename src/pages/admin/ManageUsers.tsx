"use client"

import type React from "react"
import { useState } from "react"
import Layout from "../../components/Layout"
import { useGuardias, type Usuario } from "../../contexts/GuardiasContext"

const ManageUsers: React.FC = () => {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario, horarios, addHorario } = useGuardias()

  // Filter only profesores (not admins)
  const profesores = usuarios.filter((u) => u.rol === "profesor")

  // State for the form
  const [formData, setFormData] = useState<Omit<Usuario, "id">>({
    nombre: "",
    email: "",
    rol: "profesor",
    activo: true,
  })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [inheritFromId, setInheritFromId] = useState<number | null>(null)

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      // Update existing user
      updateUsuario(editingId, formData)
    } else {
      // Add new user
      addUsuario(formData)

      // If inheriting horarios from another profesor
      if (inheritFromId) {
        // Get the ID of the newly added user
        const newUserId = Math.max(...usuarios.map((u) => u.id)) + 1

        // Get horarios of the profesor to inherit from
        const horariosToCopy = horarios.filter((h) => h.profesorId === inheritFromId)

        // Create new horarios for the new profesor
        horariosToCopy.forEach((horario) => {
          addHorario({
            profesorId: newUserId,
            diaSemana: horario.diaSemana,
            tramoHorario: horario.tramoHorario,
          })
        })
      }
    }

    // Reset form
    resetForm()
  }

  // Reset form and state
  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      rol: "profesor",
      activo: true,
    })
    setEditingId(null)
    setShowForm(false)
    setInheritFromId(null)
  }

  // Start editing a user
  const handleEdit = (usuario: Usuario) => {
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo,
    })
    setEditingId(usuario.id)
    setShowForm(true)
    setInheritFromId(null)
  }

  // Handle user deactivation
  const handleDeactivate = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres desactivar este usuario?")) {
      deleteUsuario(id)
    }
  }

  return (
    <Layout title="Gestión de Usuarios">
      <div className="mb-4">
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
        >
          {showForm ? "Cancelar" : "Añadir Nuevo Profesor"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">{editingId ? "Editar Profesor" : "Añadir Nuevo Profesor"}</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">
                  Nombre
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="activo"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="activo">
                  Activo
                </label>
              </div>

              {!editingId && (
                <div className="mb-3">
                  <label htmlFor="inheritFrom" className="form-label">
                    Heredar horarios de
                  </label>
                  <select
                    className="form-select"
                    id="inheritFrom"
                    onChange={(e) => setInheritFromId(e.target.value ? Number.parseInt(e.target.value) : null)}
                    value={inheritFromId || ""}
                  >
                    <option value="">No heredar horarios</option>
                    {profesores.map((profesor) => (
                      <option key={profesor.id} value={profesor.id}>
                        {profesor.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="form-text">
                    Si este profesor sustituye a otro, puede heredar sus horarios de guardia.
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary">
                {editingId ? "Actualizar" : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">Profesores</div>
        <div className="card-body">
          {profesores.length === 0 ? (
            <div className="alert alert-info">No hay profesores registrados.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {profesores.map((profesor) => (
                    <tr key={profesor.id}>
                      <td>{profesor.id}</td>
                      <td>{profesor.nombre}</td>
                      <td>{profesor.email}</td>
                      <td>
                        {profesor.activo ? (
                          <span className="badge bg-success">Activo</span>
                        ) : (
                          <span className="badge bg-danger">Inactivo</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(profesor)}>
                          Editar
                        </button>
                        {profesor.activo ? (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeactivate(profesor.id)}>
                            Desactivar
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => updateUsuario(profesor.id, { activo: true })}
                          >
                            Activar
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

export default ManageUsers

