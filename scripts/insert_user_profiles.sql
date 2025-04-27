-- =============================================================================
-- Script SQL para Insertar Usuarios Específicos (Autenticación Personalizada)
-- Objetivo: Insertar usuarios directamente en la tabla public.Usuarios.
-- ¡¡IMPORTANTE!!: Debes generar el HASH de la contraseña '1234' usando
--                 tu algoritmo (ej: bcrypt) y REEMPLAZAR los placeholders
--                 '...hash_de_1234_generado_con_bcrypt...' con el hash real.
-- =============================================================================

-- REEMPLAZA '...hash_de_1234_generado_con_bcrypt...' con el hash real
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

-- Mensaje de finalización
SELECT 'Usuarios admin@instituto.es y profesor@instituto.es insertados/actualizados en public.Usuarios. Asegúrate de haber reemplazado los placeholders del HASH de la contraseña.';