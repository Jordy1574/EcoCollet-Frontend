// src/app/adapters/ui/pages/admin/dasboard/admin-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// IMPORTACIONES CORREGIDAS (4 NIVELES DE SALTO)
import { User } from '../../../../../core/models/user.model'; 
import { Usuario, Cita, PuntoReciclaje, Material, TrendPoint, TopUser, RolPermiso, ConfiguracionSistema } from '../../../../../core/models/admin.models'; 
import { AuthApiService } from '../../../../api/auth.api.service'; 
import { AdminApiService } from '../../../../api/admin.api.service'; 

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: [],
})
export class AdminDashboardComponent implements OnInit {
  user: User | null = null;
  
  // Sección activa y títulos
  currentSection: 'dashboard' | 'usuarios' | 'citas' | 'puntos' | 'materiales' | 'reportes' | 'configuracion' = 'dashboard';
  
  // PROPIEDADES DE DATOS
  usuarios: Usuario[] = [];
  citas: Cita[] = [];
  puntosReciclaje: PuntoReciclaje[] = [];
  materiales: Material[] = [];
  trendPoints: TrendPoint[] = []; 
  topUsers: TopUser[] = [];
  rolesPermisos: RolPermiso[] = [];
  configuracion: ConfiguracionSistema | null = null;

  constructor(
    private authService: AuthApiService, 
    private adminApi: AdminApiService,   
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
    
    // Protección de ruta: Solo administradores
    if (!this.user || this.user.rol !== 'ADMIN') {
      this.router.navigate(['/login']); 
    }
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // CARGAR DATOS DEL DASHBOARD
  loadDashboardData(): void {
    this.adminApi.getUsuarios().subscribe(data => this.usuarios = data);
    this.adminApi.getCitas().subscribe(data => this.citas = data);
    this.adminApi.getPuntosReciclaje().subscribe(data => this.puntosReciclaje = data);
    this.adminApi.getMateriales().subscribe(data => this.materiales = data);
    this.adminApi.getConfiguracion().subscribe(data => this.configuracion = data);
    this.adminApi.getTopUsers().subscribe(data => this.topUsers = data);
    this.adminApi.getRolesPermisos().subscribe(data => this.rolesPermisos = data);
    this.adminApi.getTrendPoints().subscribe(data => this.trendPoints = data);
  }

  // NAVEGACIÓN ENTRE SECCIONES
  setActiveSection(section: 'dashboard' | 'usuarios' | 'citas' | 'puntos' | 'materiales' | 'reportes' | 'configuracion'): void {
    this.currentSection = section;
  }

  // MÉTODOS AUXILIARES PARA UI
  getInitials(nombre: string): string {
    return nombre.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
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

  // MÉTODOS DE CÁLCULO
  getTotalMateriales(): string {
    const total = this.materiales.reduce((sum, material) => {
      const cantidad = parseInt(material.cantidad.replace(/[^\d]/g, ''));
      return sum + cantidad;
    }, 0);
    return total.toLocaleString();
  }

  getPuntosActivos(): number {
    return this.puntosReciclaje.filter(p => p.estado === 'Activo').length;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']); 
  }
}