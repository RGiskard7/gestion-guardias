"use client"

import { useState, useEffect } from "react"
import { useAusencias } from "@/src/contexts/AusenciasContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { Ausencia } from "@/src/types"
import { Pagination } from "@/components/ui/pagination"
import { useForm } from "@/hooks/use-form"
import DataCard from "@/components/common/DataCard"
import { DB_CONFIG } from "@/lib/db-config"

export default function AdminAusenciasPage() {
  const { ausencias, addAusencia, updateAusencia, deleteAusencia, acceptAusencia, rejectAusencia, refreshAusencias } = useAusencias()
  const { usuarios, getUsuarioById } = useUsuarios()
  const { guardias, getGuardiaByAusenciaId, desasociarGuardiaDeAusencia, refreshGuardias } = useGuardias()
  const { lugares, getLugarById } = useLugares()

  // Estados para la gestión de la interfaz
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showAcceptForm, setShowAcceptForm] = useState(false)
  const [processingAusenciaId, setProcessingAusenciaId] = useState<number | null>(null)
  const [filterProfesorId, setFilterProfesorId] = useState<number | null>(null)
  const [filterFecha, setFilterFecha] = useState("")
  const [filterEstado, setFilterEstado] = useState("")
  const [filterId, setFilterId] = useState("")
  const [sortField, setSortField] = useState<'id' | 'fecha' | 'tramoHorario'>('fecha')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Estado para el modal de detalles
  const [selectedAusencia, setSelectedAusencia] = useState<Ausencia | null>(null)
  const [showModal, setShowModal] = useState(false)
  
  // Estado para control de guardia asociada en edición
  const [hasAssociatedGuardia, setHasAssociatedGuardia] = useState(false)
  const [desasociarGuardia, setDesasociarGuardia] = useState(false)

  // Tramos horarios - Usar los centralizados
  const tramosHorariosOptions = DB_CONFIG.TRAMOS_HORARIOS

  // Actualizar datos al cargar la página
  useEffect(() => {
    handleRefresh()
  }, [])

  // Función para refrescar los datos
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshAusencias()
    } catch (error) {
      console.error("Error al refrescar las ausencias:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Función mejorada para actualizar todos los datos relevantes
  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      // Actualizar ausencias
      await refreshAusencias();
      
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

  // Formulario principal usando el hook personalizado
  const { 
    formData, 
    handleChange, 
    setFormData, 
    resetForm, 
    handleSubmit 
  } = useForm<Omit<Ausencia, "id"> & { tramosHorarios?: string[] }>({
    initialValues: {
      profesorId: 0,
      fecha: "",
      tramoHorario: "",
      tramosHorarios: [],
      estado: DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE,
      observaciones: "",
    },
    onSubmit: async (values) => {
      try {
        // Validar que se hayan seleccionado tramos horarios
        if (!values.tramosHorarios || values.tramosHorarios.length === 0) {
          alert("Por favor, selecciona al menos un tramo horario")
          return
        }
        
        // Verificar si ya existe alguna ausencia para este profesor, fecha y tramos
        const profesorId = values.profesorId
        const fecha = values.fecha
        
        for (const tramoHorario of values.tramosHorarios) {
          // Verificar si existe ausencia (excepto si estamos editando la misma)
          const ausenciaExistente = ausencias.find(a => 
            a.profesorId === profesorId && 
            a.fecha === fecha && 
            a.tramoHorario === tramoHorario &&
            a.id !== editingId
          )
          
          if (ausenciaExistente) {
            alert(`Ya existe una ausencia registrada para este profesor el día ${fecha} en el tramo ${tramoHorario}`)
            return
          }
        }
        
        if (editingId) {
          // Modo edición
          const tramoHorario = values.tramosHorarios[0] // En edición solo permitimos un tramo
          
          // En modo edición, verificar si la nueva fecha y tramo ya existen para el profesor
          // Sólo hacemos esta validación si el usuario puede modificar estos campos
          if (!(hasAssociatedGuardia && !desasociarGuardia)) {
            // Solo entramos si NO se cumple que (tiene guardia asociada Y no se desasocia)
            // Es decir, entramos si (no tiene guardia asociada) O (tiene guardia pero se desasocia)
            const nuevaFecha = values.fecha
            const nuevoTramo = tramoHorario
            const ausenciaExistente = ausencias.find(a => 
              a.profesorId === profesorId && 
              a.fecha === nuevaFecha && 
              a.tramoHorario === nuevoTramo &&
              a.id !== editingId
            )
            
            if (ausenciaExistente) {
              alert(`No es posible modificar a esta fecha y tramo horario porque ya existe una ausencia registrada para este profesor el día ${nuevaFecha} en el tramo ${nuevoTramo}`)
              return
            }
          }
          
          // Si estamos editando una ausencia que tiene guardia asociada
          if (hasAssociatedGuardia) {
            const guardia = getGuardiaByAusenciaId(editingId)
            
            if (desasociarGuardia && guardia) {
              // Si explícitamente quiere desasociar la guardia, cambiamos automáticamente a Pendiente
              try {
                // Primero desasociamos la guardia para evitar problemas de concurrencia
                const desasociado = await desasociarGuardiaDeAusencia(guardia.id);
                
                if (!desasociado) {
                  alert("Error al desasociar la guardia. No se pudo completar la operación.");
                  return;
                }
                
                // Ahora actualizamos la ausencia y su estado
                await updateAusencia(editingId, {
                  profesorId: values.profesorId,
                  fecha: values.fecha,
                  tramoHorario,
                  // Al desasociar la guardia, siempre cambiamos a Pendiente
                  estado: DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE,
                  observaciones: values.observaciones
                });
                
                alert("Ausencia actualizada correctamente y guardia desasociada. La ausencia ha pasado a estado 'Pendiente'.");
                
                // Refrescar las guardias para asegurar que el estado de asociación está actualizado
                await refreshGuardias();
              } catch (error) {
                console.error("Error al actualizar ausencia:", error);
                alert("Error al actualizar la ausencia: " + error);
              }
            } else {
              // Si no hay que desasociar, solo actualizamos la ausencia pero sin cambiar el estado
              await updateAusencia(editingId, {
                profesorId: values.profesorId,
                fecha: values.fecha,
                tramoHorario,
                // No modificamos el estado
                observaciones: values.observaciones
              })
              
              alert("Ausencia actualizada correctamente")
            }
          } else {
            // Si no hay guardia asociada, simplemente actualizamos
            await updateAusencia(editingId, {
              profesorId: values.profesorId,
              fecha: values.fecha,
              tramoHorario,
              // No modificamos el estado
              observaciones: values.observaciones
            })
            
            alert("Ausencia actualizada correctamente")
          }
          
          // Limpiar formulario y actualizar lista
          resetForm()
          setEditingId(null)
          setHasAssociatedGuardia(false)
          setDesasociarGuardia(false)
          setShowForm(false)
          await refreshAllData()
        } else {
          // Crear ausencias para cada tramo horario seleccionado
          for (const tramoHorario of values.tramosHorarios) {
            // Preparar datos para enviar
            const ausenciaData: Omit<Ausencia, "id"> = {
              profesorId: values.profesorId,
              fecha: values.fecha,
              tramoHorario,
              estado: DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE,
              observaciones: values.observaciones,
            }

            // Crear nueva ausencia
            await addAusencia(ausenciaData)
            
            // Pequeña pausa para evitar problemas de concurrencia
            await new Promise(resolve => setTimeout(resolve, 100))
          }

          alert("Ausencias creadas correctamente")

          // Limpiar formulario y actualizar lista
          resetForm()
          setShowForm(false)
          await refreshAllData()
        }
      } catch (error) {
        console.error("Error al guardar la ausencia:", error)
        alert("Error al guardar la ausencia")
      }
    }
  })

  // Manejar cambios en los checkboxes de tramos horarios
  const handleTramoHorarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    // Si estamos en modo edición, solo permitir seleccionar un tramo
    if (editingId) {
      if (value === "todo-el-dia") {
        // No permitir "Todo el día" en modo edición
        return;
      }
      
      // En modo edición, comportarse como radio buttons
      if (checked) {
        setFormData({
          ...formData,
          tramosHorarios: [value],
          tramoHorario: value
        });
      }
      return;
    }
    
    // Modo creación - comportamiento normal de múltiples selecciones
    if (value === "todo-el-dia") {
      // Si se selecciona "Todo el día", marcar todos los tramos
      if (checked) {
        setFormData({
          ...formData,
          tramosHorarios: [...tramosHorariosOptions]
        });
      } else {
        // Si se desmarca, vaciar la selección
        setFormData({
          ...formData,
          tramosHorarios: []
        });
      }
    } else {
      // Para los tramos individuales
      let newTramosHorarios: string[] = [];
      
      if (checked) {
        // Agregar el tramo a la selección
        newTramosHorarios = [...(formData.tramosHorarios || []), value];
      } else {
        // Quitar el tramo de la selección
        newTramosHorarios = (formData.tramosHorarios || []).filter(
          tramo => tramo !== value
        );
      }
      
      setFormData({
        ...formData,
        tramosHorarios: newTramosHorarios
      });
    }
  };

  // Formulario de aceptación usando el hook personalizado
  const { 
    formData: acceptFormData, 
    handleChange: handleAcceptFormChange, 
    setFormData: setAcceptFormData, 
    resetForm: resetAcceptForm, 
    handleSubmit: handleAcceptFormSubmit 
  } = useForm({
    initialValues: {
      tipoGuardia: DB_CONFIG.TIPOS_GUARDIA[0],
      lugarId: "",
      observaciones: "",
    },
    onSubmit: async (values) => {
      if (!processingAusenciaId) return

      try {
        const ausencia = ausencias.find(a => a.id === processingAusenciaId)
        if (!ausencia) return

        // Validar que se haya seleccionado un lugar
        if (!values.lugarId) {
          alert("Por favor, selecciona un lugar para la guardia")
          return
        }

        // Aceptar la ausencia y crear la guardia
        const guardiaId = await acceptAusencia(
          processingAusenciaId,
          values.tipoGuardia,
          Number(values.lugarId),
          values.observaciones
        )

        if (guardiaId) {
          alert("Ausencia aceptada correctamente. Se ha creado una guardia.")
          
          resetAcceptForm()
          setProcessingAusenciaId(null)
          setShowAcceptForm(false)
          await refreshAllData()
        } else {
          // Si no se ha podido crear la guardia, mostrar mensaje de error
          // pero no cambiar el estado de la ausencia (sigue en pendiente)
          alert("Error al crear la guardia. La ausencia se mantiene en estado 'Pendiente'.")
          
          // Cerrar el formulario pero no cambiar el estado de la ausencia
          resetAcceptForm()
          setProcessingAusenciaId(null)
          setShowAcceptForm(false)
          await refreshAllData()
        }
      } catch (error) {
        console.error("Error al procesar la ausencia:", error)
        alert("Error al procesar la ausencia. La ausencia se mantiene en estado 'Pendiente'.")
        
        // Cerrar el formulario pero no cambiar el estado de la ausencia
        resetAcceptForm()
        setProcessingAusenciaId(null)
        setShowAcceptForm(false)
        await refreshAllData()
      }
    }
  })

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

  // Filtrar ausencias
  const handleFilterProfesorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFilterProfesorId(value ? Number.parseInt(value) : null)
  }

  // Filtrar ausencias
  const filteredAusencias = ausencias.filter(ausencia => {
    // Filtrar por ID
    if (filterId && ausencia.id.toString() !== filterId) {
      return false
    }
    
    // Filtrar por profesor
    if (filterProfesorId && ausencia.profesorId !== filterProfesorId) {
      return false
    }

    // Filtrar por fecha
    if (filterFecha && ausencia.fecha !== filterFecha) {
      return false
    }

    // Filtrar por estado
    if (filterEstado && ausencia.estado !== filterEstado) {
      return false
    }

    return true
  })

  // Ordenar ausencias según el campo y dirección seleccionados
  const sortedAusencias = [...filteredAusencias].sort((a, b) => {
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
    
    // Por defecto, ordenar por fecha
    const dateA = new Date(a.fecha).getTime()
    const dateB = new Date(b.fecha).getTime()
    return dateB - dateA
  })

  // Paginar ausencias
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentAusencias = sortedAusencias.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedAusencias.length / itemsPerPage)

  // Cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Manejar edición de ausencia
  const handleEdit = (ausencia: Ausencia) => {
    // Cerrar otros formularios
    setShowAcceptForm(false)
    setProcessingAusenciaId(null)
    
    // Verificar si tiene guardia asociada
    const guardia = getGuardiaByAusenciaId(ausencia.id)
    setHasAssociatedGuardia(!!guardia)
    setDesasociarGuardia(false)
    
    // Configurar formulario de edición
    setFormData({
      profesorId: ausencia.profesorId,
      fecha: ausencia.fecha,
      tramoHorario: ausencia.tramoHorario,
      tramosHorarios: [ausencia.tramoHorario], // Solo incluimos el tramo actual de la ausencia
      estado: ausencia.estado,
      observaciones: ausencia.observaciones,
    })
    
    setEditingId(ausencia.id)
    setShowForm(true)
  }

  // Manejar eliminación de ausencia
  const handleDelete = async (id: number) => {
    // Verificar si la ausencia tiene guardias asociadas
    const guardia = getGuardiaByAusenciaId(id);
    let mensaje = "¿Estás seguro de que deseas eliminar esta ausencia?";
    
    if (guardia) {
      mensaje = "Esta ausencia tiene una guardia asociada. Si continúas, la guardia será anulada automáticamente. ¿Deseas continuar?";
    }
    
    if (window.confirm(mensaje)) {
      try {
        await deleteAusencia(id);
        
        if (guardia) {
          alert("Ausencia eliminada correctamente. La guardia asociada ha sido anulada.");
        } else {
          alert("Ausencia eliminada correctamente");
        }
        
        await refreshAllData();
      } catch (error) {
        console.error("Error al eliminar la ausencia:", error);
        alert("Error al eliminar la ausencia");
      }
    }
  }

  // Manejar procesamiento de ausencia
  const handleProcess = (ausencia: Ausencia) => {
    // Cerrar otros formularios
    setShowForm(false)
    setEditingId(null)
    
    // Configurar formulario de procesamiento
    setAcceptFormData({
      tipoGuardia: DB_CONFIG.TIPOS_GUARDIA[0],
      lugarId: "",
      observaciones: ausencia.observaciones || "",
    })
    
    setProcessingAusenciaId(ausencia.id)
    setShowAcceptForm(true)
  }

  // Manejar anulación de ausencia
  const handleAnular = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas anular esta ausencia?")) {
      try {
        const ausencia = ausencias.find(a => a.id === id)
        if (!ausencia) return

        const motivo = prompt("Introduce el motivo de la anulación:")
        if (motivo === null) return // Usuario canceló

        await updateAusencia(id, {
          ...ausencia,
          estado: DB_CONFIG.ESTADOS_AUSENCIA.RECHAZADA,
          observaciones: `${ausencia.observaciones}\nAnulada: ${motivo}`
        })

        alert("Ausencia anulada correctamente")
        await refreshAllData()
      } catch (error) {
        console.error("Error al anular la ausencia:", error)
        alert("Error al anular la ausencia")
      }
    }
  }

  // Obtener nombre de profesor
  const getProfesorName = (id: number) => {
    const profesor = getUsuarioById(id)
    return profesor ? profesor.nombre : "Desconocido"
  }

  // Obtener nombre de lugar
  const getLugarName = (id: number) => {
    const lugar = lugares.find(l => l.id === id)
    return lugar ? `${lugar.codigo} - ${lugar.descripcion}` : "Desconocido"
  }

  // Manejar visualización de ausencia
  const handleViewAusencia = (ausencia: Ausencia) => {
    setSelectedAusencia(ausencia)
    setShowModal(true)
  }

  // Cerrar modal de detalles
  const handleCloseModal = () => {
    setSelectedAusencia(null)
    setShowModal(false)
  }

  // Obtener el color del badge según el estado
  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE:
        return "bg-warning text-dark";
      case DB_CONFIG.ESTADOS_AUSENCIA.ACEPTADA:
        return "bg-success";
      case DB_CONFIG.ESTADOS_AUSENCIA.RECHAZADA:
        return "bg-danger";
      default:
        return "bg-primary";
    }
  }

  // Renderizar página
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
        .sortable-header {
          transition: background-color 0.2s;
        }
        .sortable-header:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Gestión de Ausencias</h1>
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
                <option value={DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE}>Pendiente</option>
                <option value={DB_CONFIG.ESTADOS_AUSENCIA.ACEPTADA}>Aceptada</option>
                <option value={DB_CONFIG.ESTADOS_AUSENCIA.RECHAZADA}>Rechazada</option>
              </select>
              <small className="form-text text-muted">Filtrar por estado de ausencia</small>
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
            <div className="form-group">
              <label htmlFor="filterProfesor" className="form-label fw-bold">Profesor</label>
              <select
                id="filterProfesor"
                className="form-select"
                value={filterProfesorId || ""}
                onChange={handleFilterProfesorChange}
              >
                <option value="">Todos los profesores</option>
                {usuarios
                  .filter(u => u.rol === DB_CONFIG.ROLES.PROFESOR)
                  .map(profesor => (
                    <option key={profesor.id} value={profesor.id}>
                      {profesor.nombre}
                    </option>
                  ))}
              </select>
              <small className="form-text text-muted">Filtrar por profesor específico</small>
            </div>
          </div>
        </div>
        
        <div className="d-flex justify-content-end mt-4 pt-3 border-top">
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowAcceptForm(false)
              setProcessingAusenciaId(null)
              setEditingId(null)
              resetForm()
              setShowForm(!showForm)
            }}
          >
            <i className={`bi ${showForm ? "bi-x-circle" : "bi-plus-circle"} me-2`}></i>
            {showForm ? "Cancelar" : "Nueva Ausencia"}
          </button>
        </div>
      </DataCard>

      {showForm && (
        <DataCard
          title={editingId ? "Editar Ausencia" : "Nueva Ausencia"}
          icon="calendar-edit"
          className="mb-4"
        >
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="profesorId" className="form-label fw-bold">Profesor</label>
                  {editingId ? (
                    <>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={getProfesorName(formData.profesorId)} 
                        readOnly 
                        title="Nombre del profesor"
                        aria-label="Nombre del profesor"
                      />
                      <small className="form-text text-muted">
                        <i className="bi bi-info-circle-fill me-1"></i>
                        No es posible cambiar el profesor de una ausencia existente.
                      </small>
                    </>
                  ) : (
                    <>
                      <select
                        id="profesorId"
                        name="profesorId"
                        className="form-select"
                        value={formData.profesorId || ""}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona un profesor</option>
                        {usuarios
                          .filter(u => u.rol === DB_CONFIG.ROLES.PROFESOR)
                          .map(profesor => (
                            <option key={profesor.id} value={profesor.id}>
                              {profesor.nombre}
                            </option>
                          ))}
                      </select>
                      <small className="form-text text-muted">Seleccione el profesor que estará ausente</small>
                    </>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="fecha" className="form-label fw-bold">Fecha</label>
                  <input
                    type="date"
                    id="fecha"
                    name="fecha"
                    className="form-control"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    disabled={editingId ? hasAssociatedGuardia : false}
                  />
                  {editingId && hasAssociatedGuardia && (
                    <small className="form-text text-muted">
                      <i className="bi bi-info-circle-fill me-1"></i>
                      No es posible cambiar la fecha porque esta ausencia tiene una guardia asociada.
                    </small>
                  )}
                  {!editingId && (
                    <small className="form-text text-muted">Fecha en la que ocurrirá la ausencia</small>
                  )}
                </div>
              </div>
              
              <div className="col-12">
                <div className="form-group mb-3">
                  <label className="form-label fw-bold">Tramos Horarios</label>
                  {editingId ? (
                    // Modo edición: solo un tramo horario permitido
                    <div className="d-flex flex-column">
                      {hasAssociatedGuardia && !desasociarGuardia ? (
                        // Si tiene guardia asociada y no se va a desasociar, mostrar solo el tramo actual sin poder cambiarlo
                        <div className="form-control bg-light" style={{ cursor: 'not-allowed' }}>
                          {formData.tramosHorarios?.[0] || formData.tramoHorario}
                          <small className="d-block text-muted mt-1">
                            <i className="bi bi-info-circle-fill me-1"></i>
                            No se puede modificar el tramo horario mientras esté asociado a una guardia
                          </small>
                        </div>
                      ) : (
                        // Si no tiene guardia asociada o se va a desasociar, permitir seleccionar un tramo
                        <div className="d-flex flex-row flex-wrap gap-3">
                          {tramosHorariosOptions.map((tramo) => (
                            <div key={tramo} className="form-check me-3">
                              <input
                                className="form-check-input"
                                type="radio"
                                id={`tramo-radio-${tramo}`}
                                name="tramo-radio"
                                value={tramo}
                                checked={formData.tramosHorarios?.[0] === tramo}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      tramosHorarios: [tramo],
                                      tramoHorario: tramo
                                    });
                                  }
                                }}
                              />
                              <label className="form-check-label" htmlFor={`tramo-radio-${tramo}`}>
                                {tramo}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Modo creación: permitir seleccionar múltiples tramos horarios
                    <div className="d-flex flex-wrap gap-3">
                      <div className="form-check w-100 mb-2 border-bottom pb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="todo-el-dia"
                          value="todo-el-dia"
                          checked={formData.tramosHorarios?.length === tramosHorariosOptions.length}
                          onChange={handleTramoHorarioChange}
                        />
                        <label className="form-check-label" htmlFor="todo-el-dia">
                          <strong>Todo el día</strong>
                        </label>
                      </div>
                      {tramosHorariosOptions.map((tramo) => (
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
                  )}
                  <small className="form-text text-muted">
                    {editingId 
                      ? "Seleccione el tramo horario de la ausencia" 
                      : "Seleccione los tramos horarios en los que estará ausente"}
                  </small>
                </div>
              </div>
              
              <div className="col-12">
                <div className="form-group">
                  <label htmlFor="observaciones" className="form-label fw-bold">Observaciones</label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    className="form-control"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Información adicional sobre la ausencia"
                  />
                  <small className="form-text text-muted">Detalles importantes sobre esta ausencia</small>
                </div>
              </div>
              
              {editingId && hasAssociatedGuardia && (
                <div className="col-12">
                  <div className="alert alert-warning d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                    <div>
                      <p className="mb-0">
                        Esta ausencia tiene una guardia asociada. Si desea desasociarla, marque la casilla a continuación.
                      </p>
                    </div>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="desasociarGuardia"
                      checked={desasociarGuardia}
                      onChange={(e) => setDesasociarGuardia(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="desasociarGuardia">
                      Desasociar guardia de esta ausencia
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
              <button type="button" className="btn btn-outline-secondary me-3" onClick={() => {
                resetForm()
                setEditingId(null)
                setShowForm(false)
              }}>
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check-circle me-2"></i>
                {editingId ? "Actualizar" : "Crear"} Ausencia
              </button>
            </div>
          </form>
        </DataCard>
      )}

      {showAcceptForm && (
        <DataCard
          title="Procesar Ausencia"
          icon="check-circle"
          className="mb-4"
        >
          <form onSubmit={handleAcceptFormSubmit}>
            <div className="card-body info-block rounded p-4 mb-4">
              <div className="d-flex align-items-start">
                <i className="bi bi-info-circle-fill text-info fs-4 me-3 mt-1"></i>
                <div>
                  <h5 className="mb-2">Información importante</h5>
                  <p className="mb-0">
                    Al procesar una ausencia, su estado cambiará automáticamente a <strong>Aceptada</strong> y se generará 
                    una guardia asociada con la configuración especificada a continuación.
                    <br/>
                    Si desea rechazar una ausencia, use el botón de "Anular" en la lista de ausencias.
                  </p>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="tipoGuardia" className="form-label fw-bold">Tipo de Guardia</label>
                  <select
                    id="tipoGuardia"
                    name="tipoGuardia"
                    className="form-select"
                    value={acceptFormData.tipoGuardia}
                    onChange={handleAcceptFormChange}
                  >
                    {DB_CONFIG.TIPOS_GUARDIA.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                  <small className="form-text text-muted">Seleccione el tipo de guardia que se generará</small>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="lugarId" className="form-label fw-bold">Lugar</label>
                  <select
                    id="lugarId"
                    name="lugarId"
                    className="form-select"
                    value={acceptFormData.lugarId}
                    onChange={handleAcceptFormChange}
                  >
                    <option value="">Selecciona un lugar</option>
                    {lugares.map(lugar => (
                      <option key={lugar.id} value={lugar.id}>
                        {lugar.codigo} - {lugar.descripcion}
                      </option>
                    ))}
                  </select>
                  <small className="form-text text-muted">Ubicación donde se realizará la guardia</small>
                </div>
              </div>
              
              <div className="col-12">
                <div className="form-group">
                  <label htmlFor="observaciones" className="form-label fw-bold">Observaciones</label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    className="form-control"
                    value={acceptFormData.observaciones}
                    onChange={handleAcceptFormChange}
                    rows={3}
                    placeholder="Indicaciones o información adicional para esta guardia"
                  />
                  <small className="form-text text-muted">Información adicional importante para el profesor que cubrirá la guardia</small>
                </div>
              </div>
            </div>
            
            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
              <button 
                type="button" 
                className="btn btn-outline-secondary me-3" 
                onClick={() => {
                  resetAcceptForm()
                  setProcessingAusenciaId(null)
                  setShowAcceptForm(false)
                }}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check-circle me-2"></i>
                Procesar Ausencia
              </button>
            </div>
          </form>
        </DataCard>
      )}
      
      <DataCard
        title="Listado de Ausencias"
        icon="calendar-x"
        className="mb-4"
      >
        {currentAusencias.length === 0 ? (
          <div className="alert alert-info info-alert d-flex align-items-center">
            <i className="bi bi-info-circle-fill text-info fs-4 me-3"></i>
            <div>No hay ausencias que coincidan con los filtros seleccionados.</div>
          </div>
        ) : (
          <>
            <div className="table-responsive" style={{ overflow: 'auto', maxWidth: '100%' }}>
              <table className="table table-striped table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th 
                      scope="col" 
                      onClick={() => handleSort('id')} 
                      className="cursor-pointer user-select-none sortable-header"
                      title="Ordenar por ID"
                      style={{ minWidth: '60px' }}
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
                    <th scope="col" style={{ minWidth: '120px' }}>Profesor</th>
                    <th 
                      scope="col" 
                      onClick={() => handleSort('fecha')} 
                      className="cursor-pointer user-select-none sortable-header"
                      title="Ordenar por fecha"
                      style={{ minWidth: '100px' }}
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
                      style={{ minWidth: '100px' }}
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
                    <th scope="col">Estado</th>
                    <th scope="col">Observaciones</th>
                    <th scope="col" className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAusencias.map(ausencia => (
                    <tr key={ausencia.id}>
                      <td>{ausencia.id}</td>
                      <td className="fw-medium">{getProfesorName(ausencia.profesorId)}</td>
                      <td>{new Date(ausencia.fecha).toLocaleDateString()}</td>
                      <td>{ausencia.tramoHorario}</td>
                      <td>
                        <span
                          className={`badge ${
                            ausencia.estado === DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE
                              ? "bg-warning text-dark"
                              : ausencia.estado === DB_CONFIG.ESTADOS_AUSENCIA.ACEPTADA
                              ? "bg-success"
                              : "bg-danger"
                          } rounded-pill px-3 py-2`}
                        >
                          {ausencia.estado}
                        </span>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: "250px" }} title={ausencia.observaciones || "Sin observaciones"}>
                        {ausencia.observaciones || <span className="text-muted fst-italic">Sin observaciones</span>}
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(ausencia)}
                            title="Editar ausencia"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          {ausencia.estado === DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleProcess(ausencia)}
                              title="Procesar ausencia"
                            >
                              <i className="bi bi-check-circle"></i>
                            </button>
                          )}
                          {ausencia.estado === DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleAnular(ausencia.id)}
                              title="Anular ausencia"
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleViewAusencia(ausencia)}
                            title="Ver detalles"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(ausencia.id)}
                            title="Eliminar ausencia"
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
                Mostrando <span className="fw-bold">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedAusencias.length)}</span> de <span className="fw-bold">{sortedAusencias.length}</span> ausencias
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

      {/* Modal para mostrar detalles de la ausencia */}
      {showModal && selectedAusencia && (
        <div className="modal fade show" 
             tabIndex={-1} 
             role="dialog"
             style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-info-circle me-2"></i>
                  Detalles de la Ausencia
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
                      ID de la Ausencia
                    </h6>
                    <p className="mb-0">{selectedAusencia.id}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-flag-fill me-1"></i>
                      Estado
                    </h6>
                    <p className="mb-0">
                      <span className={`badge ${getBadgeColor(selectedAusencia.estado)}`}>
                        {selectedAusencia.estado}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-person-fill me-1"></i>
                      Profesor
                    </h6>
                    <p className="mb-0">
                      {(() => {
                        const profesor = getUsuarioById(selectedAusencia.profesorId)
                        return profesor ? profesor.nombre : `ID: ${selectedAusencia.profesorId}`
                      })()}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-calendar-event me-1"></i>
                      Fecha
                    </h6>
                    <p className="mb-0">{new Date(selectedAusencia.fecha).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-clock me-1"></i>
                      Tramo Horario
                    </h6>
                    <p className="mb-0">{selectedAusencia.tramoHorario}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">
                      <i className="bi bi-card-text me-1"></i>
                      Observaciones
                    </h6>
                    {selectedAusencia.observaciones ? (
                      <p className="mb-0">{selectedAusencia.observaciones}</p>
                    ) : (
                      <p className="text-muted mb-0">Sin observaciones</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-3">
                  <h6 className="fw-bold border-bottom pb-2 mb-3">
                    <i className="bi bi-shield-fill me-1"></i>
                    Información de Guardia Asociada
                  </h6>
                  {(() => {
                    const guardia = getGuardiaByAusenciaId(selectedAusencia.id)
                    return guardia ? (
                      <div className="card border">
                        <div className="card-body">
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <h6 className="card-subtitle mb-1 text-muted">
                                <i className="bi bi-hash me-1"></i>
                                ID de Guardia
                              </h6>
                              <p className="card-text">{guardia.id}</p>
                            </div>
                            <div className="col-md-6">
                              <h6 className="card-subtitle mb-1 text-muted">
                                <i className="bi bi-flag-fill me-1"></i>
                                Estado
                              </h6>
                              <p className="card-text">
                                <span className={`badge ${
                                  guardia.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE ? "bg-warning text-dark" : 
                                  guardia.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA ? "bg-info" : 
                                  guardia.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA ? "bg-success" : "bg-secondary"
                                }`}>{guardia.estado}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <h6 className="card-subtitle mb-1 text-muted">
                                <i className="bi bi-tag-fill me-1"></i>
                                Tipo de Guardia
                              </h6>
                              <p className="card-text">{guardia.tipoGuardia}</p>
                            </div>
                            <div className="col-md-6">
                              <h6 className="card-subtitle mb-1 text-muted">
                                <i className="bi bi-geo-alt-fill me-1"></i>
                                Lugar
                              </h6>
                              {(() => {
                                const lugar = getLugarById(guardia.lugarId)
                                return lugar ? (
                                  <p className="card-text">
                                    <strong>{lugar.codigo}</strong> - {lugar.descripcion}
                                    <br />
                                    <span className="text-muted small">
                                      <i className="bi bi-building me-1"></i>
                                      {lugar.tipoLugar}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="card-text">ID: {guardia.lugarId}</p>
                                )
                              })()}
                            </div>
                          </div>
                          
                          {guardia.profesorCubridorId && (
                            <div className="mb-3">
                              <h6 className="card-subtitle mb-1 text-muted">
                                <i className="bi bi-person-fill me-1"></i>
                                Profesor Cubridor
                              </h6>
                              {(() => {
                                const profesor = getUsuarioById(guardia.profesorCubridorId)
                                return profesor ? (
                                  <p className="card-text">
                                    <i className="bi bi-person-badge me-1"></i>
                                    {profesor.nombre}
                                    <span className="text-muted small ms-2">(ID: {profesor.id})</span>
                                  </p>
                                ) : (
                                  <p className="card-text">ID: {guardia.profesorCubridorId}</p>
                                )
                              })()}
                            </div>
                          )}
                          
                          {guardia.observaciones && (
                            <div>
                              <h6 className="card-subtitle mb-1 text-muted">
                                <i className="bi bi-chat-left-text me-1"></i>
                                Observaciones de la Guardia
                              </h6>
                              <p className="card-text">{guardia.observaciones}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-info info-alert">
                        <i className="bi bi-info-circle-fill text-info me-2"></i>
                        No hay guardia asociada a esta ausencia
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