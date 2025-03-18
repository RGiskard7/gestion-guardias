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
import { updateAusencia as updateAusenciaService } from "@/lib/ausenciasService"
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
  const addGuardia = async (guardiaData: Omit<Guardia, "id">, tarea?: string): Promise<number | null> => {
    try {
      // Mapear datos de guardia al formato de la base de datos
      const guardiaDB = mapGuardiaToDB(guardiaData as Guardia);
      
      // Llamar al servicio para crear la guardia
      const newGuardia = await createGuardiaService(guardiaDB as Omit<GuardiaDB, "id">)
      
      if (!newGuardia) {
        throw new Error("No se pudo crear la guardia. Verifica que no exista una guardia con los mismos parámetros.");
      }
      
      // Si hay tarea, añadirla a la guardia
      if (tarea) {
        const newTarea: Omit<TareaGuardia, "id"> = {
          guardiaId: newGuardia.id,
          descripcionTarea: tarea
        }
        await addTareaGuardia(newTarea)
      }
      
      // Mapear la nueva guardia de vuelta al formato de la aplicación
      const guardia = mapGuardiaFromDB(newGuardia)
      
      // Actualizar el estado guardias
      setGuardias(prevGuardias => [...prevGuardias, guardia])
      
      return guardia.id
    } catch (error) {
      console.error('Error en addGuardia:', error)
      
      // Propagar el error para que se pueda manejar en la interfaz de usuario
      if (error instanceof Error) {
        throw error
      } else {
        throw new Error("Error al crear la guardia")
      }
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
      // Verificar si la guardia tiene una ausencia asociada
      const guardia = guardias.find(g => g.id === id);
      if (!guardia) {
        console.error(`No se encontró la guardia con ID ${id}`);
        return;
      }
      
      // Si la guardia tiene una ausencia asociada, desasociar la guardia y actualizar el estado de la ausencia
      if (guardia.ausenciaId) {
        const ausenciaId = guardia.ausenciaId;
        
        // Buscar la ausencia en el contexto de ausencias
        const ausencia = ausencias.find(a => a.id === ausenciaId);
        if (ausencia) {
          // Actualizar la ausencia a estado "Pendiente"
          await updateAusenciaService(ausenciaId, { 
            estado: DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE,
            observaciones: `${ausencia.observaciones || ''}\nGuardia anulada: ${motivo}`
          });
          
          // Refrescar ausencias para reflejar los cambios
          await refreshAusencias();
        }
      }
      
      // Actualizar el estado de la guardia a "Anulada"
      await updateGuardia(id, {
        estado: "Anulada",
        observaciones: `ANULADA: ${motivo}`,
        ausenciaId: undefined // Eliminar la referencia a la ausencia
      });
      
      // Refrescar guardias para reflejar los cambios
      await refreshGuardias();
    } catch (error) {
      console.error(`Error al anular guardia con ID ${id}:`, error);
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

      // Usar directamente updateGuardia que llamará a updateGuardiaService
      // y se encargará de establecer ausencia_id a NULL correctamente
      await updateGuardia(guardiaId, {
        ausenciaId: undefined  // updateGuardia maneja esto correctamente convirtiéndolo a NULL en la BD
      });

      // Actualizar también el estado local para reflejar el cambio inmediatamente
      setGuardias(guardias.map(g => {
        if (g.id === guardiaId) {
          // Crear una copia y eliminar la propiedad ausenciaId
          const updatedGuardia = { ...g };
          updatedGuardia.ausenciaId = undefined;
          return updatedGuardia;
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
    try {
      // Verificar si el profesor existe
      if (!profesorId) return false;
      
      // Obtener la guardia
      const guardia = guardias.find(g => g.id === guardiaId);
      if (!guardia) return false;
      
      // Obtener el día de la semana de la guardia
      const fecha = new Date(guardia.fecha);
      const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
      
      // Verificar si el profesor tiene disponibilidad en ese día y tramo horario
      // Esta verificación deberá hacerse en el componente que llama a esta función
      // ya que aquí no tenemos acceso al contexto de horarios.
      
      // Verificar si ya tiene una guardia asignada para este mismo tramo horario y fecha
      const guardiasMismoTramo = guardias.filter(g => 
        g.profesorCubridorId === profesorId && 
        g.fecha === guardia.fecha && 
        g.tramoHorario === guardia.tramoHorario &&
        (g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA || g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA)
      );
      
      if (guardiasMismoTramo.length > 0) {
        console.log(`El profesor ${profesorId} ya tiene una guardia asignada en el mismo tramo horario para la fecha ${guardia.fecha}`);
        return false;
      }
      
      // Verificar el límite de guardias semanales (máximo 6 guardias por semana)
      // Obtener todas las guardias asignadas al profesor
      const guardiasProfesor = guardias.filter(g => 
        g.profesorCubridorId === profesorId && 
        (g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA || g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA)
      );
      
      if (guardiasProfesor.length === 0) return true; // Si no tiene guardias asignadas, puede tomar esta
      
      // Obtener la fecha de inicio de la semana (lunes) de la guardia actual
      const diaGuardia = new Date(guardia.fecha);
      const diaSemanaNum = diaGuardia.getDay(); // 0 es domingo, 1 es lunes, etc.
      const lunes = new Date(diaGuardia);
      lunes.setDate(diaGuardia.getDate() - (diaSemanaNum === 0 ? 6 : diaSemanaNum - 1));
      lunes.setHours(0, 0, 0, 0);
      
      // Obtener la fecha de fin de la semana (domingo)
      const domingo = new Date(lunes);
      domingo.setDate(lunes.getDate() + 6);
      domingo.setHours(23, 59, 59, 999);
      
      // Convertir fechas a formato ISO para comparar
      const lunesISO = lunes.toISOString().split('T')[0];
      const domingoISO = domingo.toISOString().split('T')[0];
      
      // Contar guardias en esa semana
      const guardiasEnSemana = guardiasProfesor.filter(g => {
        const fechaGuardia = g.fecha;
        return fechaGuardia >= lunesISO && fechaGuardia <= domingoISO;
      });
      
      // Verificar si ya tiene 6 o más guardias asignadas esta semana
      if (guardiasEnSemana.length >= 6) {
        console.log(`El profesor ${profesorId} ya tiene ${guardiasEnSemana.length} guardias esta semana (límite: 6)`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error al verificar si el profesor puede asignar la guardia:", error);
      return false;
    }
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