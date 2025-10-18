import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// 1. CORRECCIÓN DE IMPORTACIONES (4 NIVELES DE SALTO)
// Importar la interfaz User desde el Núcleo (Core)
import { User } from '../../../../core/models/user.model'; 
// Importar la clase renombrada (AuthApiService)
import { AuthApiService } from '../../../../adapters/api/auth.api.service'; 


// Define la interfaz de datos específica del usuario (Mover esto al core/models/user.models.ts en una aplicación real)
export interface UsuarioDashboardData {
  puntosAcumulados: number;
  kilosReciclados: number;
  impactoCO2: number;
  proximaRecoleccion: string | null;
}

@Component({
  selector: 'app-usuario-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Bienvenido, {{ user?.name }}</h2>
      
      @if (dashboardData) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-xl shadow-md">
            <h3 class="text-lg font-semibold text-gray-700">Puntos Acumulados</h3>
            <p class="text-4xl font-extrabold text-eco-green">{{ dashboardData.puntosAcumulados }}</p>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-md">
            <h3 class="text-lg font-semibold text-gray-700">Kilos Reciclados</h3>
            <p class="text-4xl font-extrabold text-blue-600">{{ dashboardData.kilosReciclados }} kg</p>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-md">
            <h3 class="text-lg font-semibold text-gray-700">Próxima Recolección</h3>
            <p class="text-xl font-medium text-gray-900">{{ dashboardData.proximaRecoleccion || 'No programada' }}</p>
          </div>
        </div>
      }
      
      <button (click)="logout()" class="mt-8 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Cerrar Sesión</button>
    </div>
  `
})
export class UsuarioDashboardComponent implements OnInit {
  user: User | null = null;
  dashboardData: UsuarioDashboardData | null = null;

  constructor(
    // CORRECCIÓN: Inyectamos el servicio con el nombre correcto: AuthApiService
    private authService: AuthApiService,
    private router: Router 
  ) {
    this.user = this.authService.getCurrentUser();
    // Inicialización de la data de prueba (Debería venir de un UsuarioApiService)
    this.dashboardData = {
        puntosAcumulados: 1250,
        kilosReciclados: 45,
        impactoCO2: 120,
        proximaRecoleccion: '25/11/2025 - 14:00'
    };
  }

  ngOnInit(): void {
    if (!this.user) {
        this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}