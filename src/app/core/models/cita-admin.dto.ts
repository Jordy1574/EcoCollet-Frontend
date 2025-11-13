// src/app/core/models/cita-admin.dto.ts
// Tipos basados en el contrato backend admin/citas

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string | null;
}

/**
 * DTO usado por el backend para listar y detallar citas en admin
 * Incluye items[] para soporte multi-material
 */
export interface CitaAdminDTO {
  id: number;
  usuarioNombre: string | null;
  usuarioDireccion: string | null;
  fecha: string;          // YYYY-MM-DD
  hora: string;           // HH:mm
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';
  recolectorNombre: string | null;
  items: CitaMaterialItem[];
  
  // Legacy (opcional, solo para citas creadas por usuario con 1 material)
  materialNombre?: string | null;
  cantidadEstimada?: number | null;
}

export interface CitaMaterialItem {
  materialId: number | null;
  materialNombre: string | null;
  kg: number | null;
}

/**
 * Payload para crear cita con múltiples materiales (admin)
 */
export interface CreateCitaMultiRequest {
  usuarioId: number;
  fecha: string;          // YYYY-MM-DD
  hora: string;           // HH:mm
  materiales: { materialId: number; kg: number }[];
  recolectorId?: number;
  notas?: string;
}

/**
 * Payload para actualizar estado/recolector/notas de una cita (admin)
 */
export interface UpdateCitaRequest {
  estado?: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';
  recolectorId?: number;
  notas?: string;
}

/**
 * Response de usuario (para filtrar recolectores)
 */
export interface UsuarioResponse {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'RECOLECTOR' | 'CLIENTE';
  distrito: string | null;  // alias de direccion
  estado: string;           // placeholder "Activo"
}
