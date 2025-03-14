"use client"

import ProfesorDashboard from "../../src/pages/profesor/ProfesorDashboard"
import ProtectedRoute from "../../src/components/ProtectedRoute"

export default function ProfesorPage() {
  return (
    <ProtectedRoute requiredRole="profesor">
      <ProfesorDashboard />
    </ProtectedRoute>
  )
} 