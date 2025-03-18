"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import { useAuth } from "./AuthContext"
import { getAllGuardias, getGuardiaById, getGuardiasByFecha, getGuardiasByProfesorCubridor as fetchGuardiasByProfesor, firmarGuardia as firmarGuardiaService, createGuardia as createGuardiaService, updateGuardia as updateGuardiaService, deleteGuardia as deleteGuardiaService, type Guardia as GuardiaDB } from "@/lib/guardiasService"
import { getTareasGuardia, getTareasByGuardia as fetchTareasByGuardia, createTareaGuardia, updateTareaGuardia as updateTareaGuardiaService, deleteTareaGuardia as deleteTareaGuardiaService, type TareaGuardia as TareaGuardiaDB } from "@/lib/tareasGuardiaService"
import { DB_CONFIG } from "@/lib/db-config"
import { useAusencias } from "./AusenciasContext"
import { useLugares } from "./LugaresContext"
import { useUsuarios } from "./UsuariosContext"
import { 
  Guardia, GuardiaDB as GuardiaDBType, 
  TareaGuardia, TareaGuardiaDB as TareaGuardiaDBType,
  mapGuardiaFromDB, mapGuardiaToDB,
  mapTareaGuardiaFromDB, mapTareaGuardiaToDB
} from "@/src/types"

// Definición del tipo del contexto
export interface GuardiasContextType {
  guardias: Guardia[]
  tareasGuardia: TareaGuardia[]
  loading: boolean
  
  // CRUD operations for guardias
  addGuardia: (guardia: Omit<Guardia, "id">, tarea?: string) => Promise<number | null>
  updateGuardia: (id: number, guardia: Partial<Guardia>) => Promise<void>
  deleteGuardia: (id: number) => Promise<void>
  
  // CRUD operations for tareasGuardia
  addTareaGuardia: (tarea: Omit<TareaGuardia, "id">) => Promise<void>
  updateTareaGuardia: (id: number, tarea: Partial<TareaGuardia>) => Promise<void>
  deleteTareaGuardia: (id: number) => Promise<void>
  
  // Operaciones específicas
  asignarGuardia: (guardiaId: number, profesorCubridorId: number) => Promise<boolean>
  firmarGuardia: (id: number, observaciones?: string) => Promise<void>
  anularGuardia: (id: number, motivo: string) => Promise<void>
  desasociarGuardiaDeAusencia: (guardiaId: number) => Promise<boolean>
  
  // Consultas
  getGuardiasByDate: (fecha: string) => Guardia[]
  getGuardiasByProfesor: (profesorId: number) => Guardia[]
  getTareasByGuardia: (guardiaId: number) => TareaGuardia[]
  canProfesorAsignarGuardia: (guardiaId: number, profesorId: number) => boolean
  getGuardiaByAusenciaId: (ausenciaId: number) => Guardia | undefined
  getProfesorAusenteIdByGuardia: (guardiaId: number) => number | null
  refreshGuardias: () => Promise<void>
}

// Crear el contexto
export const GuardiasContext = createContext<GuardiasContextType>({
  guardias: [],
  tareasGuardia: [],
  loading: false,
  
  addGuardia: async () => null,
  updateGuardia: async () => {},
  deleteGuardia: async () => {},
  
  addTareaGuardia: async () => {},
  updateTareaGuardia: async () => {},
  deleteTareaGuardia: async () => {},
  
  asignarGuardia: async () => false,
  firmarGuardia: async () => {},
  anularGuardia: async () => {},
  desasociarGuardiaDeAusencia: async () => false,
  
  getGuardiasByDate: () => [],
  getGuardiasByProfesor: () => [],
  getTareasByGuardia: () => [],
  canProfesorAsignarGuardia: () => false,
  getGuardiaByAusenciaId: () => undefined,
  getProfesorAusenteIdByGuardia: () => null,
  refreshGuardias: async () => {}
})

// Hook para usar el contexto
export const useGuardias = () => useContext(GuardiasContext)

// Props del proveedor
interface GuardiasProviderProps {
  children: ReactNode
}

// Componente proveedor
export const GuardiasProvider: React.FC<GuardiasProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const { ausencias, refreshAusencias } = useAusencias()
  const { lugares } = useLugares()
  const { usuarios } = useUsuarios()
  
  const [guardias, setGuardias] = useState<Guardia[]>([])
  const [tareasGuardia, setTareasGuardia] = useState<TareaGuardia[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar datos iniciales
  useEffect(() => {
    loadGuardias()
  }, [])

  // Función para cargar guardias
  const loadGuardias = async () => {
    try {
      setLoading(true)
      
      // Cargar guardias
      const guardiasData = await getAllGuardias()
      setGuardias(guardiasData.map(mapGuardiaFromDB))
      
      // Cargar tareas de guardia
      const tareasData = await getTareasGuardia()
      setTareasGuardia(tareasData.map(mapTareaGuardiaFromDB))
    } catch (error) {
      console.error("Error al cargar guardias:", error)
    } finally {
      setLoading(false)
    }
  }

  // Función para refrescar guardias
  const refreshGuardias = async () => {
    try {
      // Refrescar guardias
      await loadGuardias();
      
      // Refrescar ausencias también para mantener la sincronización
      await refreshAusencias();
    } catch (error) {
      console.error("Error al refrescar guardias:", error);
    }
  }

  // Función para añadir una guardia
  const addGuardia = async (guardia: Omit<Guardia, "id">, tarea?: string): Promise<number | null> => {
    try {
      const guardiaDB = mapGuardiaToDB(guardia)
      const newGuardia = await createGuardiaService(guardiaDB as Omit<GuardiaDB, "id">)
      
      if (newGuardia) {
        const mappedGuardia = mapGuardiaFromDB(newGuardia)
        setGuardias([...guardias, mappedGuardia])
        
        // Si se proporciona una tarea, añadirla
        if (tarea) {
          const newTarea: Omit<TareaGuardia, "id"> = {
            guardiaId: mappedGuardia.id,
            descripcionTarea: tarea
          }
          
          await addTareaGuardia(newTarea)
        }
        
        return mappedGuardia.id
      }
      
      return null
    } catch (error) {
      console.error("Error al añadir guardia:", error)
      return null
    }
  }

  // Función para actualizar una guardia
  const updateGuardia = async (id: number, guardia: Partial<Guardia>) => {
    try {
      // Convertir al formato de la base de datos
      const guardiaDB: Partial<GuardiaDB> = {}
      if (guardia.fecha !== undefined) guardiaDB.fecha = guardia.fecha
      if (guardia.tramoHorario !== undefined) guardiaDB.tramo_horario = guardia.tramoHorario
      if (guardia.tipoGuardia !== undefined) guardiaDB.tipo_guardia = guardia.tipoGuardia
      if (guardia.firmada !== undefined) guardiaDB.firmada = guardia.firmada
      if (guardia.estado !== undefined) guardiaDB.estado = guardia.estado
      if (guardia.observaciones !== undefined) guardiaDB.observaciones = guardia.observaciones || undefined
      if (guardia.lugarId !== undefined) guardiaDB.lugar_id = guardia.lugarId
      if (guardia.profesorCubridorId !== undefined) guardiaDB.profesor_cubridor_id = guardia.profesorCubridorId === null ? undefined : guardia.profesorCubridorId
      if (guardia.ausenciaId !== undefined) guardiaDB.ausencia_id = guardia.ausenciaId

      await updateGuardiaService(id, guardiaDB)
      setGuardias(guardias.map(g => g.id === id ? { ...g, ...guardia } : g))
    } catch (error) {
      console.error(`Error al actualizar guardia con ID ${id}:`, error)
    }
  }

  // Función para eliminar una guardia
  const deleteGuardia = async (id: number) => {
    try {
      await deleteGuardiaService(id)
      setGuardias(guardias.filter(g => g.id !== id))
    } catch (error) {
      console.error(`Error al eliminar guardia con ID ${id}:`, error)
    }
  }

  // Función para añadir una tarea de guardia
  const addTareaGuardia = async (tarea: Omit<TareaGuardia, "id">) => {
    try {
      const tareaDB = mapTareaGuardiaToDB(tarea)
      const newTarea = await createTareaGuardia(tareaDB as Omit<TareaGuardiaDB, "id">)
      
      if (newTarea) {
        const mappedTarea = mapTareaGuardiaFromDB(newTarea)
        setTareasGuardia([...tareasGuardia, mappedTarea])
      }
    } catch (error) {
      console.error("Error al añadir tarea de guardia:", error)
    }
  }

  // Función para actualizar una tarea de guardia
  const updateTareaGuardia = async (id: number, tarea: Partial<TareaGuardia>) => {
    try {
      // Convertir al formato de la base de datos
      const tareaDB: Partial<TareaGuardiaDB> = {}
      if (tarea.guardiaId !== undefined) tareaDB.guardia_id = tarea.guardiaId
      if (tarea.descripcionTarea !== undefined) tareaDB.descripcion = tarea.descripcionTarea

      await updateTareaGuardiaService(id, tareaDB)
      setTareasGuardia(tareasGuardia.map(t => t.id === id ? { ...t, ...tarea } : t))
    } catch (error) {
      console.error(`Error al actualizar tarea de guardia con ID ${id}:`, error)
    }
  }

  // Función para eliminar una tarea de guardia
  const deleteTareaGuardia = async (id: number) => {
    try {
      await deleteTareaGuardiaService(id)
      setTareasGuardia(tareasGuardia.filter(t => t.id !== id))
    } catch (error) {
      console.error(`Error al eliminar tarea de guardia con ID ${id}:`, error)
    }
  }

  // Función para asignar una guardia a un profesor
  const asignarGuardia = async (guardiaId: number, profesorCubridorId: number): Promise<boolean> => {
    try {
      await updateGuardia(guardiaId, {
        profesorCubridorId,
        estado: "Asignada"
      })
      
      return true
    } catch (error) {
      console.error(`Error al asignar guardia con ID ${guardiaId} al profesor con ID ${profesorCubridorId}:`, error)
      return false
    }
  }

  // Función para firmar una guardia
  const firmarGuardia = async (id: number, observaciones?: string) => {
    try {
      await firmarGuardiaService(id, observaciones)
      
      // Actualizar el estado local
      setGuardias(guardias.map(g => g.id === id ? {
        ...g,
        estado: "Firmada",
        firmada: true,
        observaciones: observaciones || g.observaciones
      } : g))
    } catch (error) {
      console.error(`Error al firmar guardia con ID ${id}:`, error)
    }
  }

  // Función para anular una guardia
  const anularGuardia = async (id: number, motivo: string) => {
    try {
      // Actualizar el estado de la guardia a "Anulada"
      await updateGuardia(id, {
        estado: "Anulada",
        observaciones: `ANULADA: ${motivo}`
      })
    } catch (error) {
      console.error(`Error al anular guardia con ID ${id}:`, error)
    }
  }

  // Función para desasociar una guardia de una ausencia
  const desasociarGuardiaDeAusencia = async (guardiaId: number): Promise<boolean> => {
    try {
      const guardia = guardias.find(g => g.id === guardiaId);
      if (!guardia || !guardia.ausenciaId) {
        console.log("No se encontró la guardia o no tiene ausencia asociada");
        return false;
      }

      // Guardar el ID de la ausencia para el mensaje de log
      const ausenciaId = guardia.ausenciaId;

      // Actualizar la guardia para eliminar la referencia a la ausencia
      // Establecemos ausenciaId explícitamente a undefined para asegurarnos de que 
      // se elimina la referencia en la base de datos
      await updateGuardia(guardiaId, {
        ausenciaId: undefined
      });

      // Actualizar también el estado local para reflejar el cambio inmediatamente
      setGuardias(guardias.map(g => {
        if (g.id === guardiaId) {
          return { ...g, ausenciaId: undefined };
        }
        return g;
      }));

      console.log(`Guardia con ID ${guardiaId} desasociada correctamente de la ausencia con ID ${ausenciaId}`);
      return true;
    } catch (error) {
      console.error(`Error al desasociar guardia con ID ${guardiaId}:`, error);
      return false;
    }
  };

  // Función para obtener guardias por fecha
  const getGuardiasByDate = (fecha: string): Guardia[] => {
    return guardias.filter(g => g.fecha === fecha)
  }

  // Función para obtener guardias por profesor
  const getGuardiasByProfesor = (profesorId: number): Guardia[] => {
    return guardias.filter(g => g.profesorCubridorId === profesorId)
  }

  // Función para obtener tareas por guardia
  const getTareasByGuardia = (guardiaId: number): TareaGuardia[] => {
    return tareasGuardia.filter(t => t.guardiaId === guardiaId)
  }

  // Función para verificar si un profesor puede asignar una guardia
  const canProfesorAsignarGuardia = (guardiaId: number, profesorId: number): boolean => {
    // Implementar lógica para verificar si un profesor puede asignar una guardia
    return true
  }

  // Función para obtener una guardia por ID de ausencia
  const getGuardiaByAusenciaId = (ausenciaId: number): Guardia | undefined => {
    return guardias.find(g => g.ausenciaId === ausenciaId)
  }

  // Función para obtener el ID del profesor ausente por ID de guardia
  const getProfesorAusenteIdByGuardia = (guardiaId: number): number | null => {
    const guardia = guardias.find(g => g.id === guardiaId)
    if (!guardia || !guardia.ausenciaId) return null
    
    const ausencia = ausencias.find(a => a.id === guardia.ausenciaId)
    return ausencia ? ausencia.profesorId : null
  }

  // Valor del contexto
  const value: GuardiasContextType = {
    guardias,
    tareasGuardia,
    loading,
    
    addGuardia,
    updateGuardia,
    deleteGuardia,
    
    addTareaGuardia,
    updateTareaGuardia,
    deleteTareaGuardia,
    
    asignarGuardia,
    firmarGuardia,
    anularGuardia,
    desasociarGuardiaDeAusencia,
    
    getGuardiasByDate,
    getGuardiasByProfesor,
    getTareasByGuardia,
    canProfesorAsignarGuardia,
    getGuardiaByAusenciaId,
    getProfesorAusenteIdByGuardia,
    refreshGuardias
  }

  return (
    <GuardiasContext.Provider value={value}>
      {children}
    </GuardiasContext.Provider>
  )
}

// Re-exportar los tipos para mantener compatibilidad
export type { Guardia, TareaGuardia }