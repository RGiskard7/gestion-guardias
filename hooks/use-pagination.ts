import { useState, useEffect } from "react"

export interface UsePaginationOptions {
  initialPage?: number
  initialItemsPerPage?: number
  totalItems?: number
}

export function usePagination<T>({
  initialPage = 1,
  initialItemsPerPage = 10,
  totalItems = 0
}: UsePaginationOptions = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  const [paginatedItems, setPaginatedItems] = useState<T[]>([])
  
  // Calcular el número total de páginas
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  
  // Asegurarse de que la página actual es válida
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages))
    }
  }, [currentPage, totalPages])
  
  // Función para cambiar de página
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }
  
  // Función para cambiar el número de elementos por página
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    // Ajustar la página actual para mantener la posición aproximada
    const firstItemIndex = (currentPage - 1) * itemsPerPage
    const newPage = Math.floor(firstItemIndex / newItemsPerPage) + 1
    setCurrentPage(Math.max(1, Math.min(newPage, Math.ceil(totalItems / newItemsPerPage))))
  }
  
  // Función para paginar un array de elementos
  const paginateItems = (items: T[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }
  
  // Función para actualizar los elementos paginados
  const updatePaginatedItems = (items: T[]) => {
    setPaginatedItems(paginateItems(items))
  }
  
  return {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    handlePageChange,
    handleItemsPerPageChange,
    paginateItems,
    updatePaginatedItems
  }
} 