"use client"

import { useState, useEffect } from "react"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useAusencias } from "@/src/contexts/AusenciasContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { Guardia, Usuario, Lugar, Ausencia } from "@/src/types"
import DataCard from "@/components/common/DataCard"
import { DB_CONFIG, getDuracionTramo } from "@/lib/db-config"

export default function EstadisticasPage() {
  const { guardias } = useGuardias()
  const { ausencias } = useAusencias()
  const { lugares } = useLugares()
  const { usuarios } = useUsuarios()
  const [periodoInicio, setPeriodoInicio] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
  )
  const [periodoFin, setPeriodoFin] = useState<string>(new Date().toISOString().split("T")[0])
  const [activeTab, setActiveTab] = useState<"profesores" | "lugares">("profesores")
  const [ausenciasEnPeriodo, setAusenciasEnPeriodo] = useState<Ausencia[]>([])

  // Configurar periodo de tiempo
  const handlePeriodoInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPeriodoInicio(e.target.value)
  }
  
  const handlePeriodoFinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPeriodoFin(e.target.value)
  }

  // Filtrar guardias por periodo
  const guardiasEnPeriodo = guardias.filter((guardia: any) => {
    const guardiaDate = new Date(guardia.fecha)
    return guardiaDate >= new Date(periodoInicio) && guardiaDate <= new Date(periodoFin)
  })

  // Filtrar ausencias por periodo - actualizado cada vez que cambia el periodo o las ausencias
  useEffect(() => {
    console.log("Filtrando ausencias para periodo:", periodoInicio, "hasta", periodoFin);
    console.log("Total de ausencias antes de filtrar:", ausencias.length);
    
    const fechaInicioPeriodo = new Date(periodoInicio);
    const fechaFinPeriodo = new Date(periodoFin);
    fechaFinPeriodo.setHours(23, 59, 59, 999); // Incluir todo el día final
    
    const ausenciasFiltradas = ausencias.filter((ausencia) => {
      // Verificar que la ausencia tenga el campo fecha
      if (!ausencia.fecha) {
        console.log("Ausencia sin fecha:", ausencia);
        return false;
      }
      
      const fechaAusencia = new Date(ausencia.fecha);
      
      // Verificar si la fecha de la ausencia está dentro del periodo
      const dentroDePeriodo = fechaAusencia >= fechaInicioPeriodo && fechaAusencia <= fechaFinPeriodo;
      
      if (dentroDePeriodo) {
        console.log("Ausencia dentro del periodo:", ausencia);
      }
      
      return dentroDePeriodo;
    });
    
    console.log("Ausencias filtradas:", ausenciasFiltradas.length);
    setAusenciasEnPeriodo(ausenciasFiltradas);
  }, [ausencias, periodoInicio, periodoFin]);

  // Tramos horarios
  const tramosHorarios = DB_CONFIG.TRAMOS_HORARIOS

  // Obtener días únicos en el periodo
  const diasUnicos = [...new Set(guardiasEnPeriodo.map((g) => g.fecha))].sort()

  // Contadores por estado
  const pendientes = guardiasEnPeriodo.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE).length
  const asignadas = guardiasEnPeriodo.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA).length
  const firmadas = guardiasEnPeriodo.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA).length
  const anuladas = guardiasEnPeriodo.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.ANULADA).length
  const total = guardiasEnPeriodo.length

  // Contadores por estado de ausencias
  const ausenciasPendientes = ausenciasEnPeriodo.filter(a => a.estado === DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE).length
  const ausenciasAceptadas = ausenciasEnPeriodo.filter(a => a.estado === DB_CONFIG.ESTADOS_AUSENCIA.ACEPTADA).length
  const ausenciasRechazadas = ausenciasEnPeriodo.filter(a => a.estado === DB_CONFIG.ESTADOS_AUSENCIA.RECHAZADA).length
  const totalAusencias = ausenciasEnPeriodo.length

  // Contar guardias por tramo horario
  const guardiasPorTramo = tramosHorarios.map((tramo) => {
    return {
      tramo,
      total: guardiasEnPeriodo.filter((g) => g.tramoHorario === tramo).length,
      horas: guardiasEnPeriodo
        .filter((g) => g.tramoHorario === tramo)
        .reduce((acc, g) => acc + getDuracionTramo(g.tramoHorario), 0),
    }
  })

  // Guardias por día y tramo horario
  const guardiasPorDiayTramo = diasUnicos.map(fecha => {
    const guardiasDelDia = guardiasEnPeriodo.filter(g => g.fecha === fecha);
    
    const porTramo = tramosHorarios.map(tramo => {
      const guardiasTramo = guardiasDelDia.filter(g => g.tramoHorario === tramo);
      const asignadas = guardiasTramo.filter(g => 
        g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA || 
        g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA
      ).length;
      const noAsignadas = guardiasTramo.filter(g => 
        g.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE
      ).length;
      
      return {
        tramo,
        total: guardiasTramo.length,
        asignadas,
        noAsignadas,
        porcentajeAsignadas: guardiasTramo.length > 0 
          ? Math.round((asignadas / guardiasTramo.length) * 100) 
          : 0
      };
    });
    
    return {
      fecha,
      porTramo
    };
  });

  // Contar guardias por profesor
  const profesoresIds = [...new Set(guardiasEnPeriodo.map((g) => g.profesorCubridorId))]
  const guardiasPorProfesor = profesoresIds
    .filter((id) => id !== null) // Filtrar null
    .map((id) => {
      const profesor = usuarios.find((u) => u.id === id)
      const guardiasProfesor = guardiasEnPeriodo.filter((g) => g.profesorCubridorId === id)
      const guardiasProfesorFirmadas = guardiasProfesor.filter(
        (g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA
      )
      
      // Contar guardias por tramo para este profesor
      const porTramo = tramosHorarios.map((tramo) => {
        const guardiasEnTramo = guardiasProfesor.filter((g) => g.tramoHorario === tramo)
        return {
          tramo,
          total: guardiasEnTramo.length,
          horas: guardiasEnTramo.reduce((acc, g) => acc + getDuracionTramo(g.tramoHorario), 0),
        }
      })

      // Contar guardias por lugar
      const lugaresIds = [...new Set(guardiasProfesor.map((g) => g.lugarId))]
      const porLugar = lugaresIds.map((lugarId) => {
        const lugar = lugares.find((l) => l.id === lugarId)
        const guardiasEnLugar = guardiasProfesor.filter((g) => g.lugarId === lugarId)

        // Contar guardias por tramo para este lugar
        const porTramoLugar = tramosHorarios.map((tramo) => {
          const guardiasEnTramo = guardiasEnLugar.filter((g) => g.tramoHorario === tramo)
          return {
            tramo,
            total: guardiasEnTramo.length,
            horas: guardiasEnTramo.reduce((acc, g) => acc + getDuracionTramo(g.tramoHorario), 0),
          }
        })

        return {
          lugarId: lugarId,
          lugarCodigo: lugar ? lugar.codigo : "Sin asignar",
          lugarDescripcion: lugar ? lugar.descripcion : "Sin asignar",
          total: guardiasEnLugar.length,
          horas: guardiasEnLugar.reduce((acc, g) => acc + getDuracionTramo(g.tramoHorario), 0),
          porTramo: porTramoLugar,
        }
      })

      return {
        profesorId: id,
        profesorNombre: profesor ? `${profesor.nombre} ${profesor.apellido || ""}` : "Desconocido",
        total: guardiasProfesor.length,
        firmadas: guardiasProfesorFirmadas.length,
        horasTotales: guardiasProfesor.reduce((acc, g) => acc + getDuracionTramo(g.tramoHorario), 0),
        horasFirmadas: guardiasProfesorFirmadas.reduce(
          (acc, g) => acc + getDuracionTramo(g.tramoHorario),
          0
        ),
        porTramo,
        porLugar,
      }
    })
    .sort((a, b) => b.total - a.total)

  // Contar guardias por lugar
  const lugaresIdsGuardias = [...new Set(guardiasEnPeriodo.map((g) => g.lugarId))]
  const guardiasPorLugarData = lugaresIdsGuardias.map((id) => {
    const lugar = lugares.find((l) => l.id === id)
    const guardiasLugar = guardiasEnPeriodo.filter((g) => g.lugarId === id)
    return {
      lugarId: id,
      lugarCodigo: lugar ? lugar.codigo : "Sin asignar",
      lugarDescripcion: lugar ? lugar.descripcion : "Sin asignar",
      total: guardiasLugar.length,
    }
  }).sort((a, b) => b.total - a.total)

  // Contar guardias por tipo
  const tiposGuardia = [...new Set(guardiasEnPeriodo.map((g) => g.tipoGuardia))]
  const guardiasPorTipoData = tiposGuardia.map((tipo) => {
    const guardiasTipo = guardiasEnPeriodo.filter((g) => g.tipoGuardia === tipo)
    return {
      tipo,
      total: guardiasTipo.length,
    }
  }).sort((a, b) => b.total - a.total)

  // Ausencias por profesor
  const ausenciasPorProfesorData = usuarios
    .filter(u => u.rol === DB_CONFIG.ROLES.PROFESOR)
    .map(usuario => {
      const ausenciasProfesor = ausenciasEnPeriodo.filter(a => a.profesorId === usuario.id && a.estado === DB_CONFIG.ESTADOS_AUSENCIA.ACEPTADA)
      return {
        profesorId: usuario.id,
        profesorNombre: `${usuario.nombre} ${usuario.apellido || ''}`,
        total: ausenciasProfesor.length
      }
    })
    .filter(p => p.total > 0)
    .sort((a, b) => b.total - a.total)

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className="container-fluid">
      <h1 className="mb-4">Estadísticas</h1>
      
      {/* Selector de periodo */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">Periodo de análisis</div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-5 mb-3 mb-md-0">
                  <label htmlFor="periodoInicio" className="form-label">Fecha de inicio</label>
                  <input
                    type="date"
                    id="periodoInicio"
                    className="form-control"
                    value={periodoInicio}
                    onChange={handlePeriodoInicioChange}
                  />
                </div>
                <div className="col-md-5">
                  <label htmlFor="periodoFin" className="form-label">Fecha de fin</label>
                  <input
                    type="date"
                    id="periodoFin"
                    className="form-control"
                    value={periodoFin}
                    onChange={handlePeriodoFinChange}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <div className="w-100 text-center pt-2">
                    <div className="badge bg-primary text-white p-2">
                      {guardiasEnPeriodo.length} guardias en periodo
                    </div>
                    <div className="badge bg-info text-white p-2 mt-2">
                      {ausenciasEnPeriodo.length} ausencias en periodo
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resumen de guardias y ausencias */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Resumen de Guardias</div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Pendientes
                  <span className="badge text-bg-warning rounded-pill">{pendientes}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Asignadas
                  <span className="badge text-bg-primary rounded-pill">{asignadas}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Firmadas
                  <span className="badge text-bg-success rounded-pill">{firmadas}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Anuladas
                  <span className="badge text-bg-danger rounded-pill">{anuladas}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                  Total
                  <span className="badge text-bg-dark rounded-pill">{total}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Resumen de Ausencias</div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Pendientes
                  <span className="badge text-bg-warning rounded-pill">{ausenciasPendientes}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Aceptadas
                  <span className="badge text-bg-success rounded-pill">{ausenciasAceptadas}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Rechazadas
                  <span className="badge text-bg-danger rounded-pill">{ausenciasRechazadas}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                  Total
                  <span className="badge text-bg-dark rounded-pill">{totalAusencias}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resumen de guardias por tipo */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">Guardias por tipo</div>
            <div className="card-body">
              <div className="table-responsive" style={{ overflow: 'auto', maxWidth: '100%' }}>
                <table className="table table-striped">
                  <thead className="table-light">
                    <tr>
                      <th>Tipo</th>
                      <th>Guardias</th>
                      <th>Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guardiasPorTipoData.map((item) => (
                      <tr key={item.tipo}>
                        <td>{item.tipo}</td>
                        <td>{item.total}</td>
                        <td>{item.total > 0 ? `${Math.round(((item.total / total) * 100))}%` : "0%"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guardias por día y tramo horario */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">Guardias por día y tramo horario</div>
            <div className="card-body">
              <div className="table-responsive" style={{ overflow: 'auto', maxWidth: '100%' }}>
                <table className="table table-striped table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Día</th>
                      {tramosHorarios.map(tramo => (
                        <th key={tramo} className="text-center">{tramo}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {guardiasPorDiayTramo.map(dia => (
                      <tr key={dia.fecha}>
                        <td>{formatDate(dia.fecha)}</td>
                        {dia.porTramo.map(tramo => (
                          <td key={tramo.tramo} className="text-center">
                            {tramo.total > 0 ? (
                              <div>
                                <div>Total: {tramo.total}</div>
                                <div className="small text-success">Asignadas: {tramo.asignadas}</div>
                                <div className="small text-danger">Pendientes: {tramo.noAsignadas}</div>
                                <div className="progress mt-1" style={{ height: "4px" }}>
                                  <div 
                                    className="progress-bar" 
                                    role="progressbar" 
                                    style={{ width: `${tramo.porcentajeAsignadas}%` }}
                                  ></div>
                                </div>
                              </div>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tiempo de guardia por profesor en cada tramo */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">Guardias por profesor</div>
            <div className="card-body">
              <div className="table-responsive" style={{ overflow: 'auto', maxWidth: '100%' }}>
                <table className="table table-striped">
                  <thead className="table-light">
                    <tr>
                      <th>Profesor</th>
                      <th>Total Guardias</th>
                      <th>Firmadas</th>
                      <th>Horas Totales</th>
                      <th>Horas Firmadas</th>
                      {tramosHorarios.map((tramo) => (
                        <th key={tramo}>{tramo}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {guardiasPorProfesor.map((item) => (
                      <tr key={item.profesorId}>
                        <td>{item.profesorNombre}</td>
                        <td>{item.total}</td>
                        <td>{item.firmadas}</td>
                        <td>{item.horasTotales.toFixed(1)}</td>
                        <td>{item.horasFirmadas.toFixed(1)}</td>
                        {item.porTramo.map((tramoData) => (
                          <td key={tramoData.tramo}>
                            {tramoData.total > 0 ? (
                              <span title={`${tramoData.horas.toFixed(1)} horas`}>
                                {tramoData.total} ({tramoData.horas.toFixed(1)}h)
                              </span>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tiempo de guardia por profesor en cada lugar */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">Detalle de guardias por profesor y lugar</div>
            <div className="card-body">
              <div className="accordion" id="accordionProfesores">
                {guardiasPorProfesor.map((profesor, index) => (
                  <div className="accordion-item" key={profesor.profesorId}>
                    <h2 className="accordion-header" id={`heading${profesor.profesorId}`}>
                      <button 
                        className="accordion-button collapsed" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target={`#collapse${profesor.profesorId}`} 
                        aria-expanded="false" 
                        aria-controls={`collapse${profesor.profesorId}`}
                      >
                        {profesor.profesorNombre} - {profesor.total} guardias ({profesor.horasTotales.toFixed(1)} horas)
                      </button>
                    </h2>
                    <div 
                      id={`collapse${profesor.profesorId}`} 
                      className="accordion-collapse collapse" 
                      aria-labelledby={`heading${profesor.profesorId}`} 
                      data-bs-parent="#accordionProfesores"
                    >
                      <div className="accordion-body">
                        <h5>Guardias por lugar</h5>
                        <div className="table-responsive">
                          <table className="table table-sm table-bordered">
                            <thead className="table-light">
                              <tr>
                                <th>Lugar</th>
                                <th>Total</th>
                                <th>Horas</th>
                                {tramosHorarios.map(tramo => (
                                  <th key={tramo}>{tramo}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {profesor.porLugar.map(lugar => (
                                <tr key={lugar.lugarId}>
                                  <td>{lugar.lugarCodigo} - {lugar.lugarDescripcion}</td>
                                  <td>{lugar.total}</td>
                                  <td>{lugar.horas.toFixed(1)}</td>
                                  {lugar.porTramo.map(tramoData => (
                                    <td key={tramoData.tramo}>
                                      {tramoData.total > 0 ? (
                                        <span>
                                          {tramoData.total} ({tramoData.horas.toFixed(1)}h)
                                        </span>
                                      ) : (
                                        <span>-</span>
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">Lugares más utilizados para guardias</div>
            <div className="card-body">
              <div className="table-responsive" style={{ overflow: 'auto', maxWidth: '100%' }}>
                <table className="table table-striped">
                  <thead className="table-light">
                    <tr>
                      <th>Lugar</th>
                      <th>Guardias</th>
                      <th>Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guardiasPorLugarData.filter(item => item.total > 0).map((item) => (
                      <tr key={item.lugarId}>
                        <td>{item.lugarCodigo} - {item.lugarDescripcion}</td>
                        <td>{item.total}</td>
                        <td>{item.total > 0 ? `${Math.round(((item.total / total) * 100))}%` : "0%"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">Ausencias aceptadas por profesor en el periodo</div>
            <div className="card-body">
              <div className="table-responsive" style={{ overflow: 'auto', maxWidth: '100%' }}>
                <table className="table table-striped">
                  <thead className="table-light">
                    <tr>
                      <th>Profesor</th>
                      <th>Ausencias aceptadas</th>
                      <th>Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ausenciasPorProfesorData.map((profesor) => (
                      <tr key={profesor.profesorId}>
                        <td>{profesor.profesorNombre}</td>
                        <td>{profesor.total}</td>
                        <td>{ausenciasAceptadas > 0 ? `${Math.round(((profesor.total / ausenciasAceptadas) * 100))}%` : "0%"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}