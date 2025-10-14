import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'recolector' | 'usuario';
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  
  constructor(private router: Router) {}

  // Simular login (aquí conectarías con tu backend)
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
    
    if (user && password === '123456') { // Contraseña simple para demo
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user };
    } else {
      return { success: false, error: 'Credenciales incorrectas' };
    }
  }

  // Redirigir según el rol
  redirectBasedOnRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'recolector':
        this.router.navigate(['/recolector/dashboard']);
        break;
      case 'usuario':
        this.router.navigate(['/usuario/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
        break;
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
    this.router.navigate(['/']);
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
}
