"use client"

import { useEffect } from 'react'
import Script from 'next/script'
import { DB_CONFIG } from '@/lib/db-config'

// Clave para almacenar la configuración en localStorage
const CONFIG_STORAGE_KEY = "admin-configuracion"

// Tipo para la configuración
interface AppConfig {
  tiposGuardia: string[]
}

/**
 * Componente que carga la configuración de localStorage
 * y actualiza los valores en DB_CONFIG al inicio
 */
export function AppConfigScript() {
  // Al montar el componente, cargar la configuración
  useEffect(() => {
    try {
      // Intentar obtener la configuración de localStorage
      const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY)
      
      if (storedConfig) {
        // Parsear la configuración
        const config = JSON.parse(storedConfig) as AppConfig
        
        // Actualizar los tipos de guardia en DB_CONFIG
        if (config.tiposGuardia && Array.isArray(config.tiposGuardia)) {
          // Verificar que "Aula" está presente
          if (!config.tiposGuardia.includes("Aula")) {
            config.tiposGuardia.unshift("Aula")
            // Guardar la configuración actualizada
            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config))
          }
          
          // Actualizar DB_CONFIG
          DB_CONFIG.TIPOS_GUARDIA = [...config.tiposGuardia]
          console.log("Tipos de guardia cargados desde localStorage:", DB_CONFIG.TIPOS_GUARDIA)
        }
      }
    } catch (error) {
      console.error("Error al cargar la configuración:", error)
    }
  }, [])

  return null
} 