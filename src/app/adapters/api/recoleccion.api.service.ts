import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseHttpService } from '../../core/services/base-http.service';
import { Recoleccion } from '../../core/models/recoleccion.model';

@Injectable({ providedIn: 'root' })
export class RecoleccionApiService {
  constructor(private baseHttp: BaseHttpService) {}

  getRecolecciones(): Observable<Recoleccion[]> {
    return this.baseHttp.get<Recoleccion[]>('recolecciones').pipe(
      map(response => response.data!)
    );

  }
  cancelarRecoleccion(id: number): Observable<void> {
        return this.baseHttp.patch<void>(`recolecciones/${id}/cancelar`, null)
            .pipe(
                map(() => void 0),
                catchError(err => {
                    console.error('Error al cancelar cita:', err);
                    throw err;
                })
            );
    }

  getRecoleccionById(id: string): Observable<Recoleccion> {
    return this.baseHttp.get<Recoleccion>(`recolecciones/${id}`).pipe(
      map(response => response.data!)
    );
  }

  createRecoleccion(data: Partial<Recoleccion>): Observable<Recoleccion> {
    return this.baseHttp.post<Recoleccion>('recolecciones', data).pipe(
      map(response => response.data!)
    );
  }

  updateRecoleccion(id: string, data: Partial<Recoleccion>): Observable<Recoleccion> {
    return this.baseHttp.put<Recoleccion>(`recolecciones/${id}`, data).pipe(
      map(response => response.data!)
    );
  }

  deleteRecoleccion(id: string): Observable<void> {
    return this.baseHttp.delete<void>(`recolecciones/${id}`).pipe(
      map(() => void 0)
    );
  }

    getMisRecolecciones(): Observable<Recoleccion[]> {
      return this.baseHttp.get<Recoleccion[]>('recolecciones/mis-recolecciones').pipe(
        map(response => response.data || [])
      );
    }

  // ✅ Endpoint público para puntos de reciclaje (usuarios CLIENTE/RECOLECTOR)
  getPuntosReciclaje(): Observable<any[]> {
    return this.baseHttp.get<any[]>('puntos-reciclaje').pipe(
      map(response => response.data || [])
    );
  }
    
}
