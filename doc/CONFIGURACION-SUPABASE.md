# Configuración de Supabase

Este documento proporciona instrucciones para configurar Supabase como backend para la aplicación de gestión de guardias.

## Requisitos previos

1. Cuenta en [Supabase](https://supabase.com/)
2. Node.js y npm instalados

## Pasos para configurar Supabase

### 1. Crear un proyecto en Supabase

1. Inicia sesión en [Supabase](https://supabase.com/)
2. Haz clic en "New Project"
3. Introduce un nombre para el proyecto (por ejemplo, "gestion-guardias")
4. Introduce una contraseña segura para la base de datos
5. Selecciona la región más cercana a tus usuarios
6. Haz clic en "Create new project"

### 2. Configurar la base de datos

1. Una vez creado el proyecto, ve a la sección "SQL Editor"
2. Copia el contenido del archivo `scripts/create-tables.sql`
3. Pega el contenido en el editor SQL
4. Haz clic en "Run" para crear las tablas

### 3. Configurar las variables de entorno

1. En el proyecto de Supabase, ve a la sección "Settings" > "API"
2. Copia la URL del proyecto y la clave anónima (anon key)
3. Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=tu-clave-publica
```

4. Reemplaza los valores con los que copiaste de Supabase

### 4. Inicializar la base de datos con datos de ejemplo

1. Asegúrate de tener instaladas las dependencias del proyecto:

```bash
npm install
```

2. Ejecuta el script de inicialización:

```bash
npx ts-node scripts/seed-db.ts
```

## Verificación de la configuración

Para verificar que la configuración se ha realizado correctamente, puedes acceder a la página de prueba en `/test-supabase`. Esta página muestra el estado de la conexión y realiza pruebas de los servicios.

## Solución de problemas

### Error de conexión

Si tienes problemas para conectarte a Supabase, verifica lo siguiente:

1. Las variables de entorno están correctamente configuradas en `.env.local`
2. La URL y la clave de Supabase son correctas
3. Las tablas se han creado correctamente en la base de datos

### Error en las consultas

Si las consultas a la base de datos fallan, verifica lo siguiente:

1. Las tablas se han creado correctamente
2. Las políticas de seguridad (RLS) están configuradas correctamente
3. Los nombres de las tablas y columnas coinciden con los utilizados en el código

## Recursos adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/) 