import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '../../adapters/api/auth.api.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(
    private router: Router,
    private authService: AuthApiService
  ) {}

  async navigateToDashboard(role: string | undefined = undefined): Promise<boolean> {
    console.log('NavigationService: Iniciando navegación al dashboard...');
    
    // Si no se proporciona rol, intentar obtenerlo del usuario actual
    if (!role) {
      const currentUser = this.authService.getCurrentUser();
      role = currentUser?.role;
    }

    console.log('NavigationService: Rol detectado:', role);

    // Determinar la ruta del dashboard
    const dashboard = this.getDashboardRoute(role);
    console.log('NavigationService: Ruta del dashboard:', dashboard);

    try {
      // Intentar navegar
      const result = await this.router.navigate([dashboard]);
      console.log('NavigationService: Resultado de navegación:', result);
      return result;
    } catch (error) {
      console.error('NavigationService: Error en navegación:', error);
      // En caso de error, intentar la ruta de usuario como fallback
      if (dashboard !== '/usuario/dashboard') {
        console.log('NavigationService: Intentando ruta de fallback...');
        return await this.router.navigate(['/usuario/dashboard']);
      }
      return false;
    }
  }

  private getDashboardRoute(role: string | undefined): string {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'recolector':
        return '/recolector/dashboard';
      case 'usuario':
        return '/usuario/dashboard';
      default:
        console.warn('NavigationService: Rol no reconocido, usando dashboard de usuario por defecto');
        return '/usuario/dashboard';
    }
  }
}