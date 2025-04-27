# Configuración y Uso de Supabase

## Índice
1. [Introducción](#introducción)
2. [Configuración Inicial](#configuración-inicial)
3. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
4. [Autenticación](#autenticación)
5. [Políticas de Seguridad](#políticas-de-seguridad)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Migración desde Java](#migración-desde-java)
8. [Mantenimiento y Monitorización](#mantenimiento-y-monitorización)

## Introducción

Supabase actúa como nuestro backend-as-a-service (BaaS), proporcionando:
- Base de datos PostgreSQL
- Autenticación y autorización
- API REST y tiempo real
- Almacenamiento de archivos

## Configuración Inicial

### 1. Creación del Proyecto en Supabase

1. Accede a [Supabase](https://supabase.com) y crea una cuenta o inicia sesión
2. Crea un nuevo proyecto y selecciona la región más cercana (Europa)
3. Guarda la URL del proyecto y la clave anon/public

### 2. Variables de Entorno
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
```

### 3. Cliente de Supabase
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## Estructura de la Base de Datos

Para una visualización detallada de la estructura de la base de datos y las relaciones entre tablas, consulta el [Diagrama Entidad-Relación](./DIAGRAMA-ER.md).

### Tablas Principales

```sql
-- Usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'profesor')),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Lugares
CREATE TABLE IF NOT EXISTS public.lugares (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    tipo_lugar VARCHAR(50) NOT NULL
);

-- Horarios
CREATE TABLE IF NOT EXISTS public.horarios (
    id SERIAL PRIMARY KEY,
    profesor_id INTEGER NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    dia_semana VARCHAR(20) NOT NULL,
    tramo_horario VARCHAR(50) NOT NULL
);

-- ausencias
CREATE TABLE IF NOT EXISTS public.ausencias (
    id SERIAL PRIMARY KEY,
    profesor_id INTEGER NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    tramo_horario VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Aceptada', 'Rechazada')),
    observaciones TEXT
);

-- Guardias
CREATE TABLE IF NOT EXISTS public.guardias (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    tramo_horario VARCHAR(50) NOT NULL,
    tipo_guardia VARCHAR(50) NOT NULL,
    firmada BOOLEAN NOT NULL DEFAULT FALSE,
    estado VARCHAR(50) NOT NULL CHECK (estado IN ('Pendiente', 'Asignada', 'Firmada', 'Anulada')),
    observaciones TEXT,
    lugar_id INTEGER REFERENCES public.lugares(id) ON DELETE SET NULL,
    profesor_cubridor_id INTEGER REFERENCES public.usuarios(id) ON DELETE SET NULL,
    ausencia_id INTEGER REFERENCES public.ausencias(id) ON DELETE SET NULL
);

-- Crear tabla de tareas de guardia
CREATE TABLE IF NOT EXISTS public.tareas_guardia (
    id SERIAL PRIMARY KEY,
    guardia_id INTEGER NOT NULL REFERENCES public.guardias(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL
);
```

## Autenticación

### Configuración del Proveedor
```typescript
// components/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const AuthContext = createContext<AuthContextType>({});

export const AuthProvider: React.FC = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar sesión actual
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Escuchar cambios en la autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
```

### Configuración de Autenticación en Supabase

1. En el dashboard de Supabase, ve a Authentication > Providers
2. Habilita Email Auth y configura las opciones:
   - Disable email confirmations
   - Secure email template
3. Personaliza los templates de email según necesidad

## Políticas de Seguridad

### Políticas RLS (Row Level Security)

```sql
-- Política para Usuarios
alter table public.usuarios enable row level security;

create policy "Los usuarios pueden ver otros usuarios activos"
on public.usuarios for select
using (activo = true);

create policy "Solo administradores pueden modificar usuarios"
on public.usuarios for all
using (
    auth.uid() in (
        select id from public.usuarios 
        where rol = 'ADMIN'
    )
);

-- Política para Guardias
alter table public.guardias enable row level security;

create policy "Usuarios pueden ver todas las guardias"
on public.guardias for select
using (true);

create policy "Profesores pueden actualizar sus propias guardias"
on public.guardias for update
using (
    auth.uid() = profesor_cubridor_id
);
```

## Ejemplos de Uso

### Consultas Básicas

```typescript
// Obtener guardias pendientes
const getGuardiasPendientes = async () => {
    const { data, error } = await supabase
        .from('guardias')
        .select(`
            id,
            fecha,
            tramo_horario,
            profesor_ausente:Usuarios!profesor_ausente_id(nombre),
            lugar:Lugares(nombre)
        `)
        .eq('estado', 'PENDIENTE')
        .order('fecha', { ascending: true });

    if (error) throw error;
    return data;
};
```

### Suscripciones en Tiempo Real

```typescript
// Suscribirse a cambios en guardias
const suscribirseAGuardias = () => {
    const subscription = supabase
        .channel('guardias_changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'guardias'
            },
            (payload) => {
                console.log('Cambio en guardias:', payload);
                // Actualizar estado local
            }
        )
        .subscribe();

    return () => subscription.unsubscribe();
};
```

## Migración desde Java

### Comparativa de Conceptos

| Java/Spring | Supabase |
|------------|----------|
| JPA Entity | Tabla PostgreSQL |
| Repository | Cliente Supabase |
| @Query | select(), filter() |
| @Transactional | rpc() |
| Spring Security | RLS Policies |

### Ejemplo de Migración

Java (Spring Data JPA):
```java
@Repository
public interface GuardiaRepository extends JpaRepository<Guardia, Long> {
    @Query("SELECT g FROM guardia g WHERE g.estado = :estado")
    List<Guardia> findByEstado(String estado);
}
```

Supabase:
```typescript
const getGuardiasPorEstado = async (estado: string) => {
    const { data, error } = await supabase
        .from('guardias')
        .select('*')
        .eq('estado', estado);
        
    if (error) throw error;
    return data;
};
```

### Funciones PostgreSQL

```sql
-- Función para asignar guardia
create or replace function asignar_guardia(
    p_guardia_id int,
    p_profesor_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
    update public.guardias
    set profesor_cubridor_id = p_profesor_id,
        estado = 'ASIGNADA'
    where id = p_guardia_id
    and estado = 'PENDIENTE';
end;
$$;
```

Uso en TypeScript:
```typescript
const asignarGuardia = async (guardiaId: number, profesorId: string) => {
    const { error } = await supabase
        .rpc('asignar_guardia', {
            p_guardia_id: guardiaId,
            p_profesor_id: profesorId
        });
        
    if (error) throw error;
};
```

## Mantenimiento y Monitorización

### Backups
- Los backups se realizan automáticamente cada día
- Se mantienen los últimos 7 días de backups
- Se pueden descargar manualmente desde el dashboard

### Monitorización
- Utilizar el dashboard de Supabase para monitorizar:
  - Uso de la base de datos
  - Rendimiento de las consultas
  - Logs de autenticación
  - Errores y excepciones

### Mejores Prácticas
1. Mantener actualizadas las políticas RLS
2. Revisar regularmente los logs de acceso
3. Monitorizar el rendimiento de las consultas
4. Optimizar índices según sea necesario
5. Mantener actualizadas las dependencias del cliente Supabase 

## Script para crear base de datos en supabase (copiar y pegar)

```sql
-- =============================================================================
-- Script simplificado para crear la base de datos en Supabase
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CREACIÓN DE TABLAS
-- -----------------------------------------------------------------------------

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'profesor')),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Crear tabla de lugares
CREATE TABLE IF NOT EXISTS public.lugares (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    tipo_lugar VARCHAR(50) NOT NULL
);

-- Crear tabla de horarios
CREATE TABLE IF NOT EXISTS public.horarios (
    id SERIAL PRIMARY KEY,
    profesor_id INTEGER NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    dia_semana VARCHAR(20) NOT NULL,
    tramo_horario VARCHAR(50) NOT NULL
);

-- Crear tabla de ausencias
CREATE TABLE IF NOT EXISTS public.ausencias (
    id SERIAL PRIMARY KEY,
    profesor_id INTEGER NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    tramo_horario VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Aceptada', 'Rechazada')),
    observaciones TEXT
);

-- Crear tabla de guardias
CREATE TABLE IF NOT EXISTS public.guardias (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    tramo_horario VARCHAR(50) NOT NULL,
    tipo_guardia VARCHAR(50) NOT NULL,
    firmada BOOLEAN NOT NULL DEFAULT FALSE,
    estado VARCHAR(50) NOT NULL CHECK (estado IN ('Pendiente', 'Asignada', 'Firmada', 'Anulada')),
    observaciones TEXT,
    lugar_id INTEGER REFERENCES public.lugares(id) ON DELETE SET NULL,
    profesor_cubridor_id INTEGER REFERENCES public.usuarios(id) ON DELETE SET NULL,
    ausencia_id INTEGER REFERENCES public.ausencias(id) ON DELETE SET NULL
);

-- Crear tabla de tareas de guardia
CREATE TABLE IF NOT EXISTS public.tareas_guardia (
    id SERIAL PRIMARY KEY,
    guardia_id INTEGER NOT NULL REFERENCES public.guardias(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL
);

-- -----------------------------------------------------------------------------
-- 2. CREACIÓN DE ÍNDICES
-- -----------------------------------------------------------------------------

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON public.usuarios(activo);

-- Índices para lugares
CREATE INDEX IF NOT EXISTS idx_lugares_codigo ON public.lugares(codigo);
CREATE INDEX IF NOT EXISTS idx_lugares_tipo ON public.lugares(tipo_lugar);

-- Índices para horarios
CREATE INDEX IF NOT EXISTS idx_horarios_profesor_id ON public.horarios(profesor_id);
CREATE INDEX IF NOT EXISTS idx_horarios_dia_tramo ON public.horarios(dia_semana, tramo_horario);

-- Índices para ausencias
CREATE INDEX IF NOT EXISTS idx_ausencias_profesor_id ON public.ausencias(profesor_id);
CREATE INDEX IF NOT EXISTS idx_ausencias_fecha ON public.ausencias(fecha);
CREATE INDEX IF NOT EXISTS idx_ausencias_estado ON public.ausencias(estado);

-- Índices para guardias
CREATE INDEX IF NOT EXISTS idx_guardias_fecha ON public.guardias(fecha);
CREATE INDEX IF NOT EXISTS idx_guardias_estado ON public.guardias(estado);
CREATE INDEX IF NOT EXISTS idx_guardias_profesor_cubridor_id ON public.guardias(profesor_cubridor_id);
CREATE INDEX IF NOT EXISTS idx_guardias_lugar_id ON public.guardias(lugar_id);
CREATE INDEX IF NOT EXISTS idx_guardias_ausencia_id ON public.guardias(ausencia_id);

-- Índices para tareas_guardia
CREATE INDEX IF NOT EXISTS idx_tareas_guardia_guardia_id ON public.tareas_guardia(guardia_id);

-- -----------------------------------------------------------------------------
-- 3. HABILITACIÓN DE RLS (Row Level Security)
-- -----------------------------------------------------------------------------
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lugares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ausencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas_guardia ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4. CREACIÓN DE POLÍTICAS RLS (Simplificadas)
-- -----------------------------------------------------------------------------

-- Políticas para usuarios
CREATE POLICY "Acceso básico a usuarios" ON public.usuarios
    FOR ALL USING (true);

-- Políticas para lugares
CREATE POLICY "Acceso básico a lugares" ON public.lugares
    FOR ALL USING (true);

-- Políticas para horarios
CREATE POLICY "Acceso básico a horarios" ON public.horarios
    FOR ALL USING (true);

-- Políticas para ausencias
CREATE POLICY "Acceso básico a ausencias" ON public.ausencias
    FOR ALL USING (true);

-- Políticas para guardias
CREATE POLICY "Acceso básico a guardias" ON public.guardias
    FOR ALL USING (true);

-- Políticas para tareas_guardia
CREATE POLICY "Acceso básico a tareas" ON public.tareas_guardia
    FOR ALL USING (true);
```

## Script para las inserciones iniciales en la base de datos en supabase (opcional)

```sql
-- -----------------------------------------------------------------------------
-- 5. INSERCIÓN DE DATOS INICIALES
-- -----------------------------------------------------------------------------

-- Insertar usuario admin
INSERT INTO public.usuarios (nombre, apellido, email, password, rol, activo)
VALUES (
    'Admin',
    'Instituto',
    'admin@instituto.es',
    '$2b$10$U4JtS6.evBPUo4ALGu6i/eJGuyQlKUsepglYOdqnUDLfG3AsnGax.', -- hash de '1234'
    'admin',
    TRUE
)
ON CONFLICT (email) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    password = EXCLUDED.password,
    rol = EXCLUDED.rol,
    activo = EXCLUDED.activo;

-- Insertar usuario profesor
INSERT INTO public.usuarios (nombre, apellido, email, password, rol, activo)
VALUES (
    'Profesor',
    'Ejemplo',
    'profesor@instituto.es',
    '$2b$10$0V8xpy.iJgZtLiP6.tf0V.uyNhf5epIeuoAcdnVGYq7sTRJ4BjUb6', -- hash de '1234'
    'profesor',
    TRUE
)
ON CONFLICT (email) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    password = EXCLUDED.password,
    rol = EXCLUDED.rol,
    activo = EXCLUDED.activo;
```