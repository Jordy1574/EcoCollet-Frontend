import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router'; 
import { Cita } from '../../../../../core/models/cita.model'; 
import { User } from '../../../../../core/models/user.model';
import { AuthApiService } from '../../../../api/auth.api.service'; 
import { UserCitasApiService, CitaUsuario } from '../../../../api/user-citas.api.service';
import { AdminApiService } from '../../../../api/admin.api.service';
import { NivelApiService, ProgresionNivel } from '../../../../api/nivel.api.service';
import { RecoleccionApiService } from '../../../../api/recoleccion.api.service';
import { Recoleccion } from '../../../../../core/models/recoleccion.model';
import { UserApiService } from '../../../../api/user.api.service';

export interface RecoleccionDto {
  id: number;
  clienteId?: number;
  recolectorId?: number | null;
  direccionRecojo?: string;
  tipoMaterial?: string;
  cantidadKg?: number;
  estado?: string;
  fechaSolicitud?: string;
  fechaAsignacion?: string | null;
  fechaCompletada?: string | null;
}

@Component({
  selector: 'app-usuario-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe], 
  templateUrl: './usuario-dashboard.component.html',

  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class UsuarioDashboardComponent implements OnInit {
  hoy = new Date().toISOString().split('T')[0];
  // --- PROPIEDADES INICIALES Y DATA SIMULADA ---
  user: User | null = null; 
  isLoading: boolean = true;
  nivelProgresion: ProgresionNivel | null = null;
  
  // Modal de detalle
  selectedRecoleccion: RecoleccionDto | null = null;
  showDetalleModal = false;
  detalleLoading = false;
  
  currentSection: 'dashboard' | 'citas' | 'puntos' | 'recompensas' | 'perfil' = 'dashboard'; 
  pageTitle: string = 'Panel de Control'; 
  pageSubtitle: string = 'Bienvenido a tu dashboard'; 

  // Datos simulados (MOCK DATA)
  estadisticas = {
    citasCompletadas: 8,
    materialReciclado: 45.5,
    puntosGanados: 890,
    impactoAmbiental: 12
  };
  citasPendientes: Cita[] = [
    // IDs como string para coincidir con la interfaz en core/models
    { id: '1', fecha: '2025-10-25', hora: '10:00 AM', estado: 'Pendiente', direccion: 'Calle Los Rosales 123', tipoMaterial: 'PLASTICO', cantidadEstimada: 5, puntos: 50 },
    { id: '2', fecha: '2025-10-22', hora: '02:00 PM', estado: 'Completada', direccion: 'Av. Siempreviva 742', tipoMaterial: 'PAPEL', cantidadEstimada: 3, puntos: 30 },
    { id: '3', fecha: '2025-11-01', hora: '09:00 AM', estado: 'Pendiente', direccion: 'Jr. Miraflores 999', tipoMaterial: 'VIDRIO', cantidadEstimada: 12, puntos: 120 }
  ];
  misCitasBackend: CitaUsuario[] = [];
  materialesBackend: any[] = [];
  misRecolecciones: Recoleccion[] = [];
  
  // --- FORMULARIOS Y ESTADOS ---
  showAgendarForm = false; 
  agendarStep = 1; 
  materialesDisponibles = [
    { tipo: 'PLASTICO', nombre: 'Plástico', seleccionado: false, icono: '♲', id: 1 }, 
    { tipo: 'PAPEL', nombre: 'Papel', seleccionado: false, icono: '📄', id: 2 }, 
    { tipo: 'VIDRIO', nombre: 'Vidrio', seleccionado: false, icono: '🍾', id: 3 }, 
    { tipo: 'METAL', nombre: 'Metal', seleccionado: false, icono: '🔧', id: 4 } 
  ]; 
  agendarForm = {
    materialId: 0,
    cantidad: 0,
    fecha: '',
    hora: '',
    direccion: '',
    referencia: '',
    distrito: '',
    notas: '',
    materiales: [] as string[]
  }; 
  horasDisponibles = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']; 
  distritos = ['San Isidro', 'Miraflores', 'Surco', 'San Borja', 'La Molina', 'Barranco'];
  materialesFiltro = ['Todos', 'Plástico', 'Papel', 'Vidrio', 'Metal'];

  // --- PERFIL Y OTROS DATOS ---
  // Valores por defecto (no deben usarse como mock en producción)
  perfilUsuario = { nombre: 'Usuario', nivel: 'Eco-Héroe', correo: 'usuario@mail.com', avatar: '👤', titulo: 'Reciclador Pro', kilos: 0 };
  editandoPerfil = false;
  perfilForm = { nombre: '', apellido: '', correo: '', email: '', telefono: '', distrito: '', direccion: '', tipoUsuario: 'Individual', notificacionesEmail: true, notificacionesPush: true, recordatorios: true };
  puntosDisponibles = 1250;
  
  puntos: any[] = [
    { id: '1', nombre: 'Centro de Reciclaje San Isidro', estado: 'Abierto', direccion: 'Av. Los Rosales 123, San Isidro', horario: '9:00 AM - 6:00 PM', materiales: ['Plástico', 'Papel', 'Vidrio'], distancia: '1.2 km', tipo: 'punto-oficial' },
    { id: '2', nombre: 'EcoRecicla Miraflores', estado: 'Abierto', direccion: 'Calle Las Orquídeas 456, Miraflores', horario: '8:00 AM - 5:00 PM', materiales: ['Plástico', 'METAL'], distancia: '2.5 km', tipo: 'punto-comunidad' },
  ];
  rankingUsuarios: any[] = [
    { id: 1, nombre: 'Carlos P.', puntos: 2500, posicion: 1, avatar: '👨', titulo: 'Eco Warrior', kilos: 250 },
    { id: 2, nombre: 'María S.', puntos: 2200, posicion: 2, avatar: '👩', titulo: 'Eco Master', kilos: 220 },
    { id: 3, nombre: 'Juan R. (Tú)', puntos: 1800, posicion: 3, avatar: '👨', titulo: 'Eco Guardian', kilos: 180 },
  ];
  recompensasDisponibles: any[] = [
    { id: 1, nombre: 'Bolsa Ecológica', puntos: 500, stock: 10, imagen: '🛍️', descripcion: 'Bolsa reutilizable', colorFondo: 'bg-eco-green', disponible: true },
    { id: 2, nombre: 'Botella Reutilizable', puntos: 1800, stock: 5, imagen: '🍶', descripcion: 'Botella de acero inoxidable', colorFondo: 'bg-eco-blue', disponible: false },
  ];
  distritoSeleccionado = '';
  materialSeleccionado = 'Todos';

  constructor(
    private authService: AuthApiService, 
    private router: Router,
    private userCitasService: UserCitasApiService,
    private adminApi: AdminApiService,
    private nivelApi: NivelApiService,
    private recoleccionApi: RecoleccionApiService,
    private userApi: UserApiService
  ) {}

  ngOnInit(): void {
    // Obtener usuario actual (puede venir de storage o después del login)
    this.user = this.authService.getCurrentUser();
    console.log('👤 Usuario obtenido del authService:', this.user);

    // Suscribirse a cambios del usuario (por ejemplo, después de login)
    this.authService.currentUser$.subscribe(u => {
      if (u) {
        console.log('👤 Usuario actualizado desde observable:', u);
        this.user = u;
        this.populateProfileData();
      }
    });

    // Fallback: si el servicio no tiene user pero hay uno en localStorage, uselo
    if (!this.user) {
      try {
        const raw = localStorage.getItem('user');
        console.log('💾 Raw user desde localStorage:', raw);
        if (raw) {
          const parsed: any = JSON.parse(raw);
          console.log('📦 Usuario parseado desde localStorage:', parsed);
          // compatible con formas 'name' o 'nombre'
          const normalized: User = {
            id: String(parsed.id || parsed.userId || parsed._id || '0'),
            email: parsed.email || parsed.correo || '',
            rol: parsed.rol || parsed.role || 'CLIENTE',
            name: parsed.name || parsed.nombre || parsed.fullName || '',
            telefono: parsed.telefono || '',
            distrito: parsed.distrito || '',
            direccion: parsed.direccion || '',
            tipoUsuario: parsed.tipoUsuario || 'Individual',
            notificacionesEmail: parsed.notificacionesEmail !== undefined ? parsed.notificacionesEmail : true,
            notificacionesPush: parsed.notificacionesPush !== undefined ? parsed.notificacionesPush : true,
            recordatorios: parsed.recordatorios !== undefined ? parsed.recordatorios : true
          };
          console.log('✅ Usuario normalizado:', normalized);
          this.user = normalized;
          this.populateProfileData();
        }
      } catch (err) {
        console.warn('No se pudo parsear user desde localStorage:', err);
      }
    }

    // Lógica de Redirección y Autenticación
    if (!this.authService.isAuthenticated() || !this.user || this.user.rol !== 'CLIENTE') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadDashboardData();
    // this.cargarMisCitas(); // Comentado: usamos cargarMisRecolecciones() en su lugar
    this.cargarMateriales();
    this.cargarNivelUsuario();
    this.cargarMisRecolecciones();
  }


  // --- MÉTODOS DE LA UI Y NEGOCIO ---
  cargarMisRecolecciones(): void {
    this.recoleccionApi.getMisRecolecciones().subscribe({
      next: (recolecciones: any[]) => {
        console.log('✅ Recolecciones cargadas:', recolecciones);
        console.log('📊 Total de recolecciones recibidas:', recolecciones.length);
        
        // Log detallado del primer elemento para debug
        if (recolecciones.length > 0) {
          console.log('🔍 Primera recolección completa:', JSON.stringify(recolecciones[0], null, 2));
        }
        
        // Mapear datos del backend al modelo del frontend
        this.misRecolecciones = recolecciones.map(r => {
          // Extraer dirección del string DireccionRecoleccion(...)
          const direccion = this.extraerDireccion(r.direccionRecojo);
          
          return {
            id: String(r.id),
            cantidad_kg: String(r.cantidadKg || r.cantidad_kg || '0'),
            direccion: direccion,
            distrito: '',
            referencia: '',
            estado: this.normalizarEstadoRecoleccion(r.estado),
            fechaAsignacion: r.fechaAsignacion || '',
            fechaCompletada: r.fechaCompletada || '',
            fechaSolicitud: r.fechaSolicitud || '',
            fechaRecojo: r.fechaSolicitud || '', // Usar fechaSolicitud como fechaRecojo
            tipo_material: r.tipoMaterial || '',
            cliente_id: String(r.clienteId || ''),
            recolector_id: r.recolectorId ? String(r.recolectorId) : undefined
          };
        }) as Recoleccion[];
        
        console.log('🗂️ misRecolecciones mapeadas:', this.misRecolecciones.length);
        
        // Actualizar citasPendientes también para que se vean en el dashboard
        this.citasPendientes = this.misRecolecciones.map(r => ({
          id: r.id,
          fecha: r.fechaRecojo,
          hora: '00:00', // No tenemos hora del backend, usar default
          estado: r.estado as any,
          direccion: r.direccion,
          tipoMaterial: r.tipo_material,
          cantidadEstimada: Number(r.cantidad_kg),
          puntos: this.calcularPuntos(Number(r.cantidad_kg))
        }));
        
        console.log('✅ CitasPendientes actualizadas:', this.citasPendientes.length, 'elementos');
        console.log('📋 Estados de las citas:', this.citasPendientes.map(c => ({ id: c.id, estado: c.estado })));
      },
      error: (err: any) => {
        console.error('❌ Error al cargar recolecciones:', err);
      }
    });
  }

  private extraerDireccion(direccionString: any): string {
    // Intenta extraer la dirección de un string como:
    // "DireccionRecoleccion(direccion=Mi casa, distrito=null, referencia=null)"
    if (!direccionString) return '';
    
    if (typeof direccionString === 'object') {
      return direccionString.direccion || '';
    }
    
    // Si es string, usar regex para extraer el valor de "direccion="
    const match = String(direccionString).match(/direccion=([^,\)]+)/);
    return match ? match[1].trim() : String(direccionString);
  }

  private normalizarEstadoRecoleccion(estado: string): 'Pendiente' | 'En proceso' | 'Completada' | 'Confirmada' | 'Cancelada' {
    const e = (estado || '').toUpperCase();
    if (e.includes('PEND')) return 'Pendiente';
    if (e.includes('PROCESO')) return 'En proceso';
    if (e.includes('COMPLET')) return 'Completada';
    if (e.includes('CONFIRM')) return 'Confirmada';
    if (e.includes('CANCEL')) return 'Cancelada';
    return 'Pendiente';
  }

  calcularPuntos(cantidadKg: number): number {
    return cantidadKg * 10; // 10 puntos por kg
  }

  private loadDashboardData(): void {
    // Cargar datos iniciales de dashboard (simulación ligera de delay)
    setTimeout(() => {
      // Llenar datos de perfil desde el usuario autenticado (si está disponible)
      this.populateProfileData();
      this.isLoading = false;
    }, 500);
  }

  /**
   * Rellena los formularios y perfil con los datos del usuario autenticado
   */
  private populateProfileData(): void {
    if (!this.user) return;

    console.log('📝 Poblando datos de perfil con usuario:', JSON.stringify(this.user, null, 2));
    
    const nombreCompleto = this.user.name || '';
    const parts = nombreCompleto.split(' ').filter(p => p.trim() !== '');
    
    // Dividir en 2 palabras para nombre y 2 para apellido
    // Ejemplo: "Juan Lopez Carlos Pérez" → nombre: "Juan Lopez", apellido: "Carlos Pérez"
    if (parts.length >= 4) {
      this.perfilForm.nombre = `${parts[0]} ${parts[1]}`;
      this.perfilForm.apellido = parts.slice(2).join(' ');
    } else if (parts.length === 3) {
      // Si hay 3 palabras: 1 para nombre, 2 para apellido
      this.perfilForm.nombre = parts[0];
      this.perfilForm.apellido = `${parts[1]} ${parts[2]}`;
    } else if (parts.length === 2) {
      this.perfilForm.nombre = parts[0];
      this.perfilForm.apellido = parts[1];
    } else {
      this.perfilForm.nombre = parts[0] || '';
      this.perfilForm.apellido = '';
    }
    
    this.perfilForm.email = this.user.email || '';
    this.perfilForm.correo = this.user.email || '';
    this.perfilForm.telefono = this.user.telefono || '';
    
    // Normalizar distrito: convertir de mayúsculas a formato correcto
    // Backend: "SAN ISIDRO" → Frontend: "San Isidro"
    const distritoRaw = this.user.distrito || '';
    if (distritoRaw) {
      // Convertir "SAN ISIDRO" a "San Isidro"
      const distritoNormalizado = distritoRaw
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Verificar si existe en la lista de distritos disponibles
      if (this.distritos.includes(distritoNormalizado)) {
        this.perfilForm.distrito = distritoNormalizado;
      } else {
        console.warn('⚠️ Distrito no encontrado en lista:', distritoNormalizado, 'Original:', distritoRaw);
        this.perfilForm.distrito = distritoRaw; // Usar el valor original si no coincide
      }
    } else {
      this.perfilForm.distrito = '';
    }
    
    this.perfilForm.direccion = this.user.direccion || '';
    
    // Normalizar tipoUsuario: convertir INDIVIDUAL/EMPRESA a Individual/Empresa
    const tipoUsuarioRaw = (this.user.tipoUsuario || 'INDIVIDUAL').toUpperCase();
    this.perfilForm.tipoUsuario = tipoUsuarioRaw === 'EMPRESA' ? 'Empresa' : 'Individual';
    // Convertir a booleano explícitamente en caso de que vengan como string
    this.perfilForm.notificacionesEmail = this.user.notificacionesEmail !== undefined ? 
      (typeof this.user.notificacionesEmail === 'boolean' ? this.user.notificacionesEmail : this.user.notificacionesEmail === 'true' || this.user.notificacionesEmail === true) : true;
    this.perfilForm.notificacionesPush = this.user.notificacionesPush !== undefined ? 
      (typeof this.user.notificacionesPush === 'boolean' ? this.user.notificacionesPush : this.user.notificacionesPush === 'true' || this.user.notificacionesPush === true) : true;
    this.perfilForm.recordatorios = this.user.recordatorios !== undefined ? 
      (typeof this.user.recordatorios === 'boolean' ? this.user.recordatorios : this.user.recordatorios === 'true' || this.user.recordatorios === true) : true;
    
    // Actualizar perfilUsuario
    this.perfilUsuario.nombre = nombreCompleto || this.perfilUsuario.nombre;
    this.perfilUsuario.correo = this.user.email || this.perfilUsuario.correo;
    
    console.log('📋 perfilForm actualizado:', this.perfilForm);
    console.log('👨 perfilUsuario actualizado:', this.perfilUsuario);
  }

  /** Nombre a mostrar en la UI: intenta this.user luego localStorage y finalmente 'Usuario' */
  get displayName(): string {
    if (this.user && this.user.name) return this.user.name;

    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const parsed: any = JSON.parse(raw);
        return parsed.name || parsed.nombre || parsed.fullName || parsed.usuario || '';
      }
    } catch (err) {
      // ignore
    }

    return 'Usuario';
  }

  get displayInitial(): string {
    return (this.displayName && this.displayName.length > 0) ? this.displayName[0] : 'U';
  }

  get displayFirstName(): string {
    const n = this.displayName || '';
    return n.split(' ')[0] || 'Usuario';
  }

  // ✅ CARGAR MIS CITAS DESDE BACKEND
  private cargarMisCitas(): void {
    this.userCitasService.getMisCitas().subscribe({
      next: (citas) => {
        this.misCitasBackend = citas;
        // Convertir TODAS las citas (incluyendo canceladas) a formato Cita
        this.citasPendientes = citas.map(c => ({
          id: String(c.id),
          fecha: c.fecha,
          hora: c.hora,
          estado: this.normalizarEstado(c.estado),
          direccion: 'Dirección guardada',
          tipoMaterial: c.materialNombre.toUpperCase(),
          cantidadEstimada: c.cantidadEstimada,
          puntos: Math.round(c.cantidadEstimada * 10)
        }));
        console.log('✅ Citas recargadas desde backend:', this.citasPendientes.length);
      },
      error: (err) => {
        console.error('Error al cargar citas:', err);
      }
    });
  }

  private normalizarEstado(estado: string): 'Pendiente' | 'En proceso' | 'Completada' | 'Confirmada' | 'Cancelada' {
    const e = estado.toLowerCase();
    if (e.includes('pend')) return 'Pendiente';
    if (e.includes('proceso')) return 'En proceso';
    if (e.includes('complet')) return 'Completada';
    if (e.includes('confirm')) return 'Confirmada';
    if (e.includes('cancel')) return 'Cancelada';
    return 'Pendiente';
  }

  // ✅ CARGAR MATERIALES DESDE BACKEND
  private cargarMateriales(): void {
    this.adminApi.getMateriales().subscribe({
      next: (materiales) => {
        if (materiales && materiales.length > 0) {
          this.materialesBackend = materiales;
          // Mapear a materialesDisponibles solo si hay datos del backend
          const materialesFromBackend = materiales.map(m => ({
            tipo: m.nombre.toUpperCase(),
            nombre: m.nombre,
            seleccionado: false,
            icono: this.getIconoPorMaterial(m.nombre),
            id: parseInt(m.id)
          }));
          
          // Actualizar materialesDisponibles conservando el estado de selección
          this.materialesDisponibles = materialesFromBackend.map(mb => {
            const existing = this.materialesDisponibles.find(md => md.tipo === mb.tipo);
            return existing ? { ...mb, seleccionado: existing.seleccionado } : mb;
          });
        }
        // Si no hay materiales del backend, mantener los hardcoded
      },
      error: (err) => {
        console.error('Error al cargar materiales:', err);
        // En caso de error, mantener los materiales hardcoded que ya están inicializados
      }
    });
  }

  // ✅ CARGAR NIVEL DEL USUARIO DESDE BACKEND
  private cargarNivelUsuario(): void {
    if (!this.user || !this.user.id) {
      console.warn('No hay usuario disponible para cargar nivel');
      return;
    }

    const usuarioId = parseInt(this.user.id);
    this.nivelApi.obtenerProgresionNivel(usuarioId).subscribe({
      next: (progresion) => {
        this.nivelProgresion = progresion;
        // Actualizar el nivel en el perfil del usuario
        this.perfilUsuario.nivel = progresion.nivel || 'Eco-Héroe';
        console.log('Nivel cargado:', progresion);
      },
      error: (err) => {
        console.error('Error al cargar nivel del usuario:', err);
        // Mantener el valor por defecto si hay error
        this.perfilUsuario.nivel = 'Eco-Héroe';
      }
    });
  }

  private getIconoPorMaterial(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('plast')) return '♲';
    if (n.includes('papel')) return '📄';
    if (n.includes('vidri')) return '🍾';
    if (n.includes('metal')) return '🔧';
    return '♲';
  }

  loadSection(section: 'dashboard' | 'citas' | 'puntos' | 'recompensas' | 'perfil'): void {
    this.currentSection = section; 
    switch(section) {
      case 'dashboard': this.pageTitle = 'Panel de Control'; this.pageSubtitle = 'Bienvenido a tu dashboard'; break;
      case 'citas': this.pageTitle = 'Mis Citas'; this.pageSubtitle = 'Gestiona tus citas de recolección'; break;
      case 'puntos': this.pageTitle = 'Puntos de Reciclaje'; this.pageSubtitle = 'Encuentra puntos cercanos'; break;
      case 'recompensas': this.pageTitle = 'Recompensas'; this.pageSubtitle = 'Canjea tus puntos por premios'; break;
      case 'perfil': 
        this.pageTitle = 'Mi Perfil'; 
        this.pageSubtitle = 'Gestiona tu información personal';
        // Recargar datos del perfil al abrir la sección
        this.populateProfileData();
        console.log('🔄 Perfil recargado al cambiar de sección');
        break;
    }
  }

  // >>> GETTER CORREGIDO PARA EL DASHBOARD (Soluciona el error de "Parser Error" en el filtro)
  get citasPendientesDashboard(): Cita[] {
    // Retornar todas las recolecciones sin filtrar
    return this.citasPendientes;
  }

  // Métodos de UTILIDAD y FORMATO
  formatFechaCorta(fecha: string): string { return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }); }
  formatearFecha(fecha: string): string { 
    return new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); 
  }

  // Métodos de ESTILOS
  getMaterialClass(material: any) { return { 'p-4 rounded-lg border-2 flex items-center space-x-3 transition-colors': true, 'border-eco-green bg-green-50': material.seleccionado, 'border-gray-200 hover:border-eco-green': !material.seleccionado }; }
  getMaterialIconClass(tipoMaterial: string): string { 
    const classes: { [key: string]: string } = {
      'PLASTICO': 'bg-blue-500',
      'PAPEL': 'bg-yellow-500',
      'VIDRIO': 'bg-green-500',
      'METAL': 'bg-gray-600',
      'default': 'bg-gray-500'
    };
    return classes[tipoMaterial.toUpperCase()] || classes['default'];
  }
  getMaterialIcon(tipoMaterial: string): string { 
    return this.materialesDisponibles.find(m => m.tipo === tipoMaterial)?.icono || '♲'; 
  }
  getPuntosPorCita(cita: any): number { return cita.puntos || 0; }
  getCrecimientoClass() { return 'text-green-600'; }
  getCrecimientoCitasClass() { return 'text-green-600'; }
  getCrecimientoPuntosClass() { return 'text-green-600'; }
  calcularPorcentajeCrecimiento() { return '+15%'; }
  calcularCrecimientoCitas() { return '+20%'; }
  calcularCrecimientoPuntos() { return '+25%'; }
  getRankingIcon(posicion: number): string { return { 1: '🥇', 2: '🥈', 3: '🥉' }[posicion] || `${posicion}`; }
  getTipoColor(punto: any): string { return `bg-${punto.tipo.toLowerCase()}-500`; }
  getEstadoPuntoClass(estado: string): string { return `estado-${estado.toLowerCase()}`; }
  puedesCanjear(recompensa: any): boolean { return this.puntosDisponibles >= recompensa.puntos && recompensa.disponible; }

  // Método ajustado para el estado de las citas
  getCitaStatusClass(estado: string): string { 
    const classes: { [key: string]: string } = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'CONFIRMADA': 'bg-green-100 text-green-800',
      'CANCELADA': 'bg-red-100 text-red-800',
      'COMPLETADA': 'bg-blue-100 text-blue-800',
      'EN PROCESO': 'bg-purple-100 text-purple-800',
    };
    return classes[estado.toUpperCase()] || 'bg-gray-100 text-gray-800';
  }

  // Métodos de ACCIÓN
  toggleMaterial(material: any) {
    material.seleccionado = !material.seleccionado;
    this.agendarForm.materiales = this.materialesDisponibles.filter(m => m.seleccionado).map(m => m.tipo);
  }
  solicitarNuevaCita() { this.showAgendarForm = true; this.agendarStep = 1; this.resetAgendarForm(); }
  cancelarAgendamiento() { this.showAgendarForm = false; this.resetAgendarForm(); }
  prevAgendarStep() { if (this.agendarStep > 1) { this.agendarStep--; } }
  nextAgendarStep() { if (this.agendarStep < 3) { this.agendarStep++; } }
  canProceedToNext(): boolean { 
    if (this.agendarStep === 1) return this.agendarForm.materiales.length > 0 && this.agendarForm.cantidad > 0;
    if (this.agendarStep === 2) return !!this.agendarForm.fecha && !!this.agendarForm.hora;
    if (this.agendarStep === 3) return !!this.agendarForm.direccion && !!this.agendarForm.distrito;
    return false;
  }

  confirmarRecoleccion() {
    console.log('🔵 confirmarRecoleccion() llamado, isLoading:', this.isLoading);
    
    if (!this.user) {
      console.log('❌ No hay usuario');
      return;
    }
    
    if (this.isLoading) {
      console.log('⚠️ Ya hay una petición en curso, ignorando...');
      return;
    }
    
    const nuevaRecoleccion: Partial<Recoleccion> = {
      cantidad_kg: String(this.agendarForm.cantidad),
      direccion: this.agendarForm.direccion,
      distrito: this.agendarForm.distrito,
      referencia: this.agendarForm.referencia,
      estado: 'Pendiente',
      fechaRecojo: this.agendarForm.fecha,
      tipo_material: this.agendarForm.materiales.join(', '),
      cliente_id: this.user.id,
      fechaSolicitud: new Date().toISOString(),
      fechaAsignacion: '',
    };
    
    this.isLoading = true;
    console.log('📤 Enviando recolección al backend...');
    
    this.recoleccionApi.createRecoleccion(nuevaRecoleccion).subscribe({
      next: (recoleccion) => {
        console.log('✅ Recolección creada exitosamente:', recoleccion);
        alert('¡Recolección agendada exitosamente! 🎉');
        this.showAgendarForm = false;
        this.resetAgendarForm();
        this.isLoading = false;
        this.cargarMisRecolecciones(); // Solo recargar desde backend
      },
      error: (err) => {
        console.error('❌ Error al agendar recolección:', err);
        alert('Error al agendar la recolección. Intenta nuevamente.');
        this.isLoading = false;
      }
    });
  }
  
  cancelarCita(id: string) {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return;
    
    this.recoleccionApi.cancelarRecoleccion(parseInt(id)).subscribe({
      next: () => {
        console.log('✅ Cita cancelada:', id);
        alert('Cita cancelada exitosamente');
        this.cargarMisRecolecciones();
      },
      error: (err: any) => {
        console.error('❌ Error al cancelar cita:', err);
        alert('Error al cancelar la cita');
      }
    });
  }

  editarCita(citaId: string) {
    console.log('Editando cita:', citaId);
  }

  verDetalle(id: number | string): void {
    this.selectedRecoleccion = null;
    this.showDetalleModal = true;
    this.detalleLoading = true;
    
    this.recoleccionApi.getRecoleccionById(String(id)).subscribe({
      next: (r: any) => {
        this.selectedRecoleccion = r;
        this.detalleLoading = false;
        console.log('✅ Detalle cargado:', r);
      },
      error: (err: any) => {
        console.error('❌ Error cargando detalle de recolección:', err);
        this.detalleLoading = false;
        alert('Error al cargar el detalle de la recolección');
      }
    });
  }

  cerrarDetalle(): void {
    this.showDetalleModal = false;
    this.selectedRecoleccion = null;
  }

  parseDireccion(direccionString: any): string {
    if (!direccionString) return 'Sin dirección';
    if (typeof direccionString === 'object') {
      return direccionString.direccion || 'Sin dirección';
    }
    const match = String(direccionString).match(/direccion=([^,\)]+)/);
    return match ? match[1].trim() : String(direccionString);
  }

  verRutaHacia(punto: any) {
    console.log('Ver ruta hacia:', punto);
  }

  llamarPunto(punto: any) {
    console.log('Llamar a punto:', punto);
  }

  canjearRecompensa(recompensa: any) {
    console.log('Canjeando recompensa:', recompensa);
  }

  guardarPerfil() {
    if (!this.user || !this.user.id) {
      alert('Error: No se pudo identificar el usuario');
      return;
    }

    this.isLoading = true;
    console.log('💾 Guardando perfil - perfilForm:', this.perfilForm);

    // Preparar datos para enviar al backend (sin id, se envía en la URL)
    const datosActualizados = {
      nombre: this.perfilForm.nombre?.trim() || '',
      apellido: this.perfilForm.apellido?.trim() || '',
      email: this.perfilForm.email,
      telefono: this.perfilForm.telefono,
      distrito: this.perfilForm.distrito?.toUpperCase() || '', // Backend espera mayúsculas
      direccion: this.perfilForm.direccion,
      tipoUsuario: this.perfilForm.tipoUsuario?.toUpperCase() || 'INDIVIDUAL',
      notificacionesEmail: this.perfilForm.notificacionesEmail,
      notificacionesPush: this.perfilForm.notificacionesPush,
      recordatorios: this.perfilForm.recordatorios
    };

    console.log('📤 Datos a enviar al backend (con ID):', datosActualizados);

    this.userApi.actualizarPerfil(this.user.id, datosActualizados).subscribe({
      next: (response) => {
        console.log('✅ Perfil actualizado exitosamente:', response);
        
        // Actualizar datos locales
        const nombreCompleto = `${datosActualizados.nombre} ${datosActualizados.apellido}`.trim();
        this.perfilUsuario.nombre = nombreCompleto;
        this.perfilUsuario.correo = datosActualizados.email;
        
        // Actualizar usuario en el servicio de autenticación y localStorage
        if (this.user) {
          this.user.name = nombreCompleto;
          this.user.email = datosActualizados.email;
          this.user.telefono = datosActualizados.telefono;
          this.user.distrito = datosActualizados.distrito;
          this.user.direccion = datosActualizados.direccion;
          this.user.tipoUsuario = datosActualizados.tipoUsuario as any;
          this.user.notificacionesEmail = datosActualizados.notificacionesEmail;
          this.user.notificacionesPush = datosActualizados.notificacionesPush;
          this.user.recordatorios = datosActualizados.recordatorios;
          
          localStorage.setItem('user', JSON.stringify(this.user));
        }
        
        this.editandoPerfil = false;
        this.isLoading = false;
        alert('✅ Perfil actualizado correctamente');
      },
      error: (err: any) => {
        console.error('❌ Error completo al guardar perfil:', err);
        console.error('❌ Status:', err.status);
        console.error('❌ Error message:', err.error?.message || err.message);
        console.error('❌ Error data:', err.error);
        this.isLoading = false;
        
        const mensajeError = err.error?.message || err.message || 'Error desconocido';
        alert(`Error al guardar el perfil: ${mensajeError}`);
      }
    });
  }

  toggleEditarPerfil() {
    this.editandoPerfil = !this.editandoPerfil;
    if (!this.editandoPerfil) {
      // Si se cancela la edición, recargar los datos originales
      this.populateProfileData();
    }
    // Ya no es necesario reinicializar perfilForm aquí
    // porque ya está poblado con los datos correctos del usuario
  }

  logout(): void {
    this.authService.logoutLocal();
    this.router.navigate(['/login']);
  }

  resetAgendarForm() {
    this.agendarForm = {
      materialId: 0,
      cantidad: 0,
      fecha: '',
      hora: '',
      direccion: '',
      referencia: '',
      distrito: '',
      notas: '',
      materiales: []
    };
    this.materialesDisponibles.forEach(m => m.seleccionado = false);
  }

  // Método para filtrar Puntos de Reciclaje
  getPuntosFiltrados() {
    return this.puntos
      .filter(punto => {
        const distritoMatch = !this.distritoSeleccionado || punto.direccion.includes(this.distritoSeleccionado);
        const materialMatch = this.materialSeleccionado === 'Todos' || punto.materiales.some((m: string) => m.toLowerCase() === this.materialSeleccionado.toLowerCase());
        return distritoMatch && materialMatch;
      });
  }
}