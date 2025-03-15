/**
 * Configuración centralizada de la base de datos
 * Contiene los nombres de las tablas y otras configuraciones relacionadas con la base de datos
 */

export const DB_CONFIG = {
  // Esquema de la base de datos (en este caso, public)
  SCHEMA: 'public',
  
  // Nombres de las tablas
  TABLES: {
    USUARIOS: 'Usuarios',
    GUARDIAS: 'Guardias',
    HORARIOS: 'Horarios',
    LUGARES: 'Lugares',
    TAREAS_GUARDIA: 'Tareas_guardia'
  },
  
  // Estados posibles para las guardias
  ESTADOS_GUARDIA: {
    PENDIENTE: 'Pendiente',
    ASIGNADA: 'Asignada',
    FIRMADA: 'Firmada',
    ANULADA: 'Anulada'
  },
  
  // Roles de usuario
  ROLES: {
    ADMIN: 'admin',
    PROFESOR: 'profesor'
  }
};

/**
 * Función auxiliar para obtener el nombre completo de una tabla (con esquema si es necesario)
 * @param tableName Nombre de la tabla
 * @returns Nombre completo de la tabla
 */
export function getTableName(tableName: keyof typeof DB_CONFIG.TABLES): string {
  // En este caso, no es necesario incluir el esquema porque estamos usando el esquema public
  return DB_CONFIG.TABLES[tableName];
} 