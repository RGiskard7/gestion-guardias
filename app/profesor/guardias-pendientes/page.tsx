"use client"

import { useState } from "react"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { useHorarios } from "@/src/contexts/HorariosContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { useAuth } from "@/src/contexts/AuthContext"
import { Guardia, Usuario } from "@/src/types"
import { Pagination } from "@/components/ui/pagination"
import GuardiaCard from "@/app/guardia/guardia-card"
import { DB_CONFIG } from "@/lib/db-config"

export default function GuardiasPendientesPage() {
  const { user } = useAuth()
  const { guardias, asignarGuardia, getProfesorAusenteIdByGuardia, canProfesorAsignarGuardia } = useGuardias()
  const { horarios } = useHorarios()
  const { usuarios } = useUsuarios()
  const { lugares } = useLugares()
  
  // Estado para mensajes al usuario
  const [mensaje, setMensaje] = useState<{texto: string, tipo: 'success' | 'warning' | 'danger' | 'info'} | null>(null)
  
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = DB_CONFIG.PAGINACION.ELEMENTOS_POR_PAGINA.GUARDIAS
  
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

  // Si no es un día laborable (fin de semana), no mostrar guardias
  if (!diaSemanaLaborable || !nombreDiaSemanaActual) {
    return (
      <div className="container-fluid">
        <h1 className="h3 mb-4">Guardias Pendientes</h1>
        <div className="alert alert-info">
          Hoy es fin de semana. No hay guardias programadas para hoy.
        </div>
      </div>
    )
  }

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

  const totalPages = Math.ceil(guardiasPendientes.length / itemsPerPage)
  
  // Obtener los elementos de la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return guardiasPendientes.slice(startIndex, endIndex)
  }
  
  // Cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
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

  // Handle asignar guardia
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

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Guardias Pendientes</h1>

      <div className="alert alert-info">
        Mostrando guardias pendientes para hoy: <strong>{new Date(today).toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</strong>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo}`}>
          <i className={`bi bi-${mensaje.tipo === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
          {mensaje.texto}
        </div>
      )}

      <div className="alert alert-warning">
        <i className="bi bi-info-circle me-2"></i>
        Nota: Las guardias generadas por tus propias ausencias no se muestran, ya que no puedes cubrirlas.
      </div>

      {guardiasPendientes.length === 0 ? (
        <div className="alert alert-warning">
          No hay guardias pendientes disponibles para hoy o no tienes horario disponible.
        </div>
      ) : (
        <div className="row">
          {getCurrentPageItems().map((guardia: Guardia) => (
            <div key={guardia.id} className="col-md-6 col-lg-4 mb-3">
              <GuardiaCard
                guardia={guardia}
                showActions={true}
                onAsignar={() => handleAsignarGuardia(guardia.id)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="card mt-4">
        <div className="card-header">Mi Horario de Hoy</div>
        <div className="card-body">
          {horariosHoy.length === 0 ? (
            <div className="alert alert-info">No tienes horario de guardias asignado para hoy.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Día</th>
                    <th>Tramo Horario</th>
                  </tr>
                </thead>
                <tbody>
                  {horariosHoy.map((horario, index) => (
                    <tr key={index}>
                      <td>{horario.diaSemana}</td>
                      <td>{horario.tramoHorario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Componente de paginación */}
      {guardiasPendientes.length > 0 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      )}
    </div>
  )
} 