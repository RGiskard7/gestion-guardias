"use client"

import { useState } from "react"
import { useGuardias, type Lugar } from "@/src/contexts/GuardiasContext"
import { Pagination } from "@/components/ui/pagination"

export default function LugaresPage() {
  const { lugares, addLugar, updateLugar, deleteLugar } = useGuardias()

  // Estado para el formulario
  const [formData, setFormData] = useState<Omit<Lugar, "id">>({
    codigo: "",
    descripcion: "",
    tipoLugar: "aula",
  })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Añadir log para depuración
  console.log("Estado actual de lugares:", { showForm, editingId, error })
  
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(lugares.length / itemsPerPage)
  
  // Obtener los elementos de la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return lugares.slice(startIndex, endIndex)
  }
  
  // Cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Tipos de lugar
  const tiposLugar = ["Aula", "Patio", "Laboratorio", "Gimnasio", "Biblioteca", "Otro"]

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      // Actualizar lugar existente
      updateLugar(editingId, formData)
    } else {
      // Añadir nuevo lugar
      addLugar(formData)
    }

    // Resetear formulario
    resetForm()
  }

  // Resetear formulario y estado
  const resetForm = () => {
    console.log("Reseteando formulario de lugares")
    setFormData({
      codigo: "",
      descripcion: "",
      tipoLugar: "aula",
    })
    setEditingId(null)
    // No resetear showForm aquí para evitar conflictos con el botón
    console.log("Formulario de lugares reseteado")
  }

  // Comenzar edición de lugar
  const handleEdit = (lugar: Lugar) => {
    setFormData({
      codigo: lugar.codigo,
      descripcion: lugar.descripcion,
      tipoLugar: lugar.tipoLugar,
    })
    setEditingId(lugar.id)
    setShowForm(true)
  }

  // Manejar eliminación de lugar
  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este lugar?")) {
      deleteLugar(id)
    }
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gestión de Lugares</h1>

      <div className="mb-4">
        <button
          className="btn btn-primary"
          onClick={() => {
            console.log("Botón Nuevo Lugar clickeado, showForm actual:", showForm)
            // Cambiar directamente a true en lugar de alternar
            setShowForm(true)
            setEditingId(null)
            resetForm()
            console.log("showForm después de click: true")
          }}
        >
          Nuevo Lugar
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

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">{editingId ? "Editar Lugar" : "Añadir Nuevo Lugar"}</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="codigo" className="form-label">
                  Código
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="codigo"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  placeholder="Ej: A-01, P-02"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">
                  Descripción
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Ej: Aula 1ºA, Patio Principal"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="tipoLugar" className="form-label">
                  Tipo de Lugar
                </label>
                <select
                  className="form-select"
                  id="tipoLugar"
                  name="tipoLugar"
                  value={formData.tipoLugar}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un tipo</option>
                  {tiposLugar.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
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
        <div className="card-header">Lugares</div>
        <div className="card-body">
          {lugares.length === 0 ? (
            <div className="alert alert-info">No hay lugares registrados.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageItems().map((lugar: Lugar) => (
                    <tr key={lugar.id}>
                      <td>{lugar.id}</td>
                      <td>{lugar.codigo}</td>
                      <td>{lugar.descripcion}</td>
                      <td>{lugar.tipoLugar}</td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(lugar)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(lugar.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Componente de paginación */}
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 