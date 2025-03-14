"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import ProtectedLayout from '@/components/layout/protected-layout'

interface ProfesorLayoutProps {
  children: React.ReactNode
}

export default function ProfesorLayout({ children }: ProfesorLayoutProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.rol !== 'profesor') {
      router.replace('/admin')
    }
  }, [user, router])

  if (!user || user.rol !== 'profesor') {
    return null
  }

  return <ProtectedLayout>{children}</ProtectedLayout>
} 