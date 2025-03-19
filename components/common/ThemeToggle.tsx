"use client"

import { useTheme } from '../../src/contexts/ThemeContext';
import { useEffect } from 'react';

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  // Agregar clase para transiciones suaves al cambiar entre modos
  useEffect(() => {
    const handleTransition = () => {
      document.documentElement.classList.add('dark-mode-transition');
      const timer = setTimeout(() => {
        document.documentElement.classList.remove('dark-mode-transition');
      }, 500);
      return () => clearTimeout(timer);
    };

    // Agregar event listener para el cambio de tema
    document.addEventListener('themeChange', handleTransition);
    return () => document.removeEventListener('themeChange', handleTransition);
  }, []);

  const handleToggleTheme = () => {
    toggleTheme();
    // Disparar evento personalizado para manejar la transición
    document.dispatchEvent(new Event('themeChange'));
  };

  return (
    <button 
      className="theme-toggle-btn"
      onClick={handleToggleTheme}
      title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <div className="theme-toggle-icons">
        <i className={`bi ${isDarkMode ? 'bi-sun' : 'bi-moon'}`}></i>
      </div>
      <span className="visually-hidden">
        {isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      </span>
    </button>
  );
} 