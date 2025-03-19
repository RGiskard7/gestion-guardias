import { DB_CONFIG } from "@/lib/db-config";

// Tipos de la base de datos (como están en la base de datos)
export interface UsuarioDB {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: string;
  activo: boolean;
}

export interface LugarDB {
  id: number;
  codigo: string;
  descripcion?: string;
  tipo_lugar: string;
}

export interface HorarioDB {
  id: number;
  profesor_id: number;
  dia_semana: string;
  tramo_horario: string;
}

export interface AusenciaDB {
  id: number;
  profesor_id: number;
  fecha: string;
  tramo_horario: string;
  estado: string;
  observaciones?: string;
}

export interface GuardiaDB {
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

export interface TareaGuardiaDB {
  id: number;
  guardia_id: number;
  descripcion: string;
}

// Tipos para la aplicación (como se usan en los contextos)
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: typeof DB_CONFIG.ROLES.ADMIN | typeof DB_CONFIG.ROLES.PROFESOR;
  activo: boolean;
}

export interface Lugar {
  id: number;
  codigo: string;
  descripcion?: string;
  tipoLugar: string;
}

export interface Horario {
  id: number;
  profesorId: number;
  diaSemana: string;
  tramoHorario: string;
}

export interface Ausencia {
  id: number;
  profesorId: number;
  fecha: string;
  tramoHorario: string;
  estado: string;
  observaciones?: string;
}

export interface Guardia {
  id: number;
  fecha: string;
  tramoHorario: string;
  tipoGuardia: string;
  firmada: boolean;
  estado: typeof DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE | 
          typeof DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA | 
          typeof DB_CONFIG.ESTADOS_GUARDIA.FIRMADA | 
          typeof DB_CONFIG.ESTADOS_GUARDIA.ANULADA;
  observaciones: string;
  lugarId: number;
  profesorCubridorId: number | null;
  ausenciaId?: number;
}

export interface TareaGuardia {
  id: number;
  guardiaId: number;
  descripcionTarea: string;
}

// Funciones de mapeo entre los tipos de la base de datos y los tipos de la aplicación
export function mapUsuarioFromDB(usuario: UsuarioDB): Usuario {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido || "",
    email: usuario.email,
    rol: usuario.rol as typeof DB_CONFIG.ROLES.ADMIN | typeof DB_CONFIG.ROLES.PROFESOR,
    activo: usuario.activo
  };
}

export function mapUsuarioToDB(usuario: Omit<Usuario, "id">): Omit<UsuarioDB, "id" | "password"> {
  return {
    nombre: usuario.nombre,
    apellido: usuario.apellido || "",
    email: usuario.email,
    rol: usuario.rol,
    activo: usuario.activo
  };
}

export function mapLugarFromDB(lugar: LugarDB): Lugar {
  return {
    id: lugar.id,
    codigo: lugar.codigo,
    descripcion: lugar.descripcion,
    tipoLugar: lugar.tipo_lugar
  };
}

export function mapLugarToDB(lugar: Omit<Lugar, "id">): Omit<LugarDB, "id"> {
  return {
    codigo: lugar.codigo,
    descripcion: lugar.descripcion,
    tipo_lugar: lugar.tipoLugar
  };
}

export function mapHorarioFromDB(horario: HorarioDB): Horario {
  return {
    id: horario.id,
    profesorId: horario.profesor_id,
    diaSemana: horario.dia_semana,
    tramoHorario: horario.tramo_horario
  };
}

export function mapHorarioToDB(horario: Omit<Horario, "id">): Omit<HorarioDB, "id"> {
  return {
    profesor_id: horario.profesorId,
    dia_semana: horario.diaSemana,
    tramo_horario: horario.tramoHorario
  };
}

export function mapAusenciaFromDB(ausencia: AusenciaDB): Ausencia {
  return {
    id: ausencia.id,
    profesorId: ausencia.profesor_id,
    fecha: ausencia.fecha,
    tramoHorario: ausencia.tramo_horario,
    estado: ausencia.estado,
    observaciones: ausencia.observaciones
  };
}

export function mapAusenciaToDB(ausencia: Ausencia): AusenciaDB {
  return {
    id: ausencia.id,
    profesor_id: ausencia.profesorId,
    fecha: ausencia.fecha,
    tramo_horario: ausencia.tramoHorario,
    estado: ausencia.estado,
    observaciones: ausencia.observaciones
  };
}

export function mapGuardiaFromDB(guardia: GuardiaDB): Guardia {
  return {
    id: guardia.id,
    fecha: guardia.fecha,
    tramoHorario: guardia.tramo_horario,
    tipoGuardia: guardia.tipo_guardia,
    firmada: guardia.firmada,
    estado: guardia.estado as typeof DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE | 
                            typeof DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA | 
                            typeof DB_CONFIG.ESTADOS_GUARDIA.FIRMADA | 
                            typeof DB_CONFIG.ESTADOS_GUARDIA.ANULADA,
    observaciones: guardia.observaciones || "",
    lugarId: guardia.lugar_id,
    profesorCubridorId: guardia.profesor_cubridor_id || null,
    ausenciaId: guardia.ausencia_id
  };
}

export function mapGuardiaToDB(guardia: Omit<Guardia, "id">): Omit<GuardiaDB, "id"> {
  return {
    fecha: guardia.fecha,
    tramo_horario: guardia.tramoHorario,
    tipo_guardia: guardia.tipoGuardia,
    firmada: guardia.firmada,
    estado: guardia.estado,
    observaciones: guardia.observaciones || undefined,
    lugar_id: guardia.lugarId,
    profesor_cubridor_id: guardia.profesorCubridorId || undefined,
    ausencia_id: guardia.ausenciaId
  };
}

export function mapTareaGuardiaFromDB(tarea: TareaGuardiaDB): TareaGuardia {
  return {
    id: tarea.id,
    guardiaId: tarea.guardia_id,
    descripcionTarea: tarea.descripcion
  };
}

export function mapTareaGuardiaToDB(tarea: Omit<TareaGuardia, "id">): Omit<TareaGuardiaDB, "id"> {
  return {
    guardia_id: tarea.guardiaId,
    descripcion: tarea.descripcionTarea
  };
} 