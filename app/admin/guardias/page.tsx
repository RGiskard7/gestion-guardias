"use client"

import { useState, useEffect, useMemo } from "react"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { useHorarios } from "@/src/contexts/HorariosContext"
import { Guardia, Usuario, Lugar, Horario, TareaGuardia } from "@/src/types"
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
    updateTareaGuardia,
    deleteTareaGuardia,
    anularGuardia,
    canProfesorAsignarGuardia,
    getProfesorAusenteIdByGuardia,
    refreshGuardias,
    desasociarGuardiaDeAusencia,
    getTareasByGuardia
  } = useGuardias()
  
  const { usuarios } = useUsuarios()
  const { lugares } = useLugares()
  const { horarios } = useHorarios()

  // Estado para controlar la carga de datos
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Estado para mensajes de feedback
  const [mensaje, setMensaje] = useState<{tipo: 'success' | 'error' | 'warning' | 'info', texto: string} | null>(null)

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

  // Función mejorada para actualizar todos los datos relevantes
  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      // Actualizar guardias
      await refreshGuardias();
      
      // Si hay otros contextos que necesiten ser actualizados, añadirlos aquí
      
      console.log("Datos actualizados completamente");
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Obtener solo profesores (no admins)
  const profesores = usuarios.filter((u: Usuario) => u.rol === DB_CONFIG.ROLES.PROFESOR && u.activo)

  // Estado para formulario
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    tramoHorario: "",
    tramosHorarios: [] as string[],
    tipoGuardia: Object.values(DB_CONFIG.TIPOS_GUARDIA)[0],
    lugarId: "",
    observaciones: "",
    estado: DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE,
    profesorAusenteId: "",
    profesorCubridorId: "",
    tarea: ""
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
  const [filterId, setFilterId] = useState<string>("")

  // Estado para guardia asociada a ausencia
  const [hasAssociatedAusencia, setHasAssociatedAusencia] = useState(false)
  const [desasociarAusencia, setDesasociarAusencia] = useState(false)

  const [sortField, setSortField] = useState<'id' | 'fecha' | 'tramoHorario'>('fecha')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Estado para el modal de detalles
  const [selectedGuardia, setSelectedGuardia] = useState<Guardia | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Estado para modal de tareas
  const [showTareaModal, setShowTareaModal] = useState(false)
  const [nuevaTarea, setNuevaTarea] = useState("")
  
  // Estado para edición de tareas
  const [showTareaEditModal, setShowTareaEditModal] = useState(false)
  const [tareaEditing, setTareaEditing] = useState<TareaGuardia | null>(null)
  const [editedTareaText, setEditedTareaText] = useState("")

  // Filtrar guardias según los criterios
  const filteredGuardias = guardias
    .filter((guardia: Guardia) => {
      // Filtrar por ID
      if (filterId && guardia.id.toString() !== filterId) {
        return false
      }
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

  // Ordenar guardias según el campo seleccionado
  const sortedGuardias = [...filteredGuardias].sort((a: Guardia, b: Guardia) => {
    if (sortField === 'id') {
      // Ordenar por ID
      return sortDirection === 'asc' ? a.id - b.id : b.id - a.id
    } else if (sortField === 'fecha') {
      // Ordenar por fecha
      const dateA = new Date(a.fecha).getTime()
      const dateB = new Date(b.fecha).getTime()
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
    } else if (sortField === 'tramoHorario') {
      // Extraer número del tramo horario (ej: "1ª hora" -> 1)
      const getTramoNumber = (tramo: string) => {
        const match = tramo.match(/(\d+)/)
        return match ? Number.parseInt(match[1]) : 0
      }
      
      const tramoA = getTramoNumber(a.tramoHorario)
      const tramoB = getTramoNumber(b.tramoHorario)
      
      // Si los tramos son iguales, ordenar por fecha
      if (tramoA === tramoB) {
        const dateA = new Date(a.fecha).getTime()
        const dateB = new Date(b.fecha).getTime()
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
      }
      
      return sortDirection === 'asc' ? tramoA - tramoB : tramoB - tramoA
    }
    
    // Por defecto, ordenar por ID descendente
    return b.id - a.id
  })

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const totalPages = Math.ceil(sortedGuardias.length / itemsPerPage)

  // Obtener los elementos de la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, sortedGuardias.length)
    return sortedGuardias.slice(startIndex, endIndex)
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

  // Tramos horarios disponibles
  const tramosHorarios = DB_CONFIG.TRAMOS_HORARIOS

  // Usar los tipos de guardia de la configuración
  const tiposGuardia = DB_CONFIG.TIPOS_GUARDIA

  // Estados de guardia
  const estadosGuardia = [
    DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE,
    DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA,
    DB_CONFIG.ESTADOS_GUARDIA.FIRMADA,
    DB_CONFIG.ESTADOS_GUARDIA.ANULADA
  ]

  // Función para cambiar el orden
  const handleSort = (field: 'id' | 'fecha' | 'tramoHorario') => {
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
          : name === "lugarId" || name === "profesorAusenteId" || name === "profesorCubridorId"
            ? value === "" ? "" : value // Permitir valor vacío para los IDs
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
    setError(null)

    try {
      if (editingId) {
        await handleEditGuardia()
      } else if (isRangeMode) {
        await handleRangoGuardias()
      } else {
        await handleNuevaGuardia()
      }
    } catch (error) {
      console.error("Error en la operación:", error)
      if (error instanceof Error) {
        setError(`Error: ${error.message}`)
      } else {
        setError("Error desconocido al procesar la solicitud")
      }
    }
  }

  // Función para manejar edición de una guardia existente
  const handleEditGuardia = async () => {
    // Validar que la guardia existe
    const guardiaActual = guardias.find(g => g.id === editingId)
    if (!guardiaActual || editingId === null) {
      alert("Error: La guardia que intentas editar ya no existe.")
      resetForm()
      return
    }
    
    // Extraer datos necesarios del formulario
    const { tramosHorarios, ...guardiaData } = formData
    
    // Determinar el estado correcto de la guardia basado en profesorCubridorId
    // Si el profesor cubridor está vacío, debe ser "Pendiente"
    // Si hay profesor cubridor, debe ser "Asignada" (a menos que ya esté firmada)
    let nuevoEstado = guardiaData.estado
    
    if (guardiaData.profesorCubridorId === "") {
      // Si se quita el profesor cubridor, la guardia pasa a "Pendiente"
      nuevoEstado = DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE as typeof formData.estado
    } else if (guardiaData.profesorCubridorId !== "" && 
               guardiaActual.profesorCubridorId !== Number(guardiaData.profesorCubridorId) &&
               guardiaActual.estado !== DB_CONFIG.ESTADOS_GUARDIA.FIRMADA &&
               guardiaActual.estado !== DB_CONFIG.ESTADOS_GUARDIA.ANULADA) {
      // Si se asigna o cambia el profesor cubridor, la guardia pasa a "Asignada"
      // excepto si ya estaba firmada o anulada
      nuevoEstado = DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA as typeof formData.estado
    }
    
    try {
      if (hasAssociatedAusencia && desasociarAusencia) {
        // Primero desasociar la guardia de la ausencia
        const desasociado = await desasociarGuardiaDeAusencia(editingId)
        
        if (desasociado) {
          // Actualizar la guardia con los nuevos datos
          await updateGuardia(editingId, {
            ...guardiaData,
            lugarId: guardiaData.lugarId ? Number(guardiaData.lugarId) : 0,
            profesorCubridorId: guardiaData.profesorCubridorId === "" ? null : 
                              typeof guardiaData.profesorCubridorId === "string" ? 
                              Number(guardiaData.profesorCubridorId) : guardiaData.profesorCubridorId,
            observaciones: guardiaData.observaciones, // Asegurar que se actualizan las observaciones
            // Al desasociar, establecer el estado como pendiente sin importar lo anterior
            estado: DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE as typeof formData.estado
          })
          
          // Refrescar todos los datos para asegurar que el estado de asociación está actualizado
          await refreshAllData()
          
          alert("Guardia actualizada correctamente y desasociada de la ausencia. La guardia ha pasado a estado 'Pendiente'.")
        } else {
          alert("Error al desasociar la guardia de la ausencia.")
          return
        }
      } else {
        // Actualización normal sin desasociar
        await updateGuardia(editingId, {
          ...guardiaData,
          lugarId: guardiaData.lugarId ? Number(guardiaData.lugarId) : 0,
          profesorCubridorId: guardiaData.profesorCubridorId === "" ? null : 
                            typeof guardiaData.profesorCubridorId === "string" ? 
                            Number(guardiaData.profesorCubridorId) : guardiaData.profesorCubridorId,
          observaciones: guardiaData.observaciones, // Asegurar que se actualizan las observaciones
          estado: nuevoEstado // Aplicar el nuevo estado según la lógica
        })
        
        // Refrescar todos los datos para mantener la coherencia
        await refreshAllData()
        
        alert("Guardia actualizada correctamente")
      }
      
      setEditingId(null)
      setHasAssociatedAusencia(false)
      setDesasociarAusencia(false)
      resetForm()
    } catch (error) {
      console.error("Error al actualizar la guardia:", error)
      alert(`Error al actualizar la guardia: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  // Manejar anulación de guardia
  const handleAnular = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres anular esta guardia?")) {
      const motivo = prompt("Motivo de la anulación:")
      if (motivo === null) return // El usuario canceló
      
      anularGuardia(id, motivo)
        .then(() => {
          // Refrescar todos los datos para que se refleje la anulación
          refreshAllData()
          alert("Guardia anulada correctamente")
        })
        .catch(error => {
          console.error("Error al anular la guardia:", error)
          alert("Error al anular la guardia: " + error)
        })
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
        if (guardiaToDelete.estado !== DB_CONFIG.ESTADOS_GUARDIA.ANULADA) {
          alert("Error: Solo se pueden eliminar guardias que estén en estado 'Anulada'.");
          return;
        }
        
        // Intentar eliminar la guardia
        await deleteGuardia(id);
        
        // Refrescar todos los datos para confirmar que se eliminó
        await refreshAllData();
        
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

  // Obtener el color del badge según el estado
  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE:
        return "bg-warning text-dark";
      case DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA:
        return "bg-info";
      case DB_CONFIG.ESTADOS_GUARDIA.FIRMADA:
        return "bg-success";
      case DB_CONFIG.ESTADOS_GUARDIA.ANULADA:
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

  // Manejar creación de guardias por rango
  const handleRangoGuardias = async () => {
    // Validar el rango
    if (!validarRangoFechas()) return;

    setError(null);
    
    try {
      // Generar todas las fechas en el rango
      const fechasRango = generateDateRange(rangoFechas.fechaInicio, rangoFechas.fechaFin);
      
      // Validar que se hayan seleccionado tramos
      if (!formData.tramosHorarios || formData.tramosHorarios.length === 0) {
        setError("Debes seleccionar al menos un tramo horario");
        return;
      }
      
      // Validar el lugar
      if (!formData.lugarId) {
        setError("Debes seleccionar un lugar para la guardia");
        return;
      }
      
      // Crear guardias para todas las fechas y tramos
      const resultado = await crearGuardiasParaRango(fechasRango);
      
      if (resultado) {
        // Mostrar resultado y reiniciar formulario
        resetForm();
        setIsRangeMode(false);
        
        // Refrescar la lista de guardias
        await refreshAllData();
      }
    } catch (error) {
      console.error("Error al crear guardias por rango:", error);
      setError(`Error al crear guardias: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const crearGuardiasParaRango = async (fechas: string[]): Promise<boolean> => {
    let guardiasCreadas = 0;
    let guardiasDuplicadas = 0;
    
    try {
      for (const fecha of fechas) {
        for (const tramoHorario of formData.tramosHorarios) {
          const lugarId = Number(formData.lugarId);
          
          // Verificar si ya existe una guardia para esta fecha y tramo
          const guardiaExistente = guardias.find(g => 
            g.fecha === fecha && 
            g.tramoHorario === tramoHorario &&
            g.lugarId === lugarId
          );
          
          if (guardiaExistente) {
            guardiasDuplicadas++;
            continue;
          }
          
          // Preparar datos de la guardia
          const guardiaData = prepararDatosGuardia(fecha, tramoHorario, lugarId);
          
          // Crear la guardia
          const nuevaGuardia = await addGuardia(guardiaData);
          
          // Añadir tarea si se ha especificado
          if (nuevaGuardia && formData.tarea) {
            await addTareaGuardia({
              guardiaId: nuevaGuardia,
              descripcionTarea: formData.tarea
            });
          }
          
          guardiasCreadas++;
        }
      }
      
      mostrarResultadoCreacionPorRango(guardiasCreadas, guardiasDuplicadas);
      
      // Refrescar todos los datos para mostrar las nuevas guardias
      await refreshAllData();
      
      return true;
    } catch (error) {
      console.error("Error al crear guardias por rango:", error);
      alert(`Error al crear guardias: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return false;
    }
  };

  // Manejar creación de nueva guardia individual
  const handleNuevaGuardia = async () => {
    // Validar formulario
    if (!validarFormularioGuardia()) return;
    
    // Verificar si hay guardias duplicadas
    if (verificarGuardiasDuplicadas()) {
      if (!window.confirm("Ya existe una guardia para esta fecha, tramo y lugar. ¿Deseas continuar?")) {
        return;
      }
    }
    
    setError(null);
    
    try {
      // Crear guardias individuales para cada tramo seleccionado
      await crearGuardiasIndividuales();
      
      // Mostrar mensaje de éxito
      alert(`Guardia${formData.tramosHorarios.length > 1 ? 's' : ''} creada${formData.tramosHorarios.length > 1 ? 's' : ''} correctamente`);
      
      // Limpiar formulario
      resetForm();
      
      // Refrescar todos los datos
      await refreshAllData();
    } catch (error) {
      console.error("Error al crear guardia:", error);
      setError(`Error al crear guardia: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // Validar rango de fechas
  const validarRangoFechas = () => {
    if (new Date(rangoFechas.fechaInicio) > new Date(rangoFechas.fechaFin)) {
      setError("La fecha de inicio no puede ser posterior a la fecha de fin")
      return false
    }
    return true
  }

  // Preparar datos de guardia para crear
  const prepararDatosGuardia = (fecha: string, tramoHorario: string, lugarId: number): Omit<Guardia, "id"> => {
    return {
      fecha,
      tramoHorario,
      tipoGuardia: formData.tipoGuardia,
      firmada: false,
      estado: DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE,
      observaciones: formData.observaciones || "Guardia creada automáticamente",
      lugarId: Number(lugarId), // Convertir a número para asegurar compatibilidad
      profesorCubridorId: null
    }
  }

  // Verificar si ya existen guardias duplicadas
  const verificarGuardiasDuplicadas = () => {
    const guardiasExistentes = []
    
    for (const tramoHorario of formData.tramosHorarios) {
      const existingGuardia = guardias.find(
        g => g.fecha === formData.fecha && 
             g.tramoHorario === tramoHorario && 
             g.lugarId === Number(formData.lugarId) &&
             g.tipoGuardia === formData.tipoGuardia &&
             g.estado !== DB_CONFIG.ESTADOS_GUARDIA.ANULADA
      )
      
      if (existingGuardia) {
        guardiasExistentes.push(tramoHorario)
      }
    }
    
    return guardiasExistentes.length > 0
  }

  // Crear guardias individuales para cada tramo
  const crearGuardiasIndividuales = async () => {
    try {
    for (const tramoHorario of formData.tramosHorarios) {
        // Preparar datos de la guardia
        const guardiaData = prepararDatosGuardia(
          formData.fecha,
          tramoHorario,
          Number(formData.lugarId)
        );
        
        // Crear la guardia
        const nuevaGuardiaId = await addGuardia(guardiaData);
        
        // Si se creó correctamente y hay una tarea, añadirla
        if (nuevaGuardiaId && formData.tarea.trim()) {
          await addTareaGuardia({
            guardiaId: nuevaGuardiaId,
            descripcionTarea: formData.tarea.trim()
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error al crear guardias individuales:", error);
      throw error;
    }
  };

  // Crear guardia en la base de datos
  const crearGuardia = async (guardiaData: Omit<Guardia, "id">) => {
    // Crear la guardia
    const guardiaId = await addGuardia(guardiaData);
    
    // Si hay tarea y la guardia se creó correctamente, añadir tarea
    if (guardiaId && formData.tarea && formData.tarea.trim() !== "") {
      await addTareaGuardia({
        guardiaId: guardiaId,
        descripcionTarea: formData.tarea.trim()
      });
    }
    
    return guardiaId;
  };

  // Resetear formulario y estado
  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split("T")[0],
      tramoHorario: "",
      tramosHorarios: [],
      tipoGuardia: Object.values(DB_CONFIG.TIPOS_GUARDIA)[0],
      lugarId: "",
      observaciones: "",
      estado: DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE,
      profesorAusenteId: "",
      profesorCubridorId: "",
      tarea: ""
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
    setDesasociarAusencia(false)
  }

  // Corregir la función handleEdit
  const handleEdit = (guardia: Guardia) => {
    // Verificar si la guardia tiene una ausencia asociada
    const profesorAusenteId = getProfesorAusenteIdByGuardia(guardia.id)
    setHasAssociatedAusencia(profesorAusenteId !== null)
    setDesasociarAusencia(false) // Restablecer el estado de desasociación

    // Obtener la primera tarea asociada a la guardia, si existe
    const tareas = getTareasByGuardia(guardia.id)
    const primeraTarea = tareas.length > 0 ? tareas[0].descripcionTarea : ""

    setFormData({
      fecha: guardia.fecha,
      tramoHorario: guardia.tramoHorario,
      tramosHorarios: [guardia.tramoHorario], // Solo incluimos el tramo actual en modo edición
      tipoGuardia: guardia.tipoGuardia,
      observaciones: guardia.observaciones,
      lugarId: String(guardia.lugarId),
      profesorCubridorId: guardia.profesorCubridorId === null ? "" : String(guardia.profesorCubridorId),
      estado: guardia.estado as typeof formData.estado, // Forzar el tipo correcto para estado
      profesorAusenteId: profesorAusenteId === null ? "" : String(profesorAusenteId),
      tarea: primeraTarea // Incluir la primera tarea si existe
    })
    setEditingId(guardia.id)
    setShowForm(true)
  }

  // Mostrar mensaje según resultado de creación por rango
  const mostrarResultadoCreacionPorRango = (guardiasCreadas: number, guardiasDuplicadas: number) => {
    if (guardiasCreadas > 0 && guardiasDuplicadas === 0) {
      alert(`Se han creado ${guardiasCreadas} guardias correctamente para el rango de fechas seleccionado.`)
    } else if (guardiasCreadas > 0 && guardiasDuplicadas > 0) {
      alert(`Se han creado ${guardiasCreadas} guardias correctamente. Se omitieron ${guardiasDuplicadas} guardias por ya existir en el sistema.`)
    } else if (guardiasCreadas === 0 && guardiasDuplicadas > 0) {
      alert("No se crearon guardias porque todas las combinaciones ya existen en el sistema.")
        } else {
      alert("No se pudieron crear guardias para el rango seleccionado.")
    }
  }

  // Validar formulario de creación de guardia
  const validarFormularioGuardia = () => {
    if (!formData.fecha) {
      setError("La fecha es obligatoria")
      return false
    }
    
    if (!formData.tramosHorarios || formData.tramosHorarios.length === 0) {
      setError("Debes seleccionar al menos un tramo horario")
      return false
    }
    
    if (!formData.lugarId) {
      setError("Debes seleccionar un lugar para la guardia")
      return false
    }
    
    return true
  }

  // Manejador para añadir tarea
  const handleAddTarea = (guardia: Guardia) => {
    setSelectedGuardia(guardia)
    setNuevaTarea("")
    setShowTareaModal(true)
  }
  
  // Manejador para editar tarea
  const handleEditTarea = (tarea: TareaGuardia) => {
    setTareaEditing(tarea)
    setEditedTareaText(tarea.descripcionTarea)
    setShowTareaEditModal(true)
  }
  
  // Manejador para eliminar tarea
  const handleDeleteTarea = async (tareaId: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta tarea?")) {
      try {
        await deleteTareaGuardia(tareaId)
        setMensaje({
          tipo: "success",
          texto: "Tarea eliminada correctamente"
        })
      } catch (error) {
        console.error("Error al eliminar la tarea:", error)
        setMensaje({
          tipo: "error",
          texto: "Error al eliminar la tarea"
        })
      }
    }
  }
  
  // Guardar tarea nueva
  const handleSaveTarea = async () => {
    if (!selectedGuardia || !nuevaTarea.trim()) return
    
    try {
      await addTareaGuardia({
        guardiaId: selectedGuardia.id,
        descripcionTarea: nuevaTarea.trim()
      })
      
      setMensaje({
        tipo: "success",
        texto: "Tarea añadida correctamente"
      })
      
      setShowTareaModal(false)
      setNuevaTarea("")
    } catch (error) {
      console.error("Error al guardar la tarea:", error)
      setMensaje({
        tipo: "error",
        texto: "Error al guardar la tarea"
      })
    }
  }
  
  // Guardar edición de tarea
  const handleSaveEditTarea = async () => {
    if (!tareaEditing || !editedTareaText.trim()) return
    
    try {
      await updateTareaGuardia(tareaEditing.id, {
        ...tareaEditing,
        descripcionTarea: editedTareaText.trim()
      })
      
      setMensaje({
        tipo: "success",
        texto: "Tarea actualizada correctamente"
      })
      
      setShowTareaEditModal(false)
      setTareaEditing(null)
    } catch (error) {
      console.error("Error al actualizar la tarea:", error)
      setMensaje({
        tipo: "error",
        texto: "Error al actualizar la tarea"
      })
    }
  }
  
  // Cerrar modales
  const handleCloseModals = () => {
    setShowTareaModal(false)
    setShowTareaEditModal(false)
    setShowModal(false)
    setTareaEditing(null)
    setSelectedGuardia(null)
  }

  // Corregir la función que verifica si un profesor tiene disponibilidad
  const profesorTieneDisponibilidad = (profesorId: number, fecha: string, tramoHorario: string): boolean => {
    // Si estamos editando una guardia, el profesor cubridor actual siempre debe estar disponible
    if (editingId) {
      const guardiaActual = guardias.find(g => g.id === editingId);
      if (guardiaActual && guardiaActual.profesorCubridorId === profesorId) {
        return true; // El profesor actual siempre está disponible para la guardia que edita
      }
    }
    
    // Obtener el día de la semana (1-7, donde 1 es lunes y 7 es domingo)
    const fechaObj = new Date(fecha);
    const diaSemanaNumerico = fechaObj.getDay() || 7; // Si es domingo (0), convertirlo a 7
    
    // Solo considerar días laborables (lunes a viernes)
    if (diaSemanaNumerico > 5) {
      return false; // No hay disponibilidad en fin de semana
    }
    
    // Obtener el nombre del día a partir del número
    const nombreDiaSemana = DB_CONFIG.DIAS_SEMANA[diaSemanaNumerico - 1];
    
    // Verificar si el profesor tiene horario para ese día y tramo
    const tieneHorario = horarios.some(h => 
      h.profesorId === profesorId && 
      h.diaSemana === nombreDiaSemana && 
      h.tramoHorario === tramoHorario
    );
    
    // Si no tiene horario para este día y tramo, no está disponible
    if (!tieneHorario) {
      return false;
    }
    
    // Verificar si ya tiene una guardia asignada para esta fecha específica y tramo
    const tieneProgramada = guardias.some(g => 
      g.profesorCubridorId === profesorId && 
      g.fecha === fecha && 
      g.tramoHorario === tramoHorario &&
      g.id !== editingId && // Ignorar la guardia que estamos editando
      (g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA || g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA)
    );
    
    // Está disponible si no tiene otra guardia ya asignada
    return !tieneProgramada;
  };

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

      {/* Mostrar mensajes de feedback */}
      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show mb-4`} role="alert">
          <i className={`bi ${
            mensaje.tipo === 'success' ? 'bi-check-circle' : 
            mensaje.tipo === 'error' ? 'bi-exclamation-triangle' :
            mensaje.tipo === 'warning' ? 'bi-exclamation-triangle' : 'bi-info-circle'
          } me-2`}></i>
          {mensaje.texto}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMensaje(null)}
            aria-label="Cerrar"
          ></button>
        </div>
      )}

      <DataCard 
        title="Filtros y Acciones" 
        icon="filter"
        className="mb-4"
      >
        <div className="row g-4">
          <div className="col-md-3">
            <div className="form-group">
              <label htmlFor="filterId" className="form-label fw-bold">ID</label>
              <input
                type="text"
                id="filterId"
                className="form-control"
                value={filterId}
                onChange={(e) => setFilterId(e.target.value)}
                placeholder="Buscar por ID exacto"
              />
              <small className="form-text text-muted">Filtrar por ID específico</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label htmlFor="filterEstado" className="form-label fw-bold">Estado</label>
              <select
                id="filterEstado"
                className="form-select"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value={DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE}>Pendiente</option>
                <option value={DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA}>Asignada</option>
                <option value={DB_CONFIG.ESTADOS_GUARDIA.FIRMADA}>Firmada</option>
                <option value={DB_CONFIG.ESTADOS_GUARDIA.ANULADA}>Anulada</option>
              </select>
              <small className="form-text text-muted">Filtrar por estado de guardia</small>
            </div>
          </div>
          <div className="col-md-3">
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
          <div className="col-md-3">
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
                    <i className={`bi ${editingId ? "bi-check-circle" : "bi-plus-circle"} me-2`}></i>
                    {editingId ? "Actualizar" : "Crear Guardia"}
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
    
                  {/* Añadir profesor cubridor aquí para el modo edición */}
                  {editingId && (
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="profesorCubridorId" className="form-label fw-bold">
                          Profesor Cubridor
                  </label>
                        <select
                          className="form-select"
                          id="profesorCubridorId"
                          name="profesorCubridorId"
                          value={formData.profesorCubridorId}
                    onChange={handleChange}
                        >
                          <option value="">Sin asignar</option>
                          {profesores
                            .filter(profesor => profesorTieneDisponibilidad(profesor.id, formData.fecha, formData.tramoHorario))
                            .map((profesor) => (
                              <option key={profesor.id} value={profesor.id}>
                                {profesor.nombre}
                              </option>
                          ))}
                        </select>
                        <small className="form-text text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Solo se muestran profesores con horario para este día y tramo que no tengan otra guardia asignada
                        </small>
                        {guardias.find(g => g.id === editingId)?.profesorCubridorId !== null && (
                          <small className="d-block mt-1 text-info">
                            <i className="bi bi-person-check me-1"></i>
                            El profesor cubridor actual siempre aparece en la lista, incluso si su disponibilidad ha cambiado
                          </small>
                        )}
                        {formData.profesorCubridorId !== guardias.find(g => g.id === editingId)?.profesorCubridorId?.toString() && (
                          <div className="alert alert-info mt-2">
                            <i className="bi bi-info-circle-fill me-2"></i>
                            Al cambiar el profesor cubridor, el estado de la guardia se actualizará automáticamente
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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

                {/* Sección de tareas (solo para edición) */}
                {editingId && (
                  <div className="mt-4">
                    <h5 className="fw-bold border-bottom pb-2 mb-3 d-flex justify-content-between align-items-center">
                      <span>
                        <i className="bi bi-list-check me-1"></i>
                        Tareas de la guardia
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleAddTarea(guardias.find(g => g.id === editingId) as Guardia)}
                        title="Añadir nueva tarea"
                      >
                        <i className="bi bi-plus-circle me-1"></i>
                        Añadir tarea
                      </button>
                    </h5>
                    
                    {getTareasByGuardia(editingId).length === 0 ? (
                      <div className="alert alert-light">
                        <i className="bi bi-info-circle me-2"></i>
                        No hay tareas asignadas para esta guardia
                      </div>
                    ) : (
                      <div className="list-group mb-4">
                        {getTareasByGuardia(editingId).map((tarea) => (
                          <div key={tarea.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                            <span>
                              <i className="bi bi-check2-square me-2"></i>
                              {tarea.descripcionTarea}
                            </span>
                            <div className="btn-group btn-group-sm">
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => handleEditTarea(tarea)}
                                title="Editar tarea"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteTarea(tarea.id)}
                                title="Eliminar tarea"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {editingId && hasAssociatedAusencia && (
                  <div className="mt-4">
                    <div className="alert alert-warning d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                      <div>
                        <p className="mb-0">
                          Esta guardia está asociada a una ausencia. Si desea desasociarla, marque la casilla a continuación.
                        </p>
                      </div>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="desasociarAusencia"
                        checked={desasociarAusencia}
                        onChange={(e) => setDesasociarAusencia(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="desasociarAusencia">
                        Desasociar ausencia de esta guardia
                      </label>
                    </div>
                  </div>
                )}
    
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
        {sortedGuardias.length === 0 ? (
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
                      onClick={() => handleSort('id')} 
                      className="cursor-pointer user-select-none sortable-header"
                      title="Ordenar por ID"
                    >
                      <div className="d-flex align-items-center">
                        ID
                        {sortField === 'id' && (
                          <span className="ms-2 text-primary">
                            <i className={`bi bi-sort-${sortDirection === 'asc' ? 'up' : 'down'}-alt`}></i>
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      onClick={() => handleSort('fecha')} 
                      className="cursor-pointer user-select-none sortable-header"
                      title="Ordenar por fecha"
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
                      className="cursor-pointer user-select-none sortable-header"
                      title="Ordenar por tramo horario"
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
                        <td>{guardia.id}</td>
                        <td>{new Date(guardia.fecha).toLocaleDateString()}</td>
                        <td>{guardia.tramoHorario}</td>
                        <td>{guardia.tipoGuardia}</td>
                        <td>{lugar ? `${lugar.codigo} - ${lugar.descripcion}` : "No especificado"}</td>
                        <td>{profesorAusente ? profesorAusente.nombre : "No especificado"}</td>
                        <td>{profesorCubridor ? profesorCubridor.nombre : "Pendiente"}</td>
                        <td>
                          <span
                            className={`badge ${
                              guardia.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE
                                ? "bg-warning text-dark"
                                : guardia.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA
                                ? "bg-info"
                                : guardia.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA
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
                            {guardia.estado !== DB_CONFIG.ESTADOS_GUARDIA.FIRMADA && guardia.estado !== DB_CONFIG.ESTADOS_GUARDIA.ANULADA && (
                              <button
                                className="btn btn-sm btn-outline-warning"
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
                            {guardia.estado === DB_CONFIG.ESTADOS_GUARDIA.ANULADA && (
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
                Mostrando <span className="fw-bold">{currentPage * itemsPerPage - itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sortedGuardias.length)}</span> de <span className="fw-bold">{sortedGuardias.length}</span> guardias
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
                
                <div className="mb-4">
                      <h6 className="fw-bold">
                    <i className="bi bi-chat-left-text me-1"></i>
                      Observaciones
                    </h6>
                    {selectedGuardia.observaciones ? (
                      <p className="mb-0">{selectedGuardia.observaciones}</p>
                    ) : (
                    <p className="text-muted mb-0">No hay observaciones</p>
                    )}
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

                <div className="mb-3">
                  <h6 className="fw-bold border-bottom pb-2 mb-3">
                    <i className="bi bi-list-check me-1"></i>
                    Tareas asignadas
                  </h6>
                  
                  {getTareasByGuardia(selectedGuardia.id).length === 0 ? (
                    <div className="alert alert-light">
                      <i className="bi bi-info-circle me-2"></i>
                      No hay tareas asignadas para esta guardia
                    </div>
                  ) : (
                    <div className="list-group">
                      {getTareasByGuardia(selectedGuardia.id).map((tarea) => (
                        <div key={tarea.id} className="list-group-item">
                          <i className="bi bi-check2-square me-2"></i>
                          {tarea.descripcionTarea}
                        </div>
                      ))}
                    </div>
                  )}
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

      {/* Modal para añadir tarea */}
      {showTareaModal && selectedGuardia && (
        <div className="modal fade show" 
              style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-plus-circle me-2"></i>
                  Añadir Tarea a la Guardia
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCloseModals}
                  aria-label="Cerrar"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Guardia:</strong> {new Date(selectedGuardia.fecha).toLocaleDateString('es-ES')} - {selectedGuardia.tramoHorario}
                </p>
                <div className="mb-3">
                  <label htmlFor="nuevaTarea" className="form-label">Descripción de la tarea</label>
                  <textarea
                    id="nuevaTarea"
                    className="form-control"
                    value={nuevaTarea}
                    onChange={(e) => setNuevaTarea(e.target.value)}
                    rows={3}
                    placeholder="Escribe aquí la tarea a realizar..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModals}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveTarea}
                  disabled={!nuevaTarea.trim()}
                >
                  <i className="bi bi-save me-1"></i>
                  Guardar Tarea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar tarea */}
      {showTareaEditModal && tareaEditing && (
        <div className="modal fade show" 
              style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i>
                  Editar Tarea
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    setShowTareaEditModal(false)
                    setTareaEditing(null)
                  }}
                  aria-label="Cerrar"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="editTarea" className="form-label">Descripción de la tarea</label>
                  <textarea
                    id="editTarea"
                    className="form-control"
                    value={editedTareaText}
                    onChange={(e) => setEditedTareaText(e.target.value)}
                    rows={3}
                    placeholder="Escribe aquí la descripción de la tarea..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowTareaEditModal(false)
                    setTareaEditing(null)
                  }}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveEditTarea}
                  disabled={!editedTareaText.trim()}
                >
                  <i className="bi bi-save me-1"></i>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 