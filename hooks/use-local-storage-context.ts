"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocalStorage } from './use-local-storage';
import { DB_CONFIG } from '@/lib/db-config';

// Clave para almacenar la configuración en localStorage
const CONFIG_STORAGE_KEY = "app-configuracion"

// Tipo para la configuración
export interface AppConfig {
  tiposGuardia: string[]
}

// Valor predeterminado para la configuración
const defaultConfig: AppConfig = {
  tiposGuardia: [...DB_CONFIG.TIPOS_GUARDIA]
}

// Tipo para el contexto
interface AppConfigContextType {
  config: AppConfig
  updateConfig: (newConfig: Partial<AppConfig>) => void
  resetConfig: () => void
  addTipoGuardia: (tipo: string) => void
  removeTipoGuardia: (tipo: string) => void
}

// Crear el contexto
const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined)

// Props del proveedor
interface AppConfigProviderProps {
  children: ReactNode
}

// Componente proveedor
export function AppConfigProvider({ children }: AppConfigProviderProps) {
  // Almacenar la configuración en localStorage
  const [storedConfig, setStoredConfig] = useLocalStorage<AppConfig>(CONFIG_STORAGE_KEY, defaultConfig)
  // Estado local para la configuración
  const [config, setConfig] = useState<AppConfig>(defaultConfig)
  
  // Inicializar la configuración
  useEffect(() => {
    setConfig(storedConfig)
  }, [storedConfig])
  
  // Actualizar la configuración
  const updateConfig = (newConfig: Partial<AppConfig>) => {
    const updatedConfig = { ...config, ...newConfig }
    setConfig(updatedConfig)
    setStoredConfig(updatedConfig)
  }
  
  // Resetear la configuración a los valores predeterminados
  const resetConfig = () => {
    setConfig(defaultConfig)
    setStoredConfig(defaultConfig)
  }
  
  // Añadir un tipo de guardia
  const addTipoGuardia = (tipo: string) => {
    if (!tipo.trim() || config.tiposGuardia.includes(tipo.trim())) {
      return
    }
    
    const newTipos = [...config.tiposGuardia, tipo.trim()]
    updateConfig({ tiposGuardia: newTipos })
  }
  
  // Eliminar un tipo de guardia
  const removeTipoGuardia = (tipo: string) => {
    if (tipo === "Aula") return // No permitir eliminar el tipo obligatorio
    
    const newTipos = config.tiposGuardia.filter(t => t !== tipo)
    updateConfig({ tiposGuardia: newTipos })
  }
  
  return (
    <AppConfigContext.Provider 
      value={{ 
        config, 
        updateConfig, 
        resetConfig,
        addTipoGuardia,
        removeTipoGuardia
      }}
    >
      {children}
    </AppConfigContext.Provider>
  )
}

// Hook para usar el contexto
export function useAppConfig() {
  const context = useContext(AppConfigContext)
  if (context === undefined) {
    throw new Error('useAppConfig debe ser usado dentro de un AppConfigProvider')
  }
  return context
} 