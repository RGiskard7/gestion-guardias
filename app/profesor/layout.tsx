"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import ProtectedLayout from '@/components/layout/protected-layout'
import { DB_CONFIG } from '@/lib/db-config'

interface ProfesorLayoutProps {
  children: React.ReactNode
}

export default function ProfesorLayout({ children }: ProfesorLayoutProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.rol !== DB_CONFIG.ROLES.PROFESOR) {
      router.replace(DB_CONFIG.RUTAS.ADMIN)
    }
  }, [user, router])

  if (!user || user.rol !== DB_CONFIG.ROLES.PROFESOR) {
    return null
  }

  return <ProtectedLayout>{children}</ProtectedLayout>
} 