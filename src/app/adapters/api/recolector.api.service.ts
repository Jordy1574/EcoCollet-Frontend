import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, tap, delay, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { RecolectorStats, AgendaItem, RendimientoSemanal } from '../../core/models/recolector.models';
import { BaseHttpService } from '../../core/services/base-http.service';
import { Recoleccion } from '../../core/models/recoleccion.model';

export interface ActualizarRecoleccionRequest {
  pesoReal?: number;
  calidadMaterial?: string;
  observaciones?: string;
  clientePresente?: boolean;
  estado?: 'pendiente' | 'en_curso' | 'completada' | 'cancelada';
  notasRecolector?: string;
}

export interface HistorialFilter {
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
  tipoMaterial?: string;
  clienteId?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class RecolectorApiService {
  constructor(private baseHttp: BaseHttpService) {}

  private mockStats: RecolectorStats = {
    pendientes: 5,
    enCurso: 1,
    completadas: 2,
    totalRecollectadoKg: 47
  };

  private mockAgenda: AgendaItem[] = [
    { id: '#001', hora: '8:30 AM', direccion: 'Av. Larco 123', material: 'Plástico', cantidad: '12 kg', estado: 'Completada' },
    { id: '#002', hora: '10:00 AM', direccion: 'Jr. Colón 456', material: 'Papel', cantidad: '8 kg', estado: 'En proceso' },
    { id: '#003', hora: '11:30 AM', direccion: 'Av. Pardo 789', material: 'Vidrio', cantidad: '15 kg', estado: 'Pendiente' },
    { id: '#004', hora: '2:00 PM', direccion: 'Av. Benavides 321', material: 'Plástico', cantidad: '10 kg', estado: 'Pendiente' },
  ];

  /**
   * Obtener estadísticas del recolector
   */
  getStats(): Observable<RecolectorStats> {
    return this.baseHttp.get<RecolectorStats>('recolector/stats')
      .pipe(
        map(response => response.data!),
        catchError(error => {
          console.warn('Usando datos mock para stats:', error);
          return of(this.mockStats).pipe(delay(200));
        })
      );
  }

  /**
   * Obtener agenda del día actual
   */
  getAgendaHoy(): Observable<AgendaItem[]> {
    const today = new Date().toISOString().split('T')[0];
    const params = new HttpParams().set('fecha', today);
    
    return this.baseHttp.get<AgendaItem[]>('recolector/agenda', params)
      .pipe(
        map(response => response.data!),
        catchError(error => {
          console.warn('Usando datos mock para agenda:', error);
          return of(this.mockAgenda.filter(r => ['Pendiente', 'En proceso'].includes(r.estado))).pipe(delay(300));
        })
      );
  }

  /**
   * Obtener todas las recolecciones con filtros
   */
  getRecolecciones(filtros?: HistorialFilter): Observable<{ recolecciones: Recoleccion[], total: number }> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.tipoMaterial) params = params.set('tipoMaterial', filtros.tipoMaterial);
      if (filtros.clienteId) params = params.set('clienteId', filtros.clienteId);
      if (filtros.page) params = params.set('page', filtros.page.toString());
      if (filtros.limit) params = params.set('limit', filtros.limit.toString());
    }

    return this.baseHttp.get<{ recolecciones: Recoleccion[], total: number }>('recolector/recolecciones', params)
      .pipe(
        map(response => response.data!)
      );
  }

  /**
   * Obtener historial de recolecciones
   */
  getHistorial(filtros?: HistorialFilter): Observable<{ recolecciones: any[], total: number }> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.page) params = params.set('page', filtros.page.toString());
      if (filtros.limit) params = params.set('limit', filtros.limit.toString());
    }

    return this.baseHttp.get<{ recolecciones: any[], total: number }>('recolector/historial', params)
      .pipe(
        map(response => response.data!)
      );
  }

  /**
   * Obtener rendimiento semanal
   */
  getRendimientoSemanal(): Observable<RendimientoSemanal[]> {
    return this.baseHttp.get<RendimientoSemanal[]>('recolector/rendimiento/semanal')
      .pipe(
        map(response => response.data!),
        catchError(error => {
          console.warn('Usando datos mock para rendimiento:', error);
          return of([
            { dia: 'Lun', kg: 45 }, { dia: 'Mar', kg: 52 }, { dia: 'Mié', kg: 38 }, 
            { dia: 'Jue', kg: 67 }, { dia: 'Vie', kg: 43 }, { dia: 'Sáb', kg: 29 }, 
            { dia: 'Dom', kg: 35 }
          ]);
        })
      );
  }

  /**
   * Obtener métricas del recolector
   */
  getMetricas(periodo: 'hoy' | 'semana' | 'mes' = 'hoy'): Observable<any> {
    const params = new HttpParams().set('periodo', periodo);
    
    return this.baseHttp.get<any>('recolector/metricas', params)
      .pipe(
        map(response => response.data!)
      );
  }

  /**
   * Actualizar ubicación del recolector
   */
  actualizarUbicacion(latitud: number, longitud: number): Observable<any> {
    return this.baseHttp.post('recolector/ubicacion', { latitud, longitud })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Obtener ruta optimizada para el día
   */
  getRutaOptimizada(fecha?: string): Observable<any> {
    const params = fecha ? new HttpParams().set('fecha', fecha) : new HttpParams();
    
    return this.baseHttp.get<any>('recolector/ruta', params)
      .pipe(
        map(response => response.data!)
      );
  }

  aceptarRecoleccion(id: string): Observable<AgendaItem> {
    return this.baseHttp.patch<AgendaItem>(`recolector/recolecciones/${id}/aceptar`, {}).pipe(
      map(response => response.data!)
    );
  }

  
}