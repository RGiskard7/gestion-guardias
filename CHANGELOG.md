# Bitácora de Desarrollo - Sistema de Gestión de Guardias

Este documento registra todos los cambios, mejoras y correcciones realizadas en el proyecto de Sistema de Gestión de Guardias.

## [2025-03-19] (2) - Mejoras en autenticación, gestión de usuarios y visualización de horarios

### Autor(es)
- Equipo de Desarrollo

### Cambios realizados
- Optimización del sistema de autenticación y validación de sesiones
- Implementación de restricción para creación de nuevos usuarios: solo permitido cuando hay profesores inactivos
- Implementación de herencia obligatoria de horarios cuando se crea un nuevo usuario y hay profesores inactivos con horarios
- Mejora en la visualización de horarios con soporte para modo oscuro y modo claro
- Implementación de validación para evitar horarios duplicados en el mismo día y tramo para un profesor
- Mejora en el formulario de creación de horarios para seleccionar múltiples tramos en un solo día
- Adición de vista semanal para horarios de profesores con mejoras en la visualización y navegación
- Implementación de botón de eliminación en la vista semanal de horarios
- Corrección de problemas de visualización de las tablas de horarios en modo oscuro

### Archivos modificados
- `app/admin/horarios/page.tsx`: Mejoras en la validación y visualización de horarios, adición de vista semanal
- `app/profesor/horario/page.tsx`: Mejoras en la visualización de horarios y soporte para modo oscuro
- `app/admin/users/page.tsx`: Implementación de restricciones para creación de usuarios y herencia de horarios
- `app/sala-guardias/page.tsx`: Mejoras en la visualización de la tabla y soporte para modo oscuro
- `lib/authService.ts`: Optimización de procesos de autenticación y validación de sesiones

### Problemas resueltos
- Inconsistencias visuales en el modo oscuro para tablas de horarios
- Duplicidad en horarios de guardias para un mismo profesor en el mismo día y tramo
- Proceso tedioso para añadir múltiples tramos horarios a un profesor
- Falta de restricciones en la creación de usuarios, lo que podía causar confusión en la asignación de horarios
- Problemas de visualización en las tablas de horarios para diferentes tamaños de pantalla

### Notas adicionales
- La restricción de creación de usuarios mejora la organización y evita la proliferación de profesores sin horarios asignados
- La herencia de horarios facilita la transición cuando se reemplaza un profesor inactivo con uno nuevo
- La vista semanal de horarios proporciona una mejor visualización de la disponibilidad y asignaciones
- El soporte mejorado para modo oscuro cumple con estándares de accesibilidad y mejora la experiencia de usuario
- El proceso de validación de horarios duplicados previene errores de programación y conflictos en las guardias

## [2025-03-19] (1) - Mejoras en la selección de profesores disponibles y en la navegación del sistema

### Autor(es)
- Equipo de Desarrollo

### Cambios realizados
- Corrección de la función `profesorTieneDisponibilidad` que filtra los profesores disponibles para cubrir guardias
- Optimización del algoritmo de verificación de disponibilidad para comprobar correctamente el día de la semana y el tramo horario
- Implementación de mejora para que ignore la guardia actual al comprobar disponibilidad durante la edición
- Añadida la propiedad `tarea` al estado del formulario para evitar errores al crear guardias con tareas
- Limpieza de elementos de depuración de la interfaz de usuario
- Simplificación de la interfaz de edición de guardias
- Renombrada la sección "Guardias pendientes" a "Mis guardias" en la interfaz del profesor
- Restructuración de la página de "Mis guardias" con un sistema de pestañas para acceder a diferentes tipos de guardias:
  - Guardias pendientes (por asignar)
  - Guardias generadas (por ausencias del profesor)
  - Guardias por firmar (asignadas al profesor)
- Implementada la navegación por pestañas con parámetros URL para mantener el estado entre recargas

### Archivos modificados
- `app/admin/guardias/page.tsx`: Corrección de la función `profesorTieneDisponibilidad` y mejoras en la interfaz
- `app/profesor/guardias-pendientes/page.tsx`: Redireccionamiento a la nueva página "Mis guardias"
- `app/profesor/mis-guardias/page.tsx`: Nueva página con sistema de pestañas para gestionar todos los tipos de guardias
- `components/common/Sidebar.tsx`: Actualización de enlaces en la barra lateral de navegación
- `lib/db-config.ts`: Actualización de rutas para reflejar el cambio de nomenclatura

### Problemas resueltos
- Error al mostrar profesores disponibles para cubrir una guardia, ahora se verifica correctamente si tienen horario para ese día de la semana y tramo
- Problema al editar guardias donde no se mostraba el profesor asignado actualmente como opción disponible
- Error al crear guardias con tareas debido a la falta de la propiedad `tarea` en el estado del formulario
- Navegación confusa para profesores entre diferentes tipos de guardias (pendientes, generadas, por firmar)
- Experiencia de usuario fragmentada que requería navegar entre diferentes páginas para gestionar guardias

### Notas adicionales
- La selección de profesores disponibles ahora funciona correctamente y muestra:
  - Profesores con horario para ese día de la semana y tramo horario
  - Profesores que no tienen otra guardia asignada en esa fecha y tramo
  - El profesor actualmente asignado a la guardia (en modo edición)
- Se ha eliminado el botón de depuración y los mensajes de consola para mantener un código limpio y profesional
- La nueva página "Mis guardias" unifica la experiencia del profesor proporcionando acceso a todos los tipos de guardias desde una única interfaz
- El sistema de pestañas con parámetros URL permite compartir enlaces directos a secciones específicas y mantener la pestaña activa en recargas

## [2025-03-25] (5) - Mejora en la validación de fechas para guardias y ausencias

### Autor(es)
- Equipo de desarrollo

### Cambios realizados
- Añadida validación para impedir la creación de guardias y ausencias con fechas pasadas
- Implementada validación en formularios web para evitar la selección de fechas anteriores a la actual
- Agregada validación a nivel de servicios para rechazar operaciones con fechas pasadas
- Implementada validación en `createGuardia` y `createAusencia` para verificar fechas válidas

### Archivos modificados
- `app/admin/guardias/page.tsx`: Añadido atributo `min` a los campos de fecha para prevenir selección de fechas pasadas
- `app/admin/ausencias/page.tsx`: Añadido atributo `min` al campo de fecha para prevenir selección de fechas pasadas
- `lib/guardiasService.ts`: Implementada validación en `createGuardia` para rechazar fechas pasadas
- `lib/ausenciasService.ts`: Implementada validación en `createAusencia` para rechazar fechas pasadas

### Problemas resueltos
- Eliminada la posibilidad de crear guardias y ausencias con fechas pasadas
- Mejorada la validación de datos para garantizar la integridad temporal del sistema
- Prevenidos errores de consistencia en la asignación de profesores a guardias pasadas

### Notas adicionales
- Esta implementación forma parte de las mejoras de seguridad y consistencia del sistema
- Se mantiene la funcionalidad para visualizar registros históricos, solo se impide la creación en fechas pasadas

## [2025-03-18] (4) - Mejora en la anulación de guardias y corrección de errores en la creación

### Autor(es)
- Equipo de Desarrollo

### Cambios realizados
- Implementación de la funcionalidad para que al anular una guardia con ausencia asociada, la ausencia vuelva a estado "Pendiente"
- Corrección del error en la creación de guardias donde el tipo de guardia no se establecía correctamente
- Adición de logs para diagnóstico y seguimiento del flujo de creación de guardias
- Verificación y mejora del proceso de anulación de guardias

### Archivos modificados
- `src/contexts/GuardiasContext.tsx`: Modificación de la función `anularGuardia` para gestionar la actualización del estado de la ausencia asociada
- `lib/guardiasService.ts`: Adición de logs para verificar el tipo de guardia durante la creación
- `app/admin/guardias/page.tsx`: Mejora en el manejo de la anulación de guardias y adición de logs para diagnóstico

### Problemas resueltos
- Error donde la ausencia quedaba sin guardia asociada pero no volvía a estado "Pendiente" al anular la guardia
- Problema en la creación de guardias donde el tipo de guardia no se establecía correctamente
- Mejora en la trazabilidad del proceso de creación y anulación de guardias mediante logs

### Notas adicionales
- Se ha implementado una comprobación adicional para verificar si una guardia tiene ausencia asociada antes de anularla
- Se ha mejorado el flujo de trabajo para que el administrador reciba confirmación explícita sobre el cambio de estado de la ausencia
- Se ha mejorado la gestión de errores en todo el proceso de anulación de guardias 

## [2025-03-18] (3) - Documentación técnica y mejoras en la estructura del proyecto

### Autor(es)
- Equipo de Desarrollo

### Cambios realizados
- Creación del manual del programador con documentación técnica exhaustiva
- Creación de un diagrama entidad-relación en formato Mermaid para visualizar la estructura de la base de datos
- Reorganización de los archivos de documentación, moviendo la mayoría a la carpeta `doc/`
- Actualización de todos los enlaces en el README.md para reflejar la nueva ubicación de los archivos
- Mejora en la estructura general del proyecto, manteniendo solo README.md y CHANGELOG.md en la raíz

### Archivos creados
- `doc/MANUAL-PROGRAMADOR.md`: Manual técnico exhaustivo con comparativas Java/TypeScript
- `doc/DIAGRAMA-ER.md`: Diagrama entidad-relación de la base de datos con descripciones detalladas

### Archivos movidos
- `MANUAL-USUARIO.md` → `doc/MANUAL-USUARIO.md`
- `CONFIGURACION-SUPABASE.md` → `doc/CONFIGURACION-SUPABASE.md`
- `INSTRUCCIONES-PRUEBA.md` → `doc/INSTRUCCIONES-PRUEBA.md`
- `README-SUPABASE.md` → `doc/README-SUPABASE.md`

### Archivos modificados
- `README.md`: Actualización de enlaces y adición de referencias a la nueva documentación
- `CHANGELOG.md`: Actualización para reflejar los cambios realizados

### Mejoras implementadas
- Documentación técnica detallada con ejemplos y comparativas Java/TypeScript
- Visualización clara de la estructura de la base de datos y las relaciones entre tablas
- Estructura de proyecto más limpia y profesional
- Mejor organización de la documentación en una carpeta dedicada
- Mantenimiento de las convenciones estándar de mantener README.md y CHANGELOG.md en la raíz

### Notas adicionales
- El manual del programador facilita la comprensión del proyecto para desarrolladores Java
- El diagrama entidad-relación facilita la comprensión de la estructura de datos del sistema
- Esta reorganización facilita el mantenimiento futuro de la documentación
- La estructura actual sigue las mejores prácticas de la industria para proyectos profesionales

## [2025-03-18] (2) - Documentación exhaustiva del sistema

### Autor(es)
- Equipo de Desarrollo

### Cambios realizados
- Creación de un manual de usuario exhaustivo que cubre todas las funcionalidades del sistema
- Desarrollo de diagramas de flujo en formato Mermaid para visualizar los procesos principales
- Actualización del README con enlaces a la nueva documentación
- Mejora en la organización de la documentación del proyecto

### Archivos creados
- `MANUAL-USUARIO.md`: Manual completo con instrucciones detalladas para profesores y administradores
- `doc/DIAGRAMAS-FLUJO.md`: Diagramas de flujo de todas las funcionalidades principales

### Archivos modificados
- `README.md`: Actualización de la sección de documentación adicional con enlaces a los nuevos documentos

### Mejoras implementadas
- Documentación detallada de todas las funcionalidades para profesores y administradores
- Representación visual de los flujos de trabajo del sistema
- Sección de preguntas frecuentes y solución de problemas en el manual de usuario
- Instrucciones paso a paso para cada funcionalidad del sistema

### Notas adicionales
- El manual de usuario incluye indicaciones sobre dónde colocar capturas de pantalla para mejorar la comprensión
- Los diagramas de flujo utilizan la sintaxis de Mermaid para una representación visual clara y mantenible
- La documentación se ha estructurado de manera modular para facilitar futuras actualizaciones

## [2025-03-18] (1) - Reorganización de la documentación del proyecto

### Autor(es)
- Equipo de Desarrollo

### Cambios realizados
- Reorganización de los archivos de documentación, moviendo la mayoría a la carpeta `doc/`
- Actualización de todos los enlaces en el README.md para reflejar la nueva ubicación de los archivos
- Mejora en la estructura general del proyecto, manteniendo solo README.md y CHANGELOG.md en la raíz

### Archivos movidos
- `MANUAL-USUARIO.md` → `doc/MANUAL-USUARIO.md`
- `CONFIGURACION-SUPABASE.md` → `doc/CONFIGURACION-SUPABASE.md`
- `INSTRUCCIONES-PRUEBA.md` → `doc/INSTRUCCIONES-PRUEBA.md`
- `README-SUPABASE.md` → `doc/README-SUPABASE.md`

### Archivos modificados
- `README.md`: Actualización de todos los enlaces a los archivos de documentación

### Mejoras implementadas
- Estructura de proyecto más limpia y profesional
- Mejor organización de la documentación en una carpeta dedicada
- Mantenimiento de las convenciones estándar de mantener README.md y CHANGELOG.md en la raíz

### Notas adicionales
- Esta reorganización facilita el mantenimiento futuro de la documentación
- La estructura actual sigue las mejores prácticas de la industria para proyectos profesionales

## [2025-03-17] - Actualización de documentación del proyecto

### Autor(es)
- Equipo de desarrollo

### Cambios realizados
- Actualización completa del README.md para reflejar el estado actual del proyecto
- Corrección de información desactualizada sobre la estructura de la base de datos
- Actualización de la descripción de funcionalidades, incluyendo la gestión de ausencias
- Actualización de la estructura del proyecto para reflejar los cambios recientes
- Mejora de la sección de tecnologías utilizadas

### Archivos modificados
- `README.md`: Actualización completa del contenido para reflejar el estado actual del proyecto

### Notas adicionales
- La documentación ahora refleja correctamente la migración de Tailwind CSS a Bootstrap
- Se ha añadido información sobre la gestión de ausencias como funcionalidad independiente
- Se ha actualizado la estructura de la base de datos para incluir la tabla de Ausencias

## [2025-03-17] - Mejoras en la gestión de ausencias para administradores

### Autor(es)
- Equipo de Desarrollo

### Cambios realizados
- Rediseño completo de la página de gestión de ausencias para administradores
- Implementación de funcionalidad para ver todas las ausencias, no solo las pendientes
- Adición de filtros por estado, profesor y fecha
- Implementación de funcionalidad para crear nuevas ausencias desde la cuenta de administrador
- Implementación de funcionalidad para editar ausencias existentes
- Implementación de funcionalidad para anular ausencias y sus guardias asociadas
- Mejora en la visualización de ausencias con indicadores visuales según su estado
- Actualización de la navegación para reflejar los cambios en la gestión de ausencias

### Archivos modificados
- `app/admin/ausencias/page.tsx`: Nueva página para la gestión completa de ausencias
- `app/admin/ausencias-pendientes/page.tsx`: Modificada para redirigir a la nueva página de ausencias
- `components/common/Sidebar.tsx`: Actualización del enlace a la página de ausencias
- `components/common/Navbar.tsx`: Actualización del menú móvil para incluir el enlace a la página de ausencias
- `src/contexts/GuardiasContext.tsx`: Adición de la función `anularAusencia` para anular ausencias y sus guardias asociadas

### Problemas resueltos
- Limitación anterior que solo permitía ver ausencias pendientes
- Falta de funcionalidad para crear ausencias desde la cuenta de administrador
- Falta de funcionalidad para editar ausencias existentes
- Falta de funcionalidad para anular ausencias y sus guardias asociadas
- Inconsistencia en la navegación entre la barra lateral y el menú móvil

### Notas adicionales
- Se ha implementado un sistema de ordenación que muestra primero las ausencias pendientes
- Se ha mejorado la experiencia de usuario con indicadores visuales durante procesos de carga
- Se ha implementado una redirección desde la antigua página de ausencias pendientes a la nueva página de ausencias
- Se ha mejorado el manejo de errores en las operaciones de gestión de ausencias

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

## [1.0.0]

### Añadido
- Versión inicial del sistema de gestión de guardias
- Funcionalidad básica para profesores y administradores
- Sistema de autenticación y autorización
