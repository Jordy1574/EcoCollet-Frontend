import { Injectable } from '@angular/core';
import { User } from '../../core/models/user.model'; // <-- IMPORTADO DESDE EL NÚCLEO
import { delay } from 'rxjs/operators';
import { of } from 'rxjs'; // Necesario para simular la promesa con delay

@Injectable({
  providedIn: 'root'
})
// RENOMBRADO: Clase final para el Adaptador de Autenticación
export class AuthApiService {
  private currentUser: User | null = null;

  // CONSTRUCTOR LIMPIO: Ya no inyecta Router (¡Principio Hexagonal!)
  constructor() { }

  // Simular login (listo para cambiar a llamada HTTP en el futuro)
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
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
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user };
    } else {
      return { success: false, error: 'Credenciales incorrectas' };
    }
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    return this.currentUser;
  }

  // Cerrar sesión
  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
    // NOTA: La redirección a /login la hace el Componente.
  }
  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Verificar rol específico
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
  
  // Devuelve la ruta a la que se debe redirigir el usuario según su rol
  // Recibe el rol como string y retorna la URL correspondiente como string
  redirectBasedOnRole(role: string): string {
    switch (role) { 
      case 'admin':
        return '/admin-dashboard';
      case 'recolector':
        return '/recolector-dashboard';
      case 'usuario':
        return '/user-dashboard';
      default:
        return '/';
    }
  }
}



