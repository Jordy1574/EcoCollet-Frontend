import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  distrito: string;
  estado: string;
  fechaRegistro: string;
}

export interface Cita {
  id: string;
  usuario: {
    nombre: string;
    direccion: string;
  };
  material: {
    tipo: string;
    cantidad: string;
  };
  fecha: {
    dia: string;
    hora: string;
  };
  estado: string;
  recolector?: string;
}

export interface PuntoReciclaje {
  id: string;
  nombre: string;
  tipo: string;
  tipoTexto: string;
  direccion: string;
  horario: string;
  materiales: string[];
  estado: string;
}

export interface Material {
  id: string;
  nombre: string;
  tipo: string;
  cantidad: string;
  periodo: string;
  info?: {
    precioPromedio: string;
    puntosActivos: string;
    ultimaActualizacion: string;
  };
}

export interface TrendPoint {
  x: number;
  y: number;
}

export interface TopUser {
  id: string;
  position: number;
  nombre: string;
  ubicacion: string;
  cantidad: string;
  citas: string;
}

export interface RolPermiso {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface ConfiguracionSistema {
  nombreSistema: string;
  emailContacto: string;
  zonaHoraria: string;
  backupAutomatico: boolean;
  ultimoBackup: string;
  colorPrincipal: string;
  tema: 'claro' | 'oscuro';
  notificaciones: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  seguridad: {
    dobleAutenticacion: boolean;
    sesionSegura: boolean;
  };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-lg">
        <div class="p-6">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-[#5EA362] rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">EC</span>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900">EcoCollet</h1>
              <p class="text-xs text-gray-500">Panel Admin</p>
            </div>
          </div>
        </div>
        
        <nav class="mt-6">
          <div class="px-6">
            <button 
              (click)="setActiveSection('dashboard')"
              [class]="currentSection === 'dashboard' ? 'bg-[#5EA362] text-white' : 'text-gray-600 hover:bg-gray-100'"
              class="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-2"
            >
              <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
              </svg>
              Dashboard
            </button>
            
            <button 
              (click)="setActiveSection('usuarios')"
              [class]="currentSection === 'usuarios' ? 'bg-[#5EA362] text-white' : 'text-gray-600 hover:bg-gray-100'"
              class="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-2"
            >
              <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
              </svg>
              Usuarios
            </button>
            
            <button 
              (click)="setActiveSection('citas')"
              [class]="currentSection === 'citas' ? 'bg-[#5EA362] text-white' : 'text-gray-600 hover:bg-gray-100'"
              class="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-2 relative"
            >
              <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
              </svg>
              Citas
              <span class="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">12</span>
            </button>
            
            <button 
              (click)="setActiveSection('puntos')"
              [class]="currentSection === 'puntos' ? 'bg-[#5EA362] text-white' : 'text-gray-600 hover:bg-gray-100'"
              class="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-2"
            >
              <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              Puntos de Reciclaje
            </button>
            
            <button 
              (click)="setActiveSection('materiales')"
              [class]="currentSection === 'materiales' ? 'bg-[#5EA362] text-white' : 'text-gray-600 hover:bg-gray-100'"
              class="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-2"
            >
              <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              Materiales
            </button>
            
            <button 
              (click)="setActiveSection('reportes')"
              [class]="currentSection === 'reportes' ? 'bg-[#5EA362] text-white' : 'text-gray-600 hover:bg-gray-100'"
              class="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-2"
            >
              <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
              </svg>
              Reportes
            </button>
            
            <button 
              (click)="setActiveSection('configuracion')"
              [class]="currentSection === 'configuracion' ? 'bg-[#5EA362] text-white' : 'text-gray-600 hover:bg-gray-100'"
              class="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-2"
            >
              <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path>
              </svg>
              Configuración
            </button>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-hidden">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              @if (currentSection === 'usuarios') {
                <h1 class="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h1>
              } @else if (currentSection === 'citas') {
                <h1 class="text-2xl font-semibold text-gray-900">Gestión de Citas</h1>
              } @else if (currentSection === 'puntos') {
                <h1 class="text-2xl font-semibold text-gray-900">Puntos de Reciclaje</h1>
              } @else if (currentSection === 'materiales') {
                <h1 class="text-2xl font-semibold text-gray-900">Gestión de Materiales</h1>
              } @else if (currentSection === 'reportes') {
                <h1 class="text-2xl font-semibold text-gray-900">Reportes y Estadísticas</h1>
              } @else if (currentSection === 'configuracion') {
                <h1 class="text-2xl font-semibold text-gray-900">Configuración del Sistema</h1>
              } @else {
                <h1 class="text-2xl font-semibold text-gray-900">Dashboard General</h1>
              }
            </div>
            <div class="flex items-center space-x-4">
              <!-- Search -->
              <div class="relative">
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  class="bg-gray-100 border-0 rounded-lg px-4 py-2 pl-10 text-sm focus:ring-2 focus:ring-[#5EA362] focus:bg-white"
                >
                <svg class="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              
              <!-- Notifications -->
              <button class="relative p-2 text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5l-5-5h5V6h10v11z"></path>
                </svg>
                <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">1</span>
              </button>
              
              <!-- User Menu -->
              <div class="flex items-center space-x-3">
                <span class="text-sm text-gray-600">{{ user?.name }}</span>
                <div class="w-8 h-8 bg-[#5EA362] rounded-full flex items-center justify-center">
                  <span class="text-white font-semibold text-sm">AD</span>
                </div>
                <button 
                  (click)="logout()"
                  class="text-sm text-gray-500 hover:text-gray-700"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Dashboard Content -->
        <div class="p-6 overflow-y-auto" style="height: calc(100vh - 80px);">
          
          <!-- Dashboard Section -->
          @if (currentSection === 'dashboard') {
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-[#5EA362] rounded-lg flex items-center justify-center mr-4">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-500">Usuarios Activos</h3>
                    <p class="text-2xl font-bold text-gray-900">15,420</p>
                    <p class="text-xs text-[#5EA362]">+12% vs mes anterior</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-[#FFD60A] rounded-lg flex items-center justify-center mr-4">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-500">Kilos Reciclados</h3>
                    <p class="text-2xl font-bold text-gray-900">2,847</p>
                    <p class="text-xs text-[#5EA362]">+8% vs mes anterior</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-500">Citas Pendientes</h3>
                    <p class="text-2xl font-bold text-gray-900">127</p>
                    <p class="text-xs text-[#5EA362]">+5 nuevas hoy</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-[#1E5631] rounded-lg flex items-center justify-center mr-4">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path>
                      <path fill-rule="evenodd" d="M3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-500">Centros Activos</h3>
                    <p class="text-2xl font-bold text-gray-900">156</p>
                    <p class="text-xs text-[#5EA362]">+3 nuevos</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <!-- Materials Chart -->
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <div class="flex justify-between items-center mb-6">
                  <h3 class="text-lg font-semibold text-gray-900">Materiales Reciclados por Mes</h3>
                  <button class="text-[#5EA362] text-sm hover:underline">Ver detalles</button>
                </div>
                <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div class="text-center">
                    <svg class="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    <p class="text-gray-500 text-sm">Gráfico de barras</p>
                    <p class="text-xs text-gray-400">Plástico, Papel, Vidrio</p>
                  </div>
                </div>
              </div>
              
              <!-- Users Growth Chart -->
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <div class="flex justify-between items-center mb-6">
                  <h3 class="text-lg font-semibold text-gray-900">Crecimiento de Usuarios</h3>
                  <button class="text-[#5EA362] text-sm hover:underline">Ver detalles</button>
                </div>
                <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div class="text-center">
                    <svg class="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                    <p class="text-gray-500 text-sm">Gráfico de líneas</p>
                    <p class="text-xs text-gray-400">Crecimiento mensual</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-6">Actividad Reciente</h3>
              <div class="space-y-4">
                <div class="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg">
                  <div class="w-2 h-2 bg-[#5EA362] rounded-full"></div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">Nueva cita programada por María González</p>
                    <p class="text-xs text-gray-500">Hace 5 minutos</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg">
                  <div class="w-2 h-2 bg-[#FFD60A] rounded-full"></div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">Centro de acopio EcoPoint Miraflores actualizado</p>
                    <p class="text-xs text-gray-500">Hace 15 minutos</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">Recolección completada: 25kg de plástico</p>
                    <p class="text-xs text-gray-500">Hace 30 minutos</p>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Configuration Section -->
          @if (currentSection === 'configuracion') {
            <!-- Configuracion Header -->
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-semibold text-gray-900">Configuración del Sistema</h2>
              <button 
                class="bg-[#5EA362] hover:bg-[#4d8c54] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Guardar Configuración</span>
              </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Configuracion General -->
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Configuración General</h3>
                
                <div class="space-y-4">
                  <!-- Nombre del Sistema -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Sistema</label>
                    <input 
                      type="text" 
                      [value]="configuracion.nombreSistema"
                      (input)="configuracion.nombreSistema = $any($event.target).value"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EA362] focus:border-transparent"
                    >
                  </div>

                  <!-- Email de Contacto -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email de Contacto</label>
                    <input 
                      type="email" 
                      [value]="configuracion.emailContacto"
                      (input)="configuracion.emailContacto = $any($event.target).value"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EA362] focus:border-transparent"
                    >
                  </div>

                  <!-- Zona Horaria -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
                    <select 
                      [(ngModel)]="configuracion.zonaHoraria"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EA362] focus:border-transparent"
                    >
                      <option value="America/Lima">America/Lima (UTC-5)</option>
                      <option value="America/Bogota">America/Bogota (UTC-5)</option>
                      <option value="America/Santiago">America/Santiago (UTC-3)</option>
                      <option value="America/Buenos_Aires">America/Buenos Aires (UTC-3)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Roles y Permisos -->
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Roles y Permisos</h3>
                
                <div class="space-y-4">
                  @for (rol of rolesPermisos; track rol.id) {
                    <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div class="font-medium text-gray-900">{{ rol.nombre }}</div>
                        <div class="text-sm text-gray-500">{{ rol.descripcion }}</div>
                      </div>
                      <button class="text-[#5EA362] hover:text-[#4d8c54] text-sm font-medium">
                        Editar
                      </button>
                    </div>
                  }
                </div>
              </div>

              <!-- Copia de Seguridad -->
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Copia de Seguridad</h3>
                
                <div class="space-y-4">
                  <!-- Backup Automatico -->
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div class="font-medium text-gray-900">Backup Automático</div>
                      <div class="text-sm text-gray-500">Cada 24 horas</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        [checked]="configuracion.backupAutomatico"
                        (change)="configuracion.backupAutomatico = $any($event.target).checked"
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5EA362]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5EA362]"></div>
                    </label>
                  </div>

                  <!-- Crear Backup Manual -->
                  <button class="w-full bg-[#5EA362] hover:bg-[#4d8c54] text-white px-4 py-3 rounded-lg font-medium transition-colors">
                    Crear Backup Ahora
                  </button>

                  <div class="text-sm text-gray-500">
                    Último backup: {{ configuracion.ultimoBackup }}
                  </div>
                </div>
              </div>

              <!-- Personalización -->
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Personalización</h3>
                
                <div class="space-y-6">
                  <!-- Logo del Sistema -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-3">Logo del Sistema</label>
                    <div class="flex items-center space-x-4">
                      <div class="w-16 h-16 bg-[#5EA362] rounded-lg flex items-center justify-center">
                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
                        </svg>
                      </div>
                      <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Cambiar Logo
                      </button>
                    </div>
                  </div>

                  <!-- Color Principal -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-3">Color Principal</label>
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-[#5EA362] rounded-lg border-2 border-gray-200"></div>
                      <input 
                        type="text" 
                        [value]="configuracion.colorPrincipal"
                        (input)="configuracion.colorPrincipal = $any($event.target).value"
                        class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EA362] focus:border-transparent"
                        placeholder="#5EA362"
                      >
                    </div>
                  </div>

                  <!-- Tema del Sistema -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-3">Tema del Sistema</label>
                    <div class="grid grid-cols-2 gap-3">
                      <button 
                        [class]="configuracion.tema === 'claro' ? 'bg-[#5EA362] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                        (click)="configuracion.tema = 'claro'"
                        class="p-3 rounded-lg text-sm font-medium transition-colors"
                      >
                        Claro
                      </button>
                      <button 
                        [class]="configuracion.tema === 'oscuro' ? 'bg-[#5EA362] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                        (click)="configuracion.tema = 'oscuro'"
                        class="p-3 rounded-lg text-sm font-medium transition-colors"
                      >
                        Oscuro
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Configuracion Avanzada -->
            <div class="mt-6 bg-white rounded-xl p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-6">Configuración Avanzada</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Notificaciones -->
                <div>
                  <h4 class="font-medium text-gray-900 mb-3">Notificaciones</h4>
                  <div class="space-y-3">
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        [checked]="configuracion.notificaciones.email"
                        (change)="configuracion.notificaciones.email = $any($event.target).checked"
                        class="rounded border-gray-300 text-[#5EA362] focus:ring-[#5EA362] focus:ring-offset-0"
                      >
                      <span class="ml-2 text-sm text-gray-600">Notificaciones por email</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        [checked]="configuracion.notificaciones.sms"
                        (change)="configuracion.notificaciones.sms = $any($event.target).checked"
                        class="rounded border-gray-300 text-[#5EA362] focus:ring-[#5EA362] focus:ring-offset-0"
                      >
                      <span class="ml-2 text-sm text-gray-600">Notificaciones SMS</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        [checked]="configuracion.notificaciones.push"
                        (change)="configuracion.notificaciones.push = $any($event.target).checked"
                        class="rounded border-gray-300 text-[#5EA362] focus:ring-[#5EA362] focus:ring-offset-0"
                      >
                      <span class="ml-2 text-sm text-gray-600">Notificaciones push</span>
                    </label>
                  </div>
                </div>

                <!-- Seguridad -->
                <div>
                  <h4 class="font-medium text-gray-900 mb-3">Seguridad</h4>
                  <div class="space-y-3">
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        [checked]="configuracion.seguridad.dobleAutenticacion"
                        (change)="configuracion.seguridad.dobleAutenticacion = $any($event.target).checked"
                        class="rounded border-gray-300 text-[#5EA362] focus:ring-[#5EA362] focus:ring-offset-0"
                      >
                      <span class="ml-2 text-sm text-gray-600">Doble autenticación</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        [checked]="configuracion.seguridad.sesionSegura"
                        (change)="configuracion.seguridad.sesionSegura = $any($event.target).checked"
                        class="rounded border-gray-300 text-[#5EA362] focus:ring-[#5EA362] focus:ring-offset-0"
                      >
                      <span class="ml-2 text-sm text-gray-600">Sesión segura</span>
                    </label>
                  </div>
                </div>

                <!-- Mantenimiento -->
                <div>
                  <h4 class="font-medium text-gray-900 mb-3">Mantenimiento</h4>
                  <div class="space-y-3">
                    <button class="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                      Limpiar caché del sistema
                    </button>
                    <button class="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                      Optimizar base de datos
                    </button>
                    <button class="w-full text-left text-sm text-red-600 hover:text-red-800">
                      Reiniciar sistema
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Reports and Statistics Section -->
          @if (currentSection === 'reportes') {
            <!-- Reportes Header -->
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-semibold text-gray-900">Reportes y Estadísticas</h2>
              <div class="flex space-x-3">
                <button 
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span>Exportar PDF</span>
                </button>
                <button 
                  class="bg-[#5EA362] hover:bg-[#4d8c54] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span>Exportar Excel</span>
                </button>
              </div>
            </div>

            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Materials Chart -->
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Materiales Más Reciclados</h3>
                <div class="flex items-center justify-center">
                  <!-- Donut Chart Simulation -->
                  <div class="relative w-64 h-64">
                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <!-- Background circle -->
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" stroke-width="8"></circle>
                      
                      <!-- Plástico (45%) -->
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#5EA362" stroke-width="8"
                              stroke-dasharray="113 251" stroke-dashoffset="0"
                              stroke-linecap="round"></circle>
                      
                      <!-- Papel (30%) -->
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#FFD60A" stroke-width="8"
                              stroke-dasharray="75 251" stroke-dashoffset="-113"
                              stroke-linecap="round"></circle>
                      
                      <!-- Vidrio (20%) -->
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#1E5631" stroke-width="8"
                              stroke-dasharray="50 251" stroke-dashoffset="-188"
                              stroke-linecap="round"></circle>
                      
                      <!-- Metal (5%) -->
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#6B7280" stroke-width="8"
                              stroke-dasharray="13 251" stroke-dashoffset="-238"
                              stroke-linecap="round"></circle>
                    </svg>
                    
                    <!-- Center text -->
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="text-center">
                        <div class="text-2xl font-bold text-gray-900">2,847</div>
                        <div class="text-sm text-gray-500">kg Total</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Legend -->
                <div class="grid grid-cols-2 gap-3 mt-6">
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-[#5EA362] rounded-full mr-2"></div>
                    <span class="text-sm text-gray-600">Plástico</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-[#FFD60A] rounded-full mr-2"></div>
                    <span class="text-sm text-gray-600">Papel</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-[#1E5631] rounded-full mr-2"></div>
                    <span class="text-sm text-gray-600">Vidrio</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-[#6B7280] rounded-full mr-2"></div>
                    <span class="text-sm text-gray-600">Metal</span>
                  </div>
                </div>
              </div>

              <!-- Trend Chart -->
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Tendencia Mensual</h3>
                <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center relative">
                  <!-- Simulated Line Chart -->
                  <svg class="w-full h-full absolute inset-0 p-4" viewBox="0 0 400 200">
                    <!-- Grid lines -->
                    <defs>
                      <pattern id="grid" width="40" height="25" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#f3f4f6" stroke-width="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)"/>
                    
                    <!-- Trend line -->
                    <polyline fill="none" stroke="#5EA362" stroke-width="3"
                              points="20,150 80,140 140,120 200,110 260,115 320,108 380,105"/>
                    
                    <!-- Data points -->
                    @for (point of trendPoints; track $index) {
                      <circle [attr.cx]="point.x" [attr.cy]="point.y" r="4" fill="#5EA362"/>
                    }
                    
                    <!-- Area under curve -->
                    <polyline fill="#5EA362" fill-opacity="0.1" stroke="none"
                              points="20,200 20,150 80,140 140,120 200,110 260,115 320,108 380,105 380,200"/>
                  </svg>
                  
                  <!-- Y-axis labels -->
                  <div class="absolute left-2 top-4 text-xs text-gray-500">3,000</div>
                  <div class="absolute left-2 top-12 text-xs text-gray-500">2,500</div>
                  <div class="absolute left-2 top-20 text-xs text-gray-500">2,000</div>
                  <div class="absolute left-2 top-28 text-xs text-gray-500">1,500</div>
                  <div class="absolute left-2 top-36 text-xs text-gray-500">1,000</div>
                  <div class="absolute left-2 top-44 text-xs text-gray-500">500</div>
                  <div class="absolute left-2 bottom-4 text-xs text-gray-500">0</div>
                  
                  <!-- X-axis labels -->
                  <div class="absolute bottom-2 left-6 text-xs text-gray-500">Ene</div>
                  <div class="absolute bottom-2 left-16 text-xs text-gray-500">Feb</div>
                  <div class="absolute bottom-2 left-28 text-xs text-gray-500">Mar</div>
                  <div class="absolute bottom-2 left-40 text-xs text-gray-500">Abr</div>
                  <div class="absolute bottom-2 left-52 text-xs text-gray-500">May</div>
                  <div class="absolute bottom-2 right-6 text-xs text-gray-500">Jun</div>
                </div>
              </div>
            </div>

            <!-- Top Users Section -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-6">Top Usuarios del Mes</h3>
              <div class="space-y-4">
                @for (topUser of topUsers; track topUser.id) {
                  <div class="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-[#5EA362] rounded-full flex items-center justify-center mr-4">
                        <span class="text-white font-semibold text-sm">{{ topUser.position }}</span>
                      </div>
                      <div>
                        <div class="font-medium text-gray-900">{{ topUser.nombre }}</div>
                        <div class="text-sm text-gray-500">{{ topUser.ubicacion }}</div>
                        <div class="text-xs text-gray-400">{{ topUser.citas }}</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-semibold text-[#5EA362]">{{ topUser.cantidad }}</div>
                      <div class="text-sm text-gray-500">reciclados</div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Materials Management Section -->
          @if (currentSection === 'materiales') {
            <!-- Materiales Header -->
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-semibold text-gray-900">Gestión de Materiales</h2>
              <button 
                class="bg-[#5EA362] hover:bg-[#4d8c54] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>Agregar Material</span>
              </button>
            </div>

            <!-- Materials Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              @for (material of materiales; track material.id) {
                <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div class="p-6">
                    <!-- Icon and Name -->
                    <div class="flex flex-col items-center text-center mb-6">
                      <div [class]="getMaterialIconClass(material.tipo)" class="w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        @if (material.tipo === 'plastico') {
                          <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v-.07zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                          </svg>
                        } @else if (material.tipo === 'papel') {
                          <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                          </svg>
                        } @else if (material.tipo === 'vidrio') {
                          <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5,7V4C5,3.45 5.45,3 6,3H9C9.55,3 10,3.45 10,4V7H14V4C14,3.45 14.45,3 15,3H18C18.55,3 19,3.45 19,4V7C20.1,7 21,7.9 21,9V19C21,20.1 20.1,21 19,21H5C3.9,21 3,20.1 3,19V9C3,7.9 3.9,7 5,7M5,9V19H19V9H5Z"/>
                          </svg>
                        } @else if (material.tipo === 'metal') {
                          <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
                          </svg>
                        }
                      </div>
                      <h3 class="text-lg font-semibold text-gray-900 capitalize">{{ material.nombre }}</h3>
                    </div>

                    <!-- Statistics -->
                    <div class="text-center mb-6">
                      <div class="text-3xl font-bold text-[#5EA362] mb-1">{{ material.cantidad }}</div>
                      <div class="text-sm text-gray-500">{{ material.periodo }}</div>
                    </div>

                    <!-- Additional Info -->
                    @if (material.info) {
                      <div class="bg-gray-50 rounded-lg p-3 mb-4">
                        <div class="text-xs text-gray-600">
                          <div class="flex justify-between mb-1">
                            <span>Precio promedio:</span>
                            <span class="font-medium">{{ material.info.precioPromedio }}</span>
                          </div>
                          <div class="flex justify-between mb-1">
                            <span>Puntos activos:</span>
                            <span class="font-medium">{{ material.info.puntosActivos }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span>Última actualización:</span>
                            <span class="font-medium">{{ material.info.ultimaActualizacion }}</span>
                          </div>
                        </div>
                      </div>
                    }

                    <!-- Action Button -->
                    <button class="w-full bg-[#5EA362] hover:bg-[#4d8c54] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Editar
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Additional Statistics -->
            <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Resumen General</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">{{ getTotalMateriales() }} kg</div>
                  <div class="text-sm text-gray-500">Total Recolectado</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">4</div>
                  <div class="text-sm text-gray-500">Tipos de Material</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">{{ getPromedioMensual() }} kg</div>
                  <div class="text-sm text-gray-500">Promedio Mensual</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">+{{ getCrecimiento() }}%</div>
                  <div class="text-sm text-gray-500">Crecimiento</div>
                </div>
              </div>
            </div>
          }

          <!-- Recycling Points Management Section -->
          @if (currentSection === 'puntos') {
            <!-- Puntos Header -->
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-semibold text-gray-900">Puntos de Reciclaje</h2>
              <button 
                class="bg-[#5EA362] hover:bg-[#4d8c54] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>Agregar Punto</span>
              </button>
            </div>

            <!-- Puntos Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              @for (punto of puntosReciclaje; track punto.id) {
                <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <!-- Header Card -->
                  <div class="p-6">
                    <div class="flex items-start justify-between mb-4">
                      <div class="flex items-center">
                        <div [class]="getPointTypeIconClass(punto.tipo)" class="w-12 h-12 rounded-lg flex items-center justify-center mr-3">
                          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                          </svg>
                        </div>
                        <div>
                          <h3 class="text-lg font-semibold text-gray-900">{{ punto.nombre }}</h3>
                          <p class="text-sm text-gray-500">{{ punto.tipoTexto }}</p>
                        </div>
                      </div>
                      <span [class]="getPointStatusClass(punto.estado)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ punto.estado }}
                      </span>
                    </div>

                    <!-- Dirección -->
                    <div class="flex items-start mb-3">
                      <svg class="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span class="text-sm text-gray-600">{{ punto.direccion }}</span>
                    </div>

                    <!-- Horarios -->
                    <div class="flex items-center mb-4">
                      <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span class="text-sm text-gray-600">{{ punto.horario }}</span>
                    </div>

                    <!-- Materiales -->
                    <div class="mb-4">
                      <p class="text-sm font-medium text-gray-700 mb-2">Materiales aceptados:</p>
                      <div class="flex flex-wrap gap-1">
                        @for (material of punto.materiales; track material) {
                          <span class="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            {{ material }}
                          </span>
                        }
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex space-x-2 pt-4 border-t border-gray-100">
                      <button class="flex-1 bg-[#5EA362] hover:bg-[#4d8c54] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Editar
                      </button>
                      <button class="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                        Ver en Mapa
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Appointments Management Section -->
          @if (currentSection === 'citas') {
            <!-- Citas Header -->
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-semibold text-gray-900">Gestión de Citas</h2>
              <div class="flex space-x-3">
                <button 
                  class="bg-[#FFD60A] hover:bg-[#e6c109] text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span>Asignar Recolector</span>
                </button>
                <button 
                  class="bg-[#5EA362] hover:bg-[#4d8c54] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <span>Nueva Cita</span>
                </button>
              </div>
            </div>

            <!-- Citas Table -->
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b">
                    <tr>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recolector</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    @for (cita of citas; track cita.id) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {{ cita.id }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div class="text-sm font-medium text-gray-900">{{ cita.usuario.nombre }}</div>
                            <div class="text-sm text-gray-500">{{ cita.usuario.direccion }}</div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div class="text-sm font-medium text-gray-900">{{ cita.material.tipo }}</div>
                            <div class="text-sm text-gray-500">{{ cita.material.cantidad }}</div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div class="text-sm font-medium text-gray-900">{{ cita.fecha.dia }}</div>
                            <div class="text-sm text-gray-500">{{ cita.fecha.hora }}</div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span 
                            [class]="getAppointmentStatusClass(cita.estado)"
                            class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          >
                            {{ cita.estado }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          @if (cita.recolector) {
                            <div class="text-sm font-medium text-gray-900">{{ cita.recolector }}</div>
                          } @else {
                            <span class="text-sm text-gray-500">Sin asignar</span>
                          }
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          @if (cita.estado === 'Pendiente') {
                            <button class="text-[#5EA362] hover:text-[#4d8c54] mr-3">Asignar</button>
                          }
                          @if (cita.estado === 'En proceso') {
                            <button class="text-[#5EA362] hover:text-[#4d8c54] mr-3">Completar</button>
                          }
                          <button class="text-blue-600 hover:text-blue-800 mr-3">Ver</button>
                          @if (cita.estado === 'Completada') {
                            <span class="text-gray-400">Completada</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Users Management Section -->
          @if (currentSection === 'usuarios') {
            <!-- Users Header -->
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h2>
              <button 
                class="bg-[#5EA362] hover:bg-[#4d8c54] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>Agregar Usuario</span>
              </button>
            </div>

            <!-- Filters -->
            <div class="bg-white rounded-xl p-6 shadow-sm mb-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                  <select class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EA362] focus:border-transparent">
                    <option>Todos los roles</option>
                    <option>Usuario</option>
                    <option>Empresa</option>
                    <option>Recolector</option>
                    <option>Admin</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Distrito</label>
                  <select class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EA362] focus:border-transparent">
                    <option>Todos los distritos</option>
                    <option>Miraflores</option>
                    <option>San Isidro</option>
                    <option>Surco</option>
                    <option>La Molina</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EA362] focus:border-transparent">
                    <option>Todos los estados</option>
                    <option>Activo</option>
                    <option>Suspendido</option>
                    <option>Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Users Table -->
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b">
                    <tr>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distrito</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                      <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    @for (usuario of usuarios; track usuario.id) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <span class="text-sm font-medium text-gray-600">{{ getInitials(usuario.nombre) }}</span>
                            </div>
                            <div>
                              <div class="text-sm font-medium text-gray-900">{{ usuario.nombre }}</div>
                              <div class="text-sm text-gray-500">{{ usuario.email }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span 
                            [class]="getRoleBadgeClass(usuario.rol)"
                            class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          >
                            {{ usuario.rol }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ usuario.distrito }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span 
                            [class]="getStatusBadgeClass(usuario.estado)"
                            class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          >
                            {{ usuario.estado }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ usuario.fechaRegistro }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button class="text-[#5EA362] hover:text-[#4d8c54] mr-3">Editar</button>
                          <button class="text-red-600 hover:text-red-800">Eliminar</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
                <div class="text-sm text-gray-700">
                  Mostrando 1 a 10 de {{ usuarios.length }} resultados
                </div>
                <div class="flex items-center space-x-2">
                  <button class="px-3 py-1 text-sm border rounded hover:bg-gray-100">1</button>
                  <button class="px-3 py-1 text-sm border rounded hover:bg-gray-100">2</button>
                  <button class="px-3 py-1 text-sm border rounded hover:bg-gray-100">3</button>
                  <button class="px-3 py-1 text-sm border rounded hover:bg-gray-100">→</button>
                </div>
              </div>
            </div>
          }

          <!-- Other Sections Placeholder -->
          @if (currentSection !== 'dashboard' && currentSection !== 'usuarios' && currentSection !== 'citas' && currentSection !== 'puntos' && currentSection !== 'materiales' && currentSection !== 'reportes' && currentSection !== 'configuracion') {
            <div class="bg-white rounded-xl p-8 shadow-sm text-center">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              <h3 class="text-xl font-medium text-gray-900 mb-2">Sección {{ currentSection | titlecase }}</h3>
              <p class="text-gray-600">Esta sección estará disponible próximamente</p>
            </div>
          }

        </div>
      </main>
    </div>
  `
})
export class AdminDashboardComponent {
  user: User | null = null;
  currentSection: string = 'dashboard';
  usuarios: Usuario[] = [
    {
      id: '1',
      nombre: 'María González',
      email: 'maria.gonzalez@email.com',
      rol: 'Usuario',
      distrito: 'Miraflores',
      estado: 'Activo',
      fechaRegistro: '15/03/2024'
    },
    {
      id: '2',
      nombre: 'Juan Pérez',
      email: 'juan.perez@empresa.com',
      rol: 'Empresa',
      distrito: 'San Isidro',
      estado: 'Activo',
      fechaRegistro: '12/03/2024'
    },
    {
      id: '3',
      nombre: 'Ana Rodríguez',
      email: 'ana.rodriguez@email.com',
      rol: 'Recolector',
      distrito: 'Surco',
      estado: 'Suspendido',
      fechaRegistro: '10/03/2024'
    },
    {
      id: '4',
      nombre: 'Carlos López',
      email: 'carlos.lopez@email.com',
      rol: 'Usuario',
      distrito: 'La Molina',
      estado: 'Activo',
      fechaRegistro: '08/03/2024'
    },
    {
      id: '5',
      nombre: 'EcoTech Solutions',
      email: 'info@ecotech.com',
      rol: 'Empresa',
      distrito: 'Miraflores',
      estado: 'Activo',
      fechaRegistro: '05/03/2024'
    }
  ];

  citas: Cita[] = [
    {
      id: '#001',
      usuario: {
        nombre: 'María González',
        direccion: 'Av. Larco 123, Miraflores'
      },
      material: {
        tipo: 'Plástico',
        cantidad: '15 kg aprox.'
      },
      fecha: {
        dia: '20/03/2024',
        hora: '10:00 AM'
      },
      estado: 'Pendiente',
      recolector: undefined
    },
    {
      id: '#002',
      usuario: {
        nombre: 'Juan Pérez',
        direccion: 'Av. Pardo 456, San Isidro'
      },
      material: {
        tipo: 'Papel',
        cantidad: '8 kg aprox.'
      },
      fecha: {
        dia: '19/03/2024',
        hora: '2:00 PM'
      },
      estado: 'En proceso',
      recolector: 'Carlos Ruiz'
    },
    {
      id: '#003',
      usuario: {
        nombre: 'Ana Rodríguez',
        direccion: 'Av. Benavides 789, Surco'
      },
      material: {
        tipo: 'Vidrio',
        cantidad: '12 kg aprox.'
      },
      fecha: {
        dia: '18/03/2024',
        hora: '4:00 PM'
      },
      estado: 'Completada',
      recolector: 'Luis Torres'
    }
  ];

  puntosReciclaje: PuntoReciclaje[] = [
    {
      id: '1',
      nombre: 'EcoPoint Miraflores',
      tipo: 'principal',
      tipoTexto: 'Centro Principal',
      direccion: 'Av. Larco 345, Miraflores',
      horario: 'Lun-Sáb 8:00 AM - 6:00 PM',
      materiales: ['Plástico', 'Papel', 'Vidrio'],
      estado: 'Activo'
    },
    {
      id: '2',
      nombre: 'ReciclaMax San Isidro',
      tipo: 'empresarial',
      tipoTexto: 'Centro Empresarial',
      direccion: 'Av. Javier Prado 1234, San Isidro',
      horario: 'Lun-Vie 9:00 AM - 5:00 PM',
      materiales: ['Plástico', 'Papel', 'Electrónicos'],
      estado: 'Activo'
    },
    {
      id: '3',
      nombre: 'Verde Surco',
      tipo: 'comunitario',
      tipoTexto: 'Centro Comunitario',
      direccion: 'Av. Benavides 567, Surco',
      horario: 'Mar-Dom 8:00 AM - 7:00 PM',
      materiales: ['Papel', 'Cartón', 'Vidrio'],
      estado: 'Mantenimiento'
    }
  ];

  materiales: Material[] = [
    {
      id: '1',
      nombre: 'Plástico',
      tipo: 'plastico',
      cantidad: '1,245 kg',
      periodo: 'Este mes',
      info: {
        precioPromedio: 'S/. 2.50/kg',
        puntosActivos: '12',
        ultimaActualizacion: 'Hoy'
      }
    },
    {
      id: '2',
      nombre: 'Papel',
      tipo: 'papel',
      cantidad: '892 kg',
      periodo: 'Este mes',
      info: {
        precioPromedio: 'S/. 1.80/kg',
        puntosActivos: '15',
        ultimaActualizacion: 'Ayer'
      }
    },
    {
      id: '3',
      nombre: 'Vidrio',
      tipo: 'vidrio',
      cantidad: '567 kg',
      periodo: 'Este mes',
      info: {
        precioPromedio: 'S/. 1.20/kg',
        puntosActivos: '8',
        ultimaActualizacion: 'Hace 2 días'
      }
    },
    {
      id: '4',
      nombre: 'Metal',
      tipo: 'metal',
      cantidad: '143 kg',
      periodo: 'Este mes',
      info: {
        precioPromedio: 'S/. 4.00/kg',
        puntosActivos: '5',
        ultimaActualizacion: 'Hoy'
      }
    }
  ];

  trendPoints: TrendPoint[] = [
    { x: 20, y: 150 },
    { x: 80, y: 140 },
    { x: 140, y: 120 },
    { x: 200, y: 110 },
    { x: 260, y: 115 },
    { x: 320, y: 108 },
    { x: 380, y: 105 }
  ];

  topUsers: TopUser[] = [
    {
      id: '1',
      position: 1,
      nombre: 'María González',
      ubicacion: 'Miraflores',
      cantidad: '125 kg',
      citas: '15 citas'
    },
    {
      id: '2',
      position: 2,
      nombre: 'Juan Pérez',
      ubicacion: 'San Isidro',
      cantidad: '98 kg',
      citas: '12 citas'
    },
    {
      id: '3',
      position: 3,
      nombre: 'Ana Rodríguez',
      ubicacion: 'Surco',
      cantidad: '87 kg',
      citas: '10 citas'
    },
    {
      id: '4',
      position: 4,
      nombre: 'Carlos López',
      ubicacion: 'La Molina',
      cantidad: '75 kg',
      citas: '8 citas'
    },
    {
      id: '5',
      position: 5,
      nombre: 'EcoTech Solutions',
      ubicacion: 'Miraflores',
      cantidad: '65 kg',
      citas: '6 citas'
    }
  ];

  rolesPermisos: RolPermiso[] = [
    {
      id: '1',
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema'
    },
    {
      id: '2',
      nombre: 'Recolector',
      descripcion: 'Gestión de citas y recolecciones'
    },
    {
      id: '3',
      nombre: 'Usuario',
      descripcion: 'Acceso básico a la plataforma'
    }
  ];

  configuracion: ConfiguracionSistema = {
    nombreSistema: 'EcoCollet',
    emailContacto: 'admin@ecocollet.pe',
    zonaHoraria: 'America/Lima',
    backupAutomatico: true,
    ultimoBackup: '18/03/2024 - 02:00 AM',
    colorPrincipal: '#5EA362',
    tema: 'claro',
    notificaciones: {
      email: true,
      sms: false,
      push: true
    },
    seguridad: {
      dobleAutenticacion: false,
      sesionSegura: true
    }
  };

  constructor(private authService: AuthService, private router: Router) {
    this.user = this.authService.getCurrentUser();
  }

  setActiveSection(section: string): void {
    this.currentSection = section;
    console.log('Navegando a sección:', section);
  }

  getInitials(nombre: string): string {
    return nombre
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getRoleBadgeClass(rol: string): string {
    const classes = {
      'Usuario': 'bg-blue-100 text-blue-800',
      'Empresa': 'bg-purple-100 text-purple-800',
      'Recolector': 'bg-green-100 text-green-800',
      'Admin': 'bg-red-100 text-red-800'
    };
    return classes[rol as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  getStatusBadgeClass(estado: string): string {
    const classes = {
      'Activo': 'bg-green-100 text-green-800',
      'Suspendido': 'bg-yellow-100 text-yellow-800',
      'Inactivo': 'bg-red-100 text-red-800'
    };
    return classes[estado as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  getAppointmentStatusClass(estado: string): string {
    const classes = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'En proceso': 'bg-blue-100 text-blue-800',
      'Completada': 'bg-green-100 text-green-800',
      'Cancelada': 'bg-red-100 text-red-800'
    };
    return classes[estado as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  getPointTypeIconClass(tipo: string): string {
    const classes = {
      'principal': 'bg-[#5EA362]',
      'empresarial': 'bg-[#FFD60A]',
      'comunitario': 'bg-[#1E5631]'
    };
    return classes[tipo as keyof typeof classes] || 'bg-gray-500';
  }

  getPointStatusClass(estado: string): string {
    const classes = {
      'Activo': 'bg-green-100 text-green-800',
      'Mantenimiento': 'bg-yellow-100 text-yellow-800',
      'Inactivo': 'bg-red-100 text-red-800'
    };
    return classes[estado as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  getMaterialIconClass(tipo: string): string {
    const classes = {
      'plastico': 'bg-blue-500',
      'papel': 'bg-yellow-500',
      'vidrio': 'bg-green-500',
      'metal': 'bg-gray-600'
    };
    return classes[tipo as keyof typeof classes] || 'bg-gray-400';
  }

  getTotalMateriales(): string {
    const total = this.materiales.reduce((sum, material) => {
      const cantidad = parseInt(material.cantidad.replace(/[^\d]/g, ''));
      return sum + cantidad;
    }, 0);
    return total.toLocaleString();
  }

  getPromedioMensual(): number {
    const total = this.materiales.reduce((sum, material) => {
      const cantidad = parseInt(material.cantidad.replace(/[^\d]/g, ''));
      return sum + cantidad;
    }, 0);
    return Math.round(total / this.materiales.length);
  }

  getCrecimiento(): number {
    return 15; // Simulado - en un caso real vendría de la API
  }

  logout(): void {
    this.authService.logout();
  }
}