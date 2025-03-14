"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import Navbar from '@/src/components/Navbar'
import Sidebar from '@/src/components/Sidebar'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
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
    <div className="d-flex">
      <Sidebar role={user.rol} />
      <div className="flex-grow-1">
        <Navbar />
        <main className="container-fluid py-4">
          {children}
        </main>
      </div>
    </div>
  )
} 