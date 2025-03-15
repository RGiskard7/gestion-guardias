"use client"

import { useState } from "react"
import { useGuardias, type Usuario, type Horario } from "@/src/contexts/GuardiasContext"

export default function UsersPage() {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario, horarios, addHorario } = useGuardias()

  // Filtrar solo profesores (no admins)
  const profesores = usuarios.filter((u: Usuario) => u.rol === "profesor")

  // Estado para el formulario
  const [formData, setFormData] = useState<Omit<Usuario, "id">>({
    nombre: "",
    email: "",
    rol: "profesor",
    activo: true,
  })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [inheritFromId, setInheritFromId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (editingId) {
      // Actualizar usuario existente
      updateUsuario(editingId, formData)
      resetForm()
    } else {
      // Añadir nuevo usuario
      const result = await addUsuario(formData)
      
      if (result.success) {
        // Si hereda horarios de otro profesor
        if (inheritFromId) {
          // Obtener el ID del usuario recién añadido
          const newUserId = Math.max(...usuarios.map((u: Usuario) => u.id)) + 1

          // Obtener horarios del profesor a heredar
          const horariosToCopy = horarios.filter((h: Horario) => h.profesorId === inheritFromId)

          // Crear nuevos horarios para el nuevo profesor
          horariosToCopy.forEach((horario: Horario) => {
            addHorario({
              profesorId: newUserId,
              diaSemana: horario.diaSemana,
              tramoHorario: horario.tramoHorario,
            })
          })
        }
        
        // Resetear formulario
        resetForm()
      } else {
        // Mostrar mensaje de error
        setError(result.error || "Error al crear usuario")
      }
    }
  }

  // Resetear formulario y estado
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

  // Comenzar edición de usuario
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

  // Manejar desactivación de usuario
  const handleDeactivate = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres desactivar este usuario?")) {
      deleteUsuario(id)
    }
  }

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Gestión de Usuarios</h1>
      
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
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
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
                    {profesores.map((profesor: Usuario) => (
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
                  {profesores.map((profesor: Usuario) => (
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
    </div>
  )
} 