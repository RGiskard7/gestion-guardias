# Gestión de Guardias

Sistema de gestión de guardias desarrollado con Next.js, TypeScript y Tailwind CSS.

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
