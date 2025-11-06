import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router'; 
// Asegúrate de que esta ruta sea correcta y que tus interfaces Cita y User estén allí.
import { Cita, } from '../../../../../core/models/cita.model'; 
import {  User } from '../../../../../core/models/user.model';
import { AuthApiService } from '../../../../api/auth.api.service'; 
import { UserCitasApiService, CitaUsuario } from '../../../../api/user-citas.api.service';
import { AdminApiService } from '../../../../api/admin.api.service';
// NOTA: Es fundamental que Cita.id y User.id sean ambos STRING o ambos NUMBER para evitar errores.
// Asumo que tu backend usa STRINGs para IDs.

@Component({
  selector: 'app-usuario-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe], 
  templateUrl: './usuario-dashboard.component.html',

  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class UsuarioDashboardComponent implements OnInit {
  // --- PROPIEDADES INICIALES Y DATA SIMULADA ---
  user: User | null = null; 
  isLoading: boolean = true; 
  
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
  citasPendientes: Cita[] = [];
  misCitasBackend: CitaUsuario[] = []; // Citas del backend
  materialesBackend: any[] = []; // Lista de materiales del backend
  
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
  perfilUsuario = { nombre: 'Alexander', nivel: 'Eco-Héroe', correo: 'alexander@mail.com', avatar: '👤', titulo: 'Reciclador Pro', kilos: 45 };
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


  // --- CONSTRUCTOR Y LIFECYCLE ---
  constructor(
    private authService: AuthApiService, 
    private router: Router,
    private userCitasService: UserCitasApiService,
    private adminApi: AdminApiService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    
    // Lógica de Redirección y Autenticación
    if (!this.authService.isAuthenticated() || !this.user || this.user.rol !== 'CLIENTE') {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadDashboardData();
    this.cargarMisCitas();
    this.cargarMateriales();
  }

  // --- MÉTODOS DE LA UI Y NEGOCIO ---

  private loadDashboardData(): void {
    setTimeout(() => {
      // mock user con id como string para coincidir con User model
      this.user = { id: '1', name: 'Alexander Rodriguez', rol: 'CLIENTE', email: 'alex@mail.com' };
      if (this.user) {
        this.perfilForm.nombre = this.user.name.split(' ')[0] || '';
        this.perfilForm.apellido = this.user.name.split(' ')[1] || '';
        this.perfilForm.email = this.user.email || '';
        this.perfilUsuario.nombre = this.user.name || this.perfilUsuario.nombre;
      }

      this.isLoading = false;
    }, 500);
  }

  // ✅ CARGAR MIS CITAS DESDE BACKEND
  private cargarMisCitas(): void {
    this.userCitasService.getMisCitas().subscribe({
      next: (citas) => {
        this.misCitasBackend = citas;
        // Convertir a formato Cita para compatibilidad con UI existente
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
      case 'perfil': this.pageTitle = 'Mi Perfil'; this.pageSubtitle = 'Gestiona tu información personal'; break;
    }
  }

  // >>> GETTER CORREGIDO PARA EL DASHBOARD (Soluciona el error de "Parser Error" en el filtro)
  get citasPendientesDashboard(): Cita[] {
    // Filtramos el array una sola vez en TypeScript
    return this.citasPendientes.filter(cita => cita.estado === 'Pendiente');
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
  nextAgendarStep() { if (this.agendarStep < 3) { this.agendarStep++; } else { this.confirmarRecoleccion(); } }
  canProceedToNext(): boolean { 
    if (this.agendarStep === 1) return this.agendarForm.materiales.length > 0 && this.agendarForm.cantidad > 0;
    if (this.agendarStep === 2) return !!this.agendarForm.fecha && !!this.agendarForm.hora;
    if (this.agendarStep === 3) return !!this.agendarForm.direccion && !!this.agendarForm.distrito;
    return false;
  }
  
  // ✅ CONFIRMAR RECOLECCIÓN CON BACKEND
  confirmarRecoleccion() {
    // Obtener el ID del material seleccionado
    const materialSeleccionado = this.materialesDisponibles.find(m => m.seleccionado);
    if (!materialSeleccionado) {
      alert('Por favor selecciona un material');
      return;
    }

    const citaRequest = {
      materialId: materialSeleccionado.id,
      cantidadEstimada: this.agendarForm.cantidad,
      fecha: this.agendarForm.fecha,
      hora: this.agendarForm.hora,
      notas: `${this.agendarForm.direccion}, ${this.agendarForm.distrito}. ${this.agendarForm.referencia}`
    };

    this.userCitasService.crearCita(citaRequest).subscribe({
      next: (cita) => {
        console.log('✅ Cita creada exitosamente:', cita);
        alert('¡Cita agendada exitosamente! 🎉');
        this.cargarMisCitas(); // Recargar lista
        this.showAgendarForm = false;
        this.resetAgendarForm();
      },
      error: (err) => {
        console.error('❌ Error al crear cita:', err);
        alert('Error al agendar la cita. Por favor intenta de nuevo.');
      }
    });
  }
  
  // ✅ CANCELAR CITA CON BACKEND
  cancelarCita(id: string) {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return;
    
    this.userCitasService.cancelarCita(parseInt(id)).subscribe({
      next: () => {
        console.log('✅ Cita cancelada:', id);
        alert('Cita cancelada exitosamente');
        this.cargarMisCitas(); // Recargar lista
      },
      error: (err) => {
        console.error('❌ Error al cancelar cita:', err);
        alert('Error al cancelar la cita');
      }
    });
  } 
  editarCita(citaId: string) { console.log('Editando cita:', citaId); } 
  verRutaHacia(punto: any) { console.log('Ver ruta hacia:', punto); } 
  llamarPunto(punto: any) { console.log('Llamar a punto:', punto); } 
  canjearRecompensa(recompensa: any) { console.log('Canjeando recompensa:', recompensa); } 
  guardarPerfil() { 
    this.perfilUsuario.nombre = this.perfilForm.nombre + ' ' + this.perfilForm.apellido;
    this.perfilUsuario.correo = this.perfilForm.email;
    this.editandoPerfil = false;
    console.log('Guardando perfil:', this.perfilForm); 
  } 
  toggleEditarPerfil() {
    this.editandoPerfil = !this.editandoPerfil;
    if (this.editandoPerfil) {
      this.perfilForm = { 
        nombre: this.perfilUsuario.nombre.split(' ')[0], 
        apellido: this.perfilUsuario.nombre.split(' ')[1] || '',
        correo: this.perfilUsuario.correo, 
        email: this.perfilUsuario.correo, telefono: '', distrito: 'Miraflores', 
        direccion: '', tipoUsuario: 'Individual', notificacionesEmail: true, 
        notificacionesPush: true, recordatorios: true 
      };
    }
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