"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import { useAuth } from "./AuthContext"

// Define types
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

// Define context type
interface GuardiasContextType {
  usuarios: Usuario[]
  horarios: Horario[]
  lugares: Lugar[]
  guardias: Guardia[]
  tareasGuardia: TareaGuardia[]

  // CRUD operations for usuarios
  addUsuario: (usuario: Omit<Usuario, "id">) => void
  updateUsuario: (id: number, usuario: Partial<Usuario>) => void
  deleteUsuario: (id: number) => void

  // CRUD operations for horarios
  addHorario: (horario: Omit<Horario, "id">) => void
  updateHorario: (id: number, horario: Partial<Horario>) => void
  deleteHorario: (id: number) => void

  // CRUD operations for lugares
  addLugar: (lugar: Omit<Lugar, "id">) => void
  updateLugar: (id: number, lugar: Partial<Lugar>) => void
  deleteLugar: (id: number) => void

  // CRUD operations for guardias
  addGuardia: (guardia: Omit<Guardia, "id">) => void
  updateGuardia: (id: number, guardia: Partial<Guardia>) => void
  deleteGuardia: (id: number) => void

  // CRUD operations for tareasGuardia
  addTareaGuardia: (tarea: Omit<TareaGuardia, "id">) => void
  updateTareaGuardia: (id: number, tarea: Partial<TareaGuardia>) => void
  deleteTareaGuardia: (id: number) => void

  // Business logic
  asignarGuardia: (guardiaId: number, profesorCubridorId: number) => boolean
  firmarGuardia: (guardiaId: number) => void
  anularGuardia: (guardiaId: number) => void

  // Helper functions
  getGuardiasByDate: (fecha: string) => Guardia[]
  getGuardiasByProfesor: (profesorId: number) => Guardia[]
  getLugarById: (id: number) => Lugar | undefined
  getUsuarioById: (id: number) => Usuario | undefined
  getHorariosByProfesor: (profesorId: number) => Horario[]
  getTareasByGuardia: (guardiaId: number) => TareaGuardia[]
  canProfesorAsignarGuardia: (guardiaId: number, profesorId: number) => boolean
}

// Create context with default values
const GuardiasContext = createContext<GuardiasContextType>({
  usuarios: [],
  horarios: [],
  lugares: [],
  guardias: [],
  tareasGuardia: [],

  addUsuario: () => {},
  updateUsuario: () => {},
  deleteUsuario: () => {},

  addHorario: () => {},
  updateHorario: () => {},
  deleteHorario: () => {},

  addLugar: () => {},
  updateLugar: () => {},
  deleteLugar: () => {},

  addGuardia: () => {},
  updateGuardia: () => {},
  deleteGuardia: () => {},

  addTareaGuardia: () => {},
  updateTareaGuardia: () => {},
  deleteTareaGuardia: () => {},

  asignarGuardia: () => false,
  firmarGuardia: () => {},
  anularGuardia: () => {},

  getGuardiasByDate: () => [],
  getGuardiasByProfesor: () => [],
  getLugarById: () => undefined,
  getUsuarioById: () => undefined,
  getHorariosByProfesor: () => [],
  getTareasByGuardia: () => [],
  canProfesorAsignarGuardia: () => false,
})

// Mock data
const mockUsuarios: Usuario[] = [
  {
    id: 1,
    nombre: "Admin Usuario",
    email: "admin@instituto.es",
    rol: "admin",
    activo: true,
  },
  {
    id: 2,
    nombre: "Profesor Ejemplo",
    email: "profesor@instituto.es",
    rol: "profesor",
    activo: true,
  },
  {
    id: 3,
    nombre: "Profesor Dos",
    email: "profesor2@instituto.es",
    rol: "profesor",
    activo: true,
  },
]

const mockHorarios: Horario[] = [
  { id: 1, profesorId: 2, diaSemana: "Lunes", tramoHorario: "1ª hora" },
  { id: 2, profesorId: 2, diaSemana: "Martes", tramoHorario: "3ª hora" },
  { id: 3, profesorId: 3, diaSemana: "Lunes", tramoHorario: "2ª hora" },
  { id: 4, profesorId: 3, diaSemana: "Miércoles", tramoHorario: "4ª hora" },
]

const mockLugares: Lugar[] = [
  { id: 1, codigo: "A-01", descripcion: "Aula 1ºA", tipoLugar: "Aula" },
  { id: 2, codigo: "A-02", descripcion: "Aula 1ºB", tipoLugar: "Aula" },
  { id: 3, codigo: "P-01", descripcion: "Patio Principal", tipoLugar: "Patio" },
  { id: 4, codigo: "L-01", descripcion: "Laboratorio Física", tipoLugar: "Laboratorio" },
]

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split("T")[0]
const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0]

const mockGuardias: Guardia[] = [
  {
    id: 1,
    fecha: today,
    tramoHorario: "1ª hora",
    tipoGuardia: "Aula",
    firmada: false,
    estado: "Pendiente",
    observaciones: "",
    lugarId: 1,
    profesorAusenteId: 2,
    profesorCubridorId: null,
  },
  {
    id: 2,
    fecha: today,
    tramoHorario: "2ª hora",
    tipoGuardia: "Aula",
    firmada: true,
    estado: "Firmada",
    observaciones: "",
    lugarId: 2,
    profesorAusenteId: 3,
    profesorCubridorId: 2,
  },
  {
    id: 3,
    fecha: tomorrow,
    tramoHorario: "3ª hora",
    tipoGuardia: "Patio",
    firmada: false,
    estado: "Asignada",
    observaciones: "Vigilancia especial zona norte",
    lugarId: 3,
    profesorAusenteId: null,
    profesorCubridorId: 3,
  },
]

const mockTareasGuardia: TareaGuardia[] = [
  {
    id: 1,
    guardiaId: 1,
    descripcionTarea: "Los alumnos deben realizar los ejercicios 1-5 de la página 45.",
  },
  {
    id: 2,
    guardiaId: 2,
    descripcionTarea: "Lectura del capítulo 3 y resumen en el cuaderno.",
  },
]

interface GuardiasProviderProps {
  children: ReactNode
}

export const GuardiasProvider: React.FC<GuardiasProviderProps> = ({ children }) => {
  const { user } = useAuth()

  // State for each entity
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios)
  const [horarios, setHorarios] = useState<Horario[]>(mockHorarios)
  const [lugares, setLugares] = useState<Lugar[]>(mockLugares)
  const [guardias, setGuardias] = useState<Guardia[]>(mockGuardias)
  const [tareasGuardia, setTareasGuardia] = useState<TareaGuardia[]>(mockTareasGuardia)

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUsuarios = localStorage.getItem("usuarios")
    const storedHorarios = localStorage.getItem("horarios")
    const storedLugares = localStorage.getItem("lugares")
    const storedGuardias = localStorage.getItem("guardias")
    const storedTareasGuardia = localStorage.getItem("tareasGuardia")

    if (storedUsuarios) setUsuarios(JSON.parse(storedUsuarios))
    if (storedHorarios) setHorarios(JSON.parse(storedHorarios))
    if (storedLugares) setLugares(JSON.parse(storedLugares))
    if (storedGuardias) setGuardias(JSON.parse(storedGuardias))
    if (storedTareasGuardia) setTareasGuardia(JSON.parse(storedTareasGuardia))
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("usuarios", JSON.stringify(usuarios))
    localStorage.setItem("horarios", JSON.stringify(horarios))
    localStorage.setItem("lugares", JSON.stringify(lugares))
    localStorage.setItem("guardias", JSON.stringify(guardias))
    localStorage.setItem("tareasGuardia", JSON.stringify(tareasGuardia))
  }, [usuarios, horarios, lugares, guardias, tareasGuardia])

  // CRUD operations for usuarios
  const addUsuario = (usuario: Omit<Usuario, "id">) => {
    const newUsuario = {
      ...usuario,
      id: usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1,
    }
    setUsuarios([...usuarios, newUsuario])
  }

  const updateUsuario = (id: number, usuario: Partial<Usuario>) => {
    setUsuarios(usuarios.map((u) => (u.id === id ? { ...u, ...usuario } : u)))
  }

  const deleteUsuario = (id: number) => {
    // In a real app, we might want to just mark as inactive instead of deleting
    updateUsuario(id, { activo: false })
  }

  // CRUD operations for horarios
  const addHorario = (horario: Omit<Horario, "id">) => {
    const newHorario = {
      ...horario,
      id: horarios.length > 0 ? Math.max(...horarios.map((h) => h.id)) + 1 : 1,
    }
    setHorarios([...horarios, newHorario])
  }

  const updateHorario = (id: number, horario: Partial<Horario>) => {
    setHorarios(horarios.map((h) => (h.id === id ? { ...h, ...horario } : h)))
  }

  const deleteHorario = (id: number) => {
    setHorarios(horarios.filter((h) => h.id !== id))
  }

  // CRUD operations for lugares
  const addLugar = (lugar: Omit<Lugar, "id">) => {
    const newLugar = {
      ...lugar,
      id: lugares.length > 0 ? Math.max(...lugares.map((l) => l.id)) + 1 : 1,
    }
    setLugares([...lugares, newLugar])
  }

  const updateLugar = (id: number, lugar: Partial<Lugar>) => {
    setLugares(lugares.map((l) => (l.id === id ? { ...l, ...lugar } : l)))
  }

  const deleteLugar = (id: number) => {
    setLugares(lugares.filter((l) => l.id !== id))
  }

  // CRUD operations for guardias
  const addGuardia = (guardia: Omit<Guardia, "id">) => {
    const newGuardia = {
      ...guardia,
      id: guardias.length > 0 ? Math.max(...guardias.map((g) => g.id)) + 1 : 1,
    }
    setGuardias([...guardias, newGuardia])
  }

  const updateGuardia = (id: number, guardia: Partial<Guardia>) => {
    setGuardias(guardias.map((g) => (g.id === id ? { ...g, ...guardia } : g)))
  }

  const deleteGuardia = (id: number) => {
    setGuardias(guardias.filter((g) => g.id !== id))
  }

  // CRUD operations for tareasGuardia
  const addTareaGuardia = (tarea: Omit<TareaGuardia, "id">) => {
    const newTarea = {
      ...tarea,
      id: tareasGuardia.length > 0 ? Math.max(...tareasGuardia.map((t) => t.id)) + 1 : 1,
    }
    setTareasGuardia([...tareasGuardia, newTarea])
  }

  const updateTareaGuardia = (id: number, tarea: Partial<TareaGuardia>) => {
    setTareasGuardia(tareasGuardia.map((t) => (t.id === id ? { ...t, ...tarea } : t)))
  }

  const deleteTareaGuardia = (id: number) => {
    setTareasGuardia(tareasGuardia.filter((t) => t.id !== id))
  }

  // Business logic
  const asignarGuardia = (guardiaId: number, profesorCubridorId: number): boolean => {
    // Check if the guardia exists and is in 'Pendiente' state
    const guardia = guardias.find((g) => g.id === guardiaId)
    if (!guardia || guardia.estado !== "Pendiente") {
      return false
    }

    // Check if profesor can be assigned to this guardia
    if (!canProfesorAsignarGuardia(guardiaId, profesorCubridorId)) {
      return false
    }

    // Assign the guardia
    updateGuardia(guardiaId, {
      profesorCubridorId,
      estado: "Asignada",
    })

    return true
  }

  const firmarGuardia = (guardiaId: number) => {
    updateGuardia(guardiaId, {
      firmada: true,
      estado: "Firmada",
    })
  }

  const anularGuardia = (guardiaId: number) => {
    updateGuardia(guardiaId, {
      estado: "Anulada",
    })
  }

  // Helper functions
  const getGuardiasByDate = (fecha: string): Guardia[] => {
    return guardias.filter((g) => g.fecha === fecha)
  }

  const getGuardiasByProfesor = (profesorId: number): Guardia[] => {
    return guardias.filter((g) => g.profesorAusenteId === profesorId || g.profesorCubridorId === profesorId)
  }

  const getLugarById = (id: number): Lugar | undefined => {
    return lugares.find((l) => l.id === id)
  }

  const getUsuarioById = (id: number): Usuario | undefined => {
    return usuarios.find((u) => u.id === id)
  }

  const getHorariosByProfesor = (profesorId: number): Horario[] => {
    return horarios.filter((h) => h.profesorId === profesorId)
  }

  const getTareasByGuardia = (guardiaId: number): TareaGuardia[] => {
    return tareasGuardia.filter((t) => t.guardiaId === guardiaId)
  }

  const canProfesorAsignarGuardia = (guardiaId: number, profesorId: number): boolean => {
    const guardia = guardias.find((g) => g.id === guardiaId)
    if (!guardia) return false

    // Check if profesor has this tramo in their horario
    const profesorHorarios = getHorariosByProfesor(profesorId)
    const diaSemana = new Date(guardia.fecha).toLocaleDateString("es-ES", { weekday: "long" })
    const tieneHorario = profesorHorarios.some(
      (h) => h.diaSemana.toLowerCase() === diaSemana.toLowerCase() && h.tramoHorario === guardia.tramoHorario,
    )

    if (!tieneHorario) return false

    // Check if profesor already has a guardia in this tramo
    const guardiasMismoTramo = guardias.filter(
      (g) =>
        g.fecha === guardia.fecha &&
        g.tramoHorario === guardia.tramoHorario &&
        g.profesorCubridorId === profesorId &&
        g.estado !== "Anulada",
    )

    if (guardiasMismoTramo.length > 0) return false

    // All checks passed
    return true
  }

  return (
    <GuardiasContext.Provider
      value={{
        usuarios,
        horarios,
        lugares,
        guardias,
        tareasGuardia,

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
      }}
    >
      {children}
    </GuardiasContext.Provider>
  )
}

// Custom hook to use guardias context
export const useGuardias = () => useContext(GuardiasContext)

