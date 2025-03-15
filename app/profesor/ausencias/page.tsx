"use client"

import { useState, useEffect } from "react"
import { useGuardias, type Guardia, type Usuario } from "../../../src/contexts/GuardiasContext"
import { useAuth } from "../../../src/contexts/AuthContext"
import { Pagination } from "@/components/ui/pagination"

export default function AusenciasPage() {
  const { user } = useAuth()
  const { guardias, lugares, usuarios, addGuardia, addTareaGuardia, anularGuardia, getTareasByGuardia } = useGuardias()

  if (!user) return null

  // State for the form
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    tramosHorarios: [] as string[],
    tipoGuardia: "Aula",
    lugarId: "",
    observaciones: "",
    tarea: "",
  })

  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  // Tramos horarios
  const tramosHorariosOptions = ["1ª hora", "2ª hora", "3ª hora", "4ª hora", "5ª hora", "6ª hora"]

  // Tipos de guardia
  const tiposGuardia = ["Aula", "Patio", "Recreo"]

  // Get mis ausencias
  const misAusencias = guardias
    .filter((g) => g.profesorAusenteId === user.id)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  // Imprimir la cantidad de ausencias encontradas
  console.log(`Total de ausencias encontradas: ${misAusencias.length}`)

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Calcular el número total de páginas de forma explícita
  let totalPages = 1
  if (misAusencias.length > 0) {
    totalPages = Math.max(1, Math.ceil(misAusencias.length / itemsPerPage))
  }

  // Añadir console.log para depuración
  console.log("Paginación ausencias:", { 
    totalAusencias: misAusencias.length, 
    itemsPerPage, 
    totalPages, 
    currentPage 
  })

  // Obtener los elementos de la página actual con depuración
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, misAusencias.length)
    
    console.log("Calculando elementos de la página actual:", {
      startIndex,
      endIndex,
      currentPage,
      itemsPerPage,
      totalItems: misAusencias.length,
      itemsToShow: misAusencias.slice(startIndex, endIndex).length
    })
    
    return misAusencias.slice(startIndex, endIndex)
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

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar errores cuando el usuario cambia un valor
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = {...prev}
        delete newErrors[name]
        return newErrors
      })
    }
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

    // Limpiar errores de tramos horarios
    if (formErrors.tramosHorarios) {
      setFormErrors(prev => {
        const newErrors = {...prev}
        delete newErrors.tramosHorarios
        return newErrors
      })
    }
  }

  // Handle "Todo el día" checkbox
  const handleTodoDiaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target

    setFormData((prev) => ({
      ...prev,
      tramosHorarios: checked ? [...tramosHorariosOptions] : [],
    }))

    // Limpiar errores de tramos horarios
    if (formErrors.tramosHorarios) {
      setFormErrors(prev => {
        const newErrors = {...prev}
        delete newErrors.tramosHorarios
        return newErrors
      })
    }
  }

  // Validar el formulario
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const selectedDate = new Date(formData.fecha)
    selectedDate.setHours(0, 0, 0, 0)
    
    // Validar fecha (no puede ser en el pasado)
    if (selectedDate < today) {
      errors.fecha = "No puedes registrar ausencias en fechas pasadas"
    }
    
    // Validar que se ha seleccionado al menos un tramo horario
    if (formData.tramosHorarios.length === 0) {
      errors.tramosHorarios = "Debes seleccionar al menos un tramo horario"
    }
    
    // Validar que no exista ya una ausencia para la misma fecha y tramos
    for (const tramo of formData.tramosHorarios) {
      const existeAusencia = misAusencias.some(
        ausencia => 
          ausencia.fecha === formData.fecha && 
          ausencia.tramoHorario === tramo &&
          ausencia.estado !== "Anulada"
      )
      
      if (existeAusencia) {
        errors.tramosHorarios = `Ya tienes una ausencia registrada para el ${new Date(formData.fecha).toLocaleDateString("es-ES")} en el tramo ${tramo}`
        break
      }
    }
    
    // Validar que se ha seleccionado un lugar
    if (!formData.lugarId) {
      errors.lugarId = "Debes seleccionar un lugar"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar el formulario
    if (!validateForm()) {
      return
    }

    // Evitar múltiples envíos simultáneos
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      // Crear guardias secuencialmente para evitar problemas de concurrencia
      for (const tramoHorario of formData.tramosHorarios) {
        // Add guardia
        const newGuardia: Omit<Guardia, "id"> = {
          fecha: formData.fecha,
          tramoHorario,
          tipoGuardia: formData.tipoGuardia,
          firmada: false,
          estado: "Pendiente" as const,
          observaciones: formData.observaciones,
          lugarId: Number.parseInt(formData.lugarId),
          profesorAusenteId: user.id,
          profesorCubridorId: null,
        }

        try {
          // Esperar a que se cree la guardia y obtener el ID devuelto
          const guardiaId = await addGuardia(newGuardia)
          
          // Add tarea if provided and if guardia was created successfully
          if (formData.tarea && guardiaId !== null) {
            await addTareaGuardia({
              guardiaId: guardiaId,
              descripcionTarea: formData.tarea,
            })
          }
        } catch (error) {
          console.error("Error al crear guardia:", error)
          alert(`Error al crear guardia para ${formData.fecha}, ${tramoHorario}: ${error}`)
          // Continuamos con la siguiente guardia en lugar de detener todo el proceso
        }
        
        // Pequeña pausa para evitar problemas de concurrencia
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Reset form
      resetForm()
      setShowForm(false)
      alert("Ausencias registradas correctamente")
    } catch (error) {
      console.error("Error al registrar ausencias:", error)
      alert("Ha ocurrido un error al registrar las ausencias. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split("T")[0],
      tramosHorarios: [],
      tipoGuardia: "Aula",
      lugarId: "",
      observaciones: "",
      tarea: "",
    })
    setFormErrors({})
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

  // Resetear la página cuando cambia la lista de ausencias
  useEffect(() => {
    setCurrentPage(1)
  }, [misAusencias.length])

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Mis Ausencias</h1>

      <div className="mb-4 d-flex justify-content-between align-items-center">
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
        >
          {showForm ? "Cancelar" : "Registrar Nueva Ausencia"}
        </button>
        
        <button 
          className="btn btn-outline-secondary"
          onClick={() => {
            // Forzar recarga de la página
            window.location.reload()
          }}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Actualizar
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">Registrar Nueva Ausencia</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="fecha" className="form-label">
                  Fecha de la Ausencia
                </label>
                <input
                  type="date"
                  className={`form-control ${formErrors.fecha ? 'is-invalid' : ''}`}
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                />
                {formErrors.fecha && (
                  <div className="invalid-feedback">
                    {formErrors.fecha}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label mb-0">Tramos Horarios</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="todo-dia"
                      checked={formData.tramosHorarios.length === tramosHorariosOptions.length}
                      onChange={handleTodoDiaChange}
                    />
                    <label className="form-check-label" htmlFor="todo-dia">
                      <strong>Todo el día</strong>
                    </label>
                  </div>
                </div>
                <div className="row">
                  {tramosHorariosOptions.map((tramo) => (
                    <div key={tramo} className="col-md-4 mb-2">
                      <div className="form-check">
                        <input
                          className={`form-check-input ${formErrors.tramosHorarios ? 'is-invalid' : ''}`}
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
                {formErrors.tramosHorarios && (
                  <div className="text-danger small mt-1">
                    {formErrors.tramosHorarios}
                  </div>
                )}
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
                  className={`form-select ${formErrors.lugarId ? 'is-invalid' : ''}`}
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
                {formErrors.lugarId && (
                  <div className="invalid-feedback">
                    {formErrors.lugarId}
                  </div>
                )}
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

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Registrando...
                  </>
                ) : (
                  "Registrar Ausencia"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card mt-4">
        <div className="card-header">Mis Ausencias</div>
        <div className="card-body">
          {misAusencias.length === 0 ? (
            <div className="alert alert-info">No has registrado ninguna ausencia.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tramo Horario</th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageItems().map((ausencia: Guardia) => {
                    const tareas = getTareasByGuardia(ausencia.id)
                    const tieneTarea = tareas.length > 0

                    return (
                      <tr key={ausencia.id}>
                        <td>{new Date(ausencia.fecha).toLocaleDateString("es-ES")}</td>
                        <td>{ausencia.tramoHorario}</td>
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
                        <td>{ausencia.observaciones}</td>
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
              
              {/* Componente de paginación */}
              {misAusencias.length > 0 && (
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={handlePageChange} 
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={misAusencias.length}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 