"use client"

import { useState, useEffect } from "react"
import DataCard from "@/components/common/DataCard"
import { DB_CONFIG } from "@/lib/db-config"

// Clave para almacenar la configuración en localStorage
const CONFIG_STORAGE_KEY = "admin-configuracion"

// Tipo para la configuración
interface AppConfig {
  tiposGuardia: string[]
}

export default function ConfiguracionPage() {
  // Estado para los tipos de guardia
  const [tiposGuardia, setTiposGuardia] = useState<string[]>([])
  
  // Estado para el nuevo tipo de guardia
  const [nuevoTipo, setNuevoTipo] = useState("")
  
  // Cargar la configuración inicial
  useEffect(() => {
    // Intentar cargar desde localStorage
    try {
      const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY)
      if (storedConfig) {
        const config = JSON.parse(storedConfig) as AppConfig
        setTiposGuardia(config.tiposGuardia)
      } else {
        // Si no hay configuración guardada, usar los valores por defecto
        setTiposGuardia([...DB_CONFIG.TIPOS_GUARDIA])
      }
    } catch (error) {
      console.error('Error al cargar la configuración:', error)
      // En caso de error, usar valores por defecto
      setTiposGuardia([...DB_CONFIG.TIPOS_GUARDIA])
    }
  }, [])
  
  // Guardar la configuración en localStorage
  const saveConfig = (config: AppConfig) => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config))
    } catch (error) {
      console.error('Error al guardar la configuración:', error)
    }
  }
  
  // Función para añadir un nuevo tipo de guardia
  const handleAddTipoGuardia = () => {
    if (!nuevoTipo.trim()) {
      alert("Por favor, introduce un tipo de guardia válido")
      return
    }
    
    // Verificar que no exista ya
    if (tiposGuardia.includes(nuevoTipo.trim())) {
      alert("Este tipo de guardia ya existe")
      return
    }
    
    // Añadir el nuevo tipo
    const nuevosTypes = [...tiposGuardia, nuevoTipo.trim()]
    setTiposGuardia(nuevosTypes)
    setNuevoTipo("")
    
    // Guardar en localStorage
    saveConfig({ tiposGuardia: nuevosTypes })
  }
  
  // Función para eliminar un tipo de guardia
  const handleDeleteTipoGuardia = (tipo: string) => {
    // No permitir eliminar el tipo "Aula" que es el obligatorio
    if (tipo === DB_CONFIG.TIPOS_GUARDIA[0]) {
      alert(`No se puede eliminar el tipo '${DB_CONFIG.TIPOS_GUARDIA[0]}', es obligatorio en el sistema`)
      return
    }
    
    // Confirmar eliminación
    if (!confirm(`¿Estás seguro de que deseas eliminar el tipo de guardia "${tipo}"?`)) {
      return
    }
    
    // Eliminar el tipo
    const nuevosTypes = tiposGuardia.filter(t => t !== tipo)
    setTiposGuardia(nuevosTypes)
    
    // Guardar en localStorage
    saveConfig({ tiposGuardia: nuevosTypes })
  }
  
  // Función para resetear la configuración
  const handleReset = () => {
    if (confirm("¿Estás seguro de que deseas restablecer la configuración a los valores predeterminados?")) {
      // Resetear a los valores por defecto
      setTiposGuardia([...DB_CONFIG.TIPOS_GUARDIA])
      
      // Guardar en localStorage
      saveConfig({ tiposGuardia: [...DB_CONFIG.TIPOS_GUARDIA] })
    }
  }
  
  return (
    <div className="container-fluid py-4">
      <h1 className="h3 mb-3">Configuración del Sistema</h1>
      
      <DataCard 
        title="Tipos de Guardia" 
        icon="gear" 
        className="mb-4"
      >
        <div className="mb-4">
          <p className="text-muted">
            Configura los tipos de guardia disponibles en el sistema. El tipo "Aula" siempre estará presente y no se puede eliminar.
          </p>
        </div>
        
        <div className="mb-4">
          <h5>Tipos de guardia actuales</h5>
          <ul className="list-group mb-3">
            {tiposGuardia.map((tipo) => (
              <li key={tipo} className="list-group-item d-flex justify-content-between align-items-center">
                {tipo}
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeleteTipoGuardia(tipo)}
                  disabled={tipo === DB_CONFIG.TIPOS_GUARDIA[0]}
                  title={tipo === DB_CONFIG.TIPOS_GUARDIA[0] ? "No se puede eliminar este tipo obligatorio" : "Eliminar tipo de guardia"}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mb-4">
          <h5>Añadir nuevo tipo de guardia</h5>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value)}
              placeholder="Nuevo tipo de guardia"
            />
            <button 
              className="btn btn-primary" 
              onClick={handleAddTipoGuardia}
            >
              Añadir
            </button>
          </div>
        </div>
        
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-secondary"
            onClick={handleReset}
          >
            Restablecer valores predeterminados
          </button>
        </div>
      </DataCard>
    </div>
  )
} 