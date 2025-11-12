// src/app/adapters/ui/pages/admin/dasboard/admin-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// IMPORTACIONES CORREGIDAS (4 NIVELES DE SALTO)
import { User } from '../../../../../core/models/user.model'; 
import { Usuario, Cita, PuntoReciclaje, Material, TrendPoint, TopUser, RolPermiso, ConfiguracionSistema } from '../../../../../core/models/admin.models'; 
import { AuthApiService } from '../../../../api/auth.api.service'; 
import { AdminApiService } from '../../../../api/admin.api.service'; 
import { UsuariosCrudComponent } from '../usuarios/usuarios-crud.component';
import { PuntosReciclajeCrudComponent } from '../puntos/puntos-reciclaje-crud.component';
import { MaterialesCrudComponent } from '../materiales/materiales-crud.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, UsuariosCrudComponent, PuntosReciclajeCrudComponent, MaterialesCrudComponent],
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
  
  // UI estado para modales de Citas (editar/crear)
  showEditCitaModal = false;
  showNewCitaModal = false;
  editCitaForm: { id: string; estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA'; recolectorId: string | null } = {
    id: '', estado: 'PENDIENTE', recolectorId: null
  };
  newCitaForm: {
    usuarioId: string | null;
    fecha: string;
    hora: string;
    notas: string;
    recolectorId: string | null;
    items: { materialId: string | null; kg: number | null }[];
  } = {
    usuarioId: null,
    fecha: '',
    hora: '',
    notas: '',
    recolectorId: null,
    items: [{ materialId: null, kg: null }]
  };
  
  // Listas derivadas
  recolectores: Usuario[] = [];
  clientes: Usuario[] = [];
  
  // Estadísticas del dashboard
  dashboardStats: any = {
    totalUsuarios: 0,
    citasActivas: 0,
    puntosActivos: 0,
    kgRecolectadosEsteMes: 0
  };

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
    this.adminApi.getUsuarios().subscribe(data => {
      this.usuarios = data;
      this.recolectores = this.usuarios.filter(u => (u.rol || '').toLowerCase() === 'recolector');
      this.clientes = this.usuarios.filter(u => {
        const r = (u.rol || '').toLowerCase();
        return r === 'usuario' || r === 'empresa' || r === 'cliente';
      });
    });
    
    // ✅ Intentar cargar citas desde el backend, fallback a mock si falla
    this.adminApi.getCitasFromBackend().subscribe(data => this.citas = data);
    
    this.adminApi.getPuntosReciclaje().subscribe(data => this.puntosReciclaje = data);
    this.adminApi.getMateriales().subscribe(data => this.materiales = data);
    
    // Intentar cargar configuración del backend
    this.adminApi.getConfiguracionFromBackend().subscribe(data => this.configuracion = data);
    
    // Intentar cargar top usuarios del backend
    this.adminApi.getTopUsuariosBackend(5).subscribe(data => this.topUsers = data);
    
    this.adminApi.getRolesPermisos().subscribe(data => this.rolesPermisos = data);
    this.adminApi.getTrendPoints().subscribe(data => this.trendPoints = data);
    
    // Cargar estadísticas del dashboard desde backend
    this.adminApi.getDashboardResumen().subscribe(resumen => {
      if (resumen && resumen.estadisticas) {
        this.dashboardStats = resumen.estadisticas;
        if (resumen.topUsuarios?.length) {
          this.topUsers = resumen.topUsuarios.map((u: any, idx: number) => ({
            id: String(u.id),
            position: idx + 1,
            nombre: u.nombre,
            ubicacion: u.distrito,
            cantidad: `${u.totalKg} kg`,
            citas: `${u.totalCitas} citas`
          }));
        }
      }
    });
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

  // GUARDAR CONFIGURACIÓN
  guardarConfiguracion(): void {
    if (!this.configuracion) return;
    
    this.adminApi.updateConfiguracion(this.configuracion).subscribe({
      next: (config) => {
        this.configuracion = config;
        alert('Configuración guardada exitosamente');
      },
      error: (err) => {
        console.error('Error al guardar configuración:', err);
        alert('Error al guardar la configuración');
      }
    });
  }

  // ✅ ACTUALIZAR ESTADO DE CITA (Admin)
  cambiarEstadoCita(citaId: string, nuevoEstado: string): void {
    const estados = ['Pendiente', 'En proceso', 'Completada', 'Cancelada'];
    const estadoActual = this.citas.find(c => c.id === citaId)?.estado;
    
    if (!estadoActual) return;
    
    // Mostrar opciones de estado
    const opcion = prompt(`Estado actual: ${estadoActual}\n\nCambiar a:\n1. Pendiente\n2. En proceso\n3. Completada\n4. Cancelada\n\nIngresa el número:`, '2');
    
    if (!opcion) return;
    
    const index = parseInt(opcion) - 1;
    if (index >= 0 && index < estados.length) {
      const estadoBackend = estados[index].toUpperCase().replace(' ', '_');
      
      this.adminApi.updateCita(citaId, { estado: estadoBackend }).subscribe({
        next: () => {
          alert(`Estado actualizado a: ${estados[index]}`);
          this.loadDashboardData(); // Recargar citas
        },
        error: (err) => {
          console.error('Error al actualizar estado:', err);
          alert('Error al actualizar el estado de la cita');
        }
      });
    }
  }

  // ✅ CANCELAR CITA (Admin)
  cancelarCitaAdmin(citaId: string): void {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return;
    
    this.adminApi.updateCita(citaId, { estado: 'CANCELADA' }).subscribe({
      next: () => {
        alert('Cita cancelada exitosamente');
        this.loadDashboardData(); // Recargar citas
      },
      error: (err) => {
        console.error('Error al cancelar cita:', err);
        alert('Error al cancelar la cita');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']); 
  }

  // ====== NUEVO: Abrir modal de edición (estado + recolector)
  abrirEditarCita(cita: Cita): void {
    this.editCitaForm.id = cita.id;
    // Mapear estado UI -> backend enum
    const e = (cita.estado || '').toUpperCase().replace(' ', '_');
    this.editCitaForm.estado = (['PENDIENTE','EN_PROCESO','COMPLETADA','CANCELADA'].includes(e) ? e : 'PENDIENTE') as any;
    const reco = this.recolectores.find(r => r.nombre === cita.recolector);
    this.editCitaForm.recolectorId = reco ? reco.id : null;
    this.showEditCitaModal = true;
  }

  guardarEdicionCita(): void {
    if (!this.editCitaForm.id) return;
    const updates: any = { estado: this.editCitaForm.estado };
    if (this.editCitaForm.recolectorId) {
      updates.recolectorId = Number(this.editCitaForm.recolectorId);
    }
    this.adminApi.updateCita(this.editCitaForm.id, updates).subscribe({
      next: () => {
        this.showEditCitaModal = false;
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error al guardar edición:', err);
        alert('No se pudo actualizar la cita');
      }
    });
  }

  // ====== NUEVO: Crear Cita con múltiples materiales
  abrirNuevaCita(): void {
    this.newCitaForm = {
      usuarioId: null,
      fecha: '',
      hora: '',
      notas: '',
      recolectorId: null,
      items: [{ materialId: null, kg: null }]
    };
    this.showNewCitaModal = true;
  }

  agregarItemMaterial(): void {
    this.newCitaForm.items.push({ materialId: null, kg: null });
  }

  quitarItemMaterial(idx: number): void {
    if (this.newCitaForm.items.length <= 1) return;
    this.newCitaForm.items.splice(idx, 1);
  }

  guardarNuevaCita(): void {
    const f = this.newCitaForm;
    if (!f.usuarioId || !f.fecha || !f.hora) {
      alert('Selecciona usuario, fecha y hora');
      return;
    }
    const items = f.items
      .filter(it => it.materialId && it.kg != null)
      .map(it => ({ materialId: Number(it.materialId), kg: Number(it.kg) }))
      .filter(it => it.kg > 0);
    if (!items.length) {
      alert('Agrega al menos un material con kg > 0');
      return;
    }
    const payload: any = {
      usuarioId: Number(f.usuarioId),
      materiales: items,
      fecha: f.fecha,
      hora: f.hora,
      notas: f.notas || undefined
    };
    if (f.recolectorId) payload.recolectorId = Number(f.recolectorId);

    this.adminApi.createCitaMulti(payload).subscribe({
      next: () => {
        this.showNewCitaModal = false;
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error al crear cita:', err);
        alert('No se pudo crear la cita');
      }
    });
  }
}