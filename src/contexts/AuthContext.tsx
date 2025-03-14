"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import Cookies from "js-cookie"

// Define user type
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

// Mock user data for demonstration
const mockUsers = [
  {
    id: 1,
    nombre: "Admin Usuario",
    email: "admin@instituto.es",
    rol: "admin" as const,
    activo: true,
    password: "admin123",
  },
  {
    id: 2,
    nombre: "Profesor Ejemplo",
    email: "profesor@instituto.es",
    rol: "profesor" as const,
    activo: true,
    password: "profesor123",
  },
]

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

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Intentando login con:", email)
    // In a real app, this would be an API call
    const foundUser = mockUsers.find((u) => u.email === email && u.password === password && u.activo)

    if (foundUser) {
      console.log("Usuario encontrado:", foundUser.email)
      // Remove password before storing user
      const { password, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      
      // Store in both localStorage and cookies
      const userString = JSON.stringify(userWithoutPassword)
      localStorage.setItem("user", userString)
      Cookies.set("user", userString, { expires: 7 }) // Cookie expires in 7 days
      
      console.log("Login exitoso")
      return true
    }
    console.log("Usuario no encontrado")
    return false
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

