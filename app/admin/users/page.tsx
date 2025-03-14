"use client"

import ManageUsers from "../../../src/pages/admin/ManageUsers"
import ProtectedRoute from "../../../src/components/ProtectedRoute"

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ManageUsers />
    </ProtectedRoute>
  )
} 