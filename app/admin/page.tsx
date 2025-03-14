"use client"

import AdminDashboard from "../../src/pages/admin/AdminDashboard"
import ProtectedRoute from "../../src/components/ProtectedRoute"

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  )
} 