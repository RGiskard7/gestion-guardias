"use client"

import ManageHorarios from "../../../src/pages/admin/ManageHorarios"
import ProtectedRoute from "../../../src/components/ProtectedRoute"

export default function HorariosPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ManageHorarios />
    </ProtectedRoute>
  )
} 