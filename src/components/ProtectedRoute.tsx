"use client"

import type React from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole: "admin" | "profesor" | "any"
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      if (requiredRole !== "any" && user?.rol !== requiredRole) {
        // Redirect to the appropriate dashboard based on user role
        if (user?.rol === "admin") {
          router.push("/admin")
        } else if (user?.rol === "profesor") {
          router.push("/profesor")
        }
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, router])

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (requiredRole !== "any" && user?.rol !== requiredRole)) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute

