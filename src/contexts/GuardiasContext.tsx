"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import { useAuth } from "./AuthContext"
import { getAllGuardias, getGuardiaById, getGuardiasByFecha, getGuardiasByProfesorCubridor as fetchGuardiasByProfesor, firmarGuardia as firmarGuardiaService, createGuardia as createGuardiaService, updateGuardia as updateGuardiaService, deleteGuardia as deleteGuardiaService, type Guardia as GuardiaDB } from "@/lib/guardiasService"
import { getUsuarios, getUsuarioById as fetchUsuarioById, getUsuarioByEmail, createUsuario, updateUsuario as updateUsuarioService, deleteUsuario as deleteUsuarioService, type Usuario as UsuarioDB } from "@/lib/usuariosService"
import { getHorarios, getHorariosByProfesor as fetchHorariosByProfesor, createHorario, updateHorario as updateHorarioService, deleteHorario as deleteHorarioService, type Horario as HorarioDB } from "@/lib/horariosService"
import { getLugares, getLugarById as fetchLugarById, createLugar, updateLugar as updateLugarService, deleteLugar as deleteLugarService, type Lugar as LugarDB } from "@/lib/lugaresService"
import { getTareasGuardia, getTareasByGuardia as fetchTareasByGuardia, createTareaGuardia, updateTareaGuardia as updateTareaGuardiaService, deleteTareaGuardia as deleteTareaGuardiaService, type TareaGuardia as TareaGuardiaDB } from "@/lib/tareasGuardiaService"
import { DB_CONFIG } from "@/lib/db-config"

// Define types adaptados para mantener compatibilidad con el código existente
export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: "admin" | "profesor"
  activo: boolean
}

export interface Horario {
  id: number
  profesorId: number
  diaSemana: string
  tramoHorario: string
}

export interface Lugar {
  id: number
  codigo: string
  descripcion: string
  tipoLugar: string
}

export interface Guardia {
  id: number
  fecha: string
  tramoHorario: string
  tipoGuardia: string
  firmada: boolean
  estado: "Pendiente" | "Asignada" | "Firmada" | "Anulada"
  observaciones: string
  lugarId: number
  profesorAusenteId: number | null
  profesorCubridorId: number | null
}

export interface TareaGuardia {
  id: number
  guardiaId: number
  descripcionTarea: string
}

// Funciones de mapeo entre los tipos de la base de datos y los tipos del contexto
function mapUsuarioFromDB(usuario: UsuarioDB): Usuario {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol as "admin" | "profesor",
    activo: usuario.activo
  }
}

function mapHorarioFromDB(horario: HorarioDB): Horario {
  return {
    id: horario.id,
    profesorId: horario.profesor_id,
    diaSemana: horario.dia_semana,
    tramoHorario: horario.tramo_horario
  }
}

function mapHorarioToDB(horario: Omit<Horario, "id">): Omit<HorarioDB, "id"> {
  return {
    profesor_id: horario.profesorId,
    dia_semana: horario.diaSemana,
    tramo_horario: horario.tramoHorario
  }
}

function mapLugarFromDB(lugar: LugarDB): Lugar {
  return {
    id: lugar.id,
    codigo: lugar.codigo,
    descripcion: lugar.descripcion,
    tipoLugar: lugar.tipo_lugar
  }
}

function mapLugarToDB(lugar: Omit<Lugar, "id">): Omit<LugarDB, "id"> {
  return {
    codigo: lugar.codigo,
    descripcion: lugar.descripcion,
    tipo_lugar: lugar.tipoLugar
  }
}

function mapGuardiaFromDB(guardia: GuardiaDB): Guardia {
  return {
    id: guardia.id,
    fecha: guardia.fecha,
    tramoHorario: guardia.tramo_horario,
    tipoGuardia: guardia.tipo_guardia,
    firmada: guardia.firmada,
    estado: guardia.estado as "Pendiente" | "Asignada" | "Firmada" | "Anulada",
    observaciones: guardia.observaciones || "",
    lugarId: guardia.lugar_id,
    profesorAusenteId: guardia.profesor_ausente_id || null,
    profesorCubridorId: guardia.profesor_cubridor_id || null
  }
}

function mapGuardiaToDB(guardia: Omit<Guardia, "id">): Omit<GuardiaDB, "id"> {
  // Asegurarnos de que profesorCubridorId tenga un valor válido
  const profesorCubridorId = guardia.profesorCubridorId === null ? 
    1 : // Valor por defecto si es null
    guardia.profesorCubridorId;
  
  return {
    fecha: guardia.fecha,
    tramo_horario: guardia.tramoHorario,
    tipo_guardia: guardia.tipoGuardia,
    firmada: guardia.firmada,
    estado: guardia.estado,
    observaciones: guardia.observaciones,
    lugar_id: guardia.lugarId,
    profesor_ausente_id: guardia.profesorAusenteId === null ? undefined : guardia.profesorAusenteId,
    profesor_cubridor_id: profesorCubridorId
  }
}

function mapTareaGuardiaFromDB(tarea: TareaGuardiaDB): TareaGuardia {
  return {
    id: tarea.id,
    guardiaId: tarea.guardia_id,
    descripcionTarea: tarea.descripcion
  }
}

function mapTareaGuardiaToDB(tarea: Omit<TareaGuardia, "id">): Omit<TareaGuardiaDB, "id"> {
  return {
    guardia_id: tarea.guardiaId,
    descripcion: tarea.descripcionTarea
  }
}

// Define context type
interface GuardiasContextType {
  usuarios: Usuario[]
  horarios: Horario[]
  lugares: Lugar[]
  guardias: Guardia[]
  tareasGuardia: TareaGuardia[]
  loading: boolean

  // CRUD operations for usuarios
  addUsuario: (usuario: Omit<Usuario, "id">) => Promise<{ success: boolean, error?: string }>
  updateUsuario: (id: number, usuario: Partial<Usuario>) => Promise<void>
  deleteUsuario: (id: number) => Promise<void>

  // CRUD operations for horarios
  addHorario: (horario: Omit<Horario, "id">) => Promise<void>
  updateHorario: (id: number, horario: Partial<Horario>) => Promise<void>
  deleteHorario: (id: number) => Promise<void>

  // CRUD operations for lugares
  addLugar: (lugar: Omit<Lugar, "id">) => Promise<void>
  updateLugar: (id: number, lugar: Partial<Lugar>) => Promise<void>
  deleteLugar: (id: number) => Promise<void>

  // CRUD operations for guardias
  addGuardia: (guardia: Omit<Guardia, "id">, tarea?: string) => Promise<number | null>
  updateGuardia: (id: number, guardia: Partial<Guardia>) => Promise<void>
  deleteGuardia: (id: number) => Promise<void>
  anularGuardia: (id: number, motivo: string) => Promise<void>
  firmarGuardia: (id: number, observaciones?: string) => Promise<void>

  // CRUD operations for tareasGuardia
  addTareaGuardia: (tarea: Omit<TareaGuardia, "id">) => Promise<void>
  updateTareaGuardia: (id: number, tarea: Partial<TareaGuardia>) => Promise<void>
  deleteTareaGuardia: (id: number) => Promise<void>

  // Business logic
  asignarGuardia: (guardiaId: number, profesorCubridorId: number) => Promise<boolean>
  getGuardiasByDate: (fecha: string) => Guardia[]
  getGuardiasByProfesor: (profesorId: number) => Guardia[]
  getLugarById: (id: number) => Lugar | undefined
  getUsuarioById: (id: number) => Usuario | undefined
  getHorariosByProfesor: (profesorId: number) => Horario[]
  getTareasByGuardia: (guardiaId: number) => TareaGuardia[]
  canProfesorAsignarGuardia: (guardiaId: number, profesorId: number) => boolean
  refreshData: () => Promise<void>
}

// Create context with default values
const GuardiasContext = createContext<GuardiasContextType>({
  usuarios: [],
  horarios: [],
  lugares: [],
  guardias: [],
  tareasGuardia: [],
  loading: true,

  addUsuario: async () => ({ success: false }),
  updateUsuario: async () => {},
  deleteUsuario: async () => {},

  addHorario: async () => {},
  updateHorario: async () => {},
  deleteHorario: async () => {},

  addLugar: async () => {},
  updateLugar: async () => {},
  deleteLugar: async () => {},

  addGuardia: async () => null,
  updateGuardia: async () => {},
  deleteGuardia: async () => {},

  addTareaGuardia: async () => {},
  updateTareaGuardia: async () => {},
  deleteTareaGuardia: async () => {},

  asignarGuardia: async () => false,
  firmarGuardia: async () => {},
  anularGuardia: async () => {},

  getGuardiasByDate: () => [],
  getGuardiasByProfesor: () => [],
  getLugarById: () => undefined,
  getUsuarioById: () => undefined,
  getHorariosByProfesor: () => [],
  getTareasByGuardia: () => [],
  canProfesorAsignarGuardia: () => false,
  refreshData: async () => {},
})

interface GuardiasProviderProps {
  children: ReactNode
}

export const GuardiasProvider: React.FC<GuardiasProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  // State for each entity
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [lugares, setLugares] = useState<Lugar[]>([])
  const [guardias, setGuardias] = useState<Guardia[]>([])
  const [tareasGuardia, setTareasGuardia] = useState<TareaGuardia[]>([])

  // Función para cargar todos los datos desde Supabase
  const loadAllData = async () => {
    setLoading(true)
    try {
      // Cargar usuarios
      const usuariosData = await getUsuarios()
      setUsuarios(usuariosData.map(mapUsuarioFromDB))

      // Cargar horarios
      const horariosData = await getHorarios()
      setHorarios(horariosData.map(mapHorarioFromDB))

      // Cargar lugares
      const lugaresData = await getLugares()
      setLugares(lugaresData.map(mapLugarFromDB))

      // Cargar guardias
      const guardiasData = await getAllGuardias()
      setGuardias(guardiasData.map(mapGuardiaFromDB))

      // Cargar tareas de guardia
      const tareasData = await getTareasGuardia()
      setTareasGuardia(tareasData.map(mapTareaGuardiaFromDB))
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAllData()
  }, [])

  // CRUD operations for usuarios
  const addUsuario = async (usuario: Omit<Usuario, "id">) => {
    try {
      // Verificar si ya existe un usuario con el mismo email
      const existingUser = await getUsuarioByEmail(usuario.email);
      
      if (existingUser) {
        console.error("Error: Ya existe un usuario con este email");
        return { success: false, error: "Ya existe un usuario con este email" };
      }
      
      const newUsuario = await createUsuario({
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo
      });
      
      if (newUsuario) {
        setUsuarios([...usuarios, mapUsuarioFromDB(newUsuario)]);
        return { success: true };
      } else {
        return { success: false, error: "No se pudo crear el usuario" };
      }
    } catch (error) {
      console.error("Error al añadir usuario:", error);
      return { success: false, error: "Error al añadir usuario" };
    }
  }

  const updateUsuario = async (id: number, usuario: Partial<Usuario>) => {
    try {
      const success = await updateUsuarioService(id, usuario)
      if (success) {
        setUsuarios(usuarios.map(u => u.id === id ? { ...u, ...usuario } : u))
      }
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error)
    }
  }

  const deleteUsuario = async (id: number) => {
    try {
      // En una aplicación real, es mejor marcar como inactivo que eliminar
      await updateUsuarioService(id, { activo: false })
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, activo: false } : u))
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error)
    }
  }

  // CRUD operations for horarios
  const addHorario = async (horario: Omit<Horario, "id">) => {
    try {
      console.log('Añadiendo horario en el contexto:', horario);
      
      // Asegurarse de que profesorId es un número
      const profesorId = typeof horario.profesorId === 'string' 
        ? Number(horario.profesorId) 
        : horario.profesorId;
      
      if (isNaN(profesorId)) {
        console.error('Error: profesorId debe ser un número válido, recibido:', horario.profesorId);
        return;
      }
      
      const horarioToCreate = mapHorarioToDB({
        ...horario,
        profesorId: profesorId
      });
      
      console.log('Horario mapeado para la BD:', horarioToCreate);
      
      const newHorario = await createHorario(horarioToCreate);
      
      // Verificar si se creó el horario correctamente
      if (newHorario !== null) {
        setHorarios([...horarios, mapHorarioFromDB(newHorario)]);
        console.log('Horario añadido con éxito:', newHorario);
      } else {
        console.error('No se pudo crear el horario');
      }
    } catch (error) {
      console.error("Error al añadir horario:", error);
    }
  }

  const updateHorario = async (id: number, horario: Partial<Horario>) => {
    try {
      // Convertir las propiedades al formato de la base de datos
      const horarioDB: Partial<HorarioDB> = {}
      if (horario.profesorId !== undefined) horarioDB.profesor_id = horario.profesorId
      if (horario.diaSemana !== undefined) horarioDB.dia_semana = horario.diaSemana
      if (horario.tramoHorario !== undefined) horarioDB.tramo_horario = horario.tramoHorario

      const success = await updateHorarioService(id, horarioDB)
      if (success) {
        setHorarios(horarios.map(h => h.id === id ? { ...h, ...horario } : h))
      }
    } catch (error) {
      console.error(`Error al actualizar horario con ID ${id}:`, error)
    }
  }

  const deleteHorario = async (id: number) => {
    try {
      const success = await deleteHorarioService(id)
      if (success) {
        setHorarios(horarios.filter(h => h.id !== id))
      }
    } catch (error) {
      console.error(`Error al eliminar horario con ID ${id}:`, error)
    }
  }

  // CRUD operations for lugares
  const addLugar = async (lugar: Omit<Lugar, "id">) => {
    try {
      const newLugar = await createLugar(mapLugarToDB(lugar))
      if (newLugar) {
        setLugares([...lugares, mapLugarFromDB(newLugar)])
      }
    } catch (error) {
      console.error("Error al añadir lugar:", error)
    }
  }

  const updateLugar = async (id: number, lugar: Partial<Lugar>) => {
    try {
      // Convertir las propiedades al formato de la base de datos
      const lugarDB: Partial<LugarDB> = {}
      if (lugar.codigo !== undefined) lugarDB.codigo = lugar.codigo
      if (lugar.descripcion !== undefined) lugarDB.descripcion = lugar.descripcion
      if (lugar.tipoLugar !== undefined) lugarDB.tipo_lugar = lugar.tipoLugar

      const success = await updateLugarService(id, lugarDB)
      if (success) {
        setLugares(lugares.map(l => l.id === id ? { ...l, ...lugar } : l))
      }
    } catch (error) {
      console.error(`Error al actualizar lugar con ID ${id}:`, error)
    }
  }

  const deleteLugar = async (id: number) => {
    try {
      const success = await deleteLugarService(id)
      if (success) {
        setLugares(lugares.filter(l => l.id !== id))
      }
    } catch (error) {
      console.error(`Error al eliminar lugar con ID ${id}:`, error)
    }
  }

  // CRUD operations for guardias
  const addGuardia = async (guardia: Omit<Guardia, "id">, tarea?: string): Promise<number | null> => {
    try {
      // Asegurarnos de que profesorCubridorId tenga un valor válido
      const guardiaToCreate = {
        ...guardia,
        // Si profesorCubridorId es null, asignar un valor por defecto (por ejemplo, el primer profesor disponible)
        profesorCubridorId: guardia.profesorCubridorId === null ? 
          (usuarios.length > 0 ? usuarios[0].id : 1) : guardia.profesorCubridorId
      };
      
      console.log('Añadiendo guardia:', guardiaToCreate);
      
      // Convertir al formato de la base de datos
      const guardiaDB = mapGuardiaToDB(guardiaToCreate);
      
      console.log('Guardia mapeada para la BD:', guardiaDB);

      // Usar el servicio para crear la guardia
      const newGuardia = await createGuardiaService(guardiaDB);
      
      if (newGuardia) {
        const mappedGuardia = mapGuardiaFromDB(newGuardia);
        setGuardias([...guardias, mappedGuardia]);
        
        // Si se proporcionó una tarea, crearla asociada a esta guardia
        if (tarea) {
          await addTareaGuardia({
            guardiaId: mappedGuardia.id,
            descripcionTarea: tarea
          });
        }
        
        return mappedGuardia.id;
      }
      
      return null;
    } catch (error) {
      console.error("Error al añadir guardia:", error);
      return null;
    }
  }

  const updateGuardia = async (id: number, guardia: Partial<Guardia>) => {
    try {
      // Convertir al formato de la base de datos
      const guardiaDB: Partial<GuardiaDB> = {}
      if (guardia.fecha !== undefined) guardiaDB.fecha = guardia.fecha
      if (guardia.tramoHorario !== undefined) guardiaDB.tramo_horario = guardia.tramoHorario
      if (guardia.tipoGuardia !== undefined) guardiaDB.tipo_guardia = guardia.tipoGuardia
      if (guardia.firmada !== undefined) guardiaDB.firmada = guardia.firmada
      if (guardia.estado !== undefined) guardiaDB.estado = guardia.estado
      if (guardia.observaciones !== undefined) guardiaDB.observaciones = guardia.observaciones
      if (guardia.lugarId !== undefined) guardiaDB.lugar_id = guardia.lugarId
      if (guardia.profesorAusenteId !== undefined) {
        guardiaDB.profesor_ausente_id = guardia.profesorAusenteId === null ? undefined : guardia.profesorAusenteId
      }
      if (guardia.profesorCubridorId !== undefined) {
        guardiaDB.profesor_cubridor_id = guardia.profesorCubridorId === null ? undefined : guardia.profesorCubridorId
      }

      // Usar el servicio para actualizar la guardia
      const success = await updateGuardiaService(id, guardiaDB)
      if (success) {
        setGuardias(guardias.map(g => g.id === id ? { ...g, ...guardia } : g))
      }
    } catch (error) {
      console.error(`Error al actualizar guardia con ID ${id}:`, error)
    }
  }

  const deleteGuardia = async (id: number) => {
    try {
      // Usar el servicio para eliminar la guardia
      await deleteGuardiaService(id);
      // Actualizar el estado local
      setGuardias(guardias.filter(g => g.id !== id));
    } catch (error) {
      console.error(`Error al eliminar guardia con ID ${id}:`, error);
    }
  }

  // CRUD operations for tareasGuardia
  const addTareaGuardia = async (tarea: Omit<TareaGuardia, "id">) => {
    try {
      const newTarea = await createTareaGuardia(mapTareaGuardiaToDB(tarea));
      
      // Verificar si se creó la tarea correctamente
      if (newTarea !== null) {
        setTareasGuardia([...tareasGuardia, mapTareaGuardiaFromDB(newTarea)]);
        console.log('Tarea de guardia añadida con éxito:', newTarea);
      } else {
        console.error('No se pudo crear la tarea de guardia');
      }
    } catch (error) {
      console.error("Error al añadir tarea de guardia:", error);
    }
  }

  const updateTareaGuardia = async (id: number, tarea: Partial<TareaGuardia>) => {
    try {
      // Convertir las propiedades al formato de la base de datos
      const tareaDB: Partial<TareaGuardiaDB> = {}
      if (tarea.guardiaId !== undefined) tareaDB.guardia_id = tarea.guardiaId
      if (tarea.descripcionTarea !== undefined) tareaDB.descripcion = tarea.descripcionTarea

      const success = await updateTareaGuardiaService(id, tareaDB)
      if (success) {
        setTareasGuardia(tareasGuardia.map(t => t.id === id ? { ...t, ...tarea } : t))
      }
    } catch (error) {
      console.error(`Error al actualizar tarea de guardia con ID ${id}:`, error)
    }
  }

  const deleteTareaGuardia = async (id: number) => {
    try {
      const success = await deleteTareaGuardiaService(id)
      if (success) {
        setTareasGuardia(tareasGuardia.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error(`Error al eliminar tarea de guardia con ID ${id}:`, error)
    }
  }

  // Business logic
  const asignarGuardia = async (guardiaId: number, profesorCubridorId: number): Promise<boolean> => {
    // Verificar si el profesor puede ser asignado a esta guardia
    if (!canProfesorAsignarGuardia(guardiaId, profesorCubridorId)) {
      return false;
    }

    // Actualizar la guardia directamente usando updateGuardia
    try {
      // Convertir al formato de la base de datos
      const guardiaDB: Partial<GuardiaDB> = {
        profesor_cubridor_id: profesorCubridorId,
        estado: DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA
      };
      
      // Actualizar la guardia
      const guardiaActualizada = await updateGuardiaService(guardiaId, guardiaDB);
      
      // Actualizar el estado local
      setGuardias(prevGuardias => 
        prevGuardias.map(g => g.id === guardiaId ? mapGuardiaFromDB(guardiaActualizada) : g)
      );
      
      return true;
    } catch (error) {
      console.error(`Error al asignar guardia ${guardiaId} al profesor ${profesorCubridorId}:`, error);
      return false;
    }
  }

  const firmarGuardia = async (guardiaId: number, observaciones?: string) => {
    try {
      // Usar el servicio de guardiasService para firmar la guardia
      const guardiaActualizada = await firmarGuardiaService(guardiaId, observaciones);
      
      // Actualizar el estado local con la guardia actualizada
      setGuardias(guardias.map(g => g.id === guardiaId ? mapGuardiaFromDB(guardiaActualizada) : g));
    } catch (error) {
      console.error(`Error al firmar guardia ${guardiaId}:`, error);
    }
  }

  const anularGuardia = async (guardiaId: number, motivo: string) => {
    try {
      // Actualizar el estado de la guardia a "Anulada"
      await updateGuardia(guardiaId, { estado: "Anulada" })
    } catch (error) {
      console.error(`Error al anular guardia ${guardiaId}:`, error)
    }
  }

  // Helper functions
  const getGuardiasByDate = (fecha: string): Guardia[] => {
    return guardias.filter(g => g.fecha === fecha)
  }

  const getGuardiasByProfesor = (profesorId: number): Guardia[] => {
    return guardias.filter(g => g.profesorAusenteId === profesorId || g.profesorCubridorId === profesorId)
  }

  const getLugarById = (id: number): Lugar | undefined => {
    return lugares.find(l => l.id === id)
  }

  const getUsuarioById = (id: number): Usuario | undefined => {
    return usuarios.find(u => u.id === id)
  }

  const getHorariosByProfesor = (profesorId: number): Horario[] => {
    return horarios.filter(h => h.profesorId === profesorId)
  }

  const getTareasByGuardia = (guardiaId: number): TareaGuardia[] => {
    return tareasGuardia.filter(t => t.guardiaId === guardiaId)
  }

  const canProfesorAsignarGuardia = (guardiaId: number, profesorId: number): boolean => {
    const guardia = guardias.find(g => g.id === guardiaId)
    if (!guardia) return false

    // Check if profesor has this tramo in their horario
    const profesorHorarios = getHorariosByProfesor(profesorId)
    const diaSemana = new Date(guardia.fecha).toLocaleDateString("es-ES", { weekday: "long" })
    const tieneHorario = profesorHorarios.some(
      h => h.diaSemana.toLowerCase() === diaSemana.toLowerCase() && h.tramoHorario === guardia.tramoHorario
    )

    if (!tieneHorario) return false

    // Check if profesor already has a guardia in this tramo
    const guardiasMismoTramo = guardias.filter(
      g => g.fecha === guardia.fecha &&
          g.tramoHorario === guardia.tramoHorario &&
          g.profesorCubridorId === profesorId &&
          g.estado !== "Anulada"
    )

    if (guardiasMismoTramo.length > 0) return false

    // Check if profesor already has 6 guardias in this week
    const fechaGuardia = new Date(guardia.fecha)
    const inicioSemana = new Date(fechaGuardia)
    inicioSemana.setDate(fechaGuardia.getDate() - fechaGuardia.getDay() + (fechaGuardia.getDay() === 0 ? -6 : 1)) // Lunes
    inicioSemana.setHours(0, 0, 0, 0)
    
    const finSemana = new Date(inicioSemana)
    finSemana.setDate(inicioSemana.getDate() + 6) // Domingo
    finSemana.setHours(23, 59, 59, 999)
    
    const guardiasEnSemana = guardias.filter(
      g => {
        const fechaG = new Date(g.fecha)
        return fechaG >= inicioSemana && 
               fechaG <= finSemana && 
               g.profesorCubridorId === profesorId && 
               (g.estado === "Asignada" || g.estado === "Firmada")
      }
    )
    
    if (guardiasEnSemana.length >= 6) {
      console.log(`El profesor ${profesorId} ya tiene ${guardiasEnSemana.length} guardias esta semana. No puede asignarse más.`)
      return false
    }

    // All checks passed
    return true
  }

  // Función para recargar todos los datos
  const refreshData = async () => {
    await loadAllData()
  }

  return (
    <GuardiasContext.Provider
      value={{
        usuarios,
        horarios,
        lugares,
        guardias,
        tareasGuardia,
        loading,

        addUsuario,
        updateUsuario,
        deleteUsuario,

        addHorario,
        updateHorario,
        deleteHorario,

        addLugar,
        updateLugar,
        deleteLugar,

        addGuardia,
        updateGuardia,
        deleteGuardia,

        addTareaGuardia,
        updateTareaGuardia,
        deleteTareaGuardia,

        asignarGuardia,
        firmarGuardia,
        anularGuardia,

        getGuardiasByDate,
        getGuardiasByProfesor,
        getLugarById,
        getUsuarioById,
        getHorariosByProfesor,
        getTareasByGuardia,
        canProfesorAsignarGuardia,
        refreshData
      }}
    >
      {children}
    </GuardiasContext.Provider>
  )
}

// Custom hook to use guardias context
export const useGuardias = () => useContext(GuardiasContext)

