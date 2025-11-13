// src/app/core/models/admin.models.ts


export interface Usuario {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    distrito: string;
    estado: string;
    fechaRegistro: string;
}

export interface Cita {
    id: string;
    usuario: { nombre: string; direccion: string; };
    material: { tipo: string; cantidad: string; };
    fecha: { dia: string; hora: string; };
    estado: string;
    recolector?: string;
    origen?: 'admin' | 'usuario';
}

export interface PuntoReciclaje {
    id: string;
    nombre: string;
    tipo: string;
    tipoTexto: string;
    direccion: string;
    horario: string;
    materiales: string[];
    estado: string;
    googleMapsUrl?: string;
}

export interface Material {
    id: string;
    nombre: string;
    tipo: string;
    cantidad: string;
    periodo: string;
    info?: {
        precioPromedio: string;
        puntosActivos: string;
        ultimaActualizacion: string;
    };
}

export interface TrendPoint {
    x: number;
    y: number;
}

export interface TopUser {
    id: string;
    position: number;
    nombre: string;
    ubicacion: string;
    cantidad: string;
    citas: string;
}

export interface RolPermiso {
    id: string;
    nombre: string;
    descripcion: string;
}

export interface ConfiguracionSistema {
    nombreSistema: string;
    emailContacto: string;
    zonaHoraria: string;
    backupAutomatico: boolean;
    ultimoBackup: string;
    colorPrincipal: string;
    tema: 'claro' | 'oscuro';
    notificaciones: { email: boolean; sms: boolean; push: boolean; };
    seguridad: { dobleAutenticacion: boolean; sesionSegura: boolean; };
}