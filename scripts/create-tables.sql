-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    rol VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Crear tabla de lugares
CREATE TABLE IF NOT EXISTS lugares (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NOT NULL,
    tipo_lugar VARCHAR(50) NOT NULL
);

-- Crear tabla de horarios
CREATE TABLE IF NOT EXISTS horarios (
    id SERIAL PRIMARY KEY,
    profesor_id INTEGER NOT NULL REFERENCES usuarios(id),
    dia_semana VARCHAR(20) NOT NULL,
    tramo_horario VARCHAR(50) NOT NULL
);

-- Crear tabla de guardias
CREATE TABLE IF NOT EXISTS guardias (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    tramo_horario VARCHAR(50) NOT NULL,
    tipo_guardia VARCHAR(50) NOT NULL,
    firmada BOOLEAN NOT NULL DEFAULT FALSE,
    estado VARCHAR(50) NOT NULL,
    observaciones TEXT,
    lugar_id INTEGER NOT NULL REFERENCES lugares(id),
    profesor_ausente_id INTEGER REFERENCES usuarios(id),
    profesor_cubridor_id INTEGER REFERENCES usuarios(id)
);

-- Crear tabla de tareas de guardia
CREATE TABLE IF NOT EXISTS tareas_guardia (
    id SERIAL PRIMARY KEY,
    guardia_id INTEGER NOT NULL REFERENCES guardias(id),
    descripcion TEXT NOT NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_horarios_profesor_id ON horarios(profesor_id);
CREATE INDEX IF NOT EXISTS idx_guardias_fecha ON guardias(fecha);
CREATE INDEX IF NOT EXISTS idx_guardias_profesor_ausente_id ON guardias(profesor_ausente_id);
CREATE INDEX IF NOT EXISTS idx_guardias_profesor_cubridor_id ON guardias(profesor_cubridor_id);
CREATE INDEX IF NOT EXISTS idx_guardias_lugar_id ON guardias(lugar_id);
CREATE INDEX IF NOT EXISTS idx_tareas_guardia_guardia_id ON tareas_guardia(guardia_id);

-- Configurar políticas de seguridad (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE lugares ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardias ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas_guardia ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir acceso a todos los usuarios autenticados
-- Estas políticas son básicas y deberían refinarse según los requisitos de seguridad
CREATE POLICY "Permitir acceso a usuarios autenticados" ON usuarios FOR ALL USING (true);
CREATE POLICY "Permitir acceso a usuarios autenticados" ON lugares FOR ALL USING (true);
CREATE POLICY "Permitir acceso a usuarios autenticados" ON horarios FOR ALL USING (true);
CREATE POLICY "Permitir acceso a usuarios autenticados" ON guardias FOR ALL USING (true);
CREATE POLICY "Permitir acceso a usuarios autenticados" ON tareas_guardia FOR ALL USING (true); 