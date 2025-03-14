# gestion-guaridas

# Aplicación para la gestión de Guardias de un instituto

Sistema de gestión de guardias para institutos educativos desarrollado con Next.js, TypeScript y Tailwind CSS. Esta aplicación permite gestionar las ausencias del profesorado, la asignación de guardias y su monitorización diaria.

<details>
<summary>📑 Tabla de Contenidos</summary>

- [gestion-guaridas](#gestion-guaridas)
- [Aplicación para la gestión de Guardias de un instituto](#aplicación-para-la-gestión-de-guardias-de-un-instituto)
  - [📋 Descripción General](#-descripción-general)
    - [Administrador](#administrador)
    - [Profesor](#profesor)
  - [⭐ Funcionalidades Principales](#-funcionalidades-principales)
    - [Gestión de Usuarios](#gestión-de-usuarios)
    - [Gestión de Horarios](#gestión-de-horarios)
    - [Gestión de Espacios](#gestión-de-espacios)
    - [Gestión de Guardias](#gestión-de-guardias)
    - [Sala de Guardias](#sala-de-guardias)
    - [Sistema de Tareas](#sistema-de-tareas)
  - [🗂️ Estructura del proyecto](#️-estructura-del-proyecto)
  - [📸 Capturas de Pantalla](#-capturas-de-pantalla)
  - [📝 Requisitos Previos](#-requisitos-previos)
  - [⚙️ Instalación](#️-instalación)
  - [🚀 Ejecución del Proyecto](#-ejecución-del-proyecto)
  - [� Scripts Disponibles](#-scripts-disponibles)
  - [🛠️ Tecnologías Principales](#️-tecnologías-principales)
  - [📊 Estado Actual de los Datos](#-estado-actual-de-los-datos)
    - [💾 Almacenamiento Local (localStorage)](#-almacenamiento-local-localstorage)
    - [🔄 Datos Mock (No Persistentes)](#-datos-mock-no-persistentes)
    - [🔄 Próximos Pasos: Integración con Supabase](#-próximos-pasos-integración-con-supabase)
  - [🗄️ Estructura de la Base de Datos](#️-estructura-de-la-base-de-datos)
    - [Tablas Principales](#tablas-principales)
  - [🤝 Contribución](#-contribución)

</details>

## 📋 Descripción General

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

## ⭐ Funcionalidades Principales

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

## 🗂️ Estructura del proyecto

```text
.                               # Estructura principal del proyecto
├── .gitignore                  # Archivos y directorios ignorados por git
├── README.md                   # Documentación principal del proyecto
├── app                         # Directorio principal de Next.js App Router
│   ├── admin                   # Área de administración
│   │   ├── estadisticas        # Visualización de datos y métricas
│   │   │   └── page.tsx        # Página de estadísticas
│   │   ├── guardias            # Gestión de guardias (vista admin)
│   │   │   └── page.tsx        # Página de gestión de guardias
│   │   ├── horarios            # Configuración de horarios
│   │   │   └── page.tsx        # Página de gestión de horarios
│   │   ├── lugares             # Gestión de espacios y ubicaciones
│   │   │   └── page.tsx        # Página de gestión de lugares
│   │   ├── page.tsx            # Dashboard principal de admin
│   │   └── users               # Gestión de usuarios
│   │       └── page.tsx        # Página de gestión de usuarios
│   ├── globals.css             # Estilos globales de la aplicación
│   ├── layout.tsx              # Layout principal que envuelve toda la app
│   ├── login                   # Autenticación de usuarios
│   │   └── page.tsx            # Página de inicio de sesión
│   ├── metadata.ts             # Configuración de metadatos de la app
│   ├── page.tsx                # Página principal/inicio
│   ├── profesor                # Área de profesores
│   │   ├── ausencias           # Gestión de ausencias del profesor
│   │   │   └── page.tsx        # Página de registro de ausencias
│   │   ├── firmar-guardia      # Confirmación de guardias realizadas
│   │   │   └── page.tsx        # Página para firmar guardias
│   │   ├── guardias-pendientes     # Guardias por cubrir
│   │   │   └── page.tsx            # Página de guardias disponibles
│   │   └── page.tsx                # Dashboard del profesor
│   └── sala-guardias               # Vista general de guardias activas
│         └── page.tsx              # Página de sala de guardias
├── components.json                 # Configuración de componentes shadcn/ui
├── components                      # Componentes reutilizables
│   ├── theme-provider.tsx          # Proveedor de tema (dark/light mode)
│   └── ui                          # Componentes de interfaz de usuario
│ 
├── hooks                           # Custom hooks de React
│   ├── use-mobile.tsx              # Hook para detección de dispositivos móviles
│   └── use-toast.ts                # Hook para sistema de notificaciones
├── lib                             # Utilidades y configuraciones
│    └── utils.ts                   # Funciones de utilidad general
├── next.config.mjs                 # Configuración de Next.js
├── package-lock.json               # Bloqueo de versiones de dependencias (npm)
├── package.json                    # Dependencias y scripts del proyecto
├── pnpm-lock.yaml                  # Bloqueo de versiones de dependencias (pnpm)
├── postcss.config.mjs              # Configuración de PostCSS
├── public                          # Archivos estáticos públicos
│   ├── placeholder-logo.png        # Logo por defecto
│   ├── placeholder-logo.svg        # Logo vectorial
│   ├── placeholder-user.jpg        # Avatar de usuario por defecto
│   ├── placeholder.jpg             # Imagen por defecto
│   └── placeholder.svg             # Imagen vectorial por defecto
├── src                             # Código fuente principal
│   ├── App.css                     # Estilos principales de la aplicación
│   ├── App.tsx                     # Componente raíz de la aplicación
│   ├── components                  # Componentes específicos de la aplicación
│   │   ├── GuardiaCard.tsx         # Tarjeta de visualización de guardia
│   │   ├── Layout.tsx              # Layout principal
│   │   ├── Navbar.tsx              # Barra de navegación
│   │   ├── ProtectedRoute.tsx      # Componente de protección de rutas
│   │   └── Sidebar.tsx             # Menú lateral
│   ├── contexts                    # Contextos de React para estado global
│   │   ├── AuthContext.tsx         # Contexto de autenticación
│   │   └── GuardiasContext.tsx     # Contexto de gestión de guardias
│   ├── index.tsx                   # Punto de entrada de la aplicación
│   └── pages                       # Páginas de la aplicación
│       ├── Login.tsx               # Página de inicio de sesión
│       ├── SalaGuardias.tsx        # Vista de sala de guardias
│       ├── admin                        # Páginas del admin
│       │   ├── AdminDashboard.tsx       # Dashboard de admin
│       │   ├── Estadisticas.tsx         # Vista de estadísticas
│       │   ├── ManageGuardias.tsx       # Gestión de guardias
│       │   ├── ManageHorarios.tsx       # Gestión de horarios
│       │   ├── ManageLugares.tsx        # Gestión de lugares
│       │   └── ManageUsers.tsx          # Gestión de usuarios
│       └── profesor                     # Páginas de profesor
│           ├── FirmarGuardia.tsx            # Firma de guardias
│           ├── GuardiasPendientes.tsx       # Lista de guardias pendientes
│           ├── MisAusencias.tsx             # Gestión de ausencias
│           └── ProfesorDashboard.tsx        # Dashboard de profesor
├── styles                                   # Estilos globales
│   └── globals.css                          # Estilos CSS globales
├── tailwind.config.ts                       # Configuración de Tailwind CSS
└── tsconfig.json                            # Configuración de TypeScript
```

## 📸 Capturas de Pantalla

<div align="center">
  <img src="doc/images/img_1.png" alt="Captura 1" />
  <br/><br/>
  <img src="doc/images/img_2.png" alt="Captura 2" />
  <br/><br/>
  <img src="doc/images/img_3.png" alt="Captura 3" />
  <br/><br/>
  <img src="doc/images/img_4.png" alt="Captura 4" />
  <br/><br/>
  <img src="doc/images/img_5.png" alt="Captura 5" />
  <br/><br/>
  <img src="doc/images/img_6.png" alt="Captura 6" />
  <br/><br/>
  <img src="doc/images/img_7.png" alt="Captura 7" />
  <br/><br/>
  <img src="doc/images/img_8.png" alt="Captura 8" />
  <br/><br/>
  <img src="doc/images/img_9.png" alt="Captura 9" />
  <br/><br/>
  <img src="doc/images/img_10.png" alt="Captura 10" />
  <br/><br/>
  <img src="doc/images/img_11.png" alt="Captura 11" />
  <br/><br/>
  <img src="doc/images/img_12.png" alt="Captura 12" />
</div>

## 📝 Requisitos Previos

- Node.js (versión 18 o superior)
- npm (viene incluido con Node.js)

## ⚙️ Instalación

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

## 🚀 Ejecución del Proyecto

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`. Puedes acceder a la aplicación abriendo esta URL en tu navegador.

## 💻 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Crea una versión optimizada para producción
- `npm start` - Inicia el servidor en modo producción
- `npm run lint` - Ejecuta el linter para verificar el código

## 🛠️ Tecnologías Principales

- Next.js 15.1.0
- React
- TypeScript
- Tailwind CSS
- date-fns
- react-day-picker

## 📊 Estado Actual de los Datos

La aplicación utiliza una combinación de datos mock y almacenamiento local:

### 💾 Almacenamiento Local (localStorage)
- Preferencias de usuario
- Datos de sesión
- Configuraciones de la interfaz
- Algunos datos temporales entre recargas de página

### 🔄 Datos Mock (No Persistentes)
- Información de guardias y ausencias
- Datos de usuarios y profesores
- Horarios y espacios
- Las operaciones CRUD son simuladas en memoria

> **Nota**: Aunque algunos datos se mantienen en localStorage, esta solución es temporal y limitada, ya que:
> - Los datos solo persisten en el navegador local
> - No hay sincronización entre diferentes dispositivos
> - Se pierde la información al limpiar el caché del navegador

### 🔄 Próximos Pasos: Integración con Supabase

Está planificada la integración con Supabase como backend para proporcionar:

- Persistencia real de datos
- Autenticación y autorización robusta
- Tiempo real para actualizaciones de guardias
- API REST y GraphQL para comunicación cliente-servidor
- Almacenamiento seguro para archivos y documentos

La integración con Supabase permitirá:
- Mantener los datos entre sesiones
- Sincronización en tiempo real entre usuarios
- Sistema de autenticación seguro
- Gestión de permisos basada en roles

## 🗄️ Estructura de la Base de Datos

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

## 🤝 Contribución

Si deseas contribuir al proyecto, por favor:

1. Haz fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios y haz commit (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request