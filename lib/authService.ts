import { supabase } from './supabaseClient';
import { DB_CONFIG, getTableName } from './db-config';
import bcrypt from 'bcryptjs';

// Definición de la interfaz Usuario
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
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
 * Verifica si un usuario existe en la base de datos y si sus credenciales son correctas
 * @param email Email del usuario
 * @param password Contraseña del usuario (sin hashear)
 * @returns true si el usuario existe, está activo y la contraseña es correcta, false en caso contrario
 */
export async function loginUser(email: string, password: string): Promise<boolean> {
  try {
    console.log(`Verificando credenciales para usuario con email: ${email}`);
    
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
    
    // Verificamos la contraseña (usando bcrypt)
    const passwordValid = await bcrypt.compare(password, data.password);
    if (!passwordValid) {
      console.log('Contraseña incorrecta');
      return false;
    }
    
    console.log('Usuario encontrado, activo y contraseña correcta');
    return true;
  } catch (error) {
    console.error('Error inesperado al verificar usuario:', error);
    return false;
  }
}

/**
 * Genera un hash de la contraseña usando bcrypt
 * @param password Contraseña en texto plano
 * @returns Hash de la contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
} 