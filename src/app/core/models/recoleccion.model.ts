export interface Recoleccion {
    id: string;
    cantidad_kg: string;
    direccion: string;
    distrito: string;
    referencia?: string;
    estado: 'Pendiente' | 'En proceso' | 'Completada' | 'Cancelada';
    fechaAsignacion: string;
    fechaCompletada?: string;
    fechaRecojo: string;
    fechaSolicitud: string;
    tipo_material: string; // Ej: 'Plástico', 'Papel'
    cliente_id: string;
    recolector_id?: string; // Puede ser null si no está asignado
}
