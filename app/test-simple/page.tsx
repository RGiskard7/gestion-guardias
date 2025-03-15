"use client"

import { useState, useEffect } from 'react'
import { testConnection } from '@/lib/test-connection'

export default function TestSimplePage() {
  const [status, setStatus] = useState<string>('Probando conexión...')

  useEffect(() => {
    async function checkConnection() {
      try {
        const result = await testConnection()
        setStatus(result ? 'Conexión exitosa ✅' : 'Error de conexión ❌')
      } catch (error) {
        console.error('Error:', error)
        setStatus('Error inesperado ❌')
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="container mt-5">
      <h1>Prueba Simple de Conexión a Supabase</h1>
      <div className="alert alert-info mt-3">
        Estado: <strong>{status}</strong>
      </div>
      <p>Revisa la consola del navegador para ver los detalles.</p>
    </div>
  )
} 