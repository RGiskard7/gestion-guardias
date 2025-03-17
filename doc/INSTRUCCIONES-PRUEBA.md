# Instrucciones para probar la aplicación

Este documento proporciona instrucciones para probar la aplicación de gestión de guardias con Supabase como backend.

## Requisitos previos

1. Tener configurado Supabase según las instrucciones en `CONFIGURACION-SUPABASE.md`
2. Tener instaladas todas las dependencias del proyecto

## Pasos para probar la aplicación

### 1. Configurar las variables de entorno

1. Asegúrate de tener un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=tu-clave-publica
```

### 2. Inicializar la base de datos

1. Ejecuta el script SQL para crear las tablas:
   - Copia el contenido de `scripts/create-tables.sql`
   - Pégalo en el editor SQL de Supabase y ejecútalo

2. Inicializa la base de datos con datos de ejemplo:

```bash
npx ts-node scripts/seed-db.ts
```

> **Nota importante**: El script de inicialización maneja los IDs de forma profesional, calculando el próximo ID disponible para cada tabla antes de insertar nuevos registros. Esto garantiza que no haya conflictos de IDs y que la secuencia de IDs sea consistente.

### 3. Verificar la conexión a Supabase

1. Inicia la aplicación:

```bash
npm run dev
```

2. Accede a la página de prueba en `http://localhost:3000/test-supabase`
3. Verifica que la conexión a Supabase sea exitosa y que se muestren los datos de ejemplo

### 4. Probar la funcionalidad de autenticación

1. Accede a la página de inicio en `http://localhost:3000`
2. Inicia sesión con uno de los usuarios de ejemplo:
   - Email: `admin@example.com` (administrador)
   - Email: `profesor1@example.com` (profesor)

### 5. Probar la gestión de guardias

Una vez iniciada la sesión, puedes probar las siguientes funcionalidades:

1. **Ver guardias**: Navega a la sección de guardias para ver las guardias existentes
2. **Crear guardia**: Crea una nueva guardia utilizando el formulario correspondiente
   - Observa cómo el sistema calcula automáticamente el próximo ID disponible
3. **Asignar guardia**: Asigna una guardia pendiente a un profesor
4. **Firmar guardia**: Firma una guardia asignada
5. **Anular guardia**: Anula una guardia existente

### 6. Probar la gestión de usuarios

Si has iniciado sesión como administrador, puedes probar:

1. **Ver usuarios**: Navega a la sección de usuarios para ver los usuarios existentes
2. **Crear usuario**: Crea un nuevo usuario utilizando el formulario correspondiente
   - Observa cómo el sistema calcula automáticamente el próximo ID disponible
3. **Editar usuario**: Modifica los datos de un usuario existente
4. **Desactivar usuario**: Marca un usuario como inactivo

### 7. Probar la gestión de lugares

1. **Ver lugares**: Navega a la sección de lugares para ver los lugares existentes
2. **Crear lugar**: Crea un nuevo lugar utilizando el formulario correspondiente
   - Observa cómo el sistema calcula automáticamente el próximo ID disponible
3. **Editar lugar**: Modifica los datos de un lugar existente
4. **Eliminar lugar**: Elimina un lugar existente

### 8. Probar la gestión de horarios

1. **Ver horarios**: Navega a la sección de horarios para ver los horarios existentes
2. **Crear horario**: Crea un nuevo horario utilizando el formulario correspondiente
   - Observa cómo el sistema calcula automáticamente el próximo ID disponible
3. **Editar horario**: Modifica los datos de un horario existente
4. **Eliminar horario**: Elimina un horario existente

## Manejo profesional de IDs

La aplicación implementa un enfoque profesional para el manejo de IDs:

1. **Cálculo automático**: Antes de insertar un nuevo registro, el sistema consulta el último ID utilizado en la tabla y calcula el siguiente.
2. **Verificación de existencia**: Antes de actualizar o eliminar un registro, el sistema verifica que el ID exista.
3. **Transacciones atómicas**: Las operaciones de inserción, actualización y eliminación se realizan de forma atómica para evitar inconsistencias.
4. **Manejo de errores**: El sistema maneja adecuadamente los errores relacionados con los IDs, proporcionando mensajes claros.

Este enfoque garantiza la integridad de los datos y evita problemas comunes como:
- Duplicación de IDs
- Huecos en la secuencia de IDs
- Referencias a IDs inexistentes
- Inconsistencias en la base de datos

## Solución de problemas

### Error de conexión a Supabase

Si tienes problemas para conectarte a Supabase:

1. Verifica que las variables de entorno estén correctamente configuradas
2. Asegúrate de que el proyecto de Supabase esté activo
3. Comprueba que las tablas se hayan creado correctamente

### Error al iniciar sesión

Si tienes problemas para iniciar sesión:

1. Verifica que el usuario exista en la base de datos
2. Asegúrate de que el usuario esté activo
3. Comprueba que estés utilizando el email correcto

### Error al cargar datos

Si los datos no se cargan correctamente:

1. Verifica la conexión a Supabase en la página de prueba
2. Asegúrate de que las tablas contengan datos
3. Comprueba los logs en la consola del navegador para identificar posibles errores 