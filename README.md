# Gestión de Guardias

Sistema de gestión de guardias para institutos educativos desarrollado con Next.js, TypeScript y Tailwind CSS. Esta aplicación permite gestionar las ausencias del profesorado, la asignación de guardias y su monitorización diaria.

## Descripción General

El sistema contempla dos tipos de usuarios:

### Administrador
- Gestión completa de usuarios (profesores)
- Asignación de horarios de guardia
- Gestión de espacios y ubicaciones
- Control y supervisión de guardias
- Visualización de estadísticas

### Profesor
- Registro de ausencias
- Visualización y asignación de guardias disponibles
- Firma de guardias realizadas
- Gestión de tareas para los alumnos durante su ausencia

## Requisitos Previos

- Node.js (versión 18 o superior)
- npm (viene incluido con Node.js)

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/RGiskard7/gestion-guardias.git
cd gestion-guardias
```

2. Instala las dependencias:
```bash
npm install --legacy-peer-deps
```

> **Nota**: Utilizamos `--legacy-peer-deps` debido a algunas incompatibilidades entre las dependencias de `date-fns` y `react-day-picker`. Este flag permite que la instalación se complete correctamente.

## Ejecución del Proyecto

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`. Puedes acceder a la aplicación abriendo esta URL en tu navegador.

## Funcionalidades Principales

### Gestión de Usuarios
- Crear, editar y desactivar usuarios de tipo "profesor"
- Control de acceso basado en roles (administrador/profesor)

### Gestión de Horarios
- Asignación de tramos de guardia a profesores
- Gestión de disponibilidad por día y hora

### Gestión de Espacios
- Registro y gestión de aulas, patios y otras áreas
- Asignación de espacios para guardias

### Gestión de Guardias
- Registro de ausencias y generación de guardias pendientes
- Sistema de asignación y firma de guardias
- Control de restricciones (1 guardia por tramo horario)

### Sala de Guardias
- Visualización en tiempo real del estado de las guardias
- Filtrado por estado (Pendientes, Asignadas, Firmadas)

### Sistema de Tareas
- Registro de instrucciones para alumnos durante ausencias
- Gestión y seguimiento de tareas asignadas

## Estructura del Proyecto

- `/app` - Contiene las rutas y páginas de la aplicación
- `/components` - Componentes reutilizables
- `/hooks` - Custom hooks de React
- `/lib` - Utilidades y configuraciones
- `/public` - Archivos estáticos
- `/styles` - Estilos globales y configuración de Tailwind

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Crea una versión optimizada para producción
- `npm start` - Inicia el servidor en modo producción
- `npm run lint` - Ejecuta el linter para verificar el código

## Tecnologías Principales

- Next.js 15.1.0
- React
- TypeScript
- Tailwind CSS
- date-fns
- react-day-picker

## Estructura de la Base de Datos

### Tablas Principales

1. **usuarios**
   - id (PK)
   - nombre
   - email
   - rol
   - activo

2. **horarios**
   - id (PK)
   - profesor_id (FK)
   - dia_semana
   - tramo_horario

3. **lugares**
   - id (PK)
   - codigo
   - descripcion
   - tipo_lugar

4. **guardias**
   - id (PK)
   - fecha
   - tramo_horario
   - tipo_guardia
   - firmada
   - estado
   - lugar_id (FK)
   - profesor_ausente_id (FK)
   - profesor_cubridor_id (FK)

5. **tareas_guardia**
   - id (PK)
   - guardia_id (FK)
   - descripcion

## Contribución

Si deseas contribuir al proyecto, por favor:

1. Haz fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios y haz commit (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
