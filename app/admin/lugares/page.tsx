"use client"

import { useState } from "react"
import { useLugares } from "@/src/contexts/LugaresContext"
import { Lugar } from "@/src/types"
import { Pagination } from "@/components/ui/pagination"
import DataCard from "@/components/common/DataCard"
import { DB_CONFIG } from "@/lib/db-config"

export default function LugaresPage() {
  const { lugares, addLugar, updateLugar, deleteLugar } = useLugares()

  // Estado para el formulario
  const [formData, setFormData] = useState<Omit<Lugar, "id">>({
    codigo: "",
    descripcion: "",
    tipoLugar: DB_CONFIG.TIPOS_LUGAR[0].toLowerCase(),
  })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Estado para filtro
  const [filterTipo, setFilterTipo] = useState<string>("")
  const [filterTexto, setFilterTexto] = useState<string>("")
  
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Filtrar lugares según criterios
  const filteredLugares = lugares.filter((lugar) => {
    // Filtrar por tipo de lugar
    if (filterTipo && lugar.tipoLugar.toLowerCase() !== filterTipo.toLowerCase()) {
      return false
    }
    
    // Filtrar por texto (buscar en código y descripción)
    if (filterTexto) {
      const searchTerm = filterTexto.toLowerCase()
      return (
        lugar.codigo.toLowerCase().includes(searchTerm) ||
        (lugar.descripcion?.toLowerCase().includes(searchTerm) ?? false)
      )
    }
    
    return true
  })
  
  const totalPages = Math.ceil(filteredLugares.length / itemsPerPage)
  
  // Obtener los elementos de la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredLugares.slice(startIndex, endIndex)
  }
  
  // Cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Tipos de lugar
  const tiposLugar = DB_CONFIG.TIPOS_LUGAR

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
    // Ocultar formulario después de enviar
    setShowForm(false)
  }

  // Resetear formulario y estado
  const resetForm = () => {
    setFormData({
      codigo: "",
      descripcion: "",
      tipoLugar: DB_CONFIG.TIPOS_LUGAR[0].toLowerCase(),
    })
    setEditingId(null)
    setError(null)
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

  // Función para refrescar los datos
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // En un entorno real, aquí iría la llamada para refrescar datos
      // Por ahora, simulamos un retraso
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Error al refrescar los lugares:", error)
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
        <h1 className="mb-0">Gestión de Lugares</h1>
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
              <label htmlFor="filterTipo" className="form-label fw-bold">Tipo de Lugar</label>
              <select
                id="filterTipo"
                className="form-select"
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                {tiposLugar.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              <small className="form-text text-muted">Filtrar por tipo de lugar</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="filterTexto" className="form-label fw-bold">Buscar</label>
              <input
                type="text"
                id="filterTexto"
                className="form-control"
                value={filterTexto}
                onChange={(e) => setFilterTexto(e.target.value)}
                placeholder="Código o descripción"
              />
              <small className="form-text text-muted">Buscar por código o descripción</small>
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
                  {showForm ? "Cancelar" : "Nuevo Lugar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DataCard>

      {showForm && (
        <DataCard
          title={editingId ? "Editar Lugar" : "Nuevo Lugar"}
          icon={editingId ? "pencil-square" : "geo-alt-fill"}
          className="mb-4"
        >
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="codigo" className="form-label fw-bold">
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
                  <small className="form-text text-muted">Código identificativo del lugar</small>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="tipoLugar" className="form-label fw-bold">
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
                      <option key={tipo} value={tipo.toLowerCase()}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                  <small className="form-text text-muted">Categoría a la que pertenece este lugar</small>
                </div>
              </div>
              
              <div className="col-12">
                <div className="form-group">
                  <label htmlFor="descripcion" className="form-label fw-bold">
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
                  />
                  <small className="form-text text-muted">Descripción detallada del lugar (opcional)</small>
                </div>
              </div>
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}

            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
              <button type="button" className="btn btn-outline-secondary me-3" onClick={() => {
                resetForm()
                setShowForm(false)
              }}>
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                <i className={`bi ${editingId ? "bi-check-circle" : "bi-plus-circle"} me-2`}></i>
                {editingId ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </DataCard>
      )}

      <DataCard
        title="Listado de Lugares"
        icon="geo-alt"
        className="mb-4"
      >
        {filteredLugares.length === 0 ? (
          <div className="alert alert-info d-flex align-items-center">
            <i className="bi bi-info-circle-fill fs-4 me-3"></i>
            <div>No hay lugares que coincidan con los filtros seleccionados.</div>
          </div>
        ) : (
          <>
            <div className="table-responsive" style={{ overflow: 'auto', maxWidth: '100%' }}>
              <table className="table table-striped table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: '80px' }}>Código</th>
                    <th style={{ minWidth: '120px' }}>Tipo</th>
                    <th style={{ minWidth: '150px' }}>Descripción</th>
                    <th style={{ minWidth: '100px' }}>Capacidad</th>
                    <th style={{ minWidth: '100px' }} className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageItems().map((lugar) => (
                    <tr key={lugar.id}>
                      <td className="fw-medium">{lugar.codigo}</td>
                      <td>
                        <span className="badge bg-info rounded-pill px-3 py-2">
                          {lugar.tipoLugar}
                        </span>
                      </td>
                      <td>{lugar.descripcion}</td>
                      <td>
                        {/* Capacidad no disponible en el modelo actual */}
                        <span className="text-muted">N/A</span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(lugar)}
                            title="Editar lugar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(lugar.id)}
                            title="Eliminar lugar"
                          >
                            <i className="bi bi-trash"></i>
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
                Mostrando <span className="fw-bold">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredLugares.length)}</span> de <span className="fw-bold">{filteredLugares.length}</span> lugares
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