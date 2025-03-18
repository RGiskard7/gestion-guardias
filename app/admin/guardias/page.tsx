"use client"

import { useState, useEffect } from "react"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { useHorarios } from "@/src/contexts/HorariosContext"
import { Guardia, Usuario, Lugar, Horario } from "@/src/types"
import { Pagination } from "@/components/ui/pagination"
import DataCard from "@/components/common/DataCard"
import { DB_CONFIG } from "@/lib/db-config"

export default function GuardiasPage() {
  const { 
    guardias, 
    addGuardia, 
    updateGuardia, 
    deleteGuardia, 
    addTareaGuardia, 
    anularGuardia,
    canProfesorAsignarGuardia,
    getProfesorAusenteIdByGuardia,
    refreshGuardias
  } = useGuardias()
  
  const { usuarios } = useUsuarios()
  const { lugares } = useLugares()
  const { horarios } = useHorarios()

  // Estado para controlar la carga de datos
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Actualizar datos al cargar la página
  useEffect(() => {
    handleRefresh()
  }, [])

  // Función para refrescar los datos
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshGuardias()
    } catch (error) {
      console.error("Error al refrescar las guardias:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Obtener solo profesores (no admins)
  const profesores = usuarios.filter((u: Usuario) => u.rol === "profesor" && u.activo)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    fecha: "",
    tramoHorario: "",
    tramosHorarios: [] as string[],
    tipoGuardia: "Aula",
    lugarId: "",
    tarea: "",
    observaciones: "",
    profesorCubridorId: null as number | null
  })
  
  const [error, setError] = useState<string | null>(null)

  // Estado para rango de fechas
  const [rangoFechas, setRangoFechas] = useState({
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaFin: new Date().toISOString().split("T")[0],
  })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isRangeMode, setIsRangeMode] = useState(false)
  const [filterEstado, setFilterEstado] = useState<string>("")
  const [filterFecha, setFilterFecha] = useState<string>("")

  // Estado para guardia asociada a ausencia
  const [hasAssociatedAusencia, setHasAssociatedAusencia] = useState(false)

  const [sortField, setSortField] = useState<'fecha' | 'tramoHorario'>('fecha')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Estado para el modal de detalles
  const [selectedGuardia, setSelectedGuardia] = useState<Guardia | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Filtrar guardias según los criterios
  const filteredGuardias = guardias
    .filter((guardia: Guardia) => {
      // Filtrar por estado
      if (filterEstado && guardia.estado !== filterEstado) {
        return false
      }
      // Filtrar por fecha
      if (filterFecha && guardia.fecha !== filterFecha) {
        return false
      }
      return true
    })
    .sort((a: Guardia, b: Guardia) => {
      // Ordenar por fecha (más reciente primero) y luego por tramo horario
      if (a.fecha !== b.fecha) {
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      }

      // Extraer número del tramo horario (ej: "1ª hora" -> 1)
      const getTramoNumber = (tramo: string) => {
        const match = tramo.match(/(\d+)/)
        return match ? Number.parseInt(match[1]) : 0
      }

      return getTramoNumber(a.tramoHorario) - getTramoNumber(b.tramoHorario)
    })

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Calcular el número total de páginas
  const totalPages = Math.max(1, Math.ceil(filteredGuardias.length / itemsPerPage))

  // Obtener los elementos de la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, filteredGuardias.length)
    return filteredGuardias.slice(startIndex, endIndex)
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

  // Tramos horarios
  const tramosHorarios = ["1ª Hora", "2ª Hora", "3ª Hora", "4ª Hora", "5ª Hora", "6ª Hora"]

  // Usar los tipos de guardia de la configuración
  const tiposGuardia = DB_CONFIG.TIPOS_GUARDIA

  // Estados de guardia
  const estadosGuardia = ["Pendiente", "Asignada", "Firmada", "Anulada"]

  // Función para cambiar el orden
  const handleSort = (field: 'fecha' | 'tramoHorario') => {
    if (sortField === field) {
      // Si ya estamos ordenando por este campo, cambiamos la dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Si cambiamos de campo, establecemos el nuevo campo y dirección por defecto (descendente)
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "lugarId" || (name === "profesorAusenteId" && value !== "") || (name === "profesorCubridorId" && value !== "")
            ? Number.parseInt(value)
            : (name === "profesorAusenteId" || name === "profesorCubridorId") && value === ""
              ? null
              : value,
    }))
  }

  // Método personalizado para manejar cambios en los checkboxes de tramos horarios
  const handleTramoHorarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    
    if (value === "todo-el-dia") {
      // Si se marca "Todo el día", seleccionar todos los tramos
      // Si se desmarca, deseleccionar todos los tramos
      setFormData(prev => ({
        ...prev,
        tramosHorarios: checked ? [...tramosHorarios] : []
      }))
    } else {
      setFormData(prev => {
        const tramosHorarios = checked
          ? [...(prev.tramosHorarios || []), value]
          : (prev.tramosHorarios || []).filter(t => t !== value)
        
        return {
          ...prev,
          tramosHorarios
        }
      })
    }
  }

  // Manejar cambios en el rango de fechas
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setRangoFechas((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Generar fechas entre fecha inicio y fin
  const generateDateRange = (start: string, end: string) => {
    const dates = []
    const currentDate = new Date(start)
    const endDate = new Date(end)

    while (currentDate <= endDate) {
      // Solo incluir días de lunes a viernes (0 = domingo, 6 = sábado)
      const dayOfWeek = currentDate.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(new Date(currentDate).toISOString().split("T")[0])
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      // Actualizar guardia existente
      const { tarea, tramosHorarios, ...guardiaData } = formData
      // Convertir lugarId a número
      updateGuardia(editingId, {
        ...guardiaData,
        lugarId: guardiaData.lugarId ? Number(guardiaData.lugarId) : 0
      })
      setEditingId(null)
    } else if (isRangeMode) {
      // Crear guardias para un rango de fechas
      const fechas = generateDateRange(rangoFechas.fechaInicio, rangoFechas.fechaFin)
      
      try {
        let guardiaCreadas = 0;
        
        // Para cada fecha en el rango (solo incluye días laborables, lunes a viernes)
        for (const fecha of fechas) {
          // Para cada tramo horario (usar todos los tramos definidos)
          for (const tramoHorario of tramosHorarios) {
            // Para cada lugar seleccionado (o el lugar específico si se ha seleccionado uno)
            const lugaresAUtilizar = formData.lugarId 
              ? [{ id: Number(formData.lugarId) }] 
              : lugares;
              
            for (const lugar of lugaresAUtilizar) {
              // Verificar si ya existe una guardia para esta fecha, tramo y lugar
              const existingGuardia = guardias.find(
                g => g.fecha === fecha && 
                     g.tramoHorario === tramoHorario && 
                     g.lugarId === lugar.id
              );
              
              if (!existingGuardia) {
                // Crear nueva guardia
                const guardiaWithDate: Omit<Guardia, "id"> = {
                  fecha,
                  tramoHorario: tramoHorario,
                  tipoGuardia: formData.tipoGuardia,
                  firmada: false,
                  estado: "Pendiente",
                  observaciones: "Guardia creada automáticamente",
                  lugarId: lugar.id,
                  profesorCubridorId: null
                }
                
                // Log para verificar el tipo de guardia antes de crearla
                console.log("Creando guardia con tipo:", guardiaWithDate.tipoGuardia);
                
                // No crear tarea automáticamente
                await addGuardia(guardiaWithDate)
                guardiaCreadas++;

                // Pequeña pausa para evitar problemas de concurrencia
                await new Promise(resolve => setTimeout(resolve, 50));
              }
            }
          }
        }
        
        // Resetear formulario
        resetForm();
        alert(`Se han creado ${guardiaCreadas} guardias correctamente para el rango de fechas seleccionado.`);
      } catch (error) {
        console.error("Error al crear guardias por rango:", error);
        setError("Error al crear guardias en el rango de fechas");
      }
    } else {
      // Validar que se hayan seleccionado tramos horarios
      if (!formData.tramosHorarios || formData.tramosHorarios.length === 0) {
        setError("Por favor, selecciona al menos un tramo horario")
        return
      }

      // Crear guardias para cada tramo horario seleccionado
      for (const tramoHorario of formData.tramosHorarios) {
        const guardiaData: Omit<Guardia, "id"> = {
          fecha: formData.fecha,
          tramoHorario: tramoHorario,
          tipoGuardia: formData.tipoGuardia,
          firmada: false,
          estado: "Pendiente",
          observaciones: formData.observaciones || "Guardia creada manualmente",
          lugarId: Number(formData.lugarId),
          profesorCubridorId: null
        }
        
        // Solo crear tarea si hay contenido en el campo
        if (formData.tarea && formData.tarea.trim() !== "") {
          await addGuardia(guardiaData, formData.tarea);
        } else {
          await addGuardia(guardiaData);
        }
      }
    }

    // Resetear formulario
    resetForm()
    alert(editingId ? "Guardia actualizada correctamente" : "Guardias creadas correctamente")
  }

  // Resetear formulario y estado
  const resetForm = () => {
    setFormData({
      fecha: "",
      tramoHorario: "",
      tramosHorarios: [],
      tipoGuardia: "Aula",
      lugarId: "",
      tarea: "",
      observaciones: "",
      profesorCubridorId: null
    })
    setRangoFechas({
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaFin: new Date().toISOString().split("T")[0],
    })
    setEditingId(null)
    setShowForm(false)
    setIsRangeMode(false)
    setError(null)
    setHasAssociatedAusencia(false)
  }

  // Comenzar edición de guardia
  const handleEdit = (guardia: Guardia) => {
    // Verificar si la guardia tiene una ausencia asociada
    const profesorAusenteId = getProfesorAusenteIdByGuardia(guardia.id)
    setHasAssociatedAusencia(profesorAusenteId !== null)

    setFormData({
      fecha: guardia.fecha,
      tramoHorario: guardia.tramoHorario,
      tramosHorarios: [guardia.tramoHorario], // Solo incluimos el tramo actual en modo edición
      tipoGuardia: guardia.tipoGuardia,
      observaciones: guardia.observaciones,
      lugarId: String(guardia.lugarId),
      profesorCubridorId: guardia.profesorCubridorId,
      tarea: ""
    })
    setEditingId(guardia.id)
    setShowForm(true)
  }

  // Manejar anulación de guardia
  const handleAnular = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres anular esta guardia?")) {
      const motivo = prompt("Por favor, indica el motivo de la anulación:", "");
      if (motivo !== null) {
        // Verificar si esta guardia tiene una ausencia asociada
        const guardia = guardias.find(g => g.id === id);
        const tieneAusencia = guardia && guardia.ausenciaId;
        
        // Anular la guardia
        anularGuardia(id, motivo);
        
        // Mostrar mensaje informativo
        if (tieneAusencia) {
          alert("Guardia anulada correctamente. La ausencia asociada ha vuelto al estado 'Pendiente'.");
        } else {
          alert("Guardia anulada correctamente.");
        }
      }
    }
  }

  // Manejar eliminación de guardia
  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar permanentemente esta guardia? Esta acción no se puede deshacer.")) {
      try {
        // Verificar que la guardia existe antes de intentar eliminarla
        const guardiaToDelete = guardias.find(g => g.id === id);
        if (!guardiaToDelete) {
          alert("Error: No se encontró la guardia que intentas eliminar.");
          return;
        }
        
        // Verificar que la guardia está anulada
        if (guardiaToDelete.estado !== "Anulada") {
          alert("Error: Solo se pueden eliminar guardias que estén en estado 'Anulada'.");
          return;
        }
        
        // Intentar eliminar la guardia
        await deleteGuardia(id);
        
        // Refrescar la lista de guardias para confirmar que se eliminó
        handleRefresh();
        
        alert("Guardia eliminada correctamente.");
      } catch (error) {
        console.error("Error al eliminar la guardia:", error);
        alert(`Error al eliminar la guardia: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  }

  // Obtener nombre del profesor por ID
  const getProfesorName = (id: number | null) => {
    if (!id) return "No asignado"

    const profesor = profesores.find((p: Usuario) => p.id === id)
    return profesor ? profesor.nombre : "Desconocido"
  }

  // Obtener nombre del profesor ausente para una guardia
  const getProfesorAusenteNombre = (guardiaId: number) => {
    const profesorId = getProfesorAusenteIdByGuardia(guardiaId)
    return getProfesorName(profesorId)
  }

  // Obtener nombre del lugar por ID
  const getLugarName = (id: number) => {
    const lugar = lugares.find((l: Lugar) => l.id === id)
    return lugar ? `${lugar.codigo} - ${lugar.descripcion}` : "Desconocido"
  }

  // Función para crear guardias para una fecha
  const createGuardiasForDate = async (fecha: string) => {
    try {
      // Log para verificar el tipo de guardia seleccionado
      console.log("Tipo de guardia seleccionado:", formData.tipoGuardia);
      
      // Crear guardias para cada tramo horario y lugar
      for (const tramo of tramosHorarios) {
        for (const lugar of lugares) {
          // Verificar si ya existe una guardia para esta fecha, tramo y lugar
          const existingGuardia = guardias.find(
            g => g.fecha === fecha && g.tramoHorario === tramo && g.lugarId === lugar.id
          )
          
          if (!existingGuardia) {
            // Crear nueva guardia
            const guardiaWithDate: Omit<Guardia, "id"> = {
              fecha,
              tramoHorario: tramo,
              tipoGuardia: formData.tipoGuardia,
              firmada: false,
              estado: "Pendiente",
              observaciones: "Guardia creada automáticamente",
              lugarId: lugar.id,
              profesorCubridorId: null
            }
            
            // Log para verificar el tipo de guardia antes de crearla
            console.log("Creando guardia con tipo:", guardiaWithDate.tipoGuardia);
            
            // No crear tarea automáticamente
            await addGuardia(guardiaWithDate)
          }
        }
      }
      
      alert(`Guardias creadas correctamente para ${new Date(fecha).toLocaleDateString()}`)
    } catch (error) {
      console.error("Error al crear guardias:", error)
      alert("Error al crear guardias")
    }
  }

  // Función para crear una guardia manualmente
  const handleCreateGuardia = async () => {
    try {
      // Validar formulario
      if (!formData.fecha || formData.tramosHorarios.length === 0 || !formData.lugarId) {
        setError("Todos los campos son obligatorios")
        return
      }
      
      // Verificar si ya existen guardias para esta fecha, tramos y lugar
      for (const tramoHorario of formData.tramosHorarios) {
        const existingGuardia = guardias.find(
          g => g.fecha === formData.fecha && 
               g.tramoHorario === tramoHorario && 
               g.lugarId === Number(formData.lugarId)
        )
        
        if (existingGuardia) {
          setError(`Ya existe una guardia para esta fecha, tramo (${tramoHorario}) y lugar`)
          return
        }
      }
      
      // Crear guardias para cada tramo horario seleccionado
      for (const tramoHorario of formData.tramosHorarios) {
        const guardiaData: Omit<Guardia, "id"> = {
          fecha: formData.fecha,
          tramoHorario: tramoHorario,
          tipoGuardia: formData.tipoGuardia,
          firmada: false,
          estado: "Pendiente",
          observaciones: formData.observaciones || "Guardia creada manualmente",
          lugarId: Number(formData.lugarId),
          profesorCubridorId: null
        }
        
        // Solo crear tarea si hay contenido en el campo
        if (formData.tarea && formData.tarea.trim() !== "") {
          await addGuardia(guardiaData, formData.tarea);
        } else {
          await addGuardia(guardiaData);
        }
      }
      
      // Resetear formulario
      resetForm()
      alert("Guardias creadas correctamente")
    } catch (error) {
      console.error("Error al crear guardia:", error)
      setError("Error al crear guardia")
    }
  }

  // Obtener el color del badge según el estado
  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "bg-warning text-dark";
      case "Asignada":
        return "bg-info";
      case "Firmada":
        return "bg-success";
      case "Anulada":
        return "bg-danger";
      default:
        return "bg-primary";
    }
  }

  // Manejar visualización de guardia
  const handleViewGuardia = (guardia: Guardia) => {
    setSelectedGuardia(guardia)
    setShowModal(true)
  }

  // Cerrar modal de detalles
  const handleCloseModal = () => {
    setSelectedGuardia(null)
    setShowModal(false)
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
        <h1 className="mb-0">Gestión de Guardias</h1>
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
              <label htmlFor="filterEstado" className="form-label fw-bold">Estado</label>
              <select
                id="filterEstado"
                className="form-select"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                {estadosGuardia.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
              <small className="form-text text-muted">Filtrar por estado de guardia</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="filterFecha" className="form-label fw-bold">Fecha</label>
              <input
                type="date"
                id="filterFecha"
                className="form-control"
                value={filterFecha}
                onChange={(e) => setFilterFecha(e.target.value)}
              />
              <small className="form-text text-muted">Filtrar por fecha específica</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group d-flex flex-column h-100">
              <label className="form-label fw-bold">Acciones</label>
              <div className="d-flex gap-2 mt-auto">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    resetForm()
                    setShowForm(!showForm)
                    setIsRangeMode(false)
                  }}
                >
                  <i className={`bi ${showForm && !isRangeMode ? "bi-x-circle" : "bi-plus-circle"} me-2`}></i>
                  {showForm && !isRangeMode ? "Cancelar" : "Nueva Guardia"}
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => {
                    resetForm()
                    setShowForm(!isRangeMode || !showForm)
                    setIsRangeMode(true)
                  }}
                >
                  <i className={`bi ${showForm && isRangeMode ? "bi-x-circle" : "bi-calendar-range"} me-2`}></i>
                  {showForm && isRangeMode ? "Cancelar" : "Rango de Guardias"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DataCard>

      {showForm && (
        <DataCard
          title={editingId ? "Editar Guardia" : isRangeMode ? "Añadir Guardias por Rango" : "Nueva Guardia"}
          icon={editingId ? "pencil-square" : isRangeMode ? "calendar-range" : "clipboard-plus"}
          className="mb-4"
        >
          <form onSubmit={handleSubmit}>
            {isRangeMode ? (
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="fechaInicio" className="form-label fw-bold">
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="fechaInicio"
                      name="fechaInicio"
                      value={rangoFechas.fechaInicio}
                      onChange={handleRangeChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                    <small className="form-text text-muted">Fecha de inicio del rango</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="fechaFin" className="form-label fw-bold">
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="fechaFin"
                      name="fechaFin"
                      value={rangoFechas.fechaFin}
                      onChange={handleRangeChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                    <small className="form-text text-muted">Fecha de fin del rango</small>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Tramos Horarios</label>
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Se crearán guardias para todos los tramos horarios ({tramosHorarios.join(", ")}) en cada fecha seleccionada dentro del rango (solo días laborables, de lunes a viernes).
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="tipoGuardia" className="form-label fw-bold">
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
                    <small className="form-text text-muted">Seleccione el tipo de guardia que se aplicará a todas las guardias del rango</small>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="lugarId" className="form-label fw-bold">
                      Lugar
                    </label>
                    <select
                      className="form-select"
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
                    <small className="form-text text-muted">Ubicación donde se realizarán las guardias</small>
                  </div>
                </div>
                
                {/* Tarea y observaciones */}
                <div className="col-12 mt-3">
                  <div className="form-group">
                    <label htmlFor="tarea" className="form-label fw-bold">
                      Tarea
                    </label>
                    <textarea
                      className="form-control"
                      id="tarea"
                      name="tarea"
                      rows={2}
                      value={formData.tarea}
                      onChange={handleChange}
                      placeholder="Descripción de la tarea a realizar durante las guardias (opcional)"
                    ></textarea>
                    <small className="form-text text-muted">Tarea que debe realizar el profesor durante la guardia</small>
                  </div>
                </div>
                
                <div className="col-12 mt-3">
                  <div className="form-group">
                    <label htmlFor="observaciones" className="form-label fw-bold">
                      Observaciones
                    </label>
                    <textarea
                      className="form-control"
                      id="observaciones"
                      name="observaciones"
                      rows={2}
                      value={formData.observaciones}
                      onChange={handleChange}
                      placeholder="Observaciones adicionales sobre las guardias (opcional)"
                    ></textarea>
                    <small className="form-text text-muted">Información adicional importante para estas guardias</small>
                  </div>
                </div>
                
                {error && <div className="alert alert-danger mt-3">{error}</div>}

                <div className="d-flex justify-content-end mt-4 pt-3 border-top w-100">
                  <button type="button" className="btn btn-outline-secondary me-3" onClick={() => {
                    resetForm()
                    setShowForm(false)
                    setIsRangeMode(false)
                  }}>
                    <i className="bi bi-x-circle me-2"></i>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear Guardias
                  </button>
                </div>
              </div>
            ) : (
              // Formulario normal (no rango)
              <div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="fecha" className="form-label fw-bold">
                        Fecha
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="fecha"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split("T")[0]}
                        disabled={!!editingId && hasAssociatedAusencia}
                      />
                      {!!editingId && hasAssociatedAusencia && (
                        <small className="form-text text-muted">
                          <i className="bi bi-info-circle-fill me-1"></i>
                          No es posible cambiar la fecha porque esta guardia tiene una ausencia asociada.
                        </small>
                      )}
                      {!editingId && (
                        <small className="form-text text-muted">Fecha en la que se realizará la guardia</small>
                      )}
                    </div>
                  </div>
                  
                  {editingId ? (
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="tramoHorario" className="form-label fw-bold">Tramo Horario</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.tramoHorario}
                          readOnly
                          title="Tramo horario"
                          aria-label="Tramo horario"
                        />
                        <small className="form-text text-muted">
                          {hasAssociatedAusencia ? (
                            <>
                              <i className="bi bi-info-circle-fill me-1"></i>
                              No es posible cambiar el tramo horario porque esta guardia tiene una ausencia asociada.
                            </>
                          ) : (
                            "No es posible cambiar el tramo horario de una guardia existente."
                          )}
                        </small>
                      </div>
                    </div>
                  ) : (
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="form-label fw-bold">Tramos Horarios</label>
                        <div className="d-flex flex-wrap gap-3">
                          <div className="form-check w-100 mb-2 border-bottom pb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="todo-el-dia"
                              value="todo-el-dia"
                              checked={formData.tramosHorarios?.length === tramosHorarios.length}
                              onChange={handleTramoHorarioChange}
                            />
                            <label className="form-check-label" htmlFor="todo-el-dia">
                              <strong>Todo el día</strong>
                            </label>
                          </div>
                          {tramosHorarios.map((tramo) => (
                            <div key={tramo} className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`tramo-${tramo}`}
                                name={tramo}
                                value={tramo}
                                checked={formData.tramosHorarios?.includes(tramo) || false}
                                onChange={handleTramoHorarioChange}
                              />
                              <label className="form-check-label" htmlFor={`tramo-${tramo}`}>
                                {tramo}
                              </label>
                            </div>
                          ))}
                        </div>
                        <small className="form-text text-muted">Seleccione los tramos horarios en los que se realizará la guardia</small>
                      </div>
                    </div>
                  )}
                
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="tipoGuardia" className="form-label fw-bold">
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
                      <small className="form-text text-muted">Seleccione el tipo de guardia</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="lugarId" className="form-label fw-bold">
                        Lugar
                      </label>
                      <select
                        className="form-select"
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
                      <small className="form-text text-muted">Ubicación donde se realizará la guardia</small>
                    </div>
                  </div>
                </div>
    
                <div className="form-group mt-4">
                  <label htmlFor="tarea" className="form-label fw-bold">
                    Tarea
                  </label>
                  <textarea
                    className="form-control"
                    id="tarea"
                    name="tarea"
                    rows={3}
                    value={formData.tarea}
                    onChange={handleChange}
                    placeholder="Descripción de la tarea a realizar durante la guardia"
                  ></textarea>
                  <small className="form-text text-muted">Tarea que debe realizar el profesor durante la guardia</small>
                </div>
    
                <div className="form-group mt-4">
                  <label htmlFor="observaciones" className="form-label fw-bold">
                    Observaciones
                  </label>
                  <textarea
                    className="form-control"
                    id="observaciones"
                    name="observaciones"
                    rows={3}
                    value={formData.observaciones}
                    onChange={handleChange}
                    placeholder="Observaciones adicionales sobre la guardia"
                  ></textarea>
                  <small className="form-text text-muted">Información adicional importante para esta guardia</small>
                </div>
    
                {error && <div className="alert alert-danger mt-3">{error}</div>}
    
                <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                  <button type="button" className="btn btn-outline-secondary me-3" onClick={() => {
                    resetForm()
                    setShowForm(false)
                    setIsRangeMode(false)
                  }}>
                    <i className="bi bi-x-circle me-2"></i>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className={`bi ${editingId ? "bi-check-circle" : "bi-plus-circle"} me-2`}></i>
                    {editingId ? "Actualizar" : "Crear Guardia"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </DataCard>
      )}

      <DataCard
        title="Listado de Guardias"
        icon="clipboard-check"
        className="mb-4"
      >
        {filteredGuardias.length === 0 ? (
          <div className="alert alert-info d-flex align-items-center">
            <i className="bi bi-info-circle-fill fs-4 me-3"></i>
            <div>No hay guardias que coincidan con los filtros seleccionados.</div>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th 
                      scope="col" 
                      onClick={() => handleSort('fecha')} 
                      className="cursor-pointer user-select-none"
                    >
                      <div className="d-flex align-items-center">
                        Fecha
                        {sortField === 'fecha' && (
                          <span className="ms-2 text-primary">
                            <i className={`bi bi-sort-${sortDirection === 'asc' ? 'up' : 'down'}-alt`}></i>
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      onClick={() => handleSort('tramoHorario')} 
                      className="cursor-pointer user-select-none"
                    >
                      <div className="d-flex align-items-center">
                        Tramo
                        {sortField === 'tramoHorario' && (
                          <span className="ms-2 text-primary">
                            <i className={`bi bi-sort-${sortDirection === 'asc' ? 'up' : 'down'}-alt`}></i>
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Lugar</th>
                    <th scope="col">Profesor Ausente</th>
                    <th scope="col">Profesor Cubridor</th>
                    <th scope="col">Estado</th>
                    <th scope="col" className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageItems().map((guardia) => {
                    const profesorAusenteId = getProfesorAusenteIdByGuardia(guardia.id)
                    const profesorAusente = profesorAusenteId
                      ? usuarios.find((u) => u.id === profesorAusenteId)
                      : null
                    const profesorCubridor = guardia.profesorCubridorId
                      ? usuarios.find((u) => u.id === guardia.profesorCubridorId)
                      : null
                    const lugar = lugares.find((l) => l.id === guardia.lugarId)

                    return (
                      <tr key={guardia.id}>
                        <td>{new Date(guardia.fecha).toLocaleDateString()}</td>
                        <td>{guardia.tramoHorario}</td>
                        <td>{guardia.tipoGuardia}</td>
                        <td>{lugar ? `${lugar.codigo} - ${lugar.descripcion}` : "No especificado"}</td>
                        <td>{profesorAusente ? profesorAusente.nombre : "No especificado"}</td>
                        <td>{profesorCubridor ? profesorCubridor.nombre : "Pendiente"}</td>
                        <td>
                          <span
                            className={`badge ${
                              guardia.estado === "Pendiente"
                                ? "bg-warning text-dark"
                                : guardia.estado === "Asignada"
                                ? "bg-info"
                                : guardia.estado === "Firmada"
                                ? "bg-success"
                                : "bg-danger"
                            } rounded-pill px-3 py-2`}
                          >
                            {guardia.estado}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(guardia)}
                              title="Editar guardia"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            {guardia.estado !== "Firmada" && guardia.estado !== "Anulada" && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleAnular(guardia.id)}
                                title="Anular guardia"
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleViewGuardia(guardia)}
                              title="Ver detalles"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            {guardia.estado === "Anulada" && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(guardia.id)}
                                title="Eliminar guardia permanentemente"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <div className="text-muted small">
                Mostrando <span className="fw-bold">{currentPage * itemsPerPage - itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredGuardias.length)}</span> de <span className="fw-bold">{filteredGuardias.length}</span> guardias
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

      {/* Modal para mostrar detalles de la guardia */}
      {showModal && selectedGuardia && (
        <div className="modal fade show" 
             tabIndex={-1} 
             role="dialog"
             style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-info-circle me-2"></i>
                  Detalles de la Guardia
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCloseModal}
                  aria-label="Cerrar">
                </button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-hash me-1"></i>
                      ID de la Guardia
                    </h6>
                    <p className="mb-0">{selectedGuardia.id}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-flag-fill me-1"></i>
                      Estado
                    </h6>
                    <p className="mb-0">
                      <span className={`badge ${getBadgeColor(selectedGuardia.estado)}`}>
                        {selectedGuardia.estado}
                      </span>
                      {selectedGuardia.firmada && (
                        <span className="badge bg-success ms-2">
                          <i className="bi bi-check-circle me-1"></i>
                          Firmada
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-calendar-event me-1"></i>
                      Fecha
                    </h6>
                    <p className="mb-0">{new Date(selectedGuardia.fecha).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-clock me-1"></i>
                      Tramo Horario
                    </h6>
                    <p className="mb-0">{selectedGuardia.tramoHorario}</p>
                  </div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-tag-fill me-1"></i>
                      Tipo de Guardia
                    </h6>
                    <p className="mb-0">{selectedGuardia.tipoGuardia}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-geo-alt-fill me-1"></i>
                      Lugar
                    </h6>
                    {(() => {
                      const lugar = lugares.find(l => l.id === selectedGuardia.lugarId)
                      return lugar ? (
                        <p className="mb-0">
                          <strong>{lugar.codigo}</strong> - {lugar.descripcion}
                          <br />
                          <span className="text-muted small">
                            <i className="bi bi-building me-1"></i>
                            {lugar.tipoLugar}
                          </span>
                        </p>
                      ) : (
                        <p className="mb-0">ID: {selectedGuardia.lugarId}</p>
                      )
                    })()}
                  </div>
                </div>
                
                <div className="row mb-4">
                  {selectedGuardia.profesorCubridorId && (
                    <div className="col-md-6">
                      <h6 className="fw-bold">
                        <i className="bi bi-person-fill me-1"></i>
                        Profesor Cubridor
                      </h6>
                      {(() => {
                        const profesor = profesores.find(p => p.id === selectedGuardia.profesorCubridorId)
                        return profesor ? (
                          <p className="mb-0">
                            <i className="bi bi-person-badge me-1"></i>
                            {profesor.nombre}
                          </p>
                        ) : (
                          <p className="mb-0">ID: {selectedGuardia.profesorCubridorId}</p>
                        )
                      })()}
                    </div>
                  )}
                  
                  <div className={selectedGuardia.profesorCubridorId ? "col-md-6" : "col-12"}>
                    <h6 className="fw-bold">
                      <i className="bi bi-card-text me-1"></i>
                      Observaciones
                    </h6>
                    {selectedGuardia.observaciones ? (
                      <p className="mb-0">{selectedGuardia.observaciones}</p>
                    ) : (
                      <p className="text-muted mb-0">Sin observaciones</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-3">
                  <h6 className="fw-bold border-bottom pb-2 mb-3">
                    <i className="bi bi-person-dash me-1"></i>
                    Información del Profesor Ausente
                  </h6>
                  {(() => {
                    const profesorAusenteId = getProfesorAusenteIdByGuardia(selectedGuardia.id)
                    return profesorAusenteId ? (
                      <div className="card border">
                        <div className="card-body">
                          <div className="row mb-3">
                            <div className="col-12">
                              <h6 className="card-subtitle mb-1 text-muted">
                                <i className="bi bi-person-fill me-1"></i>
                                Profesor Ausente
                              </h6>
                              {(() => {
                                const profesor = usuarios.find(u => u.id === profesorAusenteId)
                                return profesor ? (
                                  <p className="card-text">
                                    <i className="bi bi-person-badge me-1"></i>
                                    {profesor.nombre}
                                    <span className="text-muted small ms-2">(ID: {profesor.id})</span>
                                  </p>
                                ) : (
                                  <p className="card-text">ID: {profesorAusenteId}</p>
                                )
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        No hay profesor ausente asociado a esta guardia (guardia creada manualmente)
                      </div>
                    )
                  })()}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}>
                  <i className="bi bi-x-circle me-2"></i>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 