"use client"

import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import { getLugares, getLugarById, createLugar as createLugarService, updateLugar as updateLugarService, deleteLugar as deleteLugarService, type Lugar as LugarDB } from "@/lib/lugaresService"
import { Lugar, LugarDB as LugarDBType, mapLugarFromDB, mapLugarToDB } from "@/src/types"

// Definición del tipo del contexto
export interface LugaresContextType {
  lugares: Lugar[]
  loading: boolean
  
  // CRUD operations
  addLugar: (lugar: Omit<Lugar, "id">) => Promise<void>
  updateLugar: (id: number, lugar: Partial<Lugar>) => Promise<void>
  deleteLugar: (id: number) => Promise<void>
  
  // Consultas
  getLugarById: (id: number) => Lugar | undefined
  refreshLugares: () => Promise<void>
}

// Crear el contexto
export const LugaresContext = createContext<LugaresContextType>({
  lugares: [],
  loading: false,
  
  addLugar: async () => {},
  updateLugar: async () => {},
  deleteLugar: async () => {},
  
  getLugarById: () => undefined,
  refreshLugares: async () => {}
})

// Hook para usar el contexto
export const useLugares = () => useContext(LugaresContext)

// Props del proveedor
interface LugaresProviderProps {
  children: ReactNode
}

// Componente proveedor
export const LugaresProvider: React.FC<LugaresProviderProps> = ({ children }) => {
  const [lugares, setLugares] = useState<Lugar[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar datos iniciales
  useEffect(() => {
    loadLugares()
  }, [])

  // Función para cargar lugares
  const loadLugares = async () => {
    try {
      setLoading(true)
      
      // Cargar lugares
      const lugaresData = await getLugares()
      setLugares(lugaresData.map(mapLugarFromDB))
    } catch (error) {
      console.error("Error al cargar lugares:", error)
    } finally {
      setLoading(false)
    }
  }

  // Función para refrescar lugares
  const refreshLugares = async () => {
    await loadLugares()
  }

  // Función para añadir un lugar
  const addLugar = async (lugar: Omit<Lugar, "id">) => {
    try {
      const lugarDB = mapLugarToDB(lugar)
      const newLugar = await createLugarService(lugarDB as Omit<LugarDB, "id">)
      if (newLugar) {
        setLugares([...lugares, mapLugarFromDB(newLugar)])
      }
    } catch (error) {
      console.error("Error al añadir lugar:", error)
    }
  }

  // Función para actualizar un lugar
  const updateLugar = async (id: number, lugar: Partial<Lugar>) => {
    try {
      // Convertir al formato de la base de datos
      const lugarDB: Partial<LugarDB> = {}
      if (lugar.codigo !== undefined) lugarDB.codigo = lugar.codigo
      if (lugar.descripcion !== undefined) lugarDB.descripcion = lugar.descripcion || undefined
      if (lugar.tipoLugar !== undefined) lugarDB.tipo_lugar = lugar.tipoLugar

      await updateLugarService(id, lugarDB)
      setLugares(lugares.map(l => l.id === id ? { ...l, ...lugar } : l))
    } catch (error) {
      console.error(`Error al actualizar lugar con ID ${id}:`, error)
    }
  }

  // Función para eliminar un lugar
  const deleteLugar = async (id: number) => {
    try {
      await deleteLugarService(id)
      setLugares(lugares.filter(l => l.id !== id))
    } catch (error) {
      console.error(`Error al eliminar lugar con ID ${id}:`, error)
    }
  }

  // Función para obtener un lugar por ID
  const getLugarById = (id: number): Lugar | undefined => {
    return lugares.find(l => l.id === id)
  }

  // Valor del contexto
  const value: LugaresContextType = {
    lugares,
    loading,
    
    addLugar,
    updateLugar,
    deleteLugar,
    
    getLugarById,
    refreshLugares
  }

  return (
    <LugaresContext.Provider value={value}>
      {children}
    </LugaresContext.Provider>
  )
}

// Re-exportar el tipo para mantener compatibilidad
export type { Lugar } 