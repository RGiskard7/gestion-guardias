import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_KEY deben estar definidas');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Script para inicializar la base de datos con datos de ejemplo
 * Ejecutar con: npx ts-node scripts/seed-db.ts
 */

// Datos de ejemplo
const usuarios = [
  {
    nombre: 'Administrador',
    email: 'admin@example.com',
    rol: 'admin',
    activo: true
  },
  {
    nombre: 'Profesor 1',
    email: 'profesor1@example.com',
    rol: 'profesor',
    activo: true
  },
  {
    nombre: 'Profesor 2',
    email: 'profesor2@example.com',
    rol: 'profesor',
    activo: true
  },
  {
    nombre: 'Profesor 3',
    email: 'profesor3@example.com',
    rol: 'profesor',
    activo: true
  },
  {
    nombre: 'Profesor Inactivo',
    email: 'inactivo@example.com',
    rol: 'profesor',
    activo: false
  }
];

const lugares = [
  {
    codigo: 'A101',
    descripcion: 'Aula 101',
    tipo_lugar: 'aula'
  },
  {
    codigo: 'A102',
    descripcion: 'Aula 102',
    tipo_lugar: 'aula'
  },
  {
    codigo: 'LAB1',
    descripcion: 'Laboratorio 1',
    tipo_lugar: 'laboratorio'
  },
  {
    codigo: 'BIB',
    descripcion: 'Biblioteca',
    tipo_lugar: 'biblioteca'
  }
];

// Función para inicializar la base de datos
async function initializeDatabase() {
  console.log('Iniciando la inicialización de la base de datos...');

  try {
    // Insertar usuarios
    console.log('Insertando usuarios...');
    const { data: usuariosData, error: usuariosError } = await supabase
      .from('usuarios')
      .upsert(usuarios, { onConflict: 'email' })
      .select();

    if (usuariosError) {
      throw usuariosError;
    }
    console.log(`${usuariosData.length} usuarios insertados correctamente.`);

    // Insertar lugares
    console.log('Insertando lugares...');
    const { data: lugaresData, error: lugaresError } = await supabase
      .from('lugares')
      .upsert(lugares, { onConflict: 'codigo' })
      .select();

    if (lugaresError) {
      throw lugaresError;
    }
    console.log(`${lugaresData.length} lugares insertados correctamente.`);

    // Obtener IDs de usuarios para crear horarios y guardias
    const { data: profesores, error: profesoresError } = await supabase
      .from('usuarios')
      .select('id, nombre')
      .eq('rol', 'profesor')
      .eq('activo', true);

    if (profesoresError) {
      throw profesoresError;
    }

    // Crear horarios para los profesores
    console.log('Insertando horarios...');
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const tramosHorarios = ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:30-12:30', '12:30-13:30', '13:30-14:30'];
    
    const horarios = [];
    for (const profesor of profesores) {
      // Asignar 3 horarios aleatorios a cada profesor
      for (let i = 0; i < 3; i++) {
        const diaAleatorio = diasSemana[Math.floor(Math.random() * diasSemana.length)];
        const tramoAleatorio = tramosHorarios[Math.floor(Math.random() * tramosHorarios.length)];
        
        horarios.push({
          profesor_id: profesor.id,
          dia_semana: diaAleatorio,
          tramo_horario: tramoAleatorio
        });
      }
    }

    const { data: horariosData, error: horariosError } = await supabase
      .from('horarios')
      .upsert(horarios)
      .select();

    if (horariosError) {
      throw horariosError;
    }
    console.log(`${horariosData.length} horarios insertados correctamente.`);

    // Obtener IDs de lugares
    const { data: lugaresIds, error: lugaresIdsError } = await supabase
      .from('lugares')
      .select('id, codigo');

    if (lugaresIdsError) {
      throw lugaresIdsError;
    }

    // Crear guardias
    console.log('Insertando guardias...');
    const fechaActual = new Date();
    const guardias = [];
    const estados = ['Pendiente', 'Asignada', 'Firmada', 'Anulada'];
    const tiposGuardia = ['Ordinaria', 'Extraordinaria'];

    // Crear 10 guardias de ejemplo
    for (let i = 0; i < 10; i++) {
      // Fecha aleatoria en los próximos 30 días
      const fechaGuardia = new Date(fechaActual);
      fechaGuardia.setDate(fechaGuardia.getDate() + Math.floor(Math.random() * 30));
      
      const profesorAusente = profesores[Math.floor(Math.random() * profesores.length)];
      const profesorCubridor = i % 3 === 0 ? null : profesores[Math.floor(Math.random() * profesores.length)];
      const lugar = lugaresIds[Math.floor(Math.random() * lugaresIds.length)];
      const estado = estados[Math.floor(Math.random() * estados.length)];
      const tipoGuardia = tiposGuardia[Math.floor(Math.random() * tiposGuardia.length)];
      const tramoHorario = tramosHorarios[Math.floor(Math.random() * tramosHorarios.length)];
      
      guardias.push({
        fecha: fechaGuardia.toISOString().split('T')[0],
        tramo_horario: tramoHorario,
        tipo_guardia: tipoGuardia,
        firmada: estado === 'Firmada',
        estado: estado,
        observaciones: i % 2 === 0 ? `Observación para guardia ${i+1}` : null,
        lugar_id: lugar.id,
        profesor_ausente_id: profesorAusente.id,
        profesor_cubridor_id: profesorCubridor?.id || null
      });
    }

    const { data: guardiasData, error: guardiasError } = await supabase
      .from('guardias')
      .upsert(guardias)
      .select();

    if (guardiasError) {
      throw guardiasError;
    }
    console.log(`${guardiasData.length} guardias insertadas correctamente.`);

    // Crear tareas para algunas guardias
    console.log('Insertando tareas de guardia...');
    const tareas = [];
    for (const guardia of guardiasData) {
      // Añadir 1-3 tareas aleatorias a cada guardia
      const numTareas = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numTareas; i++) {
        tareas.push({
          guardia_id: guardia.id,
          descripcion: `Tarea ${i+1} para la guardia del ${guardia.fecha} en tramo ${guardia.tramo_horario}`
        });
      }
    }

    const { data: tareasData, error: tareasError } = await supabase
      .from('tareas_guardia')
      .upsert(tareas)
      .select();

    if (tareasError) {
      throw tareasError;
    }
    console.log(`${tareasData.length} tareas de guardia insertadas correctamente.`);

    console.log('Base de datos inicializada correctamente.');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
}

// Ejecutar la inicialización
initializeDatabase()
  .then(() => {
    console.log('Proceso completado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el proceso:', error);
    process.exit(1);
  }); 