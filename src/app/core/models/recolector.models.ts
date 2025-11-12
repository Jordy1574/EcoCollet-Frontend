import { Recoleccion } from './recoleccion.model';

// Define la estructura de los datos que se manejarán en la aplicación
export interface RecolectorStats {
    pendientes: number;
    enCurso: number;
    completadas: number;
    totalRecollectadoKg: number;
}

export interface AgendaItem {
    id: string;
    hora: string;
    direccion: string;
    material: string;
    cantidad: string;
    estado: Recoleccion['estado'];
}

export interface RendimientoSemanal {
    dia: string;
    kg: number;
}