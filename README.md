# gestion-guaridas

# Aplicación para la gestión de Guardias de un instituto

Sistema de gestión de guardias para institutos educativos desarrollado con Next.js, TypeScript y Bootstrap. Esta aplicación permite gestionar las ausencias del profesorado, la asignación de guardias y su monitorización diaria.

<details>
<summary>📑 Tabla de Contenidos</summary>

- [gestion-guaridas](#gestion-guaridas)
- [Aplicación para la gestión de Guardias de un instituto](#aplicación-para-la-gestión-de-guardias-de-un-instituto)
  - [📚 Documentación del proyecto](#-documentación-del-proyecto)
  - [📋 Descripción General](#-descripción-general)
    - [Administrador](#administrador)
    - [Profesor](#profesor)
  - [⭐ Funcionalidades Principales](#-funcionalidades-principales)
    - [Autenticación](#autenticación)
    - [Gestión de Usuarios](#gestión-de-usuarios)
    - [Gestión de Horarios](#gestión-de-horarios)
    - [Gestión de Espacios](#gestión-de-espacios)
    - [Gestión de Guardias](#gestión-de-guardias)
    - [Gestión de Ausencias](#gestión-de-ausencias)
    - [Mis Guardias (Profesores)](#mis-guardias-profesores)
    - [Sala de Guardias](#sala-de-guardias)
    - [Modo Oscuro](#modo-oscuro)
  - [🗂️ Estructura del proyecto](#️-estructura-del-proyecto)
  - [📸 Capturas de Pantalla](#-capturas-de-pantalla)
  - [📽️ Video Demo](#️-video-demo)
  - [�� Requisitos Previos](#-requisitos-previos)
  - [⚙️ Instalación](#️-instalación)
  - [🚀 Ejecución del Proyecto](#-ejecución-del-proyecto)
  - [💻 Scripts Disponibles](#-scripts-disponibles)
  - [🛠️ Tecnologías Principales](#️-tecnologías-principales)
  - [📊 Estado Actual de los Datos](#-estado-actual-de-los-datos)
  - [🗄️ Estructura de la Base de Datos](#️-estructura-de-la-base-de-datos)
    - [Tablas Principales](#tablas-principales)
  - [📓 Bitácora de Desarrollo](#-bitácora-de-desarrollo)
    - [Formato de Entradas](#formato-de-entradas)
  - [📖 Bibliografía y Referencias](#-bibliografía-y-referencias)
    - [Documentación Oficial](#documentación-oficial)
    - [Arquitectura y Patrones](#arquitectura-y-patrones)
    - [Seguridad](#seguridad)
    - [Rendimiento y Optimización](#rendimiento-y-optimización)
    - [Diseño UI/UX](#diseño-uiux)
    - [Tutoriales y Guías](#tutoriales-y-guías)
    - [Herramientas de Desarrollo](#herramientas-de-desarrollo)

</details>

## 📚 Documentación del proyecto

Para facilitar el uso y comprensión del sistema, se proporciona la siguiente documentación:

- [Memoria del proyecto](./doc/MEMORIA_PROYECTO.md) - Documentación completa del proyecto, incluyendo análisis, diseño, implementación y conclusiones
- [Manual de usuario](./doc/MANUAL-USUARIO.md) - Guía básica para usuarios del sistema
- [Manual del programador](./doc/MANUAL-PROGRAMADOR.md) - Documentación técnica exhaustiva
- [Diagramas de flujo](./doc/DIAGRAMAS-FLUJO.md) - Diagramas detallados de los principales flujos del sistema, incluidos los ciclos de vida de ausencias y guardias, procesos de anulación y firma
- [Diagramas de estados](./doc/DIAGRAMAS-ESTADOS.md) - Representación gráfica de los estados posibles de guardias, ausencias y usuarios
- [Diagrama entidad-relación](./doc/DIAGRAMA-ER.md) - Estructura completa de la base de datos
- [Configuración y uso de Supabase](./doc/SUPABASE.md) - Guía completa de configuración y uso de Supabase
- [Diseño de la interfaz de usuario](./doc/DISEÑO_INTERFAZ.md) - Evolución del diseño desde los prototipos iniciales hasta la implementación final

Los diagramas de flujo y estados incluyen representaciones detalladas de:
- Ciclos de vida completos de ausencias y guardias
- Procesos de anulación con manejo de ausencias asociadas
- Flujo de firma de guardias con tareas
- Relaciones entre entidades y sus transiciones de estado
- Sistema de pestañas para la gestión integral de guardias por parte de los profesores

Todo lo referido a la documentación del proyecto se encuentra en el directorio [/doc](./doc)

## 📋 Descripción General

El sistema contempla dos tipos de usuarios:

### Administrador
- Gestión completa de usuarios (profesores)
- Asignación de horarios de guardia
- Gestión de espacios y ubicaciones
- Control y supervisión de guardias y ausencias
- Visualización de estadísticas

### Profesor
- Registro de ausencias
- Visualización unificada de diferentes tipos de guardias (pendientes, generadas, por firmar)
- Asignación a guardias disponibles
- Firma de guardias realizadas
- Gestión de tareas para los alumnos durante su ausencia
- Visualización de su horario semanal de guardias

## ⭐ Funcionalidades Principales

### Autenticación
- Acceso mediante correo electrónico y contraseña
- Gestión de sesiones mediante Supabase Auth
- Protección de rutas según roles de usuario
- Redirección a la pantalla de login cuando se requiere autenticación

### Gestión de Usuarios
- Crear, editar y desactivar usuarios de tipo "profesor"
- Control de acceso basado en roles (administrador/profesor)
- Validación de emails únicos al crear nuevos usuarios
- Gestión de la herencia de horarios a nivel de aplicación entre usuarios

### Gestión de Horarios
- Asignación de tramos de guardia a profesores
- Gestión de disponibilidad por día y hora
- Vista semanal de horarios para profesores
- Vista en formato calendario para mejor visualización
- Prevención de horarios duplicados para un mismo profesor

### Gestión de Espacios
- Registro y gestión de aulas, patios y otras áreas
- Asignación de espacios para guardias

### Gestión de Guardias
- Sistema de asignación y firma de guardias
- Control de restricciones (1 guardia por tramo horario)
- Límite de 6 guardias por semana por profesor
- Anulación de guardias con actualización automática de estado
- Soporte para diferentes tipos de guardia (Aula, Patio, Recreo)
- Preservación de historial mediante actualización de observaciones en anulaciones
- Al anular una guardia con ausencia asociada, la ausencia vuelve a estado "Pendiente"
- Verificación automática de disponibilidad de profesores basada en horario y guardias asignadas
- Creación de guardias por lotes para múltiples fechas y tramos horarios

### Gestión de Ausencias
- Registro de ausencias por parte de profesores
- Aprobación o rechazo de ausencias por parte de administradores
- Creación automática de guardias a partir de ausencias aceptadas
- Opción "Todo el día" para seleccionar todos los tramos horarios al registrar ausencias
- Anulación de ausencias con actualización automática de guardias asociadas
- Trazabilidad completa mediante observaciones con información de cambios de estado
- Ciclo completo con estados: Pendiente → Aceptada → Pendiente (si se anula la guardia)

### Mis Guardias (Profesores)
- Interfaz unificada con sistema de pestañas para la gestión integral de guardias:
  - **Pendientes**: Guardias disponibles para asignar, filtradas por horario compatible del profesor
  - **Generadas**: Guardias creadas a partir de ausencias del profesor
  - **Por firmar**: Guardias asignadas al profesor que debe cubrir y firmar
- Navegación mediante parámetros URL que permiten mantener la pestaña activa entre recargas
- Estado de cada guardia claramente visible con un sistema de etiquetas codificadas por color
- Acciones contextuales según el tipo de guardia y su estado actual

### Sala de Guardias
- Visualización en tiempo real del estado de las guardias
- Filtrado por estado (Pendientes, Asignadas, Firmadas)
- Vista optimizada para pantallas grandes en salas de profesores

### Modo Oscuro
- Interfaz adaptable con modo claro y oscuro
- Persistencia de la preferencia del usuario
- Detección automática de preferencias del sistema
- Compatibilidad mejorada para tablas y componentes en modo oscuro

## 🗂️ Estructura del proyecto

```text
.                               # Estructura principal del proyecto
├── .gitignore                  # Archivos y directorios ignorados por git
├── README.md                   # Documentación principal del proyecto
├── CHANGELOG.md                # Registro de cambios del proyecto
├── app                         # Directorio principal de Next.js App Router
│   ├── admin                   # Área de administración
│   │   ├── ausencias           # Gestión completa de ausencias
│   │   │   └── page.tsx        # Página de gestión de ausencias
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
│   │   ├── mis-guardias        # Vista unificada con pestañas
│   │   │   └── page.tsx        # Gestión integral de guardias
│   │   ├── horario             # Visualización del horario semanal
│   │   │   └── page.tsx        # Página de horario del profesor
│   │   ├── layout.tsx          # Layout para el área de profesores
│   │   └── page.tsx            # Dashboard del profesor
│   └── sala-guardias           # Vista general de guardias activas
│       └── page.tsx            # Página de sala de guardias
├── components                  # Componentes reutilizables
│   ├── common                  # Componentes comunes (navbar, sidebar, etc.)
│   │   ├── Navbar.tsx          # Barra de navegación
│   │   └── Sidebar.tsx         # Menú lateral
│   └── ui                      # Componentes de interfaz de usuario
│       └── ...                 # Otros componentes UI
├── doc                         # Documentación adicional
│   ├── DIAGRAMA-ER.md          # Diagrama entidad-relación
│   ├── DIAGRAMAS-ESTADOS.md    # Diagramas de estados
│   ├── DIAGRAMAS-FLUJO.md      # Diagramas de flujo en formato Mermaid
│   ├── MANUAL-USUARIO.md       # Manual de usuario detallado
│   ├── MANUAL-PROGRAMADOR.md   # Manual técnico
│   ├── SUPABASE.md             # Documentación de Supabase
│   ├── images                  # Imágenes para la documentación
│   └── ...                     # Otra documentación
├── hooks                       # Custom hooks de React
├── lib                         # Utilidades y configuraciones
│   ├── authService.ts          # Servicio de autenticación
│   ├── ausenciasService.ts     # Servicio de ausencias
│   ├── db-config.ts            # Configuración de la base de datos
│   ├── guardiasService.ts      # Servicio de guardias
│   ├── horariosService.ts      # Servicio de horarios
│   ├── lugaresService.ts       # Servicio de lugares
│   ├── supabaseClient.ts       # Cliente de Supabase
│   ├── tareasGuardiaService.ts # Servicio de tareas de guardia
│   └── usuariosService.ts      # Servicio de usuarios
├── middleware.ts               # Middleware de Next.js para autenticación y rutas
├── scripts                     # Scripts de utilidad
│   └── create-tables.sql       # Script SQL para crear tablas en Supabase
└── src                         # Código fuente adicional
    ├── App.css                 # Estilos principales de la aplicación
    └── contexts                # Contextos de React para estado global
        ├── AuthContext.tsx     # Contexto de autenticación
        ├── GuardiasContext.tsx # Contexto de gestión de guardias
        └── ThemeContext.tsx    # Contexto para gestión del tema
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

## 📽️ Video Demo

Puedes ver una demostración del funcionamiento del sistema en [este enlace](https://drive.google.com/file/d/1Tz7NR0exjDE1Xx0rBiIn_CFNqNgL6u-X/view?usp=drive_link).

## �� Requisitos Previos

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
   - Copia el archivo `example.env.local` a `.env.local`:
   ```bash
   cp example.env.local .env.local
   ```
   - Edita el archivo `.env.local` y reemplaza los valores de ejemplo con tus credenciales de Supabase

4. Configura Supabase:
   - Sigue las instrucciones en [SUPABASE.md](./doc/SUPABASE.md)
   - Asegúrate de que las variables en tu archivo `.env.local` coincidan con las credenciales de tu proyecto en Supabase

## 🚀 Ejecución del Proyecto

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`. Puedes acceder a la aplicación abriendo esta URL en tu navegador.

Para probar la aplicación, consulta las instrucciones detalladas en [INSTRUCCIONES-PRUEBA.md](./doc/INSTRUCCIONES-PRUEBA.md).

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

Para más detalles sobre la implementación con Supabase, consulta [SUPABASE.md](./doc/SUPABASE.md).

## 🗄️ Estructura de la Base de Datos

Para una representación visual de la estructura de la base de datos y las relaciones entre tablas, consulta el [Diagrama Entidad-Relación](./doc/DIAGRAMA-ER.md).

### Tablas Principales

1. **Usuarios**
   - id (PK)
   - nombre
   - apellido
   - email
   - password
   - rol
   - activo

2. **Horarios**
   - id (PK)
   - profesor_id (FK)
   - dia_semana
   - tramo_horario

3. **Lugares**
   - id (PK)
   - codigo
   - descripcion
   - tipo_lugar

4. **Ausencias**
   - id (PK)
   - profesor_id (FK) - Profesor que se ausenta
   - fecha - Día de la ausencia
   - tramo_horario - Período específico de ausencia
   - estado - Pendiente/Aceptada/Rechazada
   - observaciones - Incluye motivos, comentarios y registros de cambios de estado

5. **Guardias**
   - id (PK)
   - fecha - Día de la guardia
   - tramo_horario - Período específico de la guardia
   - tipo_guardia - Aula/Patio/Recreo
   - firmada - Indica si ha sido completada (true/false)
   - estado - Pendiente/Asignada/Firmada/Anulada
   - observaciones - Incluye información de la guardia y registros de cambios
   - lugar_id (FK) - Ubicación donde se realiza la guardia
   - profesor_cubridor_id (FK) - Profesor asignado para cubrir la guardia
   - ausencia_id (FK) - Ausencia asociada (si proviene de una)

6. **Tareas_guardia**
   - id (PK)
   - guardia_id (FK) - Guardia a la que pertenece la tarea
   - descripcion - Descripción de las tareas realizadas durante la guardia

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

### Notas adicionales
- Cualquier información relevante adicional (si aplica)
```

Para añadir una nueva entrada, copia esta plantilla al principio del archivo CHANGELOG.md y completa la información correspondiente.


## 📖 Bibliografía y Referencias

### Documentación Oficial
- [Next.js Documentation](https://nextjs.org/docs) - Framework principal
- [React Documentation](https://react.dev/) - Biblioteca de UI
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Lenguaje de programación
- [Supabase Documentation](https://supabase.com/docs) - Backend y base de datos
- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3) - Framework CSS

### Arquitectura y Patrones
- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) por Robert C. Martin
- [Patterns of Enterprise Application Architecture](https://www.martinfowler.com/books/eaa.html) por Martin Fowler
- [React Patterns](https://reactpatterns.com/) - Patrones comunes en React
- [Next.js Patterns](https://leerob.io/blog/react-server-components) por Lee Robinson

### Seguridad
- [OWASP Top Ten](https://owasp.org/www-project-top-ten/) - Guía de seguridad web
- [Web Security Concepts](https://developer.mozilla.org/en-US/docs/Web/Security) - MDN Web Docs
- [Auth Patterns in Next.js](https://nextjs.org/docs/authentication) - Documentación oficial

### Rendimiento y Optimización
- [Web Vitals](https://web.dev/vitals/) - Métricas de rendimiento
- [React Performance](https://reactjs.org/docs/optimizing-performance.html) - Guía oficial
- [Database Indexing](https://www.postgresql.org/docs/current/indexes.html) - PostgreSQL

### Diseño UI/UX
- [Material Design Guidelines](https://material.io/design) - Principios de diseño
- [Nielsen Norman Group](https://www.nngroup.com/articles/) - Investigación UX
- [Refactoring UI](https://www.refactoringui.com/) - Mejores prácticas de diseño

### Tutoriales y Guías
- [Full Stack Open](https://fullstackopen.com/) - Universidad de Helsinki
- [JavaScript.info](https://javascript.info/) - JavaScript moderno
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/) - Base de datos
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) - TypeScript avanzado

### Herramientas de Desarrollo
- [VS Code TypeScript Tips](https://code.visualstudio.com/docs/typescript/typescript-tutorial)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Git Best Practices](https://git-scm.com/book/en/v2)

---

<p align="center">
  <small>Desarrollado por <b>Edu Díaz</b> a.k.a <b>RGiskard7</b> ❤️</small>
</p>
