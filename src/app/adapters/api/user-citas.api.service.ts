import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseHttpService } from '../../core/services/base-http.service';

export interface CitaUsuario {
    id: number;
    materialId: number;
    materialNombre: string;
    cantidadEstimada: number;
    fecha: string;
    hora: string;
    estado: string;
    notas?: string;
    recolectorNombre?: string;
}

export interface CrearCitaRequest {
    materialId: number;
    cantidadEstimada: number;
    fecha: string; // "2025-11-10"
    hora: string;  // "10:00"
    notas?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserCitasApiService {

    constructor(private http: BaseHttpService) {}

    /**
     * Crear nueva cita (usuario autenticado)
     * POST /api/citas
     * ✅ NO envía usuarioId, se obtiene del token JWT
     */
    crearCita(cita: CrearCitaRequest): Observable<CitaUsuario> {
        return this.http.post<any>('citas', cita)
            .pipe(
                map(resp => this.mapBackendCita(resp.data)),
                catchError(err => {
                    console.error('Error al crear cita:', err);
                    throw err;
                })
            );
    }

    /**
     * Obtener mis citas
     * GET /api/citas/mis-citas
     */
    getMisCitas(): Observable<CitaUsuario[]> {
        return this.http.get<any>('citas/mis-citas')
            .pipe(
                map(resp => {
                    console.log('📦 Respuesta del backend getMisCitas:', resp);
                    const citas = resp?.data || [];
                    console.log('📋 Citas mapeadas:', citas.length);
                    return citas.map((c: any) => this.mapBackendCita(c));
                }),
                catchError(err => {
                    console.error('❌ Error en getMisCitas:', err);
                    return of([]);
                })
            );
    }

    getCitaDetalle(id: number): Observable<CitaUsuario> {
        return this.http.get<any>(`citas/${id}`)
            .pipe(
                map(resp => this.mapBackendCita(resp.data)),
                catchError(err => {
                    console.error('Error al obtener cita:', err);
                    throw err;
                })
            );
    }

    private mapBackendCita(c: any): CitaUsuario {
        return {
            id: c.id ?? 0,
            materialId: c.materialId ?? 0,
            materialNombre: c.materialNombre ?? 'Sin especificar',
            cantidadEstimada: c.cantidadEstimada ?? 0,
            fecha: c.fecha ?? '',
            hora: c.hora ?? '',
            estado: this.capitalizeEstado(c.estado),
            notas: c.notas,
            recolectorNombre: c.recolectorNombre
        };
    }

    private capitalizeEstado(estado: string | undefined): string {
        const e = (estado || '').toLowerCase();
        if (e === 'pendiente') return 'Pendiente';
        if (e === 'en_proceso') return 'En Proceso';
        if (e === 'completada') return 'Completada';
        if (e === 'cancelada') return 'Cancelada';
        return estado || 'Pendiente';
    }
}
