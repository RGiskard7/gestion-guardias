import { supabase } from './supabaseClient';
import { DB_CONFIG, getTableName } from './db-config';

// Interfaces basadas en la estructura de las tablas
export interface TareaGuardia {
  id: number;
  guardia_id: number;
  descripcion: string;
}

/**
 * Obtiene todas las tareas de guardia
 * @returns Lista de tareas de guardia
 */
export async function getTareasGuardia(): Promise<TareaGuardia[]> {
  const { data, error } = await supabase
    .from(getTableName('TAREAS_GUARDIA'))
    .select('*');
  
  if (error) {
    console.error('Error al obtener tareas de guardia:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Obtiene una tarea de guardia por su ID
 * @param id ID de la tarea de guardia
 * @returns Tarea de guardia o null si no existe
 */
export async function getTareaGuardiaById(id: number): Promise<TareaGuardia | null> {
  const { data, error } = await supabase
    .from(getTableName('TAREAS_GUARDIA'))
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error al obtener tarea de guardia con ID ${id}:`, error);
    return null;
  }
  
  return data;
}

/**
 * Obtiene las tareas de una guardia
 * @param guardiaId ID de la guardia
 * @returns Lista de tareas de la guardia
 */
export async function getTareasByGuardia(guardiaId: number): Promise<TareaGuardia[]> {
  const { data, error } = await supabase
    .from(getTableName('TAREAS_GUARDIA'))
    .select('*')
    .eq('guardia_id', guardiaId);
  
  if (error) {
    console.error(`Error al obtener tareas para la guardia ${guardiaId}:`, error);
    return [];
  }
  
  return data || [];
}

/**
 * Crea una nueva tarea de guardia
 * @param tarea Datos de la tarea de guardia a crear
 * @returns Tarea de guardia creada o null si hubo un error
 */
export async function createTareaGuardia(tarea: Omit<TareaGuardia, 'id'>): Promise<TareaGuardia | null> {
  const { data, error } = await supabase
    .from(getTableName('TAREAS_GUARDIA'))
    .insert([tarea])
    .select();
  
  if (error) {
    console.error('Error al crear tarea de guardia:', error);
    return null;
  }
  
  return data?.[0] || null;
}

/**
 * Actualiza una tarea de guardia existente
 * @param id ID de la tarea de guardia a actualizar
 * @param tarea Datos actualizados de la tarea de guardia
 * @returns true si la actualización fue exitosa, false en caso contrario
 */
export async function updateTareaGuardia(id: number, tarea: Partial<TareaGuardia>): Promise<boolean> {
  const { error } = await supabase
    .from(getTableName('TAREAS_GUARDIA'))
    .update(tarea)
    .eq('id', id);
  
  if (error) {
    console.error(`Error al actualizar tarea de guardia con ID ${id}:`, error);
    return false;
  }
  
  return true;
}

/**
 * Elimina una tarea de guardia
 * @param id ID de la tarea de guardia a eliminar
 * @returns true si la eliminación fue exitosa, false en caso contrario
 */
export async function deleteTareaGuardia(id: number): Promise<boolean> {
  const { error } = await supabase
    .from(getTableName('TAREAS_GUARDIA'))
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error al eliminar tarea de guardia con ID ${id}:`, error);
    return false;
  }
  
  return true;
} 