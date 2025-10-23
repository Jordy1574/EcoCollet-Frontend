// src/app/core/models/cita.model.ts

export interface Cita {
  id: string;
  fecha: string;
  estado: 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada' | 'En proceso';
  direccion: string;
  tipoMaterial: string;
  cantidadEstimada: number;
  puntos: number;
  hora?: string; // Opcional, si lo usas
}
