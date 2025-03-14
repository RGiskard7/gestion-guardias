"use client"

import Estadisticas from "../../../src/pages/admin/Estadisticas"
import ProtectedRoute from "../../../src/components/ProtectedRoute"

export default function EstadisticasPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Estadisticas />
    </ProtectedRoute>
  )
} 