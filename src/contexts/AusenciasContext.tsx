"use client"

import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import { getAllAusencias, getAusenciaById, getAusenciasByProfesor as fetchAusenciasByProfesor, getAusenciasByEstado, getAusenciasPendientes as fetchAusenciasPendientes, createAusencia as createAusenciaService, updateAusencia as updateAusenciaService, deleteAusencia as deleteAusenciaService, acceptAusencia as acceptAusenciaService, rejectAusencia as rejectAusenciaService, type Ausencia as AusenciaDB } from "@/lib/ausenciasService"
import { Ausencia, AusenciaDB as AusenciaDBType, mapAusenciaFromDB, mapAusenciaToDB } from "@/src/types"

// Definición del tipo del contexto
export interface AusenciasContextType {
  ausencias: Ausencia[]
  loading: boolean
  
  // CRUD operations
  addAusencia: (ausencia: Omit<Ausencia, "id">) => Promise<number | null>
  updateAusencia: (id: number, ausencia: Partial<Ausencia>) => Promise<void>
  deleteAusencia: (id: number) => Promise<void>
  
  // Operaciones específicas
  acceptAusencia: (ausenciaId: number, tipoGuardia: string, lugarId: number, observaciones?: string) => Promise<number | null>
  rejectAusencia: (ausenciaId: number, motivo?: string) => Promise<void>
  anularAusencia: (ausenciaId: number, motivo: string) => Promise<boolean>
  
  // Consultas
  getAusenciasByProfesor: (profesorId: number) => Ausencia[]
  getAusenciasPendientes: () => Ausencia[]
  refreshAusencias: () => Promise<void>
}

// Crear el contexto
export const AusenciasContext = createContext<AusenciasContextType>({
  ausencias: [],
  loading: false,
  
  addAusencia: async () => null,
  updateAusencia: async () => {},
  deleteAusencia: async () => {},
  
  acceptAusencia: async () => null,
  rejectAusencia: async () => {},
  anularAusencia: async () => false,
  
  getAusenciasByProfesor: () => [],
  getAusenciasPendientes: () => [],
  refreshAusencias: async () => {}
})

// Hook para usar el contexto
export const useAusencias = () => useContext(AusenciasContext)

// Props del proveedor
interface AusenciasProviderProps {
  children: ReactNode
}

// Componente proveedor
export const AusenciasProvider: React.FC<AusenciasProviderProps> = ({ children }) => {
  const [ausencias, setAusencias] = useState<Ausencia[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar datos iniciales
  useEffect(() => {
    loadAusencias()
  }, [])

  // Función para cargar ausencias
  const loadAusencias = async () => {
    try {
      setLoading(true)
      
      // Cargar ausencias
      const ausenciasData = await getAllAusencias()
      setAusencias(ausenciasData.map(mapAusenciaFromDB))
    } catch (error) {
      console.error("Error al cargar ausencias:", error)
    } finally {
      setLoading(false)
    }
  }

  // Función para refrescar ausencias
  const refreshAusencias = async () => {
    await loadAusencias()
  }

  // Función para añadir una ausencia
  const addAusencia = async (ausencia: Omit<Ausencia, "id">): Promise<number | null> => {
    try {
      const ausenciaDB = mapAusenciaToDB(ausencia)
      const newAusencia = await createAusenciaService(ausenciaDB as Omit<AusenciaDB, "id">)
      if (newAusencia) {
        const mappedAusencia = mapAusenciaFromDB(newAusencia)
        setAusencias([...ausencias, mappedAusencia])
        return mappedAusencia.id
      }
      return null
    } catch (error) {
      console.error("Error al añadir ausencia:", error)
      return null
    }
  }

  // Función para actualizar una ausencia
  const updateAusencia = async (id: number, ausencia: Partial<Ausencia>) => {
    try {
      // Convertir al formato de la base de datos
      const ausenciaDB: Partial<AusenciaDB> = {}
      if (ausencia.profesorId !== undefined) ausenciaDB.profesor_id = ausencia.profesorId
      if (ausencia.fecha !== undefined) ausenciaDB.fecha = ausencia.fecha
      if (ausencia.tramoHorario !== undefined) ausenciaDB.tramo_horario = ausencia.tramoHorario
      if (ausencia.estado !== undefined) ausenciaDB.estado = ausencia.estado
      if (ausencia.observaciones !== undefined) ausenciaDB.observaciones = ausencia.observaciones || undefined
      if (ausencia.tareas !== undefined) ausenciaDB.tareas = ausencia.tareas

      await updateAusenciaService(id, ausenciaDB)
      setAusencias(ausencias.map(a => a.id === id ? { ...a, ...ausencia } : a))
    } catch (error) {
      console.error(`Error al actualizar ausencia con ID ${id}:`, error)
    }
  }

  // Función para eliminar una ausencia
  const deleteAusencia = async (id: number) => {
    try {
      await deleteAusenciaService(id)
      setAusencias(ausencias.filter(a => a.id !== id))
    } catch (error) {
      console.error(`Error al eliminar ausencia con ID ${id}:`, error)
    }
  }

  // Función para aceptar una ausencia
  const acceptAusencia = async (ausenciaId: number, tipoGuardia: string, lugarId: number, observaciones?: string): Promise<number | null> => {
    try {
      const guardia = await acceptAusenciaService(ausenciaId, tipoGuardia, lugarId, observaciones)
      if (guardia) {
        // Actualizar el estado de la ausencia en el estado local
        setAusencias(ausencias.map(a => 
          a.id === ausenciaId 
            ? { ...a, estado: "Aceptada" } 
            : a
        ))
        return guardia.id
      }
      return null
    } catch (error) {
      console.error(`Error al aceptar ausencia con ID ${ausenciaId}:`, error)
      return null
    }
  }

  // Función para rechazar una ausencia
  const rejectAusencia = async (ausenciaId: number, motivo?: string) => {
    try {
      await rejectAusenciaService(ausenciaId, motivo)
      // Actualizar el estado de la ausencia en el estado local
      setAusencias(ausencias.map(a => 
        a.id === ausenciaId 
          ? { ...a, estado: "Rechazada" } 
          : a
      ))
    } catch (error) {
      console.error(`Error al rechazar ausencia con ID ${ausenciaId}:`, error)
    }
  }

  // Función para anular una ausencia
  const anularAusencia = async (ausenciaId: number, motivo: string): Promise<boolean> => {
    try {
      // Primero rechazamos la ausencia
      await rejectAusencia(ausenciaId, motivo)
      
      // Luego la eliminamos
      await deleteAusencia(ausenciaId)
      
      return true
    } catch (error) {
      console.error(`Error al anular ausencia con ID ${ausenciaId}:`, error)
      return false
    }
  }

  // Función para obtener ausencias por profesor
  const getAusenciasByProfesor = (profesorId: number): Ausencia[] => {
    return ausencias.filter(a => a.profesorId === profesorId)
  }

  // Función para obtener ausencias pendientes
  const getAusenciasPendientes = (): Ausencia[] => {
    return ausencias.filter(a => a.estado === "Pendiente")
  }

  // Valor del contexto
  const value: AusenciasContextType = {
    ausencias,
    loading,
    
    addAusencia,
    updateAusencia,
    deleteAusencia,
    
    acceptAusencia,
    rejectAusencia,
    anularAusencia,
    
    getAusenciasByProfesor,
    getAusenciasPendientes,
    refreshAusencias
  }

  return (
    <AusenciasContext.Provider value={value}>
      {children}
    </AusenciasContext.Provider>
  )
}

// Re-exportar el tipo para mantener compatibilidad
export type { Ausencia } 