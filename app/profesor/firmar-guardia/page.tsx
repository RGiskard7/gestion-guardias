"use client"

import FirmarGuardia from "../../../src/pages/profesor/FirmarGuardia"
import ProtectedRoute from "../../../src/components/ProtectedRoute"

export default function FirmarGuardiaPage() {
  return (
    <ProtectedRoute requiredRole="profesor">
      <FirmarGuardia />
    </ProtectedRoute>
  )
} 