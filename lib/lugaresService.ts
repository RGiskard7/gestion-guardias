import { supabase } from './supabaseClient';
import { DB_CONFIG, getTableName } from './db-config';

// Interfaces basadas en la estructura de las tablas
export interface Lugar {
  id: number;
  codigo: string;
  descripcion: string;
  tipo_lugar: string;
}

/**
 * Obtiene todos los lugares
 * @returns Lista de lugares
 */
export async function getLugares(): Promise<Lugar[]> {
  const { data, error } = await supabase
    .from(getTableName('LUGARES'))
    .select('*');
  
  if (error) {
    console.error('Error al obtener lugares:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Obtiene un lugar por su ID
 * @param id ID del lugar
 * @returns Lugar o null si no existe
 */
export async function getLugarById(id: number): Promise<Lugar | null> {
  const { data, error } = await supabase
    .from(getTableName('LUGARES'))
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error al obtener lugar con ID ${id}:`, error);
    return null;
  }
  
  return data;
}

/**
 * Crea un nuevo lugar
 * @param lugar Datos del lugar a crear
 * @returns Lugar creado o null si hubo un error
 */
export async function createLugar(lugar: Omit<Lugar, 'id'>): Promise<Lugar | null> {
  const { data, error } = await supabase
    .from(getTableName('LUGARES'))
    .insert([lugar])
    .select();
  
  if (error) {
    console.error('Error al crear lugar:', error);
    return null;
  }
  
  return data?.[0] || null;
}

/**
 * Actualiza un lugar existente
 * @param id ID del lugar a actualizar
 * @param lugar Datos actualizados del lugar
 * @returns true si la actualización fue exitosa, false en caso contrario
 */
export async function updateLugar(id: number, lugar: Partial<Lugar>): Promise<boolean> {
  const { error } = await supabase
    .from(getTableName('LUGARES'))
    .update(lugar)
    .eq('id', id);
  
  if (error) {
    console.error(`Error al actualizar lugar con ID ${id}:`, error);
    return false;
  }
  
  return true;
}

/**
 * Elimina un lugar
 * @param id ID del lugar a eliminar
 * @returns true si la eliminación fue exitosa, false en caso contrario
 */
export async function deleteLugar(id: number): Promise<boolean> {
  const { error } = await supabase
    .from(getTableName('LUGARES'))
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error al eliminar lugar con ID ${id}:`, error);
    return false;
  }
  
  return true;
} 