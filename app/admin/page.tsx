"use client"

import Link from "next/link"
import { useGuardias } from "@/src/contexts/GuardiasContext"

export default function AdminDashboardPage() {
  const { guardias, usuarios, lugares } = useGuardias()

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // Count guardias by estado
  const guardiasHoy = guardias.filter((g) => g.fecha === today)
  const pendientes = guardiasHoy.filter((g) => g.estado === "Pendiente").length
  const asignadas = guardiasHoy.filter((g) => g.estado === "Asignada").length
  const firmadas = guardiasHoy.filter((g) => g.estado === "Firmada").length

  // Count active profesores
  const profesoresActivos = usuarios.filter((u) => u.rol === "profesor" && u.activo).length

  return (
    <>
      <div className="d-flex align-items-center mb-4">
        <i className="bi bi-speedometer2 me-3" style={{ fontSize: '2rem', color: '#007bff' }}></i>
        <h1 className="h3 mb-0">Panel de Administración</h1>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="card-title">Guardias Pendientes</h5>
                  <p className="card-text display-4">{pendientes}</p>
                  <p className="card-text">Hoy</p>
                </div>
                <i className="bi bi-hourglass-split" style={{ fontSize: '2.5rem', opacity: '0.5' }}></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="card-title">Guardias Asignadas</h5>
                  <p className="card-text display-4">{asignadas}</p>
                  <p className="card-text">Hoy</p>
                </div>
                <i className="bi bi-clipboard-check" style={{ fontSize: '2.5rem', opacity: '0.5' }}></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="card-title">Guardias Firmadas</h5>
                  <p className="card-text display-4">{firmadas}</p>
                  <p className="card-text">Hoy</p>
                </div>
                <i className="bi bi-check-circle" style={{ fontSize: '2.5rem', opacity: '0.5' }}></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-secondary mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="card-title">Profesores Activos</h5>
                  <p className="card-text display-4">{profesoresActivos}</p>
                  <p className="card-text">Total</p>
                </div>
                <i className="bi bi-people" style={{ fontSize: '2.5rem', opacity: '0.5' }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card dashboard-card">
            <div className="card-body">
              <div className="dashboard-icon">
                <i className="bi bi-people"></i>
              </div>
              <h5 className="card-title">Gestión de Usuarios</h5>
              <p className="card-text">Administra los profesores del centro.</p>
              <Link href="/admin/users" className="btn btn-primary">
                <i className="bi bi-arrow-right-circle me-2"></i>
                Gestionar
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card dashboard-card">
            <div className="card-body">
              <div className="dashboard-icon">
                <i className="bi bi-calendar3"></i>
              </div>
              <h5 className="card-title">Gestión de Horarios</h5>
              <p className="card-text">Configura los horarios de guardia de los profesores.</p>
              <Link href="/admin/horarios" className="btn btn-primary">
                <i className="bi bi-arrow-right-circle me-2"></i>
                Gestionar
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card dashboard-card">
            <div className="card-body">
              <div className="dashboard-icon">
                <i className="bi bi-geo-alt"></i>
              </div>
              <h5 className="card-title">Gestión de Lugares</h5>
              <p className="card-text">Administra las aulas, patios y otros espacios.</p>
              <Link href="/admin/lugares" className="btn btn-primary">
                <i className="bi bi-arrow-right-circle me-2"></i>
                Gestionar
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card dashboard-card">
            <div className="card-body">
              <div className="dashboard-icon">
                <i className="bi bi-clipboard-check"></i>
              </div>
              <h5 className="card-title">Gestión de Guardias</h5>
              <p className="card-text">Crea y administra las guardias del centro.</p>
              <Link href="/admin/guardias" className="btn btn-primary">
                <i className="bi bi-arrow-right-circle me-2"></i>
                Gestionar
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card dashboard-card">
            <div className="card-body">
              <div className="dashboard-icon">
                <i className="bi bi-display"></i>
              </div>
              <h5 className="card-title">Sala de Guardias</h5>
              <p className="card-text">Visualiza el estado actual de las guardias.</p>
              <Link href="/sala-guardias" className="btn btn-primary">
                <i className="bi bi-arrow-right-circle me-2"></i>
                Ver Sala
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card dashboard-card">
            <div className="card-body">
              <div className="dashboard-icon">
                <i className="bi bi-bar-chart"></i>
              </div>
              <h5 className="card-title">Estadísticas</h5>
              <p className="card-text">Consulta estadísticas sobre las guardias.</p>
              <Link href="/admin/estadisticas" className="btn btn-primary">
                <i className="bi bi-arrow-right-circle me-2"></i>
                Ver Estadísticas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 