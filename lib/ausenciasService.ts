import { supabase } from './supabaseClient';
import { DB_CONFIG, getTableName } from './db-config';
import { createGuardia, type Guardia } from './guardiasService';
import { createTareaGuardia } from './tareasGuardiaService';

// Interfaces basadas en la estructura de la tabla
export interface Ausencia {
  id: number;
  profesor_id: number;
  fecha: string;
  tramo_horario: string;
  estado: string; // 'Pendiente', 'Aceptada', 'Rechazada'
  observaciones?: string;
  tareas?: string;
}

/**
 * Obtiene todas las ausencias
 * @returns Lista de ausencias
 */
export async function getAllAusencias(): Promise<Ausencia[]> {
  try {
    const { data, error } = await supabase
      .from(getTableName('AUSENCIAS'))
      .select('*');

    if (error) {
      console.error('Error al obtener ausencias:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error inesperado al obtener ausencias:', error);
    throw error;
  }
}

/**
 * Obtiene una ausencia por ID
 * @param id ID de la ausencia
 * @returns Ausencia encontrada o null si no existe
 */
export async function getAusenciaById(id: number): Promise<Ausencia | null> {
  try {
    const { data, error } = await supabase
      .from(getTableName('AUSENCIAS'))
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error al obtener ausencia con ID ${id}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error inesperado al obtener ausencia con ID ${id}:`, error);
    throw error;
  }
}

/**
 * Obtiene ausencias por profesor
 * @param profesorId ID del profesor
 * @returns Lista de ausencias del profesor
 */
export async function getAusenciasByProfesor(profesorId: number): Promise<Ausencia[]> {
  try {
    const { data, error } = await supabase
      .from(getTableName('AUSENCIAS'))
      .select('*')
      .eq('profesor_id', profesorId);

    if (error) {
      console.error(`Error al obtener ausencias del profesor ${profesorId}:`, error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error(`Error inesperado al obtener ausencias del profesor ${profesorId}:`, error);
    throw error;
  }
}

/**
 * Obtiene ausencias por estado
 * @param estado Estado de las ausencias ('Pendiente', 'Aceptada', 'Rechazada')
 * @returns Lista de ausencias con el estado especificado
 */
export async function getAusenciasByEstado(estado: string): Promise<Ausencia[]> {
  try {
    const { data, error } = await supabase
      .from(getTableName('AUSENCIAS'))
      .select('*')
      .eq('estado', estado);

    if (error) {
      console.error(`Error al obtener ausencias con estado ${estado}:`, error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error(`Error inesperado al obtener ausencias con estado ${estado}:`, error);
    throw error;
  }
}

/**
 * Obtiene ausencias pendientes
 * @returns Lista de ausencias pendientes
 */
export async function getAusenciasPendientes(): Promise<Ausencia[]> {
  return getAusenciasByEstado(DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE);
}

/**
 * Crea una nueva ausencia
 * @param ausencia Datos de la ausencia a crear
 * @returns Ausencia creada o null si hubo un error
 */
export async function createAusencia(ausencia: Omit<Ausencia, 'id'>): Promise<Ausencia> {
  try {
    // Validar que la fecha no sea en el pasado
    const fechaAusencia = new Date(ausencia.fecha);
    fechaAusencia.setHours(0, 0, 0, 0);
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaAusencia < hoy) {
      throw new Error('No se pueden crear ausencias con fechas pasadas');
    }
    
    // Obtener el próximo ID disponible
    const { data: maxIdData } = await supabase
      .from(getTableName('AUSENCIAS'))
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;
    
    // Crear la ausencia con el ID calculado
    const nuevaAusencia = {
      id: nextId,
      ...ausencia
    };

    const { data, error } = await supabase
      .from(getTableName('AUSENCIAS'))
      .insert(nuevaAusencia)
      .select()
      .single();

    if (error) {
      console.error('Error al crear ausencia:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error al crear ausencia:', error);
    throw error;
  }
}

/**
 * Actualiza una ausencia existente
 * @param id ID de la ausencia a actualizar
 * @param ausencia Datos actualizados de la ausencia
 * @returns true si la actualización fue exitosa, false en caso contrario
 */
export async function updateAusencia(id: number, ausencia: Partial<Ausencia>): Promise<boolean> {
  try {
    // Verificar que la ausencia existe antes de actualizarla
    const ausenciaExistente = await getAusenciaById(id);
    if (!ausenciaExistente) {
      throw new Error(`No existe una ausencia con ID ${id}`);
    }

    // Actualizar la ausencia
    const { error } = await supabase
      .from(getTableName('AUSENCIAS'))
      .update(ausencia)
      .eq('id', id);

    if (error) {
      console.error(`Error al actualizar ausencia con ID ${id}:`, error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error inesperado al actualizar ausencia con ID ${id}:`, error);
    return false;
  }
}

/**
 * Acepta una ausencia y crea una guardia asociada
 * @param ausenciaId ID de la ausencia a aceptar
 * @param tipoGuardia Tipo de guardia a crear
 * @param lugarId ID del lugar donde se realizará la guardia
 * @param observaciones Observaciones adicionales (opcional)
 * @returns Guardia creada o null si hubo un error
 */
export async function acceptAusencia(
  ausenciaId: number, 
  tipoGuardia: string, 
  lugarId: number, 
  observaciones?: string
): Promise<Guardia | null> {
  try {
    // Obtener la ausencia
    const ausencia = await getAusenciaById(ausenciaId);
    if (!ausencia) {
      throw new Error(`No existe una ausencia con ID ${ausenciaId}`);
    }

    // Actualizar el estado de la ausencia a 'Aceptada'
    await updateAusencia(ausenciaId, { 
      estado: DB_CONFIG.ESTADOS_AUSENCIA.ACEPTADA 
    });

    // Crear la guardia asociada
    const nuevaGuardia = await createGuardia({
      fecha: ausencia.fecha,
      tramo_horario: ausencia.tramo_horario,
      tipo_guardia: tipoGuardia,
      firmada: false,
      estado: DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE,
      observaciones: observaciones || ausencia.observaciones,
      lugar_id: lugarId,
      profesor_cubridor_id: undefined,
      ausencia_id: ausenciaId
    });

    return nuevaGuardia;
  } catch (error) {
    console.error(`Error al aceptar ausencia con ID ${ausenciaId}:`, error);
    return null;
  }
}

/**
 * Rechaza una ausencia
 * @param ausenciaId ID de la ausencia a rechazar
 * @param motivo Motivo del rechazo (opcional)
 * @returns true si el rechazo fue exitoso, false en caso contrario
 */
export async function rejectAusencia(ausenciaId: number, motivo?: string): Promise<boolean> {
  try {
    // Actualizar el estado de la ausencia a 'Rechazada'
    return await updateAusencia(ausenciaId, { 
      estado: DB_CONFIG.ESTADOS_AUSENCIA.RECHAZADA,
      observaciones: motivo
    });
  } catch (error) {
    console.error(`Error al rechazar ausencia con ID ${ausenciaId}:`, error);
    return false;
  }
}

/**
 * Elimina una ausencia
 * @param id ID de la ausencia a eliminar
 * @returns true si la eliminación fue exitosa, false en caso contrario
 */
export async function deleteAusencia(id: number): Promise<boolean> {
  try {
    // Verificar que la ausencia existe antes de eliminarla
    const ausenciaExistente = await getAusenciaById(id);
    if (!ausenciaExistente) {
      throw new Error(`No existe una ausencia con ID ${id}`);
    }

    // Buscar guardias asociadas a esta ausencia
    const { data: guardiasAsociadas, error: errorGuardias } = await supabase
      .from(getTableName('GUARDIAS'))
      .select('*')
      .eq('ausencia_id', id);

    if (errorGuardias) {
      console.error(`Error al buscar guardias asociadas a la ausencia ${id}:`, errorGuardias);
      throw errorGuardias;
    }

    // Primero desasociar y anular las guardias asociadas
    if (guardiasAsociadas && guardiasAsociadas.length > 0) {
      for (const guardia of guardiasAsociadas) {
        // Desasociar la guardia de la ausencia primero (poner ausencia_id a null)
        const { error: errorDesasociar } = await supabase
          .from(getTableName('GUARDIAS'))
          .update({
            ausencia_id: null,
            estado: DB_CONFIG.ESTADOS_GUARDIA.ANULADA,
            observaciones: `ANULADA: La ausencia asociada ha sido eliminada`,
          })
          .eq('id', guardia.id);

        if (errorDesasociar) {
          console.error(`Error al desasociar/anular guardia ${guardia.id}:`, errorDesasociar);
          throw errorDesasociar;
        }
      }
    }

    // Una vez desasociadas todas las guardias, eliminar la ausencia
    const { error } = await supabase
      .from(getTableName('AUSENCIAS'))
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error al eliminar ausencia con ID ${id}:`, error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error inesperado al eliminar ausencia con ID ${id}:`, error);
    return false;
  }
} 