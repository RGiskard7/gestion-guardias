"use client"

import MisAusencias from "../../../src/pages/profesor/MisAusencias"
import ProtectedRoute from "../../../src/components/ProtectedRoute"

export default function AusenciasPage() {
  return (
    <ProtectedRoute requiredRole="profesor">
      <MisAusencias />
    </ProtectedRoute>
  )
} 