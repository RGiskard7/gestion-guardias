"use client"

import GuardiasPendientes from "../../../src/pages/profesor/GuardiasPendientes"
import ProtectedRoute from "../../../src/components/ProtectedRoute"

export default function GuardiasPendientesPage() {
  return (
    <ProtectedRoute requiredRole="profesor">
      <GuardiasPendientes />
    </ProtectedRoute>
  )
} 