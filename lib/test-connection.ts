import { supabase } from './supabaseClient';
import { DB_CONFIG, getTableName } from './db-config';

/**
 * Función simple para probar la conexión a Supabase
 */
export async function testConnection() {
  console.log('Probando conexión a Supabase...');
  
  try {
    // Intentar listar los usuarios disponibles
    const { data, error } = await supabase
      .from(getTableName('USUARIOS'))
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error al consultar Supabase:', error.message);
      return false;
    }
    
    console.log('Conexión exitosa a Supabase');
    console.log('Datos obtenidos:', data);
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    return false;
  }
} 