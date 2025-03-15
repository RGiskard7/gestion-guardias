"use client"

import { useState } from "react"
import { useGuardias, type Usuario, type Horario } from "@/src/contexts/GuardiasContext"
import { Pagination } from "@/components/ui/pagination"

export default function HorariosPage() {
  const { horarios, usuarios, addHorario, updateHorario, deleteHorario } = useGuardias()

  // Obtener solo profesores (no admins)
  const profesores = usuarios.filter((u: Usuario) => u.rol === "profesor" && u.activo)

  // Estado para el formulario
  const [formData, setFormData] = useState<Omit<Horario, "id">>({
    profesorId: 0,
    diaSemana: "",
    tramoHorario: "",
  })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedProfesor, setSelectedProfesor] = useState<number | null>(null)

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filtrar horarios por profesor
  const filteredHorarios = selectedProfesor ? horarios.filter((h: Horario) => h.profesorId === selectedProfesor) : horarios

  // Calcular el número total de páginas
  const totalPages = Math.max(1, Math.ceil(filteredHorarios.length / itemsPerPage))
  
  // Obtener los elementos de la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, filteredHorarios.length)
    return filteredHorarios.slice(startIndex, endIndex)
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

  // Días de la semana
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

  // Tramos horarios
  const tramosHorarios = ["1ª hora", "2ª hora", "3ª hora", "4ª hora", "5ª hora", "6ª hora"]

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: name === "profesorId" ? Number.parseInt(value) : value,
    }))
  }

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      // Actualizar horario existente
      updateHorario(editingId, formData)
    } else {
      // Añadir nuevo horario
      addHorario(formData)
    }

    // Resetear formulario
    resetForm()
  }

  // Resetear formulario y estado
  const resetForm = () => {
    setFormData({
      profesorId: 0,
      diaSemana: "",
      tramoHorario: "",
    })
    setEditingId(null)
    setShowForm(false)
  }

  // Comenzar edición de horario
  const handleEdit = (horario: Horario) => {
    setFormData({
      profesorId: horario.profesorId,
      diaSemana: horario.diaSemana,
      tramoHorario: horario.tramoHorario,
    })
    setEditingId(horario.id)
    setShowForm(true)
  }

  // Manejar eliminación de horario
  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este horario?")) {
      deleteHorario(id)
    }
  }

  // Obtener nombre del profesor por ID
  const getProfesorName = (id: number) => {
    const profesor = profesores.find((p: Usuario) => p.id === id)
    return profesor ? profesor.nombre : "Desconocido"
  }

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Gestión de Horarios</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">Filtrar por Profesor</span>
            <select
              className="form-select"
              value={selectedProfesor || ""}
              onChange={(e) => setSelectedProfesor(e.target.value ? Number.parseInt(e.target.value) : null)}
              aria-label="Filtrar horarios por profesor"
            >
              <option value="">Todos los profesores</option>
              {profesores.map((profesor: Usuario) => (
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
                  {profesores.map((profesor: Usuario) => (
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
                  {getCurrentPageItems().map((horario: Horario) => (
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
              
              {/* Componente de paginación */}
              {filteredHorarios.length > 0 && (
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={handlePageChange} 
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredHorarios.length}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 