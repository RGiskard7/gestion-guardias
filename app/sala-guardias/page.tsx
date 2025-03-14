"use client"

import SalaGuardias from "../../src/pages/SalaGuardias"
import ProtectedRoute from "../../src/components/ProtectedRoute"

export default function SalaGuardiasPage() {
  return (
    <ProtectedRoute requiredRole="any">
      <SalaGuardias />
    </ProtectedRoute>
  )
} 