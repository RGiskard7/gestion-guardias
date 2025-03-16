# Bitácora de Desarrollo - Sistema de Gestión de Guardias

Este documento registra todos los cambios, mejoras y correcciones realizadas en el proyecto de Sistema de Gestión de Guardias.

## [2025-03-16] - Implementación del modo oscuro y correcciones funcionales

### Autor(es)
- Equipo de Desarrollo

### Cambios realizados
- Implementación del modo oscuro utilizando Bootstrap 5
- Creación del contexto ThemeContext para gestionar el estado del tema
- Adición del botón de cambio de tema en la barra de navegación
- Adaptación de componentes y estilos para soportar modo oscuro/claro
- Mejora en la visualización de tablas en modo oscuro
- Corrección de problemas de contraste en la interfaz
- Corrección del problema al quitar un profesor cubridor de una guardia asignada
- Implementación de la actualización automática del estado de la guardia a "Pendiente" cuando se quita el profesor cubridor
- Mejora en el manejo de valores nulos en la base de datos para el campo profesor_cubridor_id
- Optimización del proceso de actualización de guardias en el contexto y en el servicio

### Archivos modificados
- `src/contexts/ThemeContext.tsx`: Creación del contexto para gestionar el tema
- `components/common/ThemeToggle.tsx`: Nuevo componente para cambiar entre temas
- `app/layout.tsx`: Integración del ThemeProvider
- `src/App.css`: Actualización de estilos para soportar modo oscuro
- `components/common/Navbar.tsx`: Integración del botón de cambio de tema
- `src/contexts/GuardiasContext.tsx`: Modificación de la función `updateGuardia` para detectar cuando se quita un profesor cubridor y actualizar el estado a "Pendiente"
- `lib/guardiasService.ts`: Implementación de una solución para manejar correctamente los valores nulos en la base de datos

### Problemas resueltos
- Problemas de contraste en tablas y componentes en modo oscuro
- Inconsistencias visuales en el menú móvil
- Problemas de visibilidad en la barra de navegación en modo oscuro
- Error al quitar un profesor cubridor de una guardia, donde el ID seguía persistiendo en la base de datos
- Inconsistencia en el estado de la guardia cuando se quitaba el profesor cubridor
- Problema con la actualización del estado local después de modificar una guardia

### Notas adicionales
- Se ha implementado la detección automática de preferencias del sistema para el tema inicial
- Se ha añadido persistencia del tema seleccionado usando localStorage
- Se han utilizado variables CSS de Bootstrap para mantener la consistencia visual
- Se ha implementado una solución específica para Supabase que maneja correctamente los valores nulos en la base de datos
- Se ha mejorado el manejo de errores en las operaciones de actualización de guardias

## [2025-03-15] - Mejoras en la visualización de horarios y corrección de errores críticos

### Autor(es)
- Equipo de Desarrollo

### Cambios realizados
- Implementación de una vista semanal para que los profesores puedan ver sus horarios de guardia
- Corrección del error de IDs duplicados al crear múltiples guardias simultáneamente
- Adición de la opción "Todo el día" para seleccionar todos los tramos horarios al registrar ausencias
- Mejora en el manejo de errores durante la creación de guardias
- Implementación de indicadores visuales durante el proceso de envío de formularios

### Archivos modificados
- `app/profesor/horario/page.tsx`: Creación de una nueva página para visualizar el horario semanal del profesor con dos modos de visualización (disponibilidad y guardias asignadas)
- `components/common/Sidebar.tsx`: Adición de un enlace a la nueva página de horario del profesor
- `components/common/Navbar.tsx`: Adición de un enlace a la nueva página de horario del profesor en el menú móvil
- `app/profesor/ausencias/page.tsx`: Corrección del manejo de IDs al crear guardias y adición de la opción "Todo el día"

### Problemas resueltos
- Error de clave duplicada al crear guardias cuando un profesor registra ausencias con múltiples tramos horarios
- Visualización incorrecta de guardias en el horario del profesor, donde se mostraban guardias de otras semanas
- Problemas de concurrencia al crear múltiples guardias simultáneamente

### Notas adicionales
- Se ha implementado un sistema de pausas entre creaciones de guardias para evitar problemas de concurrencia
- Se ha mejorado la experiencia de usuario con indicadores visuales durante procesos de carga

## [2025-03-14] - Implementación inicial del Sistema de Gestión de Guardias

### Autor(es)
- Equipo de Desarrollo

### Cambios realizados
- Configuración inicial del proyecto con Next.js, React y TypeScript
- Implementación de la autenticación de usuarios con Supabase
- Creación de la estructura de base de datos en Supabase
- Desarrollo de servicios para interactuar con la API de Supabase
- Implementación de contextos para la gestión del estado global
- Desarrollo de componentes de interfaz de usuario con Bootstrap
- Implementación de la funcionalidad de registro de ausencias para profesores
- Desarrollo de la Sala de Guardias para visualización y asignación
- Implementación del sistema de firma de guardias
- Desarrollo del panel de administración para gestión de usuarios, horarios y lugares

### Archivos modificados
- Múltiples archivos en la estructura inicial del proyecto

### Funcionalidades implementadas
- Autenticación y autorización basada en roles (Administrador/Profesor)
- Gestión de usuarios (CRUD completo)
- Gestión de horarios de guardia para profesores
- Gestión de lugares donde se realizan guardias
- Registro de ausencias por parte de profesores
- Creación automática de guardias a partir de ausencias
- Asignación de profesores a guardias pendientes
- Firma de guardias realizadas
- Visualización de estadísticas para administradores
- Interfaz responsive para dispositivos móviles y escritorio

### Problemas resueltos
- Implementación de un sistema seguro para la generación de IDs en la base de datos
- Desarrollo de un sistema de control de acceso basado en roles
- Creación de una interfaz responsive que funciona en dispositivos móviles y escritorio

### Notas adicionales
- Se ha utilizado Bootstrap 5.3.2 para el diseño de la interfaz
- Se ha implementado un sistema de contextos en React para la gestión del estado global
- La aplicación sigue una arquitectura de capas con separación clara de responsabilidades 