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
  - [💻 Scripts Disponibles](#-scripts-disponibles)
  - [🛠️ Tecnologías Principales](#️-tecnologías-principales)
  - [📊 Estado Actual de los Datos](#-estado-actual-de-los-datos)
  - [🗄️ Estructura de la Base de Datos](#️-estructura-de-la-base-de-datos)
    - [Tablas Principales](#tablas-principales)
  - [📓 Bitácora de Desarrollo](#-bitácora-de-desarrollo)
    - [Formato de Entradas](#formato-de-entradas)
  - [📚 Documentación Adicional](#-documentación-adicional)
  - [🤝 Contribución](#-contribución)
  - [📄 Licencia](#-licencia)

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
- Visualización de su horario semanal de guardias

## ⭐ Funcionalidades Principales

### Gestión de Usuarios
- Crear, editar y desactivar usuarios de tipo "profesor"
- Control de acceso basado en roles (administrador/profesor)
- Validación de emails únicos al crear nuevos usuarios

### Gestión de Horarios
- Asignación de tramos de guardia a profesores
- Gestión de disponibilidad por día y hora
- Vista semanal de horarios para profesores

### Gestión de Espacios
- Registro y gestión de aulas, patios y otras áreas
- Asignación de espacios para guardias

### Gestión de Guardias
- Registro de ausencias y generación de guardias pendientes
- Sistema de asignación y firma de guardias
- Control de restricciones (1 guardia por tramo horario)
- Opción "Todo el día" para seleccionar todos los tramos horarios al registrar ausencias

### Sala de Guardias
- Visualización en tiempo real del estado de las guardias
- Filtrado por estado (Pendientes, Asignadas, Firmadas)
- Vista semanal mejorada con indicadores visuales

### Sistema de Tareas
- Registro de instrucciones para alumnos durante ausencias
- Gestión y seguimiento de tareas asignadas

## 🗂️ Estructura del proyecto

```text
.                               # Estructura principal del proyecto
├── .gitignore                  # Archivos y directorios ignorados por git
├── README.md                   # Documentación principal del proyecto
├── CHANGELOG.md                # Registro de cambios del proyecto
├── README-SUPABASE.md          # Documentación sobre la migración a Supabase
├── CONFIGURACION-SUPABASE.md   # Instrucciones para configurar Supabase
├── INSTRUCCIONES-PRUEBA.md     # Guía para probar la aplicación
├── LICENSE.md                  # Licencia del proyecto
├── app                         # Directorio principal de Next.js App Router
│   ├── admin                   # Área de administración
│   │   ├── estadisticas        # Visualización de datos y métricas
│   │   │   └── page.tsx        # Página de estadísticas
│   │   ├── guardias            # Gestión de guardias (vista admin)
│   │   │   └── page.tsx        # Página de gestión de guardias
│   │   ├── horarios            # Configuración de horarios
│   │   │   └── page.tsx        # Página de gestión de horarios
│   │   ├── layout.tsx          # Layout para el área de administración
│   │   ├── lugares             # Gestión de espacios y ubicaciones
│   │   │   └── page.tsx        # Página de gestión de lugares
│   │   ├── page.tsx            # Dashboard principal de admin
│   │   └── users               # Gestión de usuarios
│   │       └── page.tsx        # Página de gestión de usuarios
│   ├── globals.css             # Estilos globales de la aplicación
│   ├── guardia                 # Gestión de guardias específicas
│   │   └── page.tsx            # Página de detalles de guardia
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
│   │   ├── guardias-pendientes # Guardias por cubrir
│   │   │   └── page.tsx        # Página de guardias disponibles
│   │   ├── horario             # Visualización del horario semanal
│   │   │   └── page.tsx        # Página de horario del profesor
│   │   ├── layout.tsx          # Layout para el área de profesores
│   │   └── page.tsx            # Dashboard del profesor
│   ├── sala-guardias           # Vista general de guardias activas
│   │   └── page.tsx            # Página de sala de guardias
│   └── test-supabase           # Página de prueba para Supabase
│       └── page.tsx            # Página para verificar conexión a Supabase
├── components                  # Componentes reutilizables
│   ├── common                  # Componentes comunes (navbar, sidebar, etc.)
│   │   ├── Navbar.tsx          # Barra de navegación
│   │   └── Sidebar.tsx         # Menú lateral
│   ├── layout                  # Componentes de layout
│   │   └── protected-layout.tsx # Layout protegido que requiere autenticación
│   ├── theme-provider.tsx      # Proveedor de tema (dark/light mode)
│   └── ui                      # Componentes de interfaz de usuario
│       ├── button.tsx          # Componente de botón
│       ├── card.tsx            # Componente de tarjeta
│       └── ...                 # Otros componentes UI
├── components.json             # Configuración de componentes shadcn/ui
├── hooks                       # Custom hooks de React
│   ├── use-mobile.tsx          # Hook para detección de dispositivos móviles
│   └── use-toast.ts            # Hook para sistema de notificaciones
├── lib                         # Utilidades y configuraciones
│   ├── authService.ts          # Servicio de autenticación
│   ├── db-config.ts            # Configuración de la base de datos
│   ├── guardiasService.ts      # Servicio de guardias
│   ├── horariosService.ts      # Servicio de horarios
│   ├── lugaresService.ts       # Servicio de lugares
│   ├── supabaseClient.ts       # Cliente de Supabase
│   ├── tareasGuardiaService.ts # Servicio de tareas de guardia
│   ├── test-connection.ts      # Prueba de conexión a la base de datos
│   ├── usuariosService.ts      # Servicio de usuarios
│   └── utils.ts                # Funciones de utilidad general
├── middleware.ts               # Middleware de Next.js para autenticación y rutas
├── next.config.mjs             # Configuración de Next.js
├── next-env.d.ts               # Tipos para Next.js
├── package-lock.json           # Bloqueo de versiones de dependencias (npm)
├── package.json                # Dependencias y scripts del proyecto
├── postcss.config.mjs          # Configuración de PostCSS
├── public                      # Archivos estáticos públicos
│   ├── images                  # Imágenes estáticas
│   └── ...                     # Otros archivos públicos
├── scripts                     # Scripts de utilidad
│   ├── create-tables.sql       # Script SQL para crear tablas en Supabase
│   └── ...                     # Otros scripts de utilidad
├── src                         # Código fuente adicional
│   ├── App.css                 # Estilos principales de la aplicación
│   └── contexts                # Contextos de React para estado global
│       ├── AuthContext.tsx     # Contexto de autenticación
│       └── GuardiasContext.tsx # Contexto de gestión de guardias
├── styles                      # Estilos globales adicionales
│   └── globals.css             # Estilos CSS globales
├── tailwind.config.ts          # Configuración de Tailwind CSS
└── tsconfig.json               # Configuración de TypeScript
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
- Cuenta en [Supabase](https://supabase.com/) para la base de datos

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

3. Configura las variables de entorno:
   - Copia el archivo `.env.local.example` a `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   - Edita el archivo `.env.local` y reemplaza los valores de ejemplo con tus credenciales de Supabase

4. Configura Supabase:
   - Sigue las instrucciones en [CONFIGURACION-SUPABASE.md](./CONFIGURACION-SUPABASE.md)
   - Asegúrate de que las variables en tu archivo `.env.local` coincidan con las credenciales de tu proyecto en Supabase

## 🚀 Ejecución del Proyecto

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`. Puedes acceder a la aplicación abriendo esta URL en tu navegador.

Para probar la aplicación, consulta las instrucciones detalladas en [INSTRUCCIONES-PRUEBA.md](./INSTRUCCIONES-PRUEBA.md).

## 💻 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Crea una versión optimizada para producción
- `npm start` - Inicia el servidor en modo producción
- `npm run lint` - Ejecuta el linter para verificar el código
- `npm run check-db` - Verifica la estructura de la base de datos

## 🛠️ Tecnologías Principales

- Next.js 15.1.0
- React 19
- TypeScript
- Tailwind CSS
- Bootstrap 5.3.2
- Supabase (Backend y Base de datos)
- date-fns
- react-day-picker

## 📊 Estado Actual de los Datos

La aplicación utiliza Supabase como backend para proporcionar:

- Persistencia de datos en una base de datos PostgreSQL
- Autenticación y autorización basada en roles
- API para comunicación cliente-servidor
- Manejo profesional de IDs y transacciones

Para más detalles sobre la implementación con Supabase, consulta [README-SUPABASE.md](./README-SUPABASE.md).

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
   - observaciones
   - lugar_id (FK)
   - profesor_ausente_id (FK)
   - profesor_cubridor_id (FK)

5. **tareas_guardia**
   - id (PK)
   - guardia_id (FK)
   - descripcion

## 📓 Bitácora de Desarrollo

La bitácora de desarrollo se mantiene en el archivo [CHANGELOG.md](./CHANGELOG.md). Este documento registra todos los cambios, mejoras y correcciones realizadas en el proyecto de forma cronológica.

### Formato de Entradas

Cada entrada en la bitácora debe seguir el siguiente formato:

```markdown
## [YYYY-MM-DD] - Título descriptivo de los cambios

### Autor(es)
- Nombre del desarrollador

### Cambios realizados
- Descripción detallada del cambio 1
- Descripción detallada del cambio 2

### Archivos modificados
- `ruta/al/archivo1.tsx`: Descripción breve de la modificación
- `ruta/al/archivo2.ts`: Descripción breve de la modificación

### Problemas resueltos
- Descripción del problema 1 que se ha solucionado
- Descripción del problema 2 que se ha solucionado

### Problemas pendientes
- Descripción de problemas conocidos que quedan por resolver (si aplica)

### Notas adicionales
- Cualquier información relevante adicional (si aplica)
```

Para añadir una nueva entrada, copia esta plantilla al principio del archivo CHANGELOG.md y completa la información correspondiente.

## 📚 Documentación Adicional

Para obtener más información sobre aspectos específicos del proyecto, consulta los siguientes documentos:

- [CHANGELOG.md](./CHANGELOG.md) - Registro de cambios y actualizaciones del proyecto
- [README-SUPABASE.md](./README-SUPABASE.md) - Detalles sobre la migración a Supabase
- [CONFIGURACION-SUPABASE.md](./CONFIGURACION-SUPABASE.md) - Instrucciones para configurar Supabase
- [INSTRUCCIONES-PRUEBA.md](./INSTRUCCIONES-PRUEBA.md) - Guía para probar la aplicación
- [LICENSE.md](./LICENSE.md) - Licencia del proyecto

## 🤝 Contribución

Si deseas contribuir al proyecto, por favor:

1. Haz fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios y haz commit (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo [LICENSE.md](./LICENSE.md) para más detalles.