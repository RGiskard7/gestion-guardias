"use client"

import { useState } from "react"
import { useGuardias, type Lugar } from "@/src/contexts/GuardiasContext"

export default function LugaresPage() {
  const { lugares, addLugar, updateLugar, deleteLugar } = useGuardias()

  // Estado para el formulario
  const [formData, setFormData] = useState<Omit<Lugar, "id">>({
    codigo: "",
    descripcion: "",
    tipoLugar: "",
  })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filterTipo, setFilterTipo] = useState<string>("")

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
    setFormData({
      codigo: "",
      descripcion: "",
      tipoLugar: "",
    })
    setEditingId(null)
    setShowForm(false)
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

  // Filtrar lugares por tipo
  const filteredLugares = filterTipo ? lugares.filter((l: Lugar) => l.tipoLugar === filterTipo) : lugares

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Gestión de Lugares</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">Filtrar por Tipo</span>
            <select 
              className="form-select" 
              value={filterTipo} 
              onChange={(e) => setFilterTipo(e.target.value)}
              aria-label="Filtrar lugares por tipo"
            >
              <option value="">Todos los tipos</option>
              {tiposLugar.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
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
            {showForm ? "Cancelar" : "Añadir Nuevo Lugar"}
          </button>
        </div>
      </div>

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
          {filteredLugares.length === 0 ? (
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
                  {filteredLugares.map((lugar: Lugar) => (
                    <tr key={lugar.id}>
                      <td>{lugar.id}</td>
                      <td>{lugar.codigo}</td>
                      <td>{lugar.descripcion}</td>
                      <td>{lugar.tipoLugar}</td>
                      <td>
                        <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(lugar)}>
                          Editar
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(lugar.id)}>
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
    </div>
  )
} 