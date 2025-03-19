/**
 * Configuración centralizada de la base de datos
 * Contiene los nombres de las tablas y otras configuraciones relacionadas con la base de datos
 * 
 * IMPORTANTE: Este archivo sirve como "fuente única de verdad" (single source of truth)
 * para valores constantes y enumeraciones en toda la aplicación.
 * 
 * Ventajas de usar esta configuración centralizada:
 * 1. Evita discrepancias entre diferentes partes de la aplicación (como "1ª Hora" vs "1ª hora")
 * 2. Facilita los cambios globales (al modificar un valor aquí, se actualiza en toda la aplicación)
 * 3. Reduce la posibilidad de errores por typos o diferencias de formato
 * 4. Mejora la mantenibilidad del código a largo plazo
 * 
 * SIEMPRE utiliza estas constantes en lugar de hardcodear valores directamente en los componentes.
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
    TAREAS_GUARDIA: 'Tareas_guardia',
    AUSENCIAS: 'Ausencias'
  },
  
  // Estados posibles para las guardias
  ESTADOS_GUARDIA: {
    PENDIENTE: 'Pendiente' as "Pendiente",
    ASIGNADA: 'Asignada' as "Asignada",
    FIRMADA: 'Firmada' as "Firmada",
    ANULADA: 'Anulada' as "Anulada"
  },
  
  // Estados posibles para las ausencias
  ESTADOS_AUSENCIA: {
    PENDIENTE: "Pendiente",
    ACEPTADA: "Aceptada",
    RECHAZADA: "Rechazada",
  },
  
  // Roles de usuario
  ROLES: {
    ADMIN: 'admin' as "admin",
    PROFESOR: 'profesor' as "profesor"
  },
  
  // Tipos de guardia disponibles (modificables por el administrador)
  TIPOS_GUARDIA: [
    'Aula' as "Aula",
    'Patio' as "Patio",
    'Recreo' as "Recreo"
  ] as string[], // Usar as para permitir la modificación dinámica
  
  // Tramos horarios disponibles en el sistema
  TRAMOS_HORARIOS: [
    '1ª Hora' as "1ª Hora",
    '2ª Hora' as "2ª Hora",
    '3ª Hora' as "3ª Hora",
    '4ª Hora' as "4ª Hora",
    '5ª Hora' as "5ª Hora",
    '6ª Hora' as "6ª Hora"
  ] as string[], // Usar as para permitir la modificación dinámica
  
  // Duración en horas de cada tramo horario
  DURACION_TRAMOS: {
    '1ª Hora': 1,
    '2ª Hora': 1,
    '3ª Hora': 1,
    '4ª Hora': 1,
    '5ª Hora': 1,
    '6ª Hora': 1,
    // Los recreos suelen tener una duración menor
    'Recreo': 0.5
  } as Record<string, number>,
  
  // Días de la semana para horarios
  DIAS_SEMANA: [
    'Lunes' as "Lunes",
    'Martes' as "Martes", 
    'Miércoles' as "Miércoles", 
    'Jueves' as "Jueves", 
    'Viernes' as "Viernes"
  ] as string[], // Usar as para permitir la modificación dinámica si fuera necesario
  
  // Tipos de lugar para la gestión de espacios
  TIPOS_LUGAR: [
    'Aula' as "Aula",
    'Patio' as "Patio",
    'Laboratorio' as "Laboratorio",
    'Gimnasio' as "Gimnasio",
    'Biblioteca' as "Biblioteca",
    'Otro' as "Otro"
  ] as string[], // Usar as para permitir la modificación dinámica
  
  // Estados de usuario para filtrado
  ESTADOS_USUARIO: {
    ACTIVO: 'activo' as "activo",
    INACTIVO: 'inactivo' as "inactivo"
  },
  
  // Rutas de la aplicación
  RUTAS: {
    ADMIN: '/admin' as "/admin",
    PROFESOR: '/profesor' as "/profesor",
    SALA_GUARDIAS: '/sala-guardias' as "/sala-guardias",
    ADMIN_USERS: '/admin/users' as "/admin/users",
    ADMIN_GUARDIAS: '/admin/guardias' as "/admin/guardias",
    ADMIN_AUSENCIAS: '/admin/ausencias' as "/admin/ausencias",
    ADMIN_HORARIOS: '/admin/horarios' as "/admin/horarios",
    ADMIN_LUGARES: '/admin/lugares' as "/admin/lugares",
    ADMIN_ESTADISTICAS: '/admin/estadisticas' as "/admin/estadisticas",
    PROFESOR_AUSENCIAS: '/profesor/ausencias' as "/profesor/ausencias",
    PROFESOR_MIS_GUARDIAS: '/profesor/mis-guardias' as "/profesor/mis-guardias",
    PROFESOR_HORARIO: '/profesor/horario' as "/profesor/horario",
    LOGIN: '/login' as "/login"
  },
  
  // Configuración de la paginación
  PAGINACION: {
    ELEMENTOS_POR_PAGINA: {
      GUARDIAS: 6,
      AUSENCIAS: 10,
      USUARIOS: 10,
      SALA_GUARDIAS: 10
    }
  },
  
  // Etiquetas y textos comunes para la interfaz
  ETIQUETAS: {
    LUGARES: {
      SIN_LUGAR: "Sin lugar"
    },
    USUARIOS: {
      NO_ESPECIFICADO: "No especificado",
      DESCONOCIDO: "Desconocido",
      SIN_ASIGNAR: "Sin asignar"
    },
    GUARDIAS: {
      DISPONIBLE: "Disponible",
      PENDIENTE_FIRMA: "Pendiente de firma"
    },
    MENSAJES: {
      SIN_HORARIOS: "No tienes horarios de guardia asignados.",
      SIN_GUARDIAS_FIRMA: "No tienes guardias pendientes de firma.",
      SIN_AUSENCIAS: "No tienes ausencias registradas.",
      SIN_GUARDIAS_FECHA: "No hay guardias registradas para esta fecha.",
      SIN_GUARDIAS_TRAMO: "No hay guardias para este tramo horario."
    }
  },
  
  // Límites de visualización
  LIMITES: {
    LISTA_PREVIEW: 5
  },
  
  // Constantes numéricas para días
  NUMEROS: {
    DIAS_SEMANA: 7, // Número de días en una semana (lunes a domingo)
    DIAS_LABORABLES: 5 // Número de días laborables (lunes a viernes)
  },
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

/**
 * Función para obtener la duración de un tramo horario
 * @param tramoHorario Nombre del tramo horario
 * @returns Duración en horas del tramo horario, o 1 si no está definido
 */
export function getDuracionTramo(tramoHorario: string): number {
  return DB_CONFIG.DURACION_TRAMOS[tramoHorario] || 1;
} 