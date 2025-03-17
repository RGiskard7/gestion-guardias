"use client"

import { useState } from "react"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { useHorarios } from "@/src/contexts/HorariosContext"
import { Usuario, Horario } from "@/src/types"
import { Pagination } from "@/components/ui/pagination"

export default function UsersPage() {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario } = useUsuarios()
  const { horarios, addHorario } = useHorarios()

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Añadir log para depuración
  console.log("Estado actual:", { showForm, editingId, error })

  // Calcular el número total de páginas
  const totalPages = Math.max(1, Math.ceil(profesores.length / itemsPerPage))
  
  // Obtener los elementos de la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, profesores.length)
    return profesores.slice(startIndex, endIndex)
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
    setIsSubmitting(true)

    try {
      if (editingId) {
        // Actualizar usuario existente
        await updateUsuario(editingId, formData)
        alert("Usuario actualizado correctamente")
      } else {
        // Añadir nuevo usuario
        await addUsuario(formData)
        alert("Usuario creado correctamente")
      }
      resetForm()
    } catch (error) {
      console.error("Error al procesar usuario:", error)
      setError("Error al procesar usuario")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Resetear formulario y estado
  const resetForm = () => {
    console.log("Reseteando formulario")
    setFormData({
      nombre: "",
      email: "",
      rol: "profesor",
      activo: true,
    })
    setEditingId(null)
    // No resetear showForm aquí para evitar conflictos con el botón
    setInheritFromId(null)
    console.log("Formulario reseteado")
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
    <div className="container mt-4">
      <h1 className="mb-4">Gestión de Usuarios</h1>

      <div className="mb-4">
        <button
          className="btn btn-primary"
          onClick={() => {
            console.log("Botón Nuevo Usuario clickeado, showForm actual:", showForm)
            setShowForm(true)
            setEditingId(null)
            resetForm()
            console.log("showForm después de click: true")
          }}
        >
          Nuevo Usuario
        </button>
        
        {showForm && (
          <button
            className="btn btn-secondary ms-2"
            onClick={() => {
              console.log("Botón Cancelar clickeado")
              setShowForm(false)
              console.log("showForm después de cancelar: false")
            }}
          >
            Cancelar
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Log para depurar: {showForm ? "Mostrar formulario" : "No mostrar formulario"} */}
      
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
                  {getCurrentPageItems().map((profesor: Usuario) => (
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
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(profesor)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeactivate(profesor.id)}
                          >
                            {profesor.activo ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Componente de paginación */}
              {profesores.length > 0 && (
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={handlePageChange} 
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={profesores.length}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 