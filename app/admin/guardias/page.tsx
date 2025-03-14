"use client"

import ManageGuardias from "../../../src/pages/admin/ManageGuardias"
import ProtectedRoute from "../../../src/components/ProtectedRoute"

export default function GuardiasPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ManageGuardias />
    </ProtectedRoute>
  )
} 