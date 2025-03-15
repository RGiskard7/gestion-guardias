import { supabase } from './supabaseClient';
import { DB_CONFIG, getTableName } from './db-config';

// Interfaces basadas en la estructura de las tablas
export interface Horario {
  id: number;
  profesor_id: number;
  dia_semana: string;
  tramo_horario: string;
}

// Mapeo de días de la semana a números
const diasSemanaMap: Record<string, number> = {
  'Lunes': 1,
  'Martes': 2,
  'Miércoles': 3,
  'Jueves': 4,
  'Viernes': 5
};

// Mapeo inverso de números a días de la semana
const numerosADiasMap: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes'
};

/**
 * Convierte un día de la semana en texto a su equivalente numérico
 * @param diaSemana Día de la semana en texto (Lunes, Martes, etc.)
 * @returns Número correspondiente al día de la semana o null si no es válido
 */
function convertirDiaSemanaANumero(diaSemana: string): number | null {
  return diasSemanaMap[diaSemana] || null;
}

/**
 * Convierte un número de día de la semana a su equivalente en texto
 * @param numeroDia Número del día de la semana (1-5)
 * @returns Texto correspondiente al día de la semana o null si no es válido
 */
function convertirNumeroADiaSemana(numeroDia: number): string | null {
  return numerosADiasMap[numeroDia] || null;
}

/**
 * Obtiene todos los horarios
 * @returns Lista de horarios
 */
export async function getHorarios(): Promise<Horario[]> {
  try {
    const { data, error } = await supabase
      .from(getTableName('HORARIOS'))
      .select('*');
    
    if (error) {
      console.error('Error al obtener horarios:', error);
      return [];
    }
    
    // Convertir los números de día de la semana a texto
    return data.map(horario => ({
      ...horario,
      dia_semana: convertirNumeroADiaSemana(horario.dia_semana) || horario.dia_semana.toString()
    }));
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    return [];
  }
}

/**
 * Obtiene un horario por su ID
 * @param id ID del horario
 * @returns Horario encontrado o null si no existe
 */
export async function getHorarioById(id: number): Promise<Horario | null> {
  try {
    const { data, error } = await supabase
      .from(getTableName('HORARIOS'))
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error al obtener horario con ID ${id}:`, error);
      return null;
    }
    
    // Convertir el número de día de la semana a texto
    if (data) {
      return {
        ...data,
        dia_semana: convertirNumeroADiaSemana(data.dia_semana) || data.dia_semana.toString()
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error al obtener horario con ID ${id}:`, error);
    return null;
  }
}

/**
 * Obtiene los horarios de un profesor específico
 * @param profesorId ID del profesor
 * @returns Lista de horarios del profesor
 */
export async function getHorariosByProfesor(profesorId: number): Promise<Horario[]> {
  try {
    const { data, error } = await supabase
      .from(getTableName('HORARIOS'))
      .select('*')
      .eq('profesor_id', profesorId);
    
    if (error) {
      console.error(`Error al obtener horarios del profesor ${profesorId}:`, error);
      return [];
    }
    
    // Convertir los números de día de la semana a texto
    return data.map(horario => ({
      ...horario,
      dia_semana: convertirNumeroADiaSemana(horario.dia_semana) || horario.dia_semana.toString()
    }));
  } catch (error) {
    console.error(`Error al obtener horarios del profesor ${profesorId}:`, error);
    return [];
  }
}

/**
 * Crea un nuevo horario
 * @param horario Datos del horario a crear
 * @returns Horario creado o null si hubo un error
 */
export async function createHorario(horario: Omit<Horario, 'id'>): Promise<Horario | null> {
  try {
    // Convertir profesor_id a número si es necesario
    const profesorId = typeof horario.profesor_id === 'string' 
      ? Number(horario.profesor_id) 
      : horario.profesor_id;
    
    // Verificar que los datos son del tipo correcto
    if (isNaN(profesorId)) {
      console.error('Error: profesor_id debe ser un número válido, recibido:', horario.profesor_id);
      return null;
    }
    
    // Convertir día de la semana a número
    const diaSemanaNumero = convertirDiaSemanaANumero(horario.dia_semana);
    if (diaSemanaNumero === null) {
      console.error('Error: dia_semana no válido, recibido:', horario.dia_semana);
      return null;
    }
    
    if (typeof horario.tramo_horario !== 'string') {
      console.error('Error: tramo_horario debe ser una cadena de texto');
      return null;
    }

    // Asegurarse de que profesor_id es un número entero
    const horarioToInsert = {
      profesor_id: profesorId,
      dia_semana: diaSemanaNumero,
      tramo_horario: horario.tramo_horario
    };

    console.log('Insertando horario:', horarioToInsert);

    const { data, error } = await supabase
      .from(getTableName('HORARIOS'))
      .insert([horarioToInsert])
      .select();
    
    if (error) {
      console.error('Error al crear horario:', error);
      return null;
    }
    
    // Convertir el número de día de la semana a texto antes de devolverlo
    const horarioCreado = data?.[0];
    if (horarioCreado) {
      return {
        ...horarioCreado,
        dia_semana: convertirNumeroADiaSemana(horarioCreado.dia_semana) || horarioCreado.dia_semana.toString()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error al crear horario:', error);
    return null;
  }
}

/**
 * Actualiza un horario existente
 * @param id ID del horario a actualizar
 * @param horario Datos actualizados del horario
 * @returns true si se actualizó correctamente, false en caso contrario
 */
export async function updateHorario(id: number, horario: Partial<Horario>): Promise<boolean> {
  try {
    // Preparar los datos para actualizar
    const updateData: Record<string, any> = {};
    
    // Actualizar profesor_id si se proporciona
    if (horario.profesor_id !== undefined) {
      const profesorId = typeof horario.profesor_id === 'string' 
        ? Number(horario.profesor_id) 
        : horario.profesor_id;
      
      if (isNaN(profesorId)) {
        console.error('Error: profesor_id debe ser un número válido, recibido:', horario.profesor_id);
        return false;
      }
      
      updateData.profesor_id = profesorId;
    }
    
    // Actualizar dia_semana si se proporciona
    if (horario.dia_semana !== undefined) {
      const diaSemanaNumero = convertirDiaSemanaANumero(horario.dia_semana);
      if (diaSemanaNumero === null) {
        console.error('Error: dia_semana no válido, recibido:', horario.dia_semana);
        return false;
      }
      
      updateData.dia_semana = diaSemanaNumero;
    }
    
    // Actualizar tramo_horario si se proporciona
    if (horario.tramo_horario !== undefined) {
      if (typeof horario.tramo_horario !== 'string') {
        console.error('Error: tramo_horario debe ser una cadena de texto');
        return false;
      }
      
      updateData.tramo_horario = horario.tramo_horario;
    }
    
    // Si no hay datos para actualizar, retornar true
    if (Object.keys(updateData).length === 0) {
      return true;
    }
    
    console.log('Actualizando horario:', updateData);
    
    const { error } = await supabase
      .from(getTableName('HORARIOS'))
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      console.error(`Error al actualizar horario con ID ${id}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error al actualizar horario con ID ${id}:`, error);
    return false;
  }
}

/**
 * Elimina un horario
 * @param id ID del horario a eliminar
 * @returns true si la eliminación fue exitosa, false en caso contrario
 */
export async function deleteHorario(id: number): Promise<boolean> {
  const { error } = await supabase
    .from(getTableName('HORARIOS'))
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error al eliminar horario con ID ${id}:`, error);
    return false;
  }
  
  return true;
} 