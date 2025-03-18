"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import ProtectedLayout from '@/components/layout/protected-layout'
import { DB_CONFIG } from '@/lib/db-config'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.rol !== DB_CONFIG.ROLES.ADMIN) {
      router.replace(DB_CONFIG.RUTAS.PROFESOR)
    }
  }, [user, router])

  if (!user || user.rol !== DB_CONFIG.ROLES.ADMIN) {
    return null
  }

  return <ProtectedLayout>{children}</ProtectedLayout>
} 