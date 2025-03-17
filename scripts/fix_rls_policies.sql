-- Habilitar RLS para la tabla Ausencias
ALTER TABLE "Ausencias" ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir a los usuarios autenticados insertar sus propias ausencias
CREATE POLICY "Usuarios pueden crear sus propias ausencias" 
ON "Ausencias" 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid()::text = profesor_id::text OR auth.uid() IN (
  SELECT id::text FROM "Usuarios" WHERE rol = 'admin'
));

-- Crear política para permitir a los usuarios ver sus propias ausencias
CREATE POLICY "Usuarios pueden ver sus propias ausencias" 
ON "Ausencias" 
FOR SELECT 
TO authenticated 
USING (profesor_id::text = auth.uid()::text OR auth.uid() IN (
  SELECT id::text FROM "Usuarios" WHERE rol = 'admin'
));

-- Crear política para permitir a los administradores actualizar cualquier ausencia
CREATE POLICY "Administradores pueden actualizar cualquier ausencia" 
ON "Ausencias" 
FOR UPDATE 
TO authenticated 
USING (auth.uid() IN (
  SELECT id::text FROM "Usuarios" WHERE rol = 'admin'
)) 
WITH CHECK (auth.uid() IN (
  SELECT id::text FROM "Usuarios" WHERE rol = 'admin'
));

-- Crear política para permitir a los usuarios actualizar sus propias ausencias
CREATE POLICY "Usuarios pueden actualizar sus propias ausencias" 
ON "Ausencias" 
FOR UPDATE 
TO authenticated 
USING (profesor_id::text = auth.uid()::text) 
WITH CHECK (profesor_id::text = auth.uid()::text);

-- Crear política para permitir a los administradores eliminar cualquier ausencia
CREATE POLICY "Administradores pueden eliminar cualquier ausencia" 
ON "Ausencias" 
FOR DELETE 
TO authenticated 
USING (auth.uid() IN (
  SELECT id::text FROM "Usuarios" WHERE rol = 'admin'
));

-- Crear política para permitir a los usuarios eliminar sus propias ausencias
CREATE POLICY "Usuarios pueden eliminar sus propias ausencias" 
ON "Ausencias" 
FOR DELETE 
TO authenticated 
USING (profesor_id::text = auth.uid()::text);

-- NOTA: Este script asume que:
-- 1. La tabla "Ausencias" ya existe
-- 2. La tabla "Usuarios" existe y tiene una columna "rol" que puede ser 'admin' o 'profesor'
-- 3. El ID del usuario en la tabla "Usuarios" coincide con el auth.uid() de Supabase Auth
-- 4. La columna profesor_id en "Ausencias" es el ID del profesor que registra la ausencia

-- Si alguna de estas suposiciones no es correcta, ajusta el script según sea necesario. 