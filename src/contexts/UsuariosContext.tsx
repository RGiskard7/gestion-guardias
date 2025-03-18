"use client"

import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import { getUsuarios, getUsuarioById, getUsuarioByEmail, createUsuario as createUsuarioService, updateUsuario as updateUsuarioService, deleteUsuario as deleteUsuarioService, type Usuario as UsuarioDB } from "@/lib/usuariosService"
import { Usuario, UsuarioDB as UsuarioDBType, mapUsuarioFromDB, mapUsuarioToDB } from "@/src/types"

// Definición del tipo del contexto
export interface UsuariosContextType {
  usuarios: Usuario[]
  loading: boolean
  
  // CRUD operations
  addUsuario: (usuario: Omit<Usuario, "id">) => Promise<void>
  updateUsuario: (id: number, usuario: Partial<Usuario>) => Promise<void>
  deleteUsuario: (id: number) => Promise<void>
  
  // Consultas
  getUsuarioById: (id: number) => Usuario | undefined
  getUsuarioByEmail: (email: string) => Usuario | undefined
  refreshUsuarios: () => Promise<void>
}

// Crear el contexto
export const UsuariosContext = createContext<UsuariosContextType>({
  usuarios: [],
  loading: false,
  
  addUsuario: async () => {},
  updateUsuario: async () => {},
  deleteUsuario: async () => {},
  
  getUsuarioById: () => undefined,
  getUsuarioByEmail: () => undefined,
  refreshUsuarios: async () => {}
})

// Hook para usar el contexto
export const useUsuarios = () => useContext(UsuariosContext)

// Props del proveedor
interface UsuariosProviderProps {
  children: ReactNode
}

// Componente proveedor
export const UsuariosProvider: React.FC<UsuariosProviderProps> = ({ children }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar datos iniciales
  useEffect(() => {
    loadUsuarios()
  }, [])

  // Función para cargar usuarios
  const loadUsuarios = async () => {
    try {
      setLoading(true)
      
      // Cargar usuarios
      const usuariosData = await getUsuarios()
      setUsuarios(usuariosData.map(mapUsuarioFromDB))
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
    } finally {
      setLoading(false)
    }
  }

  // Función para refrescar usuarios
  const refreshUsuarios = async () => {
    await loadUsuarios()
  }

  // Función para añadir un usuario
  const addUsuario = async (usuario: Omit<Usuario, "id">) => {
    try {
      const usuarioDB = mapUsuarioToDB(usuario)
      const newUsuario = await createUsuarioService(usuarioDB as Omit<UsuarioDB, "id">)
      if (newUsuario) {
        setUsuarios([...usuarios, mapUsuarioFromDB(newUsuario)])
      }
    } catch (error) {
      console.error("Error al añadir usuario:", error)
    }
  }

  // Función para actualizar un usuario
  const updateUsuario = async (id: number, usuario: Partial<Usuario>) => {
    try {
      // Convertir al formato de la base de datos
      const usuarioDB: Partial<UsuarioDB> = {}
      if (usuario.nombre !== undefined) usuarioDB.nombre = usuario.nombre
      if (usuario.email !== undefined) usuarioDB.email = usuario.email
      if (usuario.rol !== undefined) usuarioDB.rol = usuario.rol
      if (usuario.activo !== undefined) usuarioDB.activo = usuario.activo

      await updateUsuarioService(id, usuarioDB)
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, ...usuario } : u))
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error)
    }
  }

  // Función para eliminar un usuario
  const deleteUsuario = async (id: number) => {
    try {
      await deleteUsuarioService(id)
      setUsuarios(usuarios.filter(u => u.id !== id))
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error)
    }
  }

  // Función para obtener un usuario por ID
  const getUsuarioById = (id: number): Usuario | undefined => {
    return usuarios.find(u => u.id === id)
  }

  // Función para obtener un usuario por email
  const getUsuarioByEmail = (email: string): Usuario | undefined => {
    return usuarios.find(u => u.email === email)
  }

  // Valor del contexto
  const value: UsuariosContextType = {
    usuarios,
    loading,
    
    addUsuario,
    updateUsuario,
    deleteUsuario,
    
    getUsuarioById,
    getUsuarioByEmail,
    refreshUsuarios
  }

  return (
    <UsuariosContext.Provider value={value}>
      {children}
    </UsuariosContext.Provider>
  )
}

// Re-exportar el tipo para mantener compatibilidad
export type { Usuario } 