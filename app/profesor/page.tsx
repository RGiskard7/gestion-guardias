"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useHorarios } from "@/src/contexts/HorariosContext"
import { useAusencias } from "@/src/contexts/AusenciasContext"
import { useAuth } from "@/src/contexts/AuthContext"
import { Horario } from "@/src/types"
import StatusCard from "@/components/common/StatusCard"
import ActionCard from "@/components/common/ActionCard"
import DataCard from "@/components/common/DataCard"
import { DB_CONFIG, getDuracionTramo } from "@/lib/db-config"

export default function ProfesorDashboardPage() {
  const { user } = useAuth()
  const { guardias } = useGuardias()
  const { horarios } = useHorarios()
  const { ausencias } = useAusencias()
  
  // Estados para la ordenación
  const [sortField, setSortField] = useState<'diaSemana' | 'tramoHorario'>('diaSemana')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  // Estado para filtrado por día
  const [filterDia, setFilterDia] = useState<string>("")

  if (!user) return null

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]
  
  // Función para obtener el lunes de la semana actual
  const getStartOfWeek = () => {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = domingo, 1 = lunes, ...
    // Ajustar para que semana comience el lunes (Si es domingo, restar 6 días, sino restar dayOfWeek - 1)
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = new Date(now)
    monday.setDate(now.getDate() - diff)
    monday.setHours(0, 0, 0, 0)
    return monday
  }
  
  // Función para obtener el viernes de la semana actual
  const getEndOfWeek = () => {
    const monday = getStartOfWeek()
    const friday = new Date(monday)
    friday.setDate(monday.getDate() + 4) // 4 días después del lunes es viernes
    friday.setHours(23, 59, 59, 999)
    return friday
  }
  
  // Obtener las fechas de inicio y fin de la semana actual
  const startOfWeek = getStartOfWeek()
  const endOfWeek = getEndOfWeek()

  // Get ausencias where the profesor is ausente
  const misAusencias = ausencias.filter((a) => a.profesorId === user.id)
  const ausenciasHoy = misAusencias.filter((a) => a.fecha === today)

  // Get guardias where the profesor is cubridor
  const misGuardias = guardias.filter((g) => g.profesorCubridorId === user.id)
  const guardiasPendientesFirma = misGuardias.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA)
  
  // Obtener guardias firmadas de la semana actual
  const misGuardiasFirmadasSemana = misGuardias.filter((g) => {
    const fechaGuardia = new Date(g.fecha)
    return g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA && 
           fechaGuardia >= startOfWeek && 
           fechaGuardia <= endOfWeek
  })
  
  // Calcular total de horas de guardia en la semana
  const totalHorasSemanales = misGuardiasFirmadasSemana.reduce((total, guardia) => {
    const duracionTramo = getDuracionTramo(guardia.tramoHorario)
    return total + duracionTramo
  }, 0)

  // Get guardias pendientes that the profesor could cover
  const guardiasPendientes = guardias.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE)

  // Get horarios of the profesor
  const misHorarios = horarios.filter((h) => h.profesorId === user.id)
  
  // Filtrar horarios por día (si se ha seleccionado un filtro)
  const misHorariosFiltrados = filterDia
    ? misHorarios.filter(h => h.diaSemana.toLowerCase() === filterDia.toLowerCase())
    : misHorarios
  
  // Ordenar horarios según los criterios seleccionados
  const misHorariosOrdenados = [...misHorariosFiltrados].sort((a, b) => {
    if (sortField === 'diaSemana') {
      // Ordenar por día de la semana
      // Crear un mapa de índices para ordenar correctamente los días
      const diaIndices: { [key: string]: number } = {};
      DB_CONFIG.DIAS_SEMANA.forEach((dia, index) => {
        diaIndices[dia] = index;
      });
      
      const indexA = diaIndices[a.diaSemana] || 0;
      const indexB = diaIndices[b.diaSemana] || 0;
      
      return sortDirection === 'asc' ? indexA - indexB : indexB - indexA;
    } else {
      // Ordenar por tramo horario
      // Extraer números del tramo para ordenar numéricamente
      const getTramoNumber = (tramo: string) => {
        const match = tramo.match(/(\d+)/);
        return match ? Number.parseInt(match[1]) : 0;
      };
      
      const tramoA = getTramoNumber(a.tramoHorario);
      const tramoB = getTramoNumber(b.tramoHorario);
      
      return sortDirection === 'asc' ? tramoA - tramoB : tramoB - tramoA;
    }
  });
  
  // Función para cambiar el campo de ordenación
  const handleSort = (field: 'diaSemana' | 'tramoHorario') => {
    if (sortField === field) {
      // Si ya estamos ordenando por este campo, cambiar dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Si cambiamos de campo, establecer el nuevo campo y dirección por defecto
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter guardias for today
  const guardiasHoy = guardias.filter((g) => g.fecha === today)
  const pendientes = guardiasHoy.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE).length
  const asignadas = guardiasHoy.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA).length
  const firmadas = guardiasHoy.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA).length

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4">
        <i className="bi bi-speedometer2 me-3" style={{ fontSize: '2rem', color: '#007bff' }}></i>
        <h1 className="mb-0">Panel de Profesor</h1>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <StatusCard 
            title="Guardias Pendientes" 
            value={pendientes} 
            icon="hourglass-split" 
            color="warning"
            subtitle="Hoy"
          />
        </div>
        <div className="col-md-3">
          <StatusCard 
            title="Guardias Asignadas" 
            value={asignadas} 
            icon="clipboard-check" 
            color="info"
            subtitle="Hoy"
          />
        </div>
        <div className="col-md-3">
          <StatusCard 
            title="Guardias Firmadas" 
            value={firmadas} 
            icon="check-circle" 
            color="success"
            subtitle="Hoy"
          />
        </div>
        <div className="col-md-3">
          <StatusCard 
            title="Horas de Guardia" 
            value={totalHorasSemanales.toString()}
            icon="clock-history" 
            color="primary"
            subtitle={`Semana (${startOfWeek.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit'})} - ${endOfWeek.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit'})})`}
          />
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Mis Ausencias"
            description="Gestiona tus ausencias y permisos."
            icon="calendar-x"
            linkHref={DB_CONFIG.RUTAS.PROFESOR_AUSENCIAS}
            linkText="Gestionar Ausencias"
            color="warning"
          />
        </div>

        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Mis Guardias"
            description="Revisa y gestiona todas tus guardias."
            icon="clipboard-check"
            linkHref={DB_CONFIG.RUTAS.PROFESOR_MIS_GUARDIAS}
            linkText="Ver Guardias"
            color="info"
          />
        </div>

        <div className="col-lg-4 col-md-6 mb-4">
          <ActionCard
            title="Sala de Guardias"
            description="Visualiza el estado actual de las guardias."
            icon="display"
            linkHref={DB_CONFIG.RUTAS.SALA_GUARDIAS}
            linkText="Ver Sala"
            color="primary"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <DataCard
            title="Mi Horario de Guardias"
            icon="calendar-week"
          >
            {misHorarios.length === 0 ? (
              <div className="alert alert-info d-flex align-items-center">
                <i className="bi bi-info-circle me-2"></i>
                {DB_CONFIG.ETIQUETAS.MENSAJES.SIN_HORARIOS}
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <div className="row g-2 align-items-center">
                    <div className="col">
                      <label htmlFor="filterDia" className="form-label fw-bold">Filtrar por día:</label>
                      <select 
                        id="filterDia" 
                        className="form-select" 
                        value={filterDia}
                        onChange={(e) => setFilterDia(e.target.value)}
                      >
                        <option value="">Todos los días</option>
                        {DB_CONFIG.DIAS_SEMANA.map((dia, index) => (
                          <option key={index} value={dia}>{dia}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-auto d-flex align-items-end">
                      {filterDia && (
                        <button 
                          className="btn btn-outline-secondary mb-0"
                          onClick={() => setFilterDia("")}
                          title="Limpiar filtro"
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th 
                          onClick={() => handleSort('diaSemana')}
                          className="cursor-pointer user-select-none"
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center">
                            <i className="bi bi-calendar-day me-2"></i>Día
                            {sortField === 'diaSemana' && (
                              <i className={`bi bi-sort-${sortDirection === 'asc' ? 'up' : 'down'}-alt ms-1`}></i>
                            )}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('tramoHorario')}
                          className="cursor-pointer user-select-none"
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center">
                            <i className="bi bi-clock me-2"></i>Tramo Horario
                            {sortField === 'tramoHorario' && (
                              <i className={`bi bi-sort-${sortDirection === 'asc' ? 'up' : 'down'}-alt ms-1`}></i>
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {misHorariosOrdenados.map((horario) => (
                        <tr key={horario.id}>
                          <td>{horario.diaSemana}</td>
                          <td>{horario.tramoHorario}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <div className="mt-3 text-end">
              <Link href={DB_CONFIG.RUTAS.PROFESOR_HORARIO} className="btn btn-sm btn-outline-primary">
                <i className="bi bi-calendar-week me-1"></i>
                Ver horario semanal
              </Link>
            </div>
          </DataCard>
        </div>

        <div className="col-md-6 mb-4">
          <DataCard
            title="Guardias Pendientes de Firma"
            icon="pen"
          >
            {guardiasPendientesFirma.length === 0 ? (
              <div className="alert alert-info d-flex align-items-center">
                <i className="bi bi-info-circle me-2"></i>
                {DB_CONFIG.ETIQUETAS.MENSAJES.SIN_GUARDIAS_FIRMA}
              </div>
            ) : (
              <div className="list-group">
                {guardiasPendientesFirma.slice(0, DB_CONFIG.LIMITES.LISTA_PREVIEW).map((guardia) => (
                  <Link
                    key={guardia.id}
                    href={`${DB_CONFIG.RUTAS.PROFESOR_MIS_GUARDIAS}?tab=por-firmar`}
                    className="list-group-item list-group-item-action"
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">
                        <i className="bi bi-calendar-date me-2"></i>
                        {new Date(guardia.fecha).toLocaleDateString("es-ES")} - {guardia.tramoHorario}
                      </h5>
                      <small><span className="badge bg-info">{guardia.tipoGuardia}</span></small>
                    </div>
                    <p className="mb-1"><i className="bi bi-exclamation-circle me-2"></i>{DB_CONFIG.ETIQUETAS.GUARDIAS.PENDIENTE_FIRMA}</p>
                  </Link>
                ))}
                {guardiasPendientesFirma.length > DB_CONFIG.LIMITES.LISTA_PREVIEW && (
                  <Link href={`${DB_CONFIG.RUTAS.PROFESOR_MIS_GUARDIAS}?tab=por-firmar`} className="list-group-item list-group-item-action text-center">
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    Ver todas ({guardiasPendientesFirma.length})
                  </Link>
                )}
              </div>
            )}
          </DataCard>
        </div>
      </div>
    </div>
  )
} 