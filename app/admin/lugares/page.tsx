"use client"

import ManageLugares from "../../../src/pages/admin/ManageLugares"
import ProtectedRoute from "../../../src/components/ProtectedRoute"

export default function LugaresPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ManageLugares />
    </ProtectedRoute>
  )
} 