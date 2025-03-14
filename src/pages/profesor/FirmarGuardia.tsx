"use client"

import type React from "react"
import { useState } from "react"
import Layout from "../../components/Layout"
import GuardiaCard from "../../components/GuardiaCard"
import { useGuardias } from "../../contexts/GuardiasContext"
import { useAuth } from "../../contexts/AuthContext"

const FirmarGuardia: React.FC = () => {
  const { user } = useAuth()
  const { guardias, firmarGuardia } = useGuardias()

  if (!user) return null

  const [filterEstado, setFilterEstado] = useState<string>("Asignada")

  // Get guardias where the profesor is cubridor
  const misGuardias = guardias
    .filter((g) => g.profesorCubridorId === user.id && (filterEstado ? g.estado === filterEstado : true))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  // Handle firmar guardia
  const handleFirmarGuardia = (guardiaId: number) => {
    if (window.confirm("¿Estás seguro de que quieres firmar esta guardia?")) {
      firmarGuardia(guardiaId)
    }
  }

  return (
    <Layout title="Firmar Guardias">
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">Filtrar por Estado</span>
            <select className="form-select" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
              <option value="">Todos</option>
              <option value="Asignada">Pendientes de firma</option>
              <option value="Firmada">Firmadas</option>
            </select>
          </div>
        </div>
      </div>

      {misGuardias.length === 0 ? (
        <div className="alert alert-info">
          No tienes guardias{" "}
          {filterEstado === "Asignada" ? "pendientes de firma" : filterEstado === "Firmada" ? "firmadas" : ""}.
        </div>
      ) : (
        <div className="row">
          {misGuardias.map((guardia) => (
            <div key={guardia.id} className="col-md-6 col-lg-4 mb-3">
              <GuardiaCard
                guardia={guardia}
                showActions={guardia.estado === "Asignada"}
                onFirmar={handleFirmarGuardia}
              />
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

export default FirmarGuardia

