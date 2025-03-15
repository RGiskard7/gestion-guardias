"use client"

import { useState, useEffect } from 'react'
import { testSupabaseConnection } from '@/lib/authService'
import { getUsuarios } from '@/lib/usuariosService'
import { getAllGuardias } from '@/lib/guardiasService'
import { getLugares } from '@/lib/lugaresService'
import { getHorarios } from '@/lib/horariosService'
import { getTareasGuardia } from '@/lib/tareasGuardiaService'

export default function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  useEffect(() => {
    async function runTests() {
      setLoading(true)
      setError(null)
      
      try {
        // Probar conexión a Supabase
        const connectionResult = await testSupabaseConnection()
        setConnectionStatus(connectionResult)
        
        if (!connectionResult.success) {
          setError('Error de conexión a Supabase')
          setLoading(false)
          return
        }
        
        // Probar servicios
        const results: Record<string, any> = {}
        
        // Usuarios
        try {
          const usuarios = await getUsuarios()
          results.usuarios = {
            success: true,
            count: usuarios.length,
            sample: usuarios.slice(0, 3)
          }
        } catch (err) {
          results.usuarios = { success: false, error: String(err) }
        }
        
        // Guardias
        try {
          const guardias = await getAllGuardias()
          results.guardias = {
            success: true,
            count: guardias.length,
            sample: guardias.slice(0, 3)
          }
        } catch (err) {
          results.guardias = { success: false, error: String(err) }
        }
        
        // Lugares
        try {
          const lugares = await getLugares()
          results.lugares = {
            success: true,
            count: lugares.length,
            sample: lugares.slice(0, 3)
          }
        } catch (err) {
          results.lugares = { success: false, error: String(err) }
        }
        
        // Horarios
        try {
          const horarios = await getHorarios()
          results.horarios = {
            success: true,
            count: horarios.length,
            sample: horarios.slice(0, 3)
          }
        } catch (err) {
          results.horarios = { success: false, error: String(err) }
        }
        
        // Tareas de guardia
        try {
          const tareas = await getTareasGuardia()
          results.tareasGuardia = {
            success: true,
            count: tareas.length,
            sample: tareas.slice(0, 3)
          }
        } catch (err) {
          results.tareasGuardia = { success: false, error: String(err) }
        }
        
        setTestResults(results)
      } catch (err) {
        setError(`Error inesperado: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }
    
    runTests()
  }, [])

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Prueba de Conexión a Supabase</h1>
      
      {loading ? (
        <div className="alert alert-info">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <span>Probando conexión a Supabase...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      ) : (
        <>
          <div className={`alert ${connectionStatus?.success ? 'alert-success' : 'alert-danger'}`}>
            <i className={`bi ${connectionStatus?.success ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
            <strong>Estado de la conexión:</strong> {connectionStatus?.message}
          </div>
          
          <h2 className="mt-4 mb-3">Resultados de las pruebas</h2>
          
          <div className="row">
            {Object.entries(testResults).map(([service, result]) => (
              <div className="col-md-6 mb-4" key={service}>
                <div className="card">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">{service}</h5>
                  </div>
                  <div className="card-body">
                    {result.success ? (
                      <>
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle-fill me-2"></i>
                          Prueba exitosa
                        </div>
                        <p><strong>Registros encontrados:</strong> {result.count}</p>
                        {result.count > 0 && (
                          <>
                            <p><strong>Muestra de datos:</strong></p>
                            <pre className="bg-light p-3 rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
                              {JSON.stringify(result.sample, null, 2)}
                            </pre>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="alert alert-danger">
                        <i className="bi bi-x-circle-fill me-2"></i>
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
} 