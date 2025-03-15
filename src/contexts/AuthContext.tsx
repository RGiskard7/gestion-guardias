"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import Cookies from "js-cookie"
import { loginUser, type Usuario as UsuarioDB } from "@/lib/authService"
import { supabase } from "@/lib/supabaseClient"
import { DB_CONFIG, getTableName } from "@/lib/db-config"

// Define user type (mantenemos la misma estructura para compatibilidad)
export interface User {
  id: number
  nombre: string
  email: string
  rol: "admin" | "profesor"
  activo: boolean
}

// Define context type
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string) => Promise<boolean>
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

  // Login function - Actualizada para usar Supabase
  const login = async (email: string): Promise<boolean> => {
    console.log("Intentando login con:", email)
    
    try {
      // Verificamos si el usuario existe en la base de datos
      const userExists = await loginUser(email)
      
      if (!userExists) {
        console.log("Usuario no encontrado o inactivo")
        return false
      }
      
      // Si el usuario existe, obtenemos sus datos completos
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
        email: data.email,
        rol: data.rol as "admin" | "profesor",
        activo: data.activo
      }
      
      // Verificamos que el usuario esté activo
      if (!userData.activo) {
        console.log("Usuario inactivo")
        return false
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

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    Cookies.remove("user")
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

