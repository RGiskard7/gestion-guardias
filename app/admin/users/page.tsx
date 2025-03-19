"use client"

import { useState } from "react"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { useHorarios } from "@/src/contexts/HorariosContext"
import { Usuario, Horario } from "@/src/types"
import { Pagination } from "@/components/ui/pagination"
import DataCard from "@/components/common/DataCard"
import { DB_CONFIG } from "@/lib/db-config"

export default function UsersPage() {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario } = useUsuarios()
  const { horarios, addHorario } = useHorarios()

  // Filtrar solo profesores (no admins)
  const profesores = usuarios.filter((u: Usuario) => u.rol === DB_CONFIG.ROLES.PROFESOR)

  // Estado para el formulario
  const [formData, setFormData] = useState<Omit<Usuario, "id">>({
    nombre: "",
    email: "",
    rol: DB_CONFIG.ROLES.PROFESOR,
    activo: true,
  })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [inheritFromId, setInheritFromId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Estados para filtros
  const [filterNombre, setFilterNombre] = useState<string>("")
  const [filterEstado, setFilterEstado] = useState<string>("")
  
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filtrar profesores según criterios
  const filteredProfesores = profesores.filter((profesor: Usuario) => {
    // Filtrar por nombre o email
    if (filterNombre && 
        !profesor.nombre.toLowerCase().includes(filterNombre.toLowerCase()) &&
        !profesor.email.toLowerCase().includes(filterNombre.toLowerCase())) {
      return false
    }
    
    // Filtrar por estado
    if (filterEstado === DB_CONFIG.ESTADOS_USUARIO.ACTIVO && !profesor.activo) {
      return false
    }
    if (filterEstado === DB_CONFIG.ESTADOS_USUARIO.INACTIVO && profesor.activo) {
      return false
    }
    
    return true
  })

  // Calcular el número total de páginas
  const totalPages = Math.ceil(filteredProfesores.length / itemsPerPage)
  
  // Obtener los elementos de la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProfesores.slice(startIndex, endIndex)
  }
  
  // Cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
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
      setShowForm(false)
    } catch (error) {
      console.error("Error al procesar usuario:", error)
      setError("Error al procesar usuario")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Resetear formulario y estado
  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      rol: DB_CONFIG.ROLES.PROFESOR,
      activo: true,
    })
    setEditingId(null)
    setInheritFromId(null)
    setError(null)
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

  // Manejar activación/desactivación de usuario
  const handleDeactivate = (id: number, isActive: boolean) => {
    const action = isActive ? "desactivar" : "activar"
    if (window.confirm(`¿Estás seguro de que quieres ${action} este usuario?`)) {
      updateUsuario(id, { activo: !isActive })
    }
  }

  // Función para refrescar los datos
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // En un entorno real, aquí iría la llamada para refrescar datos
      // Por ahora, simulamos un retraso
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Error al refrescar los usuarios:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

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
        .cursor-pointer {
          cursor: pointer;
        }
        .user-select-none {
          user-select: none;
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Gestión de Usuarios</h1>
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
        <div className="row g-4">
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="filterNombre" className="form-label fw-bold">Buscar</label>
              <input
                type="text"
                id="filterNombre"
                className="form-control"
                placeholder="Nombre o email"
                value={filterNombre}
                onChange={(e) => setFilterNombre(e.target.value)}
              />
              <small className="form-text text-muted">Buscar por nombre o email del profesor</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="filterEstado" className="form-label fw-bold">Estado</label>
              <select
                id="filterEstado"
                className="form-select"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value={DB_CONFIG.ESTADOS_USUARIO.ACTIVO}>Activos</option>
                <option value={DB_CONFIG.ESTADOS_USUARIO.INACTIVO}>Inactivos</option>
              </select>
              <small className="form-text text-muted">Filtrar por estado del profesor</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group d-flex flex-column h-100">
              <label className="form-label fw-bold">Acciones</label>
              <div className="mt-auto">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    resetForm()
                    setShowForm(!showForm)
                  }}
                >
                  <i className={`bi ${showForm ? "bi-x-circle" : "bi-plus-circle"} me-2`}></i>
                  {showForm ? "Cancelar" : "Nuevo Profesor"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DataCard>

      {showForm && (
        <DataCard
          title={editingId ? "Editar Profesor" : "Nuevo Profesor"}
          icon={editingId ? "pencil-square" : "person-plus"}
          className="mb-4"
        >
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="nombre" className="form-label fw-bold">
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
                  <small className="form-text text-muted">Nombre completo del profesor</small>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="email" className="form-label fw-bold">
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
                  <small className="form-text text-muted">Correo electrónico del profesor</small>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <div className="form-check form-switch mt-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="activo"
                      name="activo"
                      checked={formData.activo}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="activo">
                      Usuario Activo
                    </label>
                    <div className="form-text">
                      Los usuarios inactivos no pueden acceder al sistema
                    </div>
                  </div>
                </div>
              </div>

              {!editingId && (
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="inheritFrom" className="form-label fw-bold">
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
                    <small className="form-text text-muted">
                      Si este profesor sustituye a otro, puede heredar sus horarios de guardia
                    </small>
                  </div>
                </div>
              )}
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}

            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
              <button 
                type="button" 
                className="btn btn-outline-secondary me-3"
                onClick={() => {
                  resetForm()
                  setShowForm(false)
                }}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {editingId ? "Actualizando..." : "Guardando..."}
                  </>
                ) : (
                  <>
                    <i className={`bi ${editingId ? "bi-check-circle" : "bi-plus-circle"} me-2`}></i>
                    {editingId ? "Actualizar" : "Guardar"}
                  </>
                )}
              </button>
            </div>
          </form>
        </DataCard>
      )}

      <DataCard
        title="Listado de Profesores"
        icon="people"
        className="mb-4"
      >
        {filteredProfesores.length === 0 ? (
          <div className="alert alert-info d-flex align-items-center">
            <i className="bi bi-info-circle-fill fs-4 me-3"></i>
            <div>No hay profesores que coincidan con los filtros seleccionados.</div>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Email</th>
                    <th scope="col">Estado</th>
                    <th scope="col" className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageItems().map((profesor: Usuario) => (
                    <tr key={profesor.id}>
                      <td className="fw-medium">{profesor.nombre}</td>
                      <td>{profesor.email}</td>
                      <td>
                        {profesor.activo ? (
                          <span className="badge bg-success rounded-pill px-3 py-2">Activo</span>
                        ) : (
                          <span className="badge bg-danger rounded-pill px-3 py-2">Inactivo</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(profesor)}
                            title="Editar profesor"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleDeactivate(profesor.id, profesor.activo)}
                            title={profesor.activo ? "Desactivar profesor" : "Activar profesor"}
                          >
                            <i className={`bi ${profesor.activo ? "bi-person-dash" : "bi-person-check"}`}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <div className="text-muted small">
                Mostrando <span className="fw-bold">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredProfesores.length)}</span> de <span className="fw-bold">{filteredProfesores.length}</span> profesores
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