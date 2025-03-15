"use client"

import React from "react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  itemsPerPage?: number
  totalItems?: number
  onItemsPerPageChange?: (itemsPerPage: number) => void
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = "",
  itemsPerPage = 10,
  totalItems = 0,
  onItemsPerPageChange
}: PaginationProps) {
  // Añadir console.log para depuración
  console.log("Renderizando componente Pagination:", { currentPage, totalPages, itemsPerPage, totalItems })
  
  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) {
    console.log("No se muestra paginación porque totalPages <= 1")
    return null
  }

  // Opciones para el número de elementos por página
  const itemsPerPageOptions = [5, 10, 25, 50, 100]

  // Generar array de páginas
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5 // Número máximo de páginas a mostrar
    
    if (totalPages <= maxPagesToShow) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Mostrar siempre la primera página
      pages.push(1)
      
      // Calcular el rango de páginas a mostrar alrededor de la página actual
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)
      
      // Ajustar si estamos cerca del inicio
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4)
      }
      
      // Ajustar si estamos cerca del final
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3)
      }
      
      // Añadir elipsis si es necesario
      if (startPage > 2) {
        pages.push('...')
      }
      
      // Añadir páginas intermedias
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      // Añadir elipsis si es necesario
      if (endPage < totalPages - 1) {
        pages.push('...')
      }
      
      // Mostrar siempre la última página
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  // Siempre mostrar el selector de elementos por página, independientemente del número de páginas
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3">
      <div className="d-flex align-items-center mb-3 mb-md-0">
        <span className="me-2">Mostrar</span>
        <select 
          className="form-select form-select-sm me-2" 
          style={{ width: 'auto' }}
          value={itemsPerPage}
          onChange={(e) => {
            if (onItemsPerPageChange) {
              onItemsPerPageChange(Number(e.target.value));
            }
          }}
          aria-label="Elementos por página"
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <span>elementos</span>
      </div>
      
      <div className="d-flex align-items-center">
        <small className="text-muted me-3">
          Mostrando {totalItems === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} elementos
        </small>
        
        {/* Solo mostrar la navegación de paginación si hay más de una página */}
        {totalPages > 1 && (
          <nav aria-label="Navegación de páginas">
            <ul className="pagination mb-0">
              {/* Botón Anterior */}
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Anterior"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              
              {/* Números de página */}
              {getPageNumbers().map((page, index) => (
                <li 
                  key={index} 
                  className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
                >
                  <button 
                    className="page-link" 
                    onClick={() => typeof page === 'number' ? onPageChange(page) : null}
                    disabled={page === '...'}
                  >
                    {page}
                  </button>
                </li>
              ))}
              
              {/* Botón Siguiente */}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Siguiente"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  )
}
