"use client"

import { useState, useEffect } from "react"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { useHorarios } from "@/src/contexts/HorariosContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { useAuth } from "@/src/contexts/AuthContext"
import { useAusencias } from "@/src/contexts/AusenciasContext"
import { Guardia, Usuario } from "@/src/types"
import { Pagination } from "@/components/ui/pagination"
import GuardiaCard from "@/app/guardia/guardia-card"
import { DB_CONFIG } from "@/lib/db-config"
import { useSearchParams } from "next/navigation"

export default function MisGuardiasPage() {
  const { user } = useAuth()
  const { guardias, asignarGuardia, firmarGuardia, getProfesorAusenteIdByGuardia, canProfesorAsignarGuardia, addTareaGuardia } = useGuardias()
  const { horarios } = useHorarios()
  const { usuarios } = useUsuarios()
  const { lugares } = useLugares()
  const { ausencias, getAusenciasByProfesor } = useAusencias()
  const searchParams = useSearchParams()
  
  // Obtener la pestaña desde los parámetros de URL
  const tabParam = searchParams.get('tab')
  
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState<'pendientes' | 'generadas' | 'por-firmar'>(
    tabParam === 'generadas' ? 'generadas' : 
    tabParam === 'por-firmar' ? 'por-firmar' : 
    'pendientes'
  )
  
  // Estado para mensajes al usuario
  const [mensaje, setMensaje] = useState<{texto: string, tipo: 'success' | 'warning' | 'danger' | 'info'} | null>(null)
  
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = DB_CONFIG.PAGINACION.ELEMENTOS_POR_PAGINA.GUARDIAS
  
  // Estados para el modal de tarea
  const [showTareaModal, setShowTareaModal] = useState(false)
  const [selectedGuardia, setSelectedGuardia] = useState<Guardia | null>(null)
  const [nuevaTarea, setNuevaTarea] = useState("")
  
  // Estado para el modal de detalles
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [guardiaDetalles, setGuardiaDetalles] = useState<Guardia | null>(null)
  
  // Usar siempre la fecha actual
  const today = new Date().toISOString().split("T")[0]
  
  // Obtener el día de la semana actual (1-7, donde 1 es lunes y 7 es domingo)
  const hoy = new Date()
  const diaSemanaNumerico = hoy.getDay() || 7 // Si es domingo (0), convertirlo a 7
  // Ajustar a escala 1-5 para días laborables (lunes a viernes)
  const diaSemanaLaborable = diaSemanaNumerico <= 5 ? diaSemanaNumerico : null
  
  // Obtener el nombre del día de la semana actual a partir del número
  const nombreDiaSemanaActual = diaSemanaLaborable ? DB_CONFIG.DIAS_SEMANA[diaSemanaLaborable - 1] : null

  if (!user) return null

  // PESTAÑA 1: GUARDIAS PENDIENTES
  // Obtener horarios del profesor
  const misHorarios = horarios.filter((h) => h.profesorId === user.id)
  
  // Filtrar horarios para mostrar solo los del día actual comparando por el nombre del día
  const horariosHoy = misHorarios.filter((h) => h.diaSemana === nombreDiaSemanaActual)

  // Filtrar guardias pendientes para hoy
  const guardiasPendientes = guardias.filter((g: Guardia) => {
    // La guardia debe estar pendiente y ser de hoy
    const esPendiente = g.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE && g.fecha === today

    // Verificar si el profesor tiene horario de guardia en ese tramo
    const tieneHorarioGuardia = horariosHoy.some(h => h.tramoHorario === g.tramoHorario)

    // Verificar que el profesor no sea el mismo que generó la ausencia
    const profesorAusenteId = getProfesorAusenteIdByGuardia(g.id)
    const noEsProfesorAusente = profesorAusenteId !== user.id

    // Solo mostrar las guardias donde el profesor SÍ tiene horario de guardia
    // Y NO es el profesor que generó la ausencia
    return esPendiente && tieneHorarioGuardia && noEsProfesorAusente
  })
  
  // PESTAÑA 2: GUARDIAS GENERADAS A PARTIR DE MIS AUSENCIAS
  const misAusencias = getAusenciasByProfesor(user.id)
  const misAusenciasIds = misAusencias.map(a => a.id)
  
  // Filtrar guardias generadas a partir de mis ausencias
  const guardiasGeneradas = guardias.filter((g: Guardia) => {
    return g.ausenciaId !== undefined && misAusenciasIds.includes(g.ausenciaId)
  }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  
  // PESTAÑA 3: GUARDIAS POR FIRMAR
  // Filtrar guardias donde soy el profesor cubridor y están asignadas
  const guardiasPorFirmar = guardias
    .filter((g) => g.profesorCubridorId === user.id && g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  
  // Guardias ya firmadas (para completar la vista)
  const guardiasFirmadas = guardias
    .filter((g) => g.profesorCubridorId === user.id && g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  
  // OBTENER LOS DATOS SEGÚN LA PESTAÑA ACTIVA
  const getActiveTabData = () => {
    switch (activeTab) {
      case 'pendientes':
        return guardiasPendientes
      case 'generadas':
        return guardiasGeneradas
      case 'por-firmar':
        return [...guardiasPorFirmar, ...guardiasFirmadas]
      default:
        return []
    }
  }
  
  const tabData = getActiveTabData()
  const totalPages = Math.ceil(tabData.length / itemsPerPage)
  
  // Paginación - obtener elementos de la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return tabData.slice(startIndex, endIndex)
  }
  
  // Cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  // Cambiar de pestaña - reset página actual
  const handleTabChange = (tab: 'pendientes' | 'generadas' | 'por-firmar') => {
    setActiveTab(tab)
    setCurrentPage(1)
    setMensaje(null)
  }

  // FUNCIONES DE ACCIÓN
  // 1. Asignar guardia
  const handleAsignarGuardia = async (guardiaId: number) => {
    if (!user) return
    
    // Limpiar mensaje previo
    setMensaje(null)
    
    try {
      // Verificar si el profesor puede asignarse esta guardia
      const puedeAsignar = canProfesorAsignarGuardia(guardiaId, user.id)
      
      if (!puedeAsignar) {
        // Obtener la guardia para verificar detalles
        const guardia = guardias.find(g => g.id === guardiaId)
        if (!guardia) {
          setMensaje({
            texto: "No se pudo encontrar la guardia seleccionada.",
            tipo: "danger"
          })
          return
        }
        
        // Verificar si ya tiene una guardia asignada en el mismo tramo
        const guardiasMismoTramo = guardias.filter(g => 
          g.profesorCubridorId === user.id && 
          g.fecha === guardia.fecha && 
          g.tramoHorario === guardia.tramoHorario &&
          (g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA || g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA)
        )
        
        if (guardiasMismoTramo.length > 0) {
          setMensaje({
            texto: `Ya tienes una guardia asignada en el tramo horario ${guardia.tramoHorario}. No puedes asignarte más de una guardia en el mismo tramo horario.`,
            tipo: "warning"
          })
          return
        }
        
        // Si no es por tramo duplicado, probablemente sea por el límite semanal
        setMensaje({
          texto: "No puedes asignarte más guardias esta semana. El límite es de 6 guardias por semana.",
          tipo: "warning"
        })
        return
      }
      
      // Verificar que la guardia sigue disponible
      const guardia = guardias.find(g => g.id === guardiaId)
      if (!guardia || guardia.estado !== DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE) {
        setMensaje({
          texto: "Esta guardia ya no está disponible.",
          tipo: "warning"
        })
        return
      }
      
      // Verificar que el profesor tiene horario para cubrir esta guardia
      const tieneHorario = horariosHoy.some(h => h.tramoHorario === guardia.tramoHorario)
      if (!tieneHorario) {
        setMensaje({
          texto: "No tienes horario de guardia asignado para este tramo horario.",
          tipo: "warning"
        })
        return
      }
      
      // Asignar la guardia
      const exito = await asignarGuardia(guardiaId, user.id)
      
      if (exito) {
        setMensaje({
          texto: "Guardia asignada correctamente. Ya puedes firmarla una vez la hayas realizado.",
          tipo: "success"
        })
      } else {
        setMensaje({
          texto: "No se pudo asignar la guardia. Inténtalo de nuevo más tarde.",
          tipo: "danger"
        })
      }
    } catch (error) {
      console.error("Error al asignar guardia:", error)
      setMensaje({
        texto: "Error al asignar la guardia. Contacta con el administrador.",
        tipo: "danger"
      })
    }
  }
  
  // 2. Firmar guardia
  const handleFirmarGuardia = (guardiaId: number) => {
    if (window.confirm("¿Estás seguro de que quieres firmar esta guardia?")) {
      try {
        firmarGuardia(guardiaId)
        setMensaje({
          texto: "Guardia firmada correctamente.",
          tipo: "success"
        })
      } catch (error) {
        console.error("Error al firmar guardia:", error)
        setMensaje({
          texto: "Error al firmar la guardia. Contacta con el administrador.",
          tipo: "danger"
        })
      }
    }
  }
  
  // 3. Añadir tarea
  const handleAddTarea = (guardia: Guardia) => {
    setSelectedGuardia(guardia)
    setNuevaTarea("")
    setShowTareaModal(true)
  }
  
  // Guardar nueva tarea
  const handleSaveTarea = async () => {
    if (!selectedGuardia || !nuevaTarea.trim()) return
    
    try {
      const tarea = {
        guardiaId: selectedGuardia.id,
        descripcionTarea: nuevaTarea.trim()
      }
      await addTareaGuardia(tarea)
      setShowTareaModal(false)
      setMensaje({
        texto: "Tarea añadida correctamente.",
        tipo: "success"
      })
    } catch (error) {
      console.error("Error al añadir tarea:", error)
      setMensaje({
        texto: "Error al añadir la tarea. Inténtalo de nuevo más tarde.",
        tipo: "danger"
      })
    }
  }
  
  // 4. Ver detalles de guardia
  const handleViewGuardia = (guardia: Guardia) => {
    setGuardiaDetalles(guardia)
    setShowDetailsModal(true)
  }
  
  // Cerrar modales
  const handleCloseModals = () => {
    setShowTareaModal(false)
    setShowDetailsModal(false)
    setSelectedGuardia(null)
    setGuardiaDetalles(null)
  }
  
  // Obtener nombre del profesor por ID
  const getProfesorName = (id: number) => {
    const profesor = usuarios.find((u: Usuario) => u.id === id)
    return profesor ? profesor.nombre : "Desconocido"
  }

  // Obtener nombre del lugar por ID
  const getLugarName = (id: number) => {
    const lugar = lugares.find((l) => l.id === id)
    return lugar ? lugar.descripcion : "Desconocido"
  }
  
  // Obtener mensaje contextual según pestaña activa
  const getTabMessage = () => {
    switch (activeTab) {
      case 'pendientes':
        return {
          title: "Guardias Pendientes",
          empty: "No hay guardias pendientes disponibles para hoy o no tienes horario disponible.",
          info: "Mostrando guardias pendientes para hoy que puedes cubrir."
        }
      case 'generadas':
        return {
          title: "Guardias Generadas por mis Ausencias",
          empty: "No se encontraron guardias generadas a partir de tus ausencias.",
          info: "Estas son las guardias que se han generado a partir de tus ausencias registradas."
        }
      case 'por-firmar':
        return {
          title: "Guardias por Firmar",
          empty: "No tienes guardias pendientes de firma.",
          info: "Estas son las guardias que te han sido asignadas y necesitas firmar una vez las hayas realizado."
        }
      default:
        return {
          title: "",
          empty: "",
          info: ""
        }
    }
  }

  const tabMessage = getTabMessage()

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Mis Guardias</h1>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'pendientes' ? 'active' : ''}`}
            onClick={() => handleTabChange('pendientes')}
          >
            <i className="bi bi-hourglass-split me-2"></i>
            Pendientes
            {guardiasPendientes.length > 0 && (
              <span className="badge bg-warning text-dark ms-2">{guardiasPendientes.length}</span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'generadas' ? 'active' : ''}`}
            onClick={() => handleTabChange('generadas')}
          >
            <i className="bi bi-calendar-event me-2"></i>
            Generadas
            {guardiasGeneradas.length > 0 && (
              <span className="badge bg-primary ms-2">{guardiasGeneradas.length}</span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'por-firmar' ? 'active' : ''}`}
            onClick={() => handleTabChange('por-firmar')}
          >
            <i className="bi bi-pen me-2"></i>
            Por firmar
            {guardiasPorFirmar.length > 0 && (
              <span className="badge bg-info ms-2">{guardiasPorFirmar.length}</span>
            )}
          </button>
        </li>
      </ul>

      {/* Mensajes */}
      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show`}>
          <i className={`bi bi-${mensaje.tipo === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
          {mensaje.texto}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMensaje(null)}
            aria-label="Cerrar"
          ></button>
        </div>
      )}

      {/* Información contextual */}
      <div className="alert alert-info mb-4">
        <i className="bi bi-info-circle me-2"></i>
        {tabMessage.info}
        {activeTab === 'pendientes' && (
          <div className="mt-2 small">
            <strong>Nota:</strong> Las guardias generadas por tus propias ausencias no se muestran, ya que no puedes cubrirlas.
          </div>
        )}
      </div>

      {/* Contenido de la pestaña */}
      {getActiveTabData().length === 0 ? (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {tabMessage.empty}
        </div>
      ) : (
        <>
          {/* Listado de guardias */}
          <div className="row">
            {getCurrentPageItems().map((guardia: Guardia) => (
              <div key={guardia.id} className="col-md-6 col-lg-4 mb-3">
                <GuardiaCard
                  guardia={guardia}
                  showActions={
                    (activeTab === 'pendientes' && guardia.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE) ||
                    (activeTab === 'por-firmar' && guardia.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA)
                  }
                  onAsignar={activeTab === 'pendientes' ? handleAsignarGuardia : undefined}
                  onFirmar={activeTab === 'por-firmar' ? handleFirmarGuardia : undefined}
                />
                {/* Botones adicionales para la pestaña Generadas */}
                {activeTab === 'generadas' && (
                  <div className="d-flex justify-content-end gap-2 mt-2">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleViewGuardia(guardia)}
                    >
                      <i className="bi bi-eye me-1"></i>
                      Ver detalles
                    </button>
                    <button 
                      className="btn btn-outline-success btn-sm"
                      onClick={() => handleAddTarea(guardia)}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      Añadir tarea
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
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

      {/* Modal para ver detalles */}
      {showDetailsModal && guardiaDetalles && (
        <div className="modal fade show" 
             style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-info-circle me-2"></i>
                  Detalles de la Guardia
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCloseModals}
                  aria-label="Cerrar"
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6 className="fw-bold">ID de la Guardia</h6>
                    <p>{guardiaDetalles.id}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">Estado</h6>
                    <p>
                      <span className={`badge ${
                        guardiaDetalles.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE ? "bg-warning text-dark" : 
                        guardiaDetalles.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA ? "bg-info" : 
                        guardiaDetalles.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA ? "bg-success" : "bg-secondary"
                      }`}>{guardiaDetalles.estado}</span>
                    </p>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6 className="fw-bold">Fecha</h6>
                    <p>{new Date(guardiaDetalles.fecha).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">Tramo Horario</h6>
                    <p>{guardiaDetalles.tramoHorario}</p>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6 className="fw-bold">Tipo de Guardia</h6>
                    <p>{guardiaDetalles.tipoGuardia}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">Lugar</h6>
                    <p>{getLugarName(guardiaDetalles.lugarId)} (ID: {guardiaDetalles.lugarId})</p>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6 className="fw-bold">Profesor Ausente</h6>
                    <p>{getProfesorName(getProfesorAusenteIdByGuardia(guardiaDetalles.id) || 0)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">Profesor Cubridor</h6>
                    <p>
                      {guardiaDetalles.profesorCubridorId 
                        ? getProfesorName(guardiaDetalles.profesorCubridorId) 
                        : "Pendiente de asignar"}
                    </p>
                  </div>
                </div>
                
                {guardiaDetalles.observaciones && (
                  <div className="mb-3">
                    <h6 className="fw-bold">Observaciones</h6>
                    <p>{guardiaDetalles.observaciones}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCloseModals}
                >
                  Cerrar
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={() => handleAddTarea(guardiaDetalles)}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Añadir Tarea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 