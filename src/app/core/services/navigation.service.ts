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

  async navigateToDashboard(rol: string | undefined = undefined): Promise<boolean> {
    console.log('NavigationService: Iniciando navegación al dashboard...');
    
    // Si no se proporciona rol, intentar obtenerlo del usuario actual
    if (!rol) {
      const currentUser = this.authService.getCurrentUser();
      rol = currentUser?.rol;
    }

    console.log('NavigationService: Rol detectado:', rol);

    // Determinar la ruta del dashboard
    const dashboard = this.getDashboardRoute(rol);
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

  private getDashboardRoute(rol: string | undefined): string {
    switch (rol) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'RECOLECTOR':
        return '/recolector/dashboard';
      case 'CLIENTE':
        return '/usuario/dashboard';
      default:
        console.warn('NavigationService: Rol no reconocido, usando dashboard de usuario por defecto');
        return '/usuario/dashboard';
    }
  }
}