import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../../core/models/user.model';
import { BaseHttpService, ApiResponse } from '../../core/services/base-http.service';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'usuario' | 'recolector';
  phone?: string;
  address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private baseHttp: BaseHttpService) {
    // Cargar usuario desde localStorage al inicializar
    this.loadUserFromStorage();
  }

  /**
   * Cargar usuario desde localStorage
   */
  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem(environment.tokenKey);
    
    if (userData && token) {
      try {
        const user: User = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user data from storage:', error);
        this.clearStorage();
      }
    }
  }

  /**
   * Limpiar almacenamiento local
   */
  private clearStorage(): void {
    localStorage.removeItem('user');
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
    this.currentUserSubject.next(null);
  }

  /**
   * Login con backend
   */
  login(credentials: LoginRequest): Observable<{ success: boolean; user?: User; error?: string }> {
    return this.baseHttp.post<LoginResponse>('auth/login', credentials, false)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            // Guardar token y usuario
            localStorage.setItem(environment.tokenKey, response.data.token);
            localStorage.setItem(environment.refreshTokenKey, response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Actualizar BehaviorSubject
            this.currentUserSubject.next(response.data.user);
            
            return { success: true, user: response.data.user };
          } else {
            return { success: false, error: response.message || 'Error de autenticación' };
          }
        }),
        tap({
          error: (error) => {
            console.error('Login error:', error);
          }
        })
      );
  }

  /**
   * Login mock para desarrollo (mantiene compatibilidad)
   */
  async loginMock(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulación de usuarios para testing
    const mockUsers: User[] = [
      { id: '1', email: 'admin@ecocollet.com', role: 'admin', name: 'Administrador Sistema' },
      { id: '2', email: 'recolector@ecocollet.com', role: 'recolector', name: 'Juan Recolector' },
      { id: '3', email: 'usuario@ecocollet.com', role: 'usuario', name: 'María Usuario' }
    ];

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));

    const user = mockUsers.find(u => u.email === email);

    if (user && password === '123456') {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem(environment.tokenKey, 'mock-token-' + user.id);
      this.currentUserSubject.next(user);
      return { success: true, user };
    } else {
      return { success: false, error: 'Credenciales incorrectas' };
    }
  }

  /**
   * Registro de usuario
   */
  register(userData: RegisterRequest): Observable<{ success: boolean; user?: User; error?: string }> {
    return this.baseHttp.post<LoginResponse>('auth/register', userData, false)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return { success: true, user: response.data.user };
          } else {
            return { success: false, error: response.message || 'Error en el registro' };
          }
        })
      );
  }

  /**
   * Cerrar sesión
   */
  logout(): Observable<any> {
    return this.baseHttp.post('auth/logout', {})
      .pipe(
        tap({
          next: () => this.clearStorage(),
          error: () => this.clearStorage() // Limpiar incluso si falla la llamada
        })
      );
  }

  /**
   * Cerrar sesión local (sin llamada al backend)
   */
  logoutLocal(): void {
    this.clearStorage();
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(environment.tokenKey);
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Verificar rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Refrescar token
   */
  refreshToken(): Observable<{ success: boolean; token?: string }> {
    const refreshToken = localStorage.getItem(environment.refreshTokenKey);
    
    if (!refreshToken) {
      this.clearStorage();
      return new Observable(observer => {
        observer.next({ success: false });
        observer.complete();
      });
    }

    return this.baseHttp.post<{ token: string }>('auth/refresh', { refreshToken }, false)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            localStorage.setItem(environment.tokenKey, response.data.token);
            return { success: true, token: response.data.token };
          } else {
            this.clearStorage();
            return { success: false };
          }
        })
      );
  }

  /**
   * Verificar si el token es válido
   */
  verifyToken(): Observable<{ valid: boolean; user?: User }> {
    return this.baseHttp.get<User>('auth/verify')
      .pipe(
        map(response => {
          if (response.success && response.data) {
            // Actualizar datos del usuario
            localStorage.setItem('user', JSON.stringify(response.data));
            this.currentUserSubject.next(response.data);
            return { valid: true, user: response.data };
          } else {
            this.clearStorage();
            return { valid: false };
          }
        })
      );
  }
}



