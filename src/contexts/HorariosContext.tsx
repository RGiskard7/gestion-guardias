"use client"

import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import { getHorarios, getHorariosByProfesor as fetchHorariosByProfesor, createHorario as createHorarioService, updateHorario as updateHorarioService, deleteHorario as deleteHorarioService, type Horario as HorarioDB } from "@/lib/horariosService"
import { Horario, HorarioDB as HorarioDBType, mapHorarioFromDB, mapHorarioToDB } from "@/src/types"

// Definición del tipo del contexto
export interface HorariosContextType {
  horarios: Horario[]
  loading: boolean
  
  // CRUD operations
  addHorario: (horario: Omit<Horario, "id">) => Promise<void>
  updateHorario: (id: number, horario: Partial<Horario>) => Promise<void>
  deleteHorario: (id: number) => Promise<void>
  
  // Consultas
  getHorariosByProfesor: (profesorId: number) => Horario[]
  refreshHorarios: () => Promise<void>
}

// Crear el contexto
export const HorariosContext = createContext<HorariosContextType>({
  horarios: [],
  loading: false,
  
  addHorario: async () => {},
  updateHorario: async () => {},
  deleteHorario: async () => {},
  
  getHorariosByProfesor: () => [],
  refreshHorarios: async () => {}
})

// Hook para usar el contexto
export const useHorarios = () => useContext(HorariosContext)

// Props del proveedor
interface HorariosProviderProps {
  children: ReactNode
}

// Componente proveedor
export const HorariosProvider: React.FC<HorariosProviderProps> = ({ children }) => {
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar datos iniciales
  useEffect(() => {
    loadHorarios()
  }, [])

  // Función para cargar horarios
  const loadHorarios = async () => {
    try {
      setLoading(true)
      
      // Cargar horarios
      const horariosData = await getHorarios()
      setHorarios(horariosData.map(mapHorarioFromDB))
    } catch (error) {
      console.error("Error al cargar horarios:", error)
    } finally {
      setLoading(false)
    }
  }

  // Función para refrescar horarios
  const refreshHorarios = async () => {
    await loadHorarios()
  }

  // Función para añadir un horario
  const addHorario = async (horario: Omit<Horario, "id">) => {
    try {
      const horarioDB = mapHorarioToDB(horario)
      const newHorario = await createHorarioService(horarioDB as Omit<HorarioDB, "id">)
      if (newHorario) {
        setHorarios([...horarios, mapHorarioFromDB(newHorario)])
      }
    } catch (error) {
      console.error("Error al añadir horario:", error)
    }
  }

  // Función para actualizar un horario
  const updateHorario = async (id: number, horario: Partial<Horario>) => {
    try {
      // Convertir al formato de la base de datos
      const horarioDB: Partial<HorarioDB> = {}
      if (horario.profesorId !== undefined) horarioDB.profesor_id = horario.profesorId
      if (horario.diaSemana !== undefined) horarioDB.dia_semana = horario.diaSemana
      if (horario.tramoHorario !== undefined) horarioDB.tramo_horario = horario.tramoHorario

      await updateHorarioService(id, horarioDB)
      setHorarios(horarios.map(h => h.id === id ? { ...h, ...horario } : h))
    } catch (error) {
      console.error(`Error al actualizar horario con ID ${id}:`, error)
    }
  }

  // Función para eliminar un horario
  const deleteHorario = async (id: number) => {
    try {
      await deleteHorarioService(id)
      setHorarios(horarios.filter(h => h.id !== id))
    } catch (error) {
      console.error(`Error al eliminar horario con ID ${id}:`, error)
    }
  }

  // Función para obtener horarios por profesor
  const getHorariosByProfesor = (profesorId: number): Horario[] => {
    return horarios.filter(h => h.profesorId === profesorId)
  }

  // Valor del contexto
  const value: HorariosContextType = {
    horarios,
    loading,
    
    addHorario,
    updateHorario,
    deleteHorario,
    
    getHorariosByProfesor,
    refreshHorarios
  }

  return (
    <HorariosContext.Provider value={value}>
      {children}
    </HorariosContext.Provider>
  )
}

// Re-exportar el tipo para mantener compatibilidad
export type { Horario } 