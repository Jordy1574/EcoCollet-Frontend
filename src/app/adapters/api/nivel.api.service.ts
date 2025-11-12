import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NivelResponse {
  usuarioId: number;
  nivel: string;
  puntos: number;
  puntosActuales: number;
  puntosParaSiguiente: number;
  porcentajeProgreso: number;
  descripcion: string;
}

export interface ProgresionNivel {
  usuarioId: number;
  nivel: string;
  puntos: number;
  puntosActuales: number;
  puntosParaSiguiente: number;
  porcentajeProgreso: number;
  benficios?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class NivelApiService {
  private apiUrl = 'http://localhost:8080/api/niveles';

  constructor(private http: HttpClient) {}

  /**
   * Obtener el nivel y progresión actual del usuario
   * @param usuarioId ID del usuario
   */
  obtenerProgresionNivel(usuarioId: number): Observable<ProgresionNivel> {
    return this.http.get<ProgresionNivel>(`${this.apiUrl}/${usuarioId}/progresion`);
  }

  /**
   * Obtener información del nivel
   * @param usuarioId ID del usuario
   */
  obtenerNivelInfo(usuarioId: number): Observable<NivelResponse> {
    return this.http.get<NivelResponse>(`${this.apiUrl}/${usuarioId}/info`);
  }

  /**
   * Obtener todos los niveles disponibles
   */
  obtenerNiveles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/catalogo`);
  }

  /**
   * Obtener el nombre del nivel actual
   * @param usuarioId ID del usuario
   */
  obtenerNivelActual(usuarioId: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/${usuarioId}/actual`);
  }
}
