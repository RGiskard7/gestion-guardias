# gestion-guaridas

# Aplicación para la gestión de Guardias de un instituto

Sistema de gestión de guardias para institutos educativos desarrollado con Next.js, TypeScript y Bootstrap. Esta aplicación permite gestionar las ausencias del profesorado, la asignación de guardias y su monitorización diaria.

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
    - [Gestión de Ausencias](#gestión-de-ausencias)
    - [Sala de Guardias](#sala-de-guardias)
    - [Modo Oscuro](#modo-oscuro)
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
  - [📖 Bibliografía y Referencias](#-bibliografía-y-referencias)
    - [Documentación Oficial](#documentación-oficial)
    - [Arquitectura y Patrones](#arquitectura-y-patrones)
    - [Seguridad](#seguridad)
    - [Rendimiento y Optimización](#rendimiento-y-optimización)
    - [Diseño UI/UX](#diseño-uiux)
    - [Tutoriales y Guías](#tutoriales-y-guías)
    - [Herramientas de Desarrollo](#herramientas-de-desarrollo)
  - [🤝 Contribución](#-contribución)

</details>

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
- Sistema de asignación y firma de guardias
- Control de restricciones (1 guardia por tramo horario)
- Límite de 6 guardias por semana por profesor
- Anulación de guardias con actualización automática de estado

### Gestión de Ausencias
- Registro de ausencias por parte de profesores
- Aprobación o rechazo de ausencias por parte de administradores
- Creación automática de guardias a partir de ausencias aceptadas
- Opción "Todo el día" para seleccionar todos los tramos horarios al registrar ausencias
- Anulación de ausencias con actualización automática de guardias asociadas

### Sala de Guardias
- Visualización en tiempo real del estado de las guardias
- Filtrado por estado (Pendientes, Asignadas, Firmadas)
- Vista optimizada para pantallas grandes en salas de profesores

### Modo Oscuro
- Interfaz adaptable con modo claro y oscuro
- Persistencia de la preferencia del usuario
- Detección automática de preferencias del sistema

## 🗂️ Estructura del proyecto

```text
.
├── app                         # Directorio principal de Next.js App Router
│   ├── (auth)                 # Rutas de autenticación
│   │   ├── login             # Página de inicio de sesión
│   │   └── logout            # Página de cierre de sesión
│   ├── admin                  # Área de administración
│   │   ├── ausencias         # Gestión de ausencias
│   │   ├── estadisticas      # Visualización de datos y métricas
│   │   ├── guardias          # Gestión de guardias
│   │   ├── horarios          # Configuración de horarios
│   │   ├── lugares           # Gestión de espacios
│   │   └── usuarios          # Gestión de usuarios
│   ├── api                    # API Routes de Next.js
│   │   ├── auth             # Endpoints de autenticación
│   │   ├── guardias         # Endpoints de guardias
│   │   └── usuarios         # Endpoints de usuarios
│   ├── profesor              # Área de profesores
│   │   ├── ausencias        # Registro de ausencias
│   │   ├── firmar-guardia   # Firma de guardias realizadas
│   │   ├── guardias         # Gestión de guardias personales
│   │   └── horario          # Visualización de horario
│   └── sala-guardias        # Vista de guardias activas
├── components                # Componentes reutilizables
│   ├── auth                 # Componentes de autenticación
│   ├── common               # Componentes comunes (layout, nav)
│   ├── forms               # Componentes de formularios
│   ├── guardias            # Componentes específicos de guardias
│   ├── tables             # Componentes de tablas y listados
│   └── ui                 # Componentes de interfaz básicos
├── config                  # Configuraciones globales
│   ├── constants.ts       # Constantes de la aplicación
│   └── theme.ts          # Configuración del tema
├── doc                    # Documentación
│   ├── DIAGRAMA-ER.md    # Diagrama entidad-relación
│   ├── DIAGRAMAS-ESTADOS.md # Diagramas de estados
│   ├── DIAGRAMAS-FLUJO.md # Diagramas de flujo
│   ├── MANUAL-PROGRAMADOR.md # Manual técnico
│   ├── MANUAL-USUARIO.md # Manual de usuario
│   └── SUPABASE.md      # Documentación de Supabase
├── hooks                 # Custom hooks
│   ├── useAuth.ts       # Hook de autenticación
│   ├── useGuardias.ts   # Hook de gestión de guardias
│   ├── useHorarios.ts   # Hook de gestión de horarios
│   └── useTheme.ts      # Hook de tema oscuro/claro
├── lib                   # Utilidades y servicios
│   ├── api              # Funciones de API
│   ├── db               # Utilidades de base de datos
│   ├── services         # Servicios de datos
│   └── utils           # Funciones utilitarias
├── public               # Archivos estáticos
│   ├── fonts           # Fuentes
│   └── images          # Imágenes
├── styles              # Estilos globales
│   ├── globals.css    # CSS global
│   └── themes         # Temas claro/oscuro
├── types               # Definiciones de tipos
│   ├── api.ts         # Tipos para la API
│   ├── db.ts          # Tipos de la base de datos
│   └── index.ts       # Tipos globales
├── .env.local         # Variables de entorno locales
├── .gitignore        # Archivos ignorados por git
├── CHANGELOG.md      # Registro de cambios
├── middleware.ts    # Middleware de autenticación
├── next.config.mjs  # Configuración de Next.js
├── package.json     # Dependencias y scripts
├── README.md       # Documentación principal
└── tsconfig.json  # Configuración de TypeScript
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
   - Sigue las instrucciones en [CONFIGURACION-SUPABASE.md](./doc/CONFIGURACION-SUPABASE.md)
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

Para más detalles sobre la implementación con Supabase, consulta [README-SUPABASE.md](./doc/README-SUPABASE.md).

## 🗄️ Estructura de la Base de Datos

Para una representación visual de la estructura de la base de datos y las relaciones entre tablas, consulta el [Diagrama Entidad-Relación](./doc/DIAGRAMA-ER.md).

### Tablas Principales

1. **Usuarios**
   - id (PK)
   - nombre
   - email
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
   - profesor_id (FK)
   - fecha
   - tramo_horario
   - estado
   - observaciones
   - tareas

5. **Guardias**
   - id (PK)
   - fecha
   - tramo_horario
   - tipo_guardia
   - firmada
   - estado
   - observaciones
   - lugar_id (FK)
   - profesor_cubridor_id (FK)
   - ausencia_id (FK)

6. **Tareas_guardia**
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

### Notas adicionales
- Cualquier información relevante adicional (si aplica)
```

Para añadir una nueva entrada, copia esta plantilla al principio del archivo CHANGELOG.md y completa la información correspondiente.

## 📚 Documentación Adicional

Para facilitar el uso y comprensión del sistema, se proporciona la siguiente documentación:

- [Manual de Usuario](./doc/MANUAL-USUARIO.md) - Guía completa para usuarios del sistema
- [Manual del Programador](./doc/MANUAL-PROGRAMADOR.md) - Documentación técnica exhaustiva
- [Diagramas de Flujo](./doc/DIAGRAMAS-FLUJO.md) - Diagramas de los principales flujos del sistema
- [Diagramas de Estados](./doc/DIAGRAMAS-ESTADOS.md) - Estados y transiciones de los elementos del sistema
- [Configuración y Uso de Supabase](./doc/SUPABASE.md) - Guía completa de configuración y uso de Supabase
- [Diagrama Entidad-Relación](./doc/DIAGRAMA-ER.md) - Estructura de la base de datos

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

## 🤝 Contribución

Si deseas contribuir al proyecto, por favor:

1. Haz fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios y haz commit (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request