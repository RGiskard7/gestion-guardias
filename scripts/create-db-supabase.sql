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