-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,  -- Almacena el hash de la contraseña
    rol VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Crear tabla de lugares
CREATE TABLE IF NOT EXISTS Lugares (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    tipo_lugar VARCHAR(50) NOT NULL
);

-- Crear tabla de horarios
CREATE TABLE IF NOT EXISTS Horarios (
    id SERIAL PRIMARY KEY,
    profesor_id INTEGER NOT NULL REFERENCES Usuarios(id),
    dia_semana VARCHAR(20) NOT NULL,
    tramo_horario VARCHAR(50) NOT NULL
);

-- Crear tabla de ausencias
CREATE TABLE IF NOT EXISTS Ausencias (
    id SERIAL PRIMARY KEY,
    profesor_id INTEGER NOT NULL REFERENCES Usuarios(id),
    fecha DATE NOT NULL,
    tramo_horario VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    observaciones TEXT
);

-- Crear tabla de guardias
CREATE TABLE IF NOT EXISTS Guardias (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    tramo_horario VARCHAR(50) NOT NULL,
    tipo_guardia VARCHAR(50) NOT NULL,
    firmada BOOLEAN NOT NULL DEFAULT FALSE,
    estado VARCHAR(50) NOT NULL,
    observaciones TEXT,
    lugar_id INTEGER NOT NULL REFERENCES Lugares(id),
    profesor_cubridor_id INTEGER REFERENCES Usuarios(id),
    ausencia_id INTEGER REFERENCES Ausencias(id)
);

-- Crear tabla de tareas de guardia
CREATE TABLE IF NOT EXISTS Tareas_guardia (
    id SERIAL PRIMARY KEY,
    guardia_id INTEGER NOT NULL REFERENCES Guardias(id),
    descripcion TEXT NOT NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_horarios_profesor_id ON Horarios(profesor_id);
CREATE INDEX IF NOT EXISTS idx_guardias_fecha ON Guardias(fecha);
CREATE INDEX IF NOT EXISTS idx_guardias_profesor_cubridor_id ON Guardias(profesor_cubridor_id);
CREATE INDEX IF NOT EXISTS idx_guardias_lugar_id ON Guardias(lugar_id);
CREATE INDEX IF NOT EXISTS idx_guardias_ausencia_id ON Guardias(ausencia_id);
CREATE INDEX IF NOT EXISTS idx_tareas_guardia_guardia_id ON Tareas_guardia(guardia_id);
CREATE INDEX IF NOT EXISTS idx_ausencias_profesor_id ON Ausencias(profesor_id);
CREATE INDEX IF NOT EXISTS idx_ausencias_fecha ON Ausencias(fecha);
CREATE INDEX IF NOT EXISTS idx_ausencias_estado ON Ausencias(estado);

-- Configurar políticas de seguridad (RLS)
ALTER TABLE Usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE Lugares ENABLE ROW LEVEL SECURITY;
ALTER TABLE Horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE Guardias ENABLE ROW LEVEL SECURITY;
ALTER TABLE Tareas_guardia ENABLE ROW LEVEL SECURITY;
ALTER TABLE Ausencias ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir acceso a todos los usuarios autenticados
-- Estas políticas son básicas y deberían refinarse según los requisitos de seguridad
CREATE POLICY "Permitir acceso a usuarios autenticados" ON Usuarios FOR ALL USING (true);
CREATE POLICY "Permitir acceso a usuarios autenticados" ON Lugares FOR ALL USING (true);
CREATE POLICY "Permitir acceso a usuarios autenticados" ON Horarios FOR ALL USING (true);
CREATE POLICY "Permitir acceso a usuarios autenticados" ON Guardias FOR ALL USING (true);
CREATE POLICY "Permitir acceso a usuarios autenticados" ON Tareas_guardia FOR ALL USING (true);
CREATE POLICY "Permitir acceso a usuarios autenticados" ON Ausencias FOR ALL USING (true);

-- Crear políticas específicas para profesores
-- Los profesores solo pueden ver sus propias ausencias
CREATE POLICY "Profesores pueden ver sus propias ausencias" ON Ausencias 
FOR SELECT USING (
    auth.uid() IN (
        SELECT id FROM Usuarios WHERE email = auth.email() AND rol = 'profesor'
    ) AND profesor_id IN (
        SELECT id FROM Usuarios WHERE email = auth.email()
    )
);

-- Los profesores solo pueden crear ausencias para sí mismos
CREATE POLICY "Profesores pueden crear sus propias ausencias" ON Ausencias 
FOR INSERT WITH CHECK (
    auth.uid() IN (
        SELECT id FROM Usuarios WHERE email = auth.email() AND rol = 'profesor'
    ) AND profesor_id IN (
        SELECT id FROM Usuarios WHERE email = auth.email()
    )
);

-- Los profesores solo pueden actualizar sus propias ausencias pendientes
CREATE POLICY "Profesores pueden actualizar sus propias ausencias pendientes" ON Ausencias 
FOR UPDATE USING (
    auth.uid() IN (
        SELECT id FROM Usuarios WHERE email = auth.email() AND rol = 'profesor'
    ) AND profesor_id IN (
        SELECT id FROM Usuarios WHERE email = auth.email()
    ) AND estado = 'Pendiente'
);

-- Los profesores solo pueden eliminar sus propias ausencias pendientes
CREATE POLICY "Profesores pueden eliminar sus propias ausencias pendientes" ON Ausencias 
FOR DELETE USING (
    auth.uid() IN (
        SELECT id FROM Usuarios WHERE email = auth.email() AND rol = 'profesor'
    ) AND profesor_id IN (
        SELECT id FROM Usuarios WHERE email = auth.email()
    ) AND estado = 'Pendiente'
);

-- Los profesores solo pueden ver guardias pendientes o asignadas a ellos
CREATE POLICY "Profesores pueden ver guardias relevantes" ON Guardias 
FOR SELECT USING (
    auth.uid() IN (
        SELECT id FROM Usuarios WHERE email = auth.email() AND rol = 'profesor'
    ) AND (
        estado = 'Pendiente' OR 
        profesor_cubridor_id IN (
            SELECT id FROM Usuarios WHERE email = auth.email()
        )
    )
);

-- Los profesores solo pueden actualizar guardias asignadas a ellos
CREATE POLICY "Profesores pueden actualizar sus guardias" ON Guardias 
FOR UPDATE USING (
    auth.uid() IN (
        SELECT id FROM Usuarios WHERE email = auth.email() AND rol = 'profesor'
    ) AND profesor_cubridor_id IN (
        SELECT id FROM Usuarios WHERE email = auth.email()
    )
);

-- Crear funciones y triggers para mantener la integridad de los datos
-- Función para actualizar el estado de una guardia cuando se asigna un profesor
CREATE OR REPLACE FUNCTION update_guardia_estado_on_profesor_assignment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.profesor_cubridor_id IS NOT NULL AND OLD.profesor_cubridor_id IS NULL THEN
        NEW.estado = 'Asignada';
    ELSIF NEW.profesor_cubridor_id IS NULL AND OLD.profesor_cubridor_id IS NOT NULL AND NEW.estado != 'Anulada' THEN
        NEW.estado = 'Pendiente';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el estado de la guardia cuando se asigna un profesor
CREATE TRIGGER trigger_update_guardia_estado_on_profesor_assignment
BEFORE UPDATE ON Guardias
FOR EACH ROW
EXECUTE FUNCTION update_guardia_estado_on_profesor_assignment(); 