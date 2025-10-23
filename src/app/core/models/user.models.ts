// src/app/core/models/user.models.ts
// Modelos específicos para el dashboard de usuario

export interface CitaUsuario {
  id: string;
  fecha: string;
  hora: string;
  direccion: string;
  material: MaterialType;
  cantidad: string; // ej: "8 kg"
  estado: CitaEstado;
  recolector?: string;
  notas?: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
}

export interface EstadisticasUsuario {
  citasCompletadas: number;
  materialReciclado: number; // en kg
  puntosGanados: number;
  impactoAmbiental: ImpactoAmbiental;
  racha: RachaReciclaje;
}

export interface ImpactoAmbiental {
  co2Ahorrado: number; // en kg de CO2
  aguaAhorrada: number; // en litros
  energiaAhorrada: number; // en kWh
  arbolesEquivalentes: number;
}

export interface RachaReciclaje {
  dias: number;
  ultimaFecha: string;
  mejor: number; // mejor racha histórica
}

export interface PuntoReciclaje {
  id: string;
  nombre: string;
  direccion: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  distancia: string; // ej: "1.2 km"
  tiempoViaje: string; // ej: "5 min"
  materiales: MaterialType[];
  horario: Horario;
  estado: PuntoEstado;
  calificacion: number; // 1-5 estrellas
  telefono?: string;
  servicios: ServicioExtra[];
}

export interface Horario {
  lunes: HoraDia;
  martes: HoraDia;
  miercoles: HoraDia;
  jueves: HoraDia;
  viernes: HoraDia;
  sabado: HoraDia;
  domingo: HoraDia;
}

export interface HoraDia {
  abierto: boolean;
  inicio?: string; // ej: "08:00"
  fin?: string; // ej: "18:00"
}

export interface HistorialReciclaje {
  id: string;
  fecha: string;
  material: MaterialType;
  cantidad: number; // en kg
  puntoReciclaje: string;
  puntosGanados: number;
  impacto: {
    co2: number;
    agua: number;
    energia: number;
  };
}

export interface NotificacionUsuario {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  accion?: AccionNotificacion;
}

export interface AccionNotificacion {
  tipo: 'link' | 'modal' | 'external';
  datos: any;
}

export interface PerfilUsuario {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  direccion: DireccionUsuario;
  avatar?: string;
  preferencias: PreferenciasUsuario;
  verificado: boolean;
  fechaRegistro: string;
  ultimaActividad: string;
}

export interface DireccionUsuario {
  calle: string;
  numero?: string;
  distrito: string;
  ciudad: string;
  codigoPostal?: string;
  referencia?: string;
}

export interface PreferenciasUsuario {
  notificaciones: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  idioma: 'es' | 'en';
  tema: 'claro' | 'oscuro' | 'auto';
  materialesFavoritos: MaterialType[];
  radioBusqueda: number; // en km
}

export interface ServicioExtra {
  nombre: string;
  descripcion?: string;
  disponible: boolean;
}

// Enums y tipos
export type MaterialType = 
  | 'plastico' 
  | 'papel' 
  | 'carton' 
  | 'vidrio' 
  | 'metal' 
  | 'electronicos' 
  | 'baterias' 
  | 'aceite'
  | 'organico';

export type CitaEstado = 
  | 'Pendiente' 
  | 'Confirmada' 
  | 'En proceso' 
  | 'Completada' 
  | 'Cancelada' 
  | 'No realizada';

export type PuntoEstado = 
  | 'Abierto' 
  | 'Cerrado' 
  | 'Mantenimiento' 
  | 'Temporalmente cerrado';

export type TipoNotificacion = 
  | 'cita_confirmada' 
  | 'cita_recordatorio' 
  | 'cita_cancelada' 
  | 'puntos_ganados' 
  | 'nuevo_punto' 
  | 'sistema' 
  | 'promocion';

// Interfaces para formularios
export interface SolicitudCita {
  material: MaterialType;
  cantidad: string;
  fechaPreferida: string;
  horaPreferida: string;
  direccion: string;
  notas?: string;
  contacto: {
    telefono: string;
    email: string;
  };
}

export interface FiltrosBusqueda {
  materiales?: MaterialType[];
  distanciaMaxima?: number; // en km
  abierto?: boolean;
  conCalificacion?: number; // mínima
}

// Interfaces para respuestas de API
export interface RespuestaApi<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardData {
  estadisticas: EstadisticasUsuario;
  citasPendientes: CitaUsuario[];
  puntosRecomendados: PuntoReciclaje[];
  notificaciones: NotificacionUsuario[];
  historialReciente: HistorialReciclaje[];
}

// Constantes útiles
export const MATERIALES_INFO = {
  plastico: {
    nombre: 'Plástico',
    color: '#3B82F6',
    icono: '♻️',
    descripcion: 'Botellas, envases, bolsas'
  },
  papel: {
    nombre: 'Papel',
    color: '#F59E0B',
    icono: '📄',
    descripcion: 'Periódicos, revistas, hojas'
  },
  carton: {
    nombre: 'Cartón',
    color: '#D97706',
    icono: '📦',
    descripcion: 'Cajas, empaques, cartones'
  },
  vidrio: {
    nombre: 'Vidrio',
    color: '#10B981',
    icono: '🍶',
    descripcion: 'Botellas, frascos, cristales'
  },
  metal: {
    nombre: 'Metal',
    color: '#6B7280',
    icono: '🔩',
    descripcion: 'Latas, aluminio, cobre'
  },
  electronicos: {
    nombre: 'Electrónicos',
    color: '#8B5CF6',
    icono: '📱',
    descripcion: 'Teléfonos, computadoras, cables'
  },
  baterias: {
    nombre: 'Baterías',
    color: '#EF4444',
    icono: '🔋',
    descripcion: 'Pilas, baterías recargables'
  },
  aceite: {
    nombre: 'Aceite',
    color: '#F59E0B',
    icono: '🛢️',
    descripcion: 'Aceite de cocina usado'
  },
  organico: {
    nombre: 'Orgánico',
    color: '#84CC16',
    icono: '🍃',
    descripcion: 'Restos de comida, hojas'
  }
} as const;