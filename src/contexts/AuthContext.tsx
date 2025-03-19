"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import Cookies from "js-cookie"
import { loginUser, type Usuario as UsuarioDB } from "@/lib/authService"
import { supabase } from "@/lib/supabaseClient"
import { DB_CONFIG, getTableName } from "@/lib/db-config"
import { useRouter } from "next/navigation"

// Define user type (mantenemos la misma estructura para compatibilidad)
export interface User {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: "admin" | "profesor"
  activo: boolean
}

// Define context type
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
})

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is already logged in (from localStorage and cookies)
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const cookieUser = Cookies.get("user")
    
    if (storedUser && cookieUser) {
      setUser(JSON.parse(storedUser))
    } else {
      // If there's a mismatch, clear both
      localStorage.removeItem("user")
      Cookies.remove("user")
    }
    setLoading(false)
  }, [])

  // Login function - Actualizada para usar Supabase y verificar contraseña
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Intentando login con:", email)
    
    try {
      // Verificamos si el usuario existe y tiene credenciales válidas
      const userValid = await loginUser(email, password)
      
      if (!userValid) {
        console.log("Usuario no encontrado, inactivo o contraseña incorrecta")
        return false
      }
      
      // Si el usuario existe y es válido, obtenemos sus datos completos
      const { data, error } = await supabase
        .from(getTableName('USUARIOS'))
        .select('*')
        .eq('email', email)
        .single();
      
      if (error || !data) {
        console.error("Error al obtener datos del usuario:", error?.message)
        return false
      }
      
      // Convertimos los datos a nuestro tipo User
      const userData: User = {
        id: data.id,
        nombre: data.nombre,
        apellido: data.apellido || '',
        email: data.email,
        rol: data.rol as typeof DB_CONFIG.ROLES.ADMIN | typeof DB_CONFIG.ROLES.PROFESOR,
        activo: data.activo
      }
      
      console.log("Usuario encontrado:", userData.email)
      setUser(userData)
      
      // Store in both localStorage and cookies
      const userString = JSON.stringify(userData)
      localStorage.setItem("user", userString)
      Cookies.set("user", userString, { expires: 7 }) // Cookie expires in 7 days
      
      console.log("Login exitoso")
      return true
    } catch (error) {
      console.error("Error en el proceso de login:", error)
      return false
    }
  }

  // Logout function - Mejorada para redirigir al login
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    Cookies.remove("user")
    router.push(DB_CONFIG.RUTAS.LOGIN)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext)

