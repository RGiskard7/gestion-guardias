"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import ProtectedLayout from '@/components/layout/protected-layout'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.rol !== 'admin') {
      router.replace('/profesor')
    }
  }, [user, router])

  if (!user || user.rol !== 'admin') {
    return null
  }

  return <ProtectedLayout>{children}</ProtectedLayout>
} 