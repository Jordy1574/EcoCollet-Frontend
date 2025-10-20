import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthApiService } from './adapters/api/auth.api.service';
import { RecolectorApiService } from './adapters/api/recolector.api.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-test-backend',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2>🧪 Test de Conexión con Spring Boot Backend</h2>
      
      <!-- Test de Login -->
      <div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; border-radius: 8px;">
        <h3>1. Test de Autenticación</h3>
        <div style="margin: 10px 0;">
          <input 
            [(ngModel)]="loginData.email" 
            placeholder="Email" 
            style="padding: 8px; margin: 5px; border: 1px solid #ddd; border-radius: 4px;">
          <input 
            [(ngModel)]="loginData.password" 
            type="password" 
            placeholder="Password" 
            style="padding: 8px; margin: 5px; border: 1px solid #ddd; border-radius: 4px;">
          <button 
            (click)="testLogin()" 
            [disabled]="loginLoading"
            style="padding: 8px 15px; margin: 5px; background: #3EB489; color: white; border: none; border-radius: 4px; cursor: pointer;">
            {{loginLoading ? 'Probando...' : 'Probar Login'}}
          </button>
        </div>
        <div *ngIf="loginResult" [style.color]="loginResult.success ? 'green' : 'red'">
          <strong>Resultado:</strong> {{loginResult.message}}
          <pre *ngIf="loginResult.data" style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; overflow-x: auto;">{{loginResult.data | json}}</pre>
        </div>
      </div>

      <!-- Test de APIs Protegidas -->
      <div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; border-radius: 8px;">
        <h3>2. Test de APIs Protegidas</h3>
        <div style="margin: 10px 0;">
          <button 
            (click)="testRecolectorStats()" 
            [disabled]="!isAuthenticated || statsLoading"
            style="padding: 8px 15px; margin: 5px; background: #1E5631; color: white; border: none; border-radius: 4px; cursor: pointer;">
            {{statsLoading ? 'Cargando...' : 'Probar Stats Recolector'}}
          </button>
          <button 
            (click)="testRecolecciones()" 
            [disabled]="!isAuthenticated || recoleccionesLoading"
            style="padding: 8px 15px; margin: 5px; background: #1E5631; color: white; border: none; border-radius: 4px; cursor: pointer;">
            {{recoleccionesLoading ? 'Cargando...' : 'Probar Recolecciones'}}
          </button>
        </div>
        <div *ngIf="!isAuthenticated" style="color: orange;">
          ⚠️ Necesitas hacer login primero para probar estas APIs
        </div>
        <div *ngIf="apiResult" [style.color]="apiResult.success ? 'green' : 'red'">
          <strong>Resultado API:</strong> {{apiResult.message}}
          <pre *ngIf="apiResult.data" style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; overflow-x: auto; max-height: 300px;">{{apiResult.data | json}}</pre>
        </div>
      </div>

      <!-- Test de Conexión Básica -->
      <div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; border-radius: 8px;">
        <h3>3. Test de Conexión Básica</h3>
        <div style="margin: 10px 0;">
          <button 
            (click)="testConnection()" 
            [disabled]="connectionLoading"
            style="padding: 8px 15px; margin: 5px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            {{connectionLoading ? 'Probando...' : 'Probar Conexión'}}
          </button>
        </div>
        <div *ngIf="connectionResult" [style.color]="connectionResult.success ? 'green' : 'red'">
          <strong>Conexión:</strong> {{connectionResult.message}}
        </div>
      </div>

      <!-- Configuración Actual -->
      <div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; border-radius: 8px; background: #f9f9f9;">
        <h3>📋 Configuración Actual</h3>
        <p><strong>API URL:</strong> {{apiUrl}}</p>
        <p><strong>Token guardado:</strong> {{hasToken ? '✅ Sí' : '❌ No'}}</p>
        <p><strong>Usuario autenticado:</strong> {{isAuthenticated ? '✅ Sí' : '❌ No'}}</p>
      </div>
    </div>
  `
})
export class TestBackendComponent implements OnInit {
  
  // Datos para login
  loginData = {
    email: 'test@example.com',
    password: 'password123'
  };

  // Estados de loading
  loginLoading = false;
  statsLoading = false;
  recoleccionesLoading = false;
  connectionLoading = false;

  // Resultados
  loginResult: any = null;
  apiResult: any = null;
  connectionResult: any = null;

  // Estado de autenticación
  isAuthenticated = false;
  hasToken = false;
  apiUrl = '';

  constructor(
    private authService: AuthApiService,
    private recolectorService: RecolectorApiService
  ) {}

  ngOnInit() {
    this.apiUrl = environment.apiUrl;
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    this.hasToken = !!localStorage.getItem('ecollet_token');
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  async testLogin() {
    this.loginLoading = true;
    this.loginResult = null;

    try {
      const result = await this.authService.login({ 
        email: this.loginData.email, 
        password: this.loginData.password 
      }).toPromise();
      
      this.loginResult = {
        success: true,
        message: 'Login exitoso',
        data: result
      };
      
      this.checkAuthStatus();
      
    } catch (error: any) {
      console.error('Error en login:', error);
      this.loginResult = {
        success: false,
        message: `Error de conexión: ${error.message || 'Error desconocido'}`,
        data: error
      };
    } finally {
      this.loginLoading = false;
    }
  }

  async testRecolectorStats() {
    this.statsLoading = true;
    this.apiResult = null;

    try {
      const result = await this.recolectorService.getStats().toPromise();
      
      this.apiResult = {
        success: true,
        message: 'Stats obtenidas correctamente',
        data: result
      };
      
    } catch (error: any) {
      console.error('Error en stats:', error);
      this.apiResult = {
        success: false,
        message: `Error: ${error.message || 'Error desconocido'}`,
        data: error
      };
    } finally {
      this.statsLoading = false;
    }
  }

  async testRecolecciones() {
    this.recoleccionesLoading = true;
    this.apiResult = null;

    try {
      const result = await this.recolectorService.getRecolecciones().toPromise();
      
      this.apiResult = {
        success: true,
        message: 'Recolecciones obtenidas correctamente',
        data: result
      };
      
    } catch (error: any) {
      console.error('Error en recolecciones:', error);
      this.apiResult = {
        success: false,
        message: `Error: ${error.message || 'Error desconocido'}`,
        data: error
      };
    } finally {
      this.recoleccionesLoading = false;
    }
  }

  async testConnection() {
    this.connectionLoading = true;
    this.connectionResult = null;

    try {
      // Hacemos una petición simple a un endpoint de salud o similar
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.connectionResult = {
          success: true,
          message: `Conexión exitosa (${response.status})`
        };
      } else {
        this.connectionResult = {
          success: false,
          message: `Error HTTP ${response.status}: ${response.statusText}`
        };
      }
      
    } catch (error: any) {
      console.error('Error de conexión:', error);
      this.connectionResult = {
        success: false,
        message: `Error de conexión: ${error.message || 'No se puede conectar al backend'}`
      };
    } finally {
      this.connectionLoading = false;
    }
  }
}