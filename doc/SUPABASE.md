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
create table public.Usuarios (
    id uuid references auth.users primary key,
    nombre text not null,
    email text not null unique,
    rol text not null check (rol in ('ADMIN', 'PROFESOR')),
    activo boolean default true
);

-- Lugares
create table public.Lugares (
    id serial primary key,
    nombre text not null,
    descripcion text,
    activo boolean default true
);

-- Horarios
create table public.Horarios (
    id serial primary key,
    profesor_id uuid references public.Usuarios(id),
    dia_semana smallint not null check (dia_semana between 1 and 5),
    tramo_horario text not null,
    lugar_id integer references public.Lugares(id)
);

-- Guardias
create table public.Guardias (
    id serial primary key,
    fecha date not null,
    tramo_horario text not null,
    profesor_ausente_id uuid references public.Usuarios(id),
    profesor_cubridor_id uuid references public.Usuarios(id),
    lugar_id integer references public.Lugares(id),
    estado text not null check (estado in ('PENDIENTE', 'ASIGNADA', 'COMPLETADA', 'ANULADA')),
    created_at timestamp with time zone default timezone('utc'::text, now())
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
alter table public.Usuarios enable row level security;

create policy "Los usuarios pueden ver otros usuarios activos"
on public.Usuarios for select
using (activo = true);

create policy "Solo administradores pueden modificar usuarios"
on public.Usuarios for all
using (
    auth.uid() in (
        select id from public.Usuarios 
        where rol = 'ADMIN'
    )
);

-- Política para Guardias
alter table public.Guardias enable row level security;

create policy "Usuarios pueden ver todas las guardias"
on public.Guardias for select
using (true);

create policy "Profesores pueden actualizar sus propias guardias"
on public.Guardias for update
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
        .from('Guardias')
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
                table: 'Guardias'
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
    @Query("SELECT g FROM Guardia g WHERE g.estado = :estado")
    List<Guardia> findByEstado(String estado);
}
```

Supabase:
```typescript
const getGuardiasPorEstado = async (estado: string) => {
    const { data, error } = await supabase
        .from('Guardias')
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
    update public.Guardias
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