import { supabase } from './supabaseClient';
import { DB_CONFIG, getTableName } from './db-config';
import { hashPassword } from './authService';

// Interfaces basadas en la estructura de las tablas
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
  try {
    // Hashear la contraseña antes de guardarla en la base de datos
    const hashedPassword = await hashPassword(usuario.password || 'changeme');
    
    const { data, error } = await supabase
      .from(getTableName('USUARIOS'))
      .insert([{
        ...usuario,
        password: hashedPassword
      }])
      .select();
    
    if (error) {
      console.error('Error al crear usuario:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return null;
  }
}

/**
 * Crea un nuevo usuario y copia los horarios del profesor reemplazado
 * @param usuario Datos del usuario a crear
 * @param usuarioReemplazadoId ID del usuario al que reemplaza (para copiar sus horarios)
 * @returns Usuario creado o null si hubo un error
 */
export async function createUsuarioConHorarios(
  usuario: Omit<Usuario, 'id'>, 
  usuarioReemplazadoId: number
): Promise<Usuario | null> {
  // Iniciar transacción usando supabase
  const nuevoUsuario = await createUsuario(usuario);
  
  if (!nuevoUsuario) {
    console.error('Error al crear el nuevo usuario');
    return null;
  }
  
  try {
    // Obtener horarios del profesor que se reemplaza
    const { data: horarios, error: horarioError } = await supabase
      .from(getTableName('HORARIOS'))
      .select('*')
      .eq('profesor_id', usuarioReemplazadoId);
    
    if (horarioError) {
      console.error('Error al obtener horarios del profesor reemplazado:', horarioError);
      return nuevoUsuario; // Devolver el usuario aunque no se hayan copiado los horarios
    }
    
    if (!horarios || horarios.length === 0) {
      console.log('El profesor reemplazado no tiene horarios para copiar');
      return nuevoUsuario;
    }
    
    // Preparar los horarios para el nuevo profesor
    const nuevosHorarios = horarios.map(horario => ({
      profesor_id: nuevoUsuario.id,
      dia_semana: horario.dia_semana,
      tramo_horario: horario.tramo_horario
    }));
    
    // Insertar los nuevos horarios
    const { error: insertError } = await supabase
      .from(getTableName('HORARIOS'))
      .insert(nuevosHorarios);
    
    if (insertError) {
      console.error('Error al copiar horarios al nuevo profesor:', insertError);
      return nuevoUsuario; // Devolver el usuario aunque no se hayan copiado los horarios
    }
    
    console.log(`Se han copiado ${nuevosHorarios.length} horarios al nuevo profesor`);
    return nuevoUsuario;
  } catch (error) {
    console.error('Error en el proceso de copiar horarios:', error);
    return nuevoUsuario; // Devolver el usuario aunque no se hayan copiado los horarios
  }
}

/**
 * Actualiza un usuario existente
 * @param id ID del usuario a actualizar
 * @param usuario Datos actualizados del usuario
 * @returns true si la actualización fue exitosa, false en caso contrario
 */
export async function updateUsuario(id: number, usuario: Partial<Usuario>): Promise<boolean> {
  try {
    // Si se está actualizando la contraseña, hashearla primero
    if (usuario.password) {
      usuario.password = await hashPassword(usuario.password);
    }
    
    const { error } = await supabase
      .from(getTableName('USUARIOS'))
      .update(usuario)
      .eq('id', id);
    
    if (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error al actualizar usuario con ID ${id}:`, error);
    return false;
  }
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