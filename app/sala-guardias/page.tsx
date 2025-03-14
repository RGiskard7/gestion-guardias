"use client"

import { useState } from "react"
import { useGuardias } from "../../src/contexts/GuardiasContext"
import GuardiaCard from "@/app/guardia/guardia-card"

export default function SalaGuardiasPage() {
  const { guardias } = useGuardias()
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])

  // Filter guardias by selected date
  const filteredGuardias = guardias.filter((guardia) => guardia.fecha === selectedDate)

  // Group guardias by tramo horario
  const guardiasByTramo: { [key: string]: typeof filteredGuardias } = {}

  filteredGuardias.forEach((guardia) => {
    if (!guardiasByTramo[guardia.tramoHorario]) {
      guardiasByTramo[guardia.tramoHorario] = []
    }
    guardiasByTramo[guardia.tramoHorario].push(guardia)
  })

  // Sort tramos horarios
  const tramosOrdenados = Object.keys(guardiasByTramo).sort((a, b) => {
    const getTramoNumber = (tramo: string) => {
      const match = tramo.match(/(\d+)/)
      return match ? Number.parseInt(match[1]) : 0
    }
    return getTramoNumber(a) - getTramoNumber(b)
  })

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Sala de Guardias</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">Fecha</span>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Seleccionar fecha para ver guardias"
            />
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        Mostrando guardias para: <strong>{formatDate(selectedDate)}</strong>
      </div>

      {tramosOrdenados.length === 0 ? (
        <div className="alert alert-warning">No hay guardias registradas para esta fecha.</div>
      ) : (
        tramosOrdenados.map((tramo) => (
          <div key={tramo} className="mb-4">
            <h3 className="border-bottom pb-2">{tramo}</h3>
            <div className="row">
              {guardiasByTramo[tramo].map((guardia) => (
                <div key={guardia.id} className="col-md-6 col-lg-4 mb-3">
                  <GuardiaCard guardia={guardia} />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
} 