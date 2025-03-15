import { supabase } from './supabaseClient';
import { DB_CONFIG, getTableName } from './db-config';

// Interfaces basadas en la estructura de las tablas
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

/**
 * Obtiene todos los usuarios
 * @returns Lista de usuarios
 */
export async function getUsuarios(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from(getTableName('USUARIOS'))
    .select('*');
  
  if (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Obtiene un usuario por su ID
 * @param id ID del usuario
 * @returns Usuario o null si no existe
 */
export async function getUsuarioById(id: number): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from(getTableName('USUARIOS'))
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error al obtener usuario con ID ${id}:`, error);
    return null;
  }
  
  return data;
}

/**
 * Obtiene un usuario por su email
 * @param email Email del usuario
 * @returns Usuario o null si no existe
 */
export async function getUsuarioByEmail(email: string): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from(getTableName('USUARIOS'))
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error(`Error al obtener usuario con email ${email}:`, error);
    return null;
  }
  
  return data;
}

/**
 * Crea un nuevo usuario
 * @param usuario Datos del usuario a crear
 * @returns Usuario creado o null si hubo un error
 */
export async function createUsuario(usuario: Omit<Usuario, 'id'>): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from(getTableName('USUARIOS'))
    .insert([usuario])
    .select();
  
  if (error) {
    console.error('Error al crear usuario:', error);
    return null;
  }
  
  return data?.[0] || null;
}

/**
 * Actualiza un usuario existente
 * @param id ID del usuario a actualizar
 * @param usuario Datos actualizados del usuario
 * @returns true si la actualización fue exitosa, false en caso contrario
 */
export async function updateUsuario(id: number, usuario: Partial<Usuario>): Promise<boolean> {
  const { error } = await supabase
    .from(getTableName('USUARIOS'))
    .update(usuario)
    .eq('id', id);
  
  if (error) {
    console.error(`Error al actualizar usuario con ID ${id}:`, error);
    return false;
  }
  
  return true;
}

/**
 * Elimina un usuario
 * @param id ID del usuario a eliminar
 * @returns true si la eliminación fue exitosa, false en caso contrario
 */
export async function deleteUsuario(id: number): Promise<boolean> {
  const { error } = await supabase
    .from(getTableName('USUARIOS'))
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error al eliminar usuario con ID ${id}:`, error);
    return false;
  }
  
  return true;
} 