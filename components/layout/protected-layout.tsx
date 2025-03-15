"use client"

import type React from "react"
import { useAuth } from "@/src/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Navbar from "@/components/common/Navbar"
import Sidebar from "@/components/common/Sidebar"

interface ProtectedLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function ProtectedLayout({ children, title }: ProtectedLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="d-flex min-vh-100">
      <Sidebar role={user.rol} />
      <div className="flex-grow-1">
        <Navbar />
        <main className="container-fluid py-4">
          {title && (
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
} 