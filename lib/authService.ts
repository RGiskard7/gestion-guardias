import { supabase } from './supabaseClient';
import { DB_CONFIG, getTableName } from './db-config';

// Definición de la interfaz Usuario
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

/**
 * Prueba la conexión a Supabase
 * @returns Resultado de la prueba
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Probando conexión a Supabase...');
    
    // Intentamos obtener un registro de la tabla de usuarios
    const { data, error } = await supabase
      .from(getTableName('USUARIOS'))
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error al probar la conexión:', error);
      return { 
        success: false, 
        message: `Error al conectar con Supabase: ${error.message}` 
      };
    }
    
    console.log('Conexión exitosa. Datos recibidos:', data);
    return { 
      success: true, 
      message: 'Conexión exitosa a Supabase' 
    };
  } catch (error) {
    console.error('Error inesperado al probar la conexión:', error);
    return { 
      success: false, 
      message: `Error inesperado: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Verifica si un usuario existe en la base de datos
 * @param email Email del usuario
 * @returns true si el usuario existe, false en caso contrario
 */
export async function loginUser(email: string): Promise<boolean> {
  try {
    console.log(`Verificando si existe el usuario con email: ${email}`);
    
    // Buscamos el usuario por su email
    const { data, error } = await supabase
      .from(getTableName('USUARIOS'))
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error al buscar usuario:', error);
      return false;
    }
    
    if (!data) {
      console.log('Usuario no encontrado');
      return false;
    }
    
    // Verificamos que el usuario esté activo
    if (!data.activo) {
      console.log('Usuario inactivo');
      return false;
    }
    
    console.log('Usuario encontrado y activo');
    return true;
  } catch (error) {
    console.error('Error inesperado al verificar usuario:', error);
    return false;
  }
} 