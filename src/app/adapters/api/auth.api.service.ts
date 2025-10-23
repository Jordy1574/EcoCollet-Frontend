import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
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
  nombre: string;     // Backend espera 'nombre' no 'name'
  email: string;
  password: string;
  rol: 'RECOLECTOR' | 'CLIENTE';
  telefono?: string;  // Backend espera 'telefono' no 'phone'
  direccion?: string; // Backend espera 'direccion' no 'address'
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
    return this.baseHttp.post<any>('auth/login', credentials, false)
      .pipe(
        // handle multiple backend shapes: wrapper {success,data}, or { token }
        switchMap(response => {
          console.log('AuthApiService.login: response from backend:', response);
          // Case: wrapped response
          if (response && typeof response === 'object' && 'success' in response) {
            console.log('AuthApiService.login: detected wrapped response with success field');
            if (response.success && response.data) {
              const data = response.data as any;
              if (data.token) {
                localStorage.setItem(environment.tokenKey, data.token);
              }
              if (data.refreshToken) {
                localStorage.setItem(environment.refreshTokenKey, data.refreshToken);
              }
              if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                this.currentUserSubject.next(data.user as User);
                return of({ success: true, user: data.user as User });
              }
            }
            return of({ success: false, error: response.message || 'Error de autenticación' });
          }

          // Case: backend returns only { token: '...' }
          if (response && typeof response === 'object' && 'token' in response) {
            console.log('AuthApiService.login: detected token-only response');
            const respAny: any = response as any;
            const token = respAny.token as string;
            if (token) {
              localStorage.setItem(environment.tokenKey, token);
              if (respAny.refreshToken) {
                localStorage.setItem(environment.refreshTokenKey, respAny.refreshToken);
              }

              // Now retrieve user info from backend (verify endpoint) using stored token
              return this.baseHttp.get<any>('auth/verify').pipe(
                map(verifyResp => {
                  // verifyResp may be wrapped or raw user
                  if (verifyResp && typeof verifyResp === 'object' && 'success' in verifyResp) {
                    if (verifyResp.success && verifyResp.data) {
                      const user = verifyResp.data as User;
                      localStorage.setItem('user', JSON.stringify(user));
                      this.currentUserSubject.next(user);
                      return { success: true, user };
                    }
                    return { success: false, error: verifyResp.message || 'No se pudo verificar usuario' };
                  }

                  // raw user object
                  const maybeUser = verifyResp as User;
                  if (maybeUser && maybeUser.email) {
                    localStorage.setItem('user', JSON.stringify(maybeUser));
                    this.currentUserSubject.next(maybeUser);
                    return { success: true, user: maybeUser };
                  }

                  return { success: false, error: 'No se pudo obtener el usuario' };
                }),
                catchError(err => {
                  console.error('Error verifying token after login:', err);
                  return of({ success: false, error: err?.message || 'Error de verificación' });
                })
              );
            }
          }

          // Other shapes: maybe direct user
          if (response && typeof response === 'object' && 'email' in response) {
            console.log('AuthApiService.login: detected direct user object response');
            const user = response as User;
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);
            return of({ success: true, user });
          }

          return of({ success: false, error: 'Error de autenticación' });
        }),
        catchError(err => {
          console.error('Login error:', err);
          return of({ success: false, error: err?.message || 'Network error' });
        })
      );
  }

  /**
   * Login mock para desarrollo (mantiene compatibilidad)
   */
  async loginMock(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulación de usuarios para testing
    const mockUsers: User[] = [
      { id: '1', email: 'admin@ecocollet.com', rol: 'ADMIN', name: 'Administrador Sistema' },
      { id: '2', email: 'recolector@ecocollet.com', rol: 'RECOLECTOR', name: 'Juan Recolector' },
      { id: '3', email: 'usuario@ecocollet.com', rol: 'CLIENTE', name: 'María Usuario' }
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
    return this.baseHttp.post<any>('auth/register', userData, false)
      .pipe(
        switchMap(response => {
          // If backend returns wrapper { success, data }
          if (response && typeof response === 'object' && 'success' in response) {
            if (response.success && response.data) {
              const data = response.data as any;
              if (data.token) {
                localStorage.setItem(environment.tokenKey, data.token);
              }
              if (data.refreshToken) {
                localStorage.setItem(environment.refreshTokenKey, data.refreshToken);
              }
              if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                this.currentUserSubject.next(data.user as User);
                return of({ success: true, user: data.user as User });
              }
            }
            return of({ success: false, error: response.message || 'Error en el registro' });
          }

          // If backend returns the created user object (no token), attempt to login automatically
          if (response && typeof response === 'object' && 'email' in response) {
            const createdUser = response as User;

            // Try to login using the credentials the user provided at registration
            // NOTE: we have access to the plain password because it was passed into this function
            const credentials: LoginRequest = { email: userData.email, password: userData.password };

            return this.login(credentials).pipe(
              map(loginResult => {
                if (loginResult.success && loginResult.user) {
                  return { success: true, user: loginResult.user };
                }
                // If login failed, still return created user but mark as partial success
                // store created user locally so the app can show a friendly message
                localStorage.setItem('user', JSON.stringify(createdUser));
                this.currentUserSubject.next(createdUser);
                return { success: true, user: createdUser };
              })
            );
          }

          return of({ success: false, error: 'Error en el registro' });
        }),
        catchError(err => {
          console.error('Register error:', err);
          return of({ success: false, error: err?.message || 'Network error' });
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
  hasRole(rol: string): boolean {
    const user = this.getCurrentUser();
    return user?.rol === rol;
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



