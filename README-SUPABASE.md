# Migración a Supabase

Este documento describe la migración del backend de la aplicación de gestión de guardias a Supabase.

## Cambios realizados

1. **Servicios de datos**: Se han creado servicios para cada entidad que interactúan directamente con Supabase:
   - `authService.ts`: Servicio de autenticación
   - `usuariosService.ts`: Servicio de usuarios
   - `guardiasService.ts`: Servicio de guardias
   - `horariosService.ts`: Servicio de horarios
   - `lugaresService.ts`: Servicio de lugares
   - `tareasGuardiaService.ts`: Servicio de tareas de guardia

2. **Contextos actualizados**: Se han actualizado los contextos para utilizar los servicios de datos:
   - `AuthContext.tsx`: Contexto de autenticación
   - `GuardiasContext.tsx`: Contexto de guardias

3. **Eliminación de datos mockeados**: Se han eliminado todos los datos mockeados y el uso de localStorage para almacenar datos.

4. **Página de prueba**: Se ha creado una página de prueba (`app/test-supabase/page.tsx`) para verificar la conexión a Supabase y probar los servicios.

5. **Manejo profesional de IDs**: Se ha implementado un sistema robusto para el manejo de IDs en todas las operaciones CRUD:
   - Cálculo automático del próximo ID disponible antes de insertar nuevos registros
   - Verificación de existencia de IDs antes de actualizar o eliminar registros
   - Manejo adecuado de errores relacionados con IDs
   - Transacciones atómicas para garantizar la integridad de los datos

## Estructura de la base de datos

La base de datos en Supabase tiene las siguientes tablas:

1. **Usuarios**: Almacena la información de los usuarios
   - `id`: ID del usuario
   - `nombre`: Nombre del usuario
   - `email`: Email del usuario
   - `rol`: Rol del usuario (admin o profesor)
   - `activo`: Indica si el usuario está activo

2. **Guardias**: Almacena la información de las guardias
   - `id`: ID de la guardia
   - `fecha`: Fecha de la guardia
   - `tramo_horario`: Tramo horario de la guardia
   - `tipo_guardia`: Tipo de guardia
   - `firmada`: Indica si la guardia ha sido firmada
   - `estado`: Estado de la guardia (Pendiente, Asignada, Firmada, Anulada)
   - `observaciones`: Observaciones de la guardia
   - `lugar_id`: ID del lugar donde se realiza la guardia
   - `profesor_ausente_id`: ID del profesor ausente
   - `profesor_cubridor_id`: ID del profesor que cubre la guardia

3. **Horarios**: Almacena los horarios de los profesores
   - `id`: ID del horario
   - `profesor_id`: ID del profesor
   - `dia_semana`: Día de la semana
   - `tramo_horario`: Tramo horario

4. **Lugares**: Almacena la información de los lugares
   - `id`: ID del lugar
   - `codigo`: Código del lugar
   - `descripcion`: Descripción del lugar
   - `tipo_lugar`: Tipo de lugar

5. **Tareas_guardia**: Almacena las tareas asociadas a las guardias
   - `id`: ID de la tarea
   - `guardia_id`: ID de la guardia
   - `descripcion`: Descripción de la tarea

## Configuración

Para que la aplicación funcione correctamente, es necesario configurar las siguientes variables de entorno:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=tu-clave-publica
```

## Pruebas

Para verificar que la conexión a Supabase funciona correctamente, puedes acceder a la página de prueba en `/test-supabase`. Esta página muestra el estado de la conexión y realiza pruebas de los servicios.

## Manejo profesional de IDs

La aplicación implementa un enfoque profesional para el manejo de IDs en todas las operaciones CRUD:

### Cálculo automático de IDs

Antes de insertar un nuevo registro, el sistema consulta el último ID utilizado en la tabla y calcula el siguiente:

```typescript
async function getNextId(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from(getTableName('GUARDIAS'))
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error al obtener el último ID:', error);
      throw error;
    }

    // Si no hay registros, comenzar desde 1
    if (!data || data.length === 0) {
      return 1;
    }

    // Devolver el siguiente ID
    return data[0].id + 1;
  } catch (error) {
    console.error('Error inesperado al obtener el próximo ID:', error);
    throw error;
  }
}
```

### Verificación de existencia

Antes de actualizar o eliminar un registro, el sistema verifica que el ID exista:

```typescript
// Verificar que la guardia existe antes de actualizarla
const guardiaExistente = await getGuardiaById(id);
if (!guardiaExistente) {
  throw new Error(`No existe una guardia con ID ${id}`);
}
```

### Transacciones atómicas

Las operaciones de inserción, actualización y eliminación se realizan de forma atómica para evitar inconsistencias:

```typescript
// Crear la guardia con el ID calculado
const nuevaGuardia = {
  id: nextId,
  ...guardia
};

const { data, error } = await supabase
  .from(getTableName('GUARDIAS'))
  .insert(nuevaGuardia)
  .select()
  .single();
```

### Manejo de errores

El sistema maneja adecuadamente los errores relacionados con los IDs, proporcionando mensajes claros:

```typescript
try {
  // Operación con la base de datos
} catch (error) {
  console.error(`Error inesperado al obtener guardia con ID ${id}:`, error);
  throw error;
}
```

## Próximos pasos

1. **Implementar autenticación completa**: Actualmente, la autenticación se realiza solo con el email. Se podría implementar una autenticación más segura con contraseñas o mediante proveedores externos.

2. **Mejorar la gestión de errores**: Implementar un sistema más robusto para manejar errores y mostrar mensajes al usuario.

3. **Optimizar consultas**: Revisar y optimizar las consultas a la base de datos para mejorar el rendimiento.

4. **Implementar caché**: Implementar un sistema de caché para reducir el número de consultas a la base de datos.

5. **Añadir tests**: Crear tests para verificar el correcto funcionamiento de los servicios y contextos. 