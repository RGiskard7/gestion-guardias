import { createClient } from '@supabase/supabase-js';

// Verificamos que las variables de entorno estén definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

console.log('Configurando cliente de Supabase...');
console.log('URL de Supabase:', supabaseUrl ? 'Definida ✅' : 'No definida ❌');
console.log('API Key de Supabase:', supabaseKey ? 'Definida ✅' : 'No definida ❌');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_KEY deben estar definidas');
}

// Creamos y exportamos el cliente de Supabase
console.log('Creando cliente de Supabase con URL:', supabaseUrl);
export const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Cliente de Supabase creado correctamente'); 