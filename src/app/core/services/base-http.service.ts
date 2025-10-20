import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BaseHttpService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los headers por defecto
   */
  private getHeaders(includeAuth: boolean = true): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (includeAuth) {
      const token = localStorage.getItem(environment.tokenKey);
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error HTTP:', error);
    
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 0) {
        errorMessage = 'No se puede conectar con el servidor';
      } else if (error.status === 401) {
        errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente';
        // Aquí podrías disparar un evento para logout automático
        localStorage.removeItem(environment.tokenKey);
        localStorage.removeItem(environment.refreshTokenKey);
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para realizar esta acción';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status >= 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error
    }));
  }

  /**
   * Petición GET
   */
  get<T>(endpoint: string, params?: HttpParams, includeAuth: boolean = true): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    const options = {
      headers: this.getHeaders(includeAuth),
      params: params
    };

    return this.http.get<ApiResponse<T>>(url, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Petición POST
   */
  post<T>(endpoint: string, data: any, includeAuth: boolean = true): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    const options = {
      headers: this.getHeaders(includeAuth)
    };

    return this.http.post<ApiResponse<T>>(url, data, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Petición PUT
   */
  put<T>(endpoint: string, data: any, includeAuth: boolean = true): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    const options = {
      headers: this.getHeaders(includeAuth)
    };

    return this.http.put<ApiResponse<T>>(url, data, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Petición PATCH
   */
  patch<T>(endpoint: string, data: any, includeAuth: boolean = true): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    const options = {
      headers: this.getHeaders(includeAuth)
    };

    return this.http.patch<ApiResponse<T>>(url, data, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Petición DELETE
   */
  delete<T>(endpoint: string, includeAuth: boolean = true): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    const options = {
      headers: this.getHeaders(includeAuth)
    };

    return this.http.delete<ApiResponse<T>>(url, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Upload de archivos
   */
  uploadFile<T>(endpoint: string, file: File, additionalData?: any): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    const formData = new FormData();
    
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const headers = new HttpHeaders();
    const token = localStorage.getItem(environment.tokenKey);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<ApiResponse<T>>(url, formData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }
}