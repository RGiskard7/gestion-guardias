import { supabase } from './supabaseClient';
import { DB_CONFIG, getTableName } from './db-config';

// Interfaces basadas en la estructura de las tablas
export interface Guardia {
  id: number;
  fecha: string;
  tramo_horario: string;
  tipo_guardia: string;
  firmada: boolean;
  estado: string;
  observaciones?: string;
  motivo_incidencia?: string;
  lugar_id: number;
  profesor_cubridor_id?: number;
  ausencia_id?: number;
}

export interface Lugar {
  id: number;
  codigo: string;
  descripcion: string;
  tipo_lugar: string;
}

export interface Horario {
  id: number;
  profesor_id: number;
  dia_semana: string;
  tramo_horario: string;
}

export interface TareaGuardia {
  id: number;
  guardia_id: number;
  descripcion: string;
}

// Función para obtener el próximo ID disponible
async function getNextId(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from(getTableName('GUARDIAS'))
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error al obtener el último ID:', error);
      throw error;
    }

    // Si no hay registros, comenzar desde 1
    if (!data || data.length === 0) {
      return 1;
    }

    // Devolver el siguiente ID
    return data[0].id + 1;
  } catch (error) {
    console.error('Error inesperado al obtener el próximo ID:', error);
    throw error;
  }
}

// Obtener todas las guardias
export async function getAllGuardias(): Promise<Guardia[]> {
  try {
    const { data, error } = await supabase
      .from(getTableName('GUARDIAS'))
      .select('*');

    if (error) {
      console.error('Error al obtener guardias:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error inesperado al obtener guardias:', error);
    throw error;
  }
}

// Obtener una guardia por ID
export async function getGuardiaById(id: number): Promise<Guardia | null> {
  try {
    const { data, error } = await supabase
      .from(getTableName('GUARDIAS'))
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error al obtener guardia con ID ${id}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error inesperado al obtener guardia con ID ${id}:`, error);
    throw error;
  }
}

// Obtener guardias por fecha
export async function getGuardiasByFecha(fecha: string): Promise<Guardia[]> {
  try {
    const { data, error } = await supabase
      .from(getTableName('GUARDIAS'))
      .select('*')
      .eq('fecha', fecha);

    if (error) {
      console.error(`Error al obtener guardias para la fecha ${fecha}:`, error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error(`Error inesperado al obtener guardias para la fecha ${fecha}:`, error);
    throw error;
  }
}

// Obtener guardias por profesor ausente (a través de ausencias)
export async function getGuardiasByProfesorAusente(profesorId: number): Promise<Guardia[]> {
  try {
    // Primero obtenemos las ausencias del profesor
    const { data: ausencias, error: ausenciasError } = await supabase
      .from(getTableName('AUSENCIAS'))
      .select('id')
      .eq('profesor_id', profesorId);

    if (ausenciasError) {
      console.error(`Error al obtener ausencias del profesor ${profesorId}:`, ausenciasError);
      throw ausenciasError;
    }

    if (!ausencias || ausencias.length === 0) {
      return []; // No hay ausencias, por lo tanto no hay guardias
    }

    // Obtenemos los IDs de las ausencias
    const ausenciaIds = ausencias.map(a => a.id);

    // Ahora buscamos guardias que tengan esos ausencia_id
    const { data, error } = await supabase
      .from(getTableName('GUARDIAS'))
      .select('*')
      .in('ausencia_id', ausenciaIds);

    if (error) {
      console.error(`Error al obtener guardias relacionadas con ausencias del profesor ${profesorId}:`, error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error(`Error inesperado al obtener guardias del profesor ausente ${profesorId}:`, error);
    throw error;
  }
}

// Obtener guardias por profesor cubridor
export async function getGuardiasByProfesorCubridor(profesorId: number): Promise<Guardia[]> {
  try {
    const { data, error } = await supabase
      .from(getTableName('GUARDIAS'))
      .select('*')
      .eq('profesor_cubridor_id', profesorId);

    if (error) {
      console.error(`Error al obtener guardias del profesor cubridor ${profesorId}:`, error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error(`Error inesperado al obtener guardias del profesor cubridor ${profesorId}:`, error);
    throw error;
  }
}

// Asignar profesor cubridor a una guardia
export async function asignarProfesorCubridor(guardiaId: number, profesorId: number): Promise<Guardia> {
  try {
    const { data, error } = await supabase
      .from(getTableName('GUARDIAS'))
      .update({
        profesor_cubridor_id: profesorId,
        estado: DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA
      })
      .eq('id', guardiaId)
      .select()
      .single();

    if (error) {
      console.error(`Error al asignar profesor ${profesorId} a guardia ${guardiaId}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error inesperado al asignar profesor ${profesorId} a guardia ${guardiaId}:`, error);
    throw error;
  }
}

// Firmar una guardia
export async function firmarGuardia(guardiaId: number, observaciones?: string): Promise<Guardia> {
  try {
    const { data, error } = await supabase
      .from(getTableName('GUARDIAS'))
      .update({
        firmada: true,
        estado: DB_CONFIG.ESTADOS_GUARDIA.FIRMADA,
        observaciones: observaciones || null
      })
      .eq('id', guardiaId)
      .select()
      .single();

    if (error) {
      console.error(`Error al firmar guardia ${guardiaId}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error inesperado al firmar guardia ${guardiaId}:`, error);
    throw error;
  }
}

// Anular una guardia
export async function anularGuardia(guardiaId: number, motivo: string): Promise<Guardia> {
  try {
    const { data, error } = await supabase
      .from(getTableName('GUARDIAS'))
      .update({
        estado: DB_CONFIG.ESTADOS_GUARDIA.ANULADA,
        observaciones: motivo
      })
      .eq('id', guardiaId)
      .select()
      .single();

    if (error) {
      console.error(`Error al anular guardia ${guardiaId}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error inesperado al anular guardia ${guardiaId}:`, error);
    throw error;
  }
}

/**
 * Crea una nueva guardia
 * @param guardia Datos de la guardia a crear
 * @returns Guardia creada o null si hubo un error
 */
export async function createGuardia(guardia: Omit<Guardia, 'id'>): Promise<Guardia> {
  try {
    // Log para verificar el tipo de guardia
    console.log("Tipo de guardia en createGuardia:", guardia.tipoGuardia);
    
    // Obtener el próximo ID disponible
    const nextId = await getNextId();
    
    // Crear la guardia con el ID calculado
    const nuevaGuardia = {
      id: nextId,
      ...guardia
    };

    const { data, error } = await supabase
      .from(getTableName('GUARDIAS'))
      .insert(nuevaGuardia)
      .select()
      .single();

    if (error) {
      console.error('Error al crear guardia:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error inesperado al crear guardia:', error);
    throw error;
  }
}

/**
 * Actualiza una guardia existente
 * @param id ID de la guardia a actualizar
 * @param guardia Datos actualizados de la guardia
 * @returns La guardia actualizada o null si hubo un error
 */
export async function updateGuardia(id: number, guardia: Partial<Guardia>): Promise<Guardia> {
  try {
    // Verificar que la guardia existe antes de actualizarla
    const guardiaExistente = await getGuardiaById(id);
    if (!guardiaExistente) {
      throw new Error(`No existe una guardia con ID ${id}`);
    }

    // Crear una copia del objeto para manipularlo
    const guardiaToUpdate = { ...guardia };

    // Usar SQL directo para establecer profesor_cubridor_id a NULL si es undefined
    if ('profesor_cubridor_id' in guardiaToUpdate && guardiaToUpdate.profesor_cubridor_id === undefined) {
      // Eliminar la propiedad del objeto para no enviarla en el update normal
      delete guardiaToUpdate.profesor_cubridor_id;
      
      // Ejecutar SQL directo para establecer el campo a NULL
      const { error: sqlError } = await supabase
        .from(getTableName('GUARDIAS'))
        .update({ profesor_cubridor_id: null })
        .eq('id', id);
        
      if (sqlError) {
        console.error(`Error al establecer profesor_cubridor_id a NULL para guardia ${id}:`, sqlError);
        throw sqlError;
      }
    }

    // Manejar ausencia_id de manera similar cuando es undefined para establecerlo a NULL
    if ('ausencia_id' in guardiaToUpdate && guardiaToUpdate.ausencia_id === undefined) {
      // Eliminar la propiedad del objeto para no enviarla en el update normal
      delete guardiaToUpdate.ausencia_id;
      
      // Ejecutar SQL directo para establecer el campo a NULL
      const { error: sqlError } = await supabase
        .from(getTableName('GUARDIAS'))
        .update({ ausencia_id: null })
        .eq('id', id);
        
      if (sqlError) {
        console.error(`Error al establecer ausencia_id a NULL para guardia ${id}:`, sqlError);
        throw sqlError;
      }
    }

    // Si no hay más campos que actualizar, devolver la guardia actualizada
    if (Object.keys(guardiaToUpdate).length === 0) {
      const guardiaActualizada = await getGuardiaById(id);
      if (!guardiaActualizada) {
        throw new Error(`No se pudo encontrar la guardia con ID ${id} después de la actualización`);
      }
      return guardiaActualizada;
    }

    // Actualizar el resto de campos
    const { data, error } = await supabase
      .from(getTableName('GUARDIAS'))
      .update(guardiaToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error al actualizar guardia con ID ${id}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error inesperado al actualizar guardia con ID ${id}:`, error);
    throw error;
  }
}

/**
 * Elimina una guardia
 * @param id ID de la guardia a eliminar
 * @returns true si la eliminación fue exitosa, false en caso contrario
 */
export async function deleteGuardia(id: number): Promise<void> {
  try {
    // Verificar que la guardia existe antes de eliminarla
    const guardiaExistente = await getGuardiaById(id);
    if (!guardiaExistente) {
      throw new Error(`No existe una guardia con ID ${id}`);
    }

    const { error } = await supabase
      .from(getTableName('GUARDIAS'))
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error al eliminar guardia con ID ${id}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Error inesperado al eliminar guardia con ID ${id}:`, error);
    throw error;
  }
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
 * Obtiene los horarios de un profesor
 * @param profesorId ID del profesor
 * @returns Lista de horarios del profesor
 */
export async function getHorariosByProfesor(profesorId: number): Promise<Horario[]> {
  const { data, error } = await supabase
    .from(getTableName('HORARIOS'))
    .select('*')
    .eq('profesor_id', profesorId);
  
  if (error) {
    console.error(`Error al obtener horarios para el profesor ${profesorId}:`, error);
    return [];
  }
  
  return data || [];
} 