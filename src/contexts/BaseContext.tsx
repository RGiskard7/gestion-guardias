"use client"

import { createContext, useState, useContext, type ReactNode } from "react"

export interface BaseContextType {
  loading: boolean
}

const BaseContext = createContext<BaseContextType>({
  loading: false
})

export const useBaseContext = () => useContext(BaseContext)

interface BaseProviderProps {
  children: ReactNode
}

export const BaseProvider: React.FC<BaseProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false)

  const value: BaseContextType = {
    loading
  }

  return (
    <BaseContext.Provider value={value}>
      {children}
    </BaseContext.Provider>
  )
} 