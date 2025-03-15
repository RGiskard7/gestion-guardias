"use client"

import { useState } from "react"
import { useGuardias, type Guardia, type Usuario } from "@/src/contexts/GuardiasContext"
import { useAuth } from "@/src/contexts/AuthContext"
import { Pagination } from "@/components/ui/pagination"
import GuardiaCard from "@/app/guardia/guardia-card"

export default function GuardiasPendientesPage() {
  const { user } = useAuth()
  const { guardias, horarios, usuarios, lugares, asignarGuardia } = useGuardias()
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])

  if (!user) return null

  // Get profesor's schedules
  const misHorarios = horarios.filter((h) => h.profesorId === user.id)

  // Filter guardias pendientes for selected date
  const guardiasPendientes = guardias.filter((g: Guardia) => {
    // La guardia debe estar pendiente y ser de la fecha seleccionada
    const esPendiente = g.estado === "Pendiente" && g.fecha === selectedDate

    // Obtener el día de la semana de la fecha de la guardia
    const diaSemana = new Date(g.fecha).toLocaleDateString("es-ES", { weekday: "long" })
    
    // Verificar si el profesor tiene horario de guardia en ese tramo
    const tieneHorarioGuardia = misHorarios.some(
      (h) => h.diaSemana.toLowerCase() === diaSemana.toLowerCase() && 
             h.tramoHorario === g.tramoHorario
    )

    // Solo mostrar las guardias donde el profesor SÍ tiene horario de guardia
    return esPendiente && tieneHorarioGuardia
  })

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6 // Ajustado para mostrar 6 tarjetas por página (2 filas de 3)
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
    
    try {
      await asignarGuardia(guardiaId, user.id)
    } catch (error) {
      console.error("Error al asignar guardia:", error)
    }
  }

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
    setCurrentPage(1) // Resetear a la primera página cuando cambia la fecha
  }

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Guardias Pendientes</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">Fecha</span>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={handleDateChange}
              aria-label="Seleccionar fecha para ver guardias pendientes"
            />
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        Mostrando guardias pendientes para: <strong>{new Date(selectedDate).toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</strong>
      </div>

      {guardiasPendientes.length === 0 ? (
        <div className="alert alert-warning">
          No hay guardias pendientes disponibles para la fecha seleccionada o no tienes horario disponible.
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
        <div className="card-header">Mi Horario</div>
        <div className="card-body">
          {misHorarios.length === 0 ? (
            <div className="alert alert-info">No tienes horarios asignados.</div>
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
                  {misHorarios.map((horario, index) => (
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