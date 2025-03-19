"use client"

import { useState, useEffect } from "react"
import { useGuardias } from "@/src/contexts/GuardiasContext"
import { useUsuarios } from "@/src/contexts/UsuariosContext"
import { useLugares } from "@/src/contexts/LugaresContext"
import { Usuario, Lugar } from "@/src/types"
import { DB_CONFIG, getDuracionTramo } from "@/lib/db-config"

export default function EstadisticasPage() {
  const { guardias } = useGuardias()
  const { usuarios } = useUsuarios()
  const { lugares } = useLugares()
  const [periodoInicio, setPeriodoInicio] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
  )
  const [periodoFin, setPeriodoFin] = useState<string>(new Date().toISOString().split("T")[0])
  const [activeTab, setActiveTab] = useState<"profesores" | "lugares">("profesores")

  // Configurar periodo de tiempo
  const tramosHorarios = DB_CONFIG.TRAMOS_HORARIOS

  // Filtrar guardias por periodo
  const guardiasEnPeriodo = guardias.filter((g) => g.fecha >= periodoInicio && g.fecha <= periodoFin)

  // Obtener profesores (no admins)
  const profesores = usuarios.filter((u: Usuario) => u.rol === DB_CONFIG.ROLES.PROFESOR && u.activo)

  // Contar guardias por estado
  const pendientes = guardiasEnPeriodo.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE).length
  const asignadas = guardiasEnPeriodo.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA).length
  const firmadas = guardiasEnPeriodo.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA).length
  const anuladas = guardiasEnPeriodo.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.ANULADA).length
  const total = guardiasEnPeriodo.length

  // Contar guardias por tramo horario
  const guardiasPorTramo = tramosHorarios.map((tramo) => {
    const guardiasFiltradas = guardiasEnPeriodo.filter((g) => g.tramoHorario === tramo)
    return {
      tramo,
      total: guardiasFiltradas.length,
      pendientes: guardiasFiltradas.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE).length,
      asignadas: guardiasFiltradas.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA).length,
      firmadas: guardiasFiltradas.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA).length,
    }
  })

  // Contar guardias por tipo
  const tiposGuardia = DB_CONFIG.TIPOS_GUARDIA
  const guardiasPorTipo = tiposGuardia.map((tipo) => {
    const guardiasFiltradas = guardiasEnPeriodo.filter((g) => g.tipoGuardia === tipo)
    return {
      tipo,
      total: guardiasFiltradas.length,
      pendientes: guardiasFiltradas.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE).length,
      asignadas: guardiasFiltradas.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA).length,
      firmadas: guardiasFiltradas.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA).length,
    }
  })

  // Contar guardias por lugar
  const guardiasPorLugar = lugares.map((lugar) => {
    const guardiasFiltradas = guardiasEnPeriodo.filter((g) => g.lugarId === lugar.id)
    return {
      lugarId: lugar.id,
      lugarCodigo: lugar.codigo,
      lugarDescripcion: lugar.descripcion,
      total: guardiasFiltradas.length,
      pendientes: guardiasFiltradas.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE).length,
      asignadas: guardiasFiltradas.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA).length,
      firmadas: guardiasFiltradas.filter((g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA).length,
    }
  }).sort((a, b) => b.total - a.total)

  // Calcular horas de guardia por profesor
  const guardiasPorProfesor = profesores
    .map((profesor) => {
      const guardiasCubiertas = guardiasEnPeriodo.filter(
        (g) => g.profesorCubridorId === profesor.id && (g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA || g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA),
      )
      
      const guardiasFirmadas = guardiasCubiertas.filter(
        (g) => g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA
      )

      // Calcular horas totales de guardia
      const horasTotales = guardiasCubiertas.reduce((total, guardia) => {
        return total + getDuracionTramo(guardia.tramoHorario)
      }, 0)
      
      // Calcular horas firmadas de guardia
      const horasFirmadas = guardiasFirmadas.reduce((total, guardia) => {
        return total + getDuracionTramo(guardia.tramoHorario)
      }, 0)

      return {
        profesorId: profesor.id,
        profesorNombre: profesor.nombre + (profesor.apellido ? ` ${profesor.apellido}` : ''),
        total: guardiasCubiertas.length,
        firmadas: guardiasFirmadas.length,
        horasTotales: horasTotales,
        horasFirmadas: horasFirmadas,
        porTramo: tramosHorarios.map((tramo) => {
          const tramoCubierto = guardiasCubiertas.filter((g) => g.tramoHorario === tramo)
          return {
            tramo,
            total: tramoCubierto.length,
            horas: tramoCubierto.length * getDuracionTramo(tramo)
          }
        }),
        porLugar: lugares.map((lugar) => ({
          lugarId: lugar.id,
          lugarCodigo: lugar.codigo,
          lugarDescripcion: lugar.descripcion,
          total: guardiasCubiertas.filter((g) => g.lugarId === lugar.id).length,
          porTramo: tramosHorarios.map((tramo) => {
            const guardiasFiltradas = guardiasCubiertas.filter(
              (g) => g.lugarId === lugar.id && g.tramoHorario === tramo
            )
            return {
              tramo,
              total: guardiasFiltradas.length,
              horas: guardiasFiltradas.length * getDuracionTramo(tramo)
            }
          }),
        })).filter(l => l.total > 0), // Solo incluir lugares donde el profesor ha realizado guardias
      }
    })
    .sort((a, b) => b.total - a.total)

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Estadísticas</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">Periodo</span>
            <input
              type="date"
              className="form-control"
              value={periodoInicio}
              onChange={(e) => setPeriodoInicio(e.target.value)}
              aria-label="Fecha de inicio del periodo"
            />
            <input
              type="date"
              className="form-control"
              value={periodoFin}
              onChange={(e) => setPeriodoFin(e.target.value)}
              aria-label="Fecha de fin del periodo"
            />
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">Resumen de guardias</div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col">
                  <h3 className="text-warning">{pendientes}</h3>
                  <p>Pendientes</p>
                </div>
                <div className="col">
                  <h3 className="text-info">{asignadas}</h3>
                  <p>Asignadas</p>
                </div>
                <div className="col">
                  <h3 className="text-success">{firmadas}</h3>
                  <p>Firmadas</p>
                </div>
                <div className="col">
                  <h3 className="text-danger">{anuladas}</h3>
                  <p>Anuladas</p>
                </div>
                <div className="col">
                  <h3 className="text-primary">{total}</h3>
                  <p>Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">Guardias por tramo horario</div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Tramo</th>
                      <th>Total</th>
                      <th>Pendientes</th>
                      <th>Asignadas</th>
                      <th>Firmadas</th>
                      <th>% Cobertura</th>
                      <th>Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guardiasPorTramo.map((item) => (
                      <tr key={item.tramo}>
                        <td>{item.tramo}</td>
                        <td>{item.total}</td>
                        <td>{item.pendientes}</td>
                        <td>{item.asignadas}</td>
                        <td>{item.firmadas}</td>
                        <td>
                          {item.total > 0
                            ? `${Math.round(((item.asignadas + item.firmadas) / item.total) * 100)}%`
                            : "0%"}
                        </td>
                        <td>{getDuracionTramo(item.tramo)} hora(s)</td>
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
            <div className="card-header">Guardias por tipo</div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Total</th>
                      <th>Pendientes</th>
                      <th>Asignadas</th>
                      <th>Firmadas</th>
                      <th>% Cobertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guardiasPorTipo.map((item) => (
                      <tr key={item.tipo}>
                        <td>{item.tipo}</td>
                        <td>{item.total}</td>
                        <td>{item.pendientes}</td>
                        <td>{item.asignadas}</td>
                        <td>{item.firmadas}</td>
                        <td>
                          {item.total > 0
                            ? `${Math.round(((item.asignadas + item.firmadas) / item.total) * 100)}%`
                            : "0%"}
                        </td>
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
            <div className="card-header">Guardias por lugar</div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Lugar</th>
                      <th>Total</th>
                      <th>Pendientes</th>
                      <th>Asignadas</th>
                      <th>Firmadas</th>
                      <th>% Cobertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guardiasPorLugar.filter(item => item.total > 0).map((item) => (
                      <tr key={item.lugarId}>
                        <td>{item.lugarCodigo} - {item.lugarDescripcion}</td>
                        <td>{item.total}</td>
                        <td>{item.pendientes}</td>
                        <td>{item.asignadas}</td>
                        <td>{item.firmadas}</td>
                        <td>
                          {item.total > 0
                            ? `${Math.round(((item.asignadas + item.firmadas) / item.total) * 100)}%`
                            : "0%"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">Guardias por profesor</div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
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
                                {tramoData.total}
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

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">Tiempo de guardia por profesor y lugar</div>
            <div className="card-body">
              <div className="accordion" id="accordionProfesores">
                {guardiasPorProfesor.filter(p => p.total > 0).map((profesor) => (
                  <div className="accordion-item" key={profesor.profesorId}>
                    <h2 className="accordion-header">
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
                      data-bs-parent="#accordionProfesores"
                    >
                      <div className="accordion-body">
                        <h5>Desglose por tramos</h5>
                        <div className="table-responsive mb-3">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Tramo</th>
                                <th>Nº Guardias</th>
                                <th>Horas</th>
                              </tr>
                            </thead>
                            <tbody>
                              {profesor.porTramo.filter(t => t.total > 0).map(t => (
                                <tr key={t.tramo}>
                                  <td>{t.tramo}</td>
                                  <td>{t.total}</td>
                                  <td>{t.horas.toFixed(1)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <h5>Desglose por lugares</h5>
                        {profesor.porLugar.length > 0 ? (
                          profesor.porLugar.map(lugar => (
                            <div key={lugar.lugarId} className="mb-3">
                              <h6>{lugar.lugarCodigo} - {lugar.lugarDescripcion} ({lugar.total} guardias)</h6>
                              <div className="table-responsive">
                                <table className="table table-sm">
                                  <thead>
                                    <tr>
                                      <th>Tramo</th>
                                      <th>Nº Guardias</th>
                                      <th>Horas</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {lugar.porTramo.filter(t => t.total > 0).map(t => (
                                      <tr key={t.tramo}>
                                        <td>{t.tramo}</td>
                                        <td>{t.total}</td>
                                        <td>{t.horas.toFixed(1)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted">No hay información de lugares disponible</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}